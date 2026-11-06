import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyTaskIntent,
  computeBlastRadius,
  computeTransitiveFanOut,
  extractImportsFromSource,
  scoreTask,
  updateCalibrationPolicy,
  DEFAULT_CALIBRATION_POLICY,
  PLAYGROUND_PRESETS,
} from '../src/index.ts';

describe('@agent-gauge/core-scorer deterministic engine', () => {
  it('routes low-risk CSS / dark-mode footer tasks to FAST + LOW effort with >90% savings', () => {
    const result = scoreTask({
      prompt: 'Add Tailwind dark-mode classes and padding to the marketing footer component',
      filePaths: ['apps/web/src/components/Footer.tsx'],
      filesTouchedOverride: 1,
      downstreamFanOutOverride: 0,
      historicalRevertRateOverride: 0.02,
    });

    assert.ok(result.totalScore <= 32, `Expected score <= 32, got ${result.totalScore}`);
    assert.equal(result.recommendedTier, 'fast');
    assert.equal(result.recommendedEffort, 'low');
    assert.equal(result.executionMode, 'direct');
    assert.ok(result.savings.costSavedPct >= 90, `Expected >=90% savings, got ${result.savings.costSavedPct}%`);
    assert.ok(result.latencyMs < 15, `Expected <15ms routing latency, got ${result.latencyMs}ms`);
  });

  it('routes critical Postgres billing race condition tasks to DEEP + HIGH effort + plan-first', () => {
    const preset = PLAYGROUND_PRESETS.find((p) => p.id === 'postgres-race')!;
    const result = scoreTask({
      prompt: preset.prompt,
      filePaths: preset.filePaths,
      filesTouchedOverride: preset.filesTouched,
      downstreamFanOutOverride: preset.downstreamFanOut,
      historicalRevertRateOverride: preset.historicalRevertRate,
      gitDiffSummary: preset.gitDiffSummary,
    });

    assert.ok(result.totalScore >= 72, `Expected score >= 72, got ${result.totalScore}`);
    assert.equal(result.recommendedTier, 'deep');
    assert.equal(result.recommendedEffort, 'high');
    assert.equal(result.executionMode, 'plan-first');
    assert.equal(result.primaryModel, 'Claude 4.6 Opus');
    assert.ok(result.latencyMs < 15);
  });

  it('routes medium-complexity eval runner tasks to BALANCED tier', () => {
    const preset = PLAYGROUND_PRESETS.find((p) => p.id === 'golden-eval-runner')!;
    const result = scoreTask({
      prompt: preset.prompt,
      filePaths: preset.filePaths,
      filesTouchedOverride: preset.filesTouched,
      downstreamFanOutOverride: preset.downstreamFanOut,
      historicalRevertRateOverride: preset.historicalRevertRate,
      gitDiffSummary: preset.gitDiffSummary,
    });

    assert.ok(
      result.totalScore > 32 && result.totalScore <= 68,
      `Expected balanced score (33..68), got ${result.totalScore}`
    );
    assert.equal(result.recommendedTier, 'balanced');
    assert.equal(result.primaryModel, 'Claude 4.6 Sonnet');
  });

  it('extracts ES module and CommonJS imports and computes transitive DFS fan-out accurately', () => {
    const code = `
      import { scoreTask } from '@agent-gauge/core-scorer';
      import type { Config } from './config.js';
      const db = require('../db/sqlite');
      const lazy = await import('./lazy-worker.ts');
    `;
    const extracted = extractImportsFromSource(code);
    assert.deepEqual(extracted.sort(), [
      '../db/sqlite',
      './config.js',
      './lazy-worker.ts',
      '@agent-gauge/core-scorer',
    ]);

    const graph: Record<string, string[]> = {
      'src/api/billing.ts': ['src/db/ledger.ts'],
      'src/api/webhooks.ts': ['src/api/billing.ts'],
      'src/workers/reconcile.ts': ['src/db/ledger.ts'],
      'src/app/dashboard.tsx': ['src/api/webhooks.ts'],
    };

    const fanOut = computeTransitiveFanOut(['src/db/ledger.ts'], graph);
    assert.equal(fanOut, 4);

    const blast = computeBlastRadius({
      filePaths: ['src/db/ledger.ts', 'prisma/schema.prisma'],
      importGraph: graph,
    });
    assert.equal(blast.downstreamFanOut, 4);
    assert.equal(blast.isSharedSchemaOrConfig, true);
  });

  it('tightens calibration thresholds when a fast or balanced turn is reverted or escalated', () => {
    const initial = { ...DEFAULT_CALIBRATION_POLICY };
    const afterRegret = updateCalibrationPolicy(initial, {
      runId: 'run-001',
      score: 30,
      tierUsed: 'fast',
      effortUsed: 'low',
      accepted: false,
      revertedLinesRatio: 0.85,
      escalatedNextTurn: true,
      filePaths: ['packages/billing/src/ledger.ts'],
    });

    assert.ok(
      afterRegret.fastMaxScore < initial.fastMaxScore,
      `Expected fastMaxScore to tighten below ${initial.fastMaxScore}, got ${afterRegret.fastMaxScore}`
    );
    assert.ok(afterRegret.pathRevertRates['packages/billing/src/ledger.ts'] > 0.1);
  });

  it('classifies task intents across concurrency, multi-agent, UI, and docs accurately', () => {
    const concurrency = classifyTaskIntent(
      'Resolve deadlock and distributed lock contention in Redis mutex'
    );
    assert.equal(concurrency.category, 'concurrency-debug');
    assert.ok(concurrency.score >= 24);

    const docs = classifyTaskIntent('Fix typo in README.md and update contributing badge');
    assert.equal(docs.category, 'docs');
    assert.ok(docs.score <= 8);
  });
});


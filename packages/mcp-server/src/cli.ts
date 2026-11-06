#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { AgentGaugeMcpEngine, startMcpStdioServer } from './index.ts';
import type { EffortLevel } from '../../core-scorer/src/index.ts';

function parseFlags(argv: string[]): { positional: string[]; flags: Record<string, string | boolean> } {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const { positional, flags } = parseFlags(args.slice(1));

  if (command === 'mcp') {
    startMcpStdioServer();
    return;
  }

  const engine = new AgentGaugeMcpEngine(
    typeof flags.db === 'string' ? flags.db : undefined
  );

  if (command === 'score') {
    const prompt =
      positional.join(' ') ||
      (typeof flags.prompt === 'string' ? flags.prompt : '') ||
      'Refactor multi-module authentication middleware and add integration tests';
    const filePaths =
      typeof flags.files === 'string'
        ? flags.files.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    const gitDiffSummary = typeof flags.diff === 'string' ? flags.diff : undefined;

    const { runId, result } = engine.executeScoreTask({
      prompt,
      filePaths,
      gitDiffSummary,
    });

    if (flags.json) {
      console.log(JSON.stringify({ runId, ...result }, null, 2));
      return;
    }

    console.log(`\n┌─────────────────────────────────────────────────────────────────────────┐`);
    console.log(`│  ${result.statusBarLabel.padEnd(71)}│`);
    console.log(`├─────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│  Run ID:            ${runId.padEnd(52)}│`);
    console.log(`│  Recommended Model: ${(result.primaryModel + ' (Alt: ' + result.alternateModel + ')').padEnd(52)}│`);
    console.log(`│  Tier & Effort:     ${(result.recommendedTier.toUpperCase() + ' · ' + result.recommendedEffort.toUpperCase() + ' EFFORT').padEnd(52)}│`);
    console.log(`│  Execution Mode:    ${result.executionMode.padEnd(52)}│`);
    console.log(`│  Routing Latency:   ${(result.latencyMs + ' ms (<15ms deterministic SLA)').padEnd(52)}│`);
    console.log(`│  Context Shield:    ${('Max ' + result.contextBudget.maxPromptTokensRecommended + ' tokens · Max ' + result.contextBudget.maxFilesToInject + ' files').padEnd(52)}│`);
    console.log(`├─────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│  Score Breakdown (0-100):                                               │`);
    console.log(`│    • Task Intent:       ${String(result.breakdown.intent.score + '/35').padEnd(10)} (${result.breakdown.intent.category})`.padEnd(74) + `│`);
    console.log(`│    • Blast Radius:      ${String(result.breakdown.blastRadius.score + '/30').padEnd(10)} (${result.breakdown.blastRadius.filesTouched} files, ${result.breakdown.blastRadius.downstreamFanOut} fan-out)`.padEnd(74) + `│`);
    console.log(`│    • Structural:        ${String(result.breakdown.structural.score + '/20').padEnd(10)} (${result.breakdown.structural.indicators[0] || 'standard'})`.padEnd(74) + `│`);
    console.log(`│    • Historical Risk:   ${String(result.breakdown.repoRisk.score + '/15').padEnd(10)} (${(result.breakdown.repoRisk.effectiveRevertRate * 100).toFixed(1)}% revert rate)`.padEnd(74) + `│`);
    console.log(`├─────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│  Estimated Savings vs Opus High: ${String(result.savings.costSavedPct + '% ($' + result.savings.recommendedCostUsd + ' vs $' + result.savings.baselineDeepHighCostUsd + ')').padEnd(39)}│`);
    console.log(`│  First-Pass Confidence:          ${String(result.savings.winRateConfidencePct + '%').padEnd(39)}│`);
    console.log(`└─────────────────────────────────────────────────────────────────────────┘`);
    if (result.regretAlert.isHighRisk && result.regretAlert.warning) {
      console.log(`\n${result.regretAlert.warning}\n`);
    } else {
      console.log('');
    }
    return;
  }

  if (command === 'log') {
    const runId = typeof flags['run-id'] === 'string' ? flags['run-id'] : `run-${Date.now().toString(36)}`;
    const modelUsed = typeof flags.model === 'string' ? flags.model : 'Claude 4.6 Sonnet';
    const effortUsed = (typeof flags.effort === 'string' ? flags.effort : 'medium') as EffortLevel;
    const revertedLinesRatio = typeof flags.reverted === 'string' ? parseFloat(flags.reverted) : 0;
    const escalatedNextTurn = Boolean(flags.escalated);
    const accepted = flags.accepted !== 'false' && revertedLinesRatio < 0.35;

    const res = engine.executeRecordOutcome({
      runId,
      modelUsed,
      effortUsed,
      accepted,
      revertedLinesRatio,
      escalatedNextTurn,
    });
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (command === 'audit') {
    const currentPrompt = positional.join(' ') || (typeof flags.prompt === 'string' ? flags.prompt : undefined);
    const res = engine.executeAuditGitSurvival({ currentPrompt });
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (command === 'report' || command === 'export') {
    const outPath =
      typeof flags.out === 'string'
        ? flags.out
        : command === 'export'
          ? 'report.json'
          : undefined;

    const { markdown, savedJsonPath, report } = engine.executeGenerateRoiReport({
      outputJsonPath: outPath,
    });

    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(markdown);
      if (savedJsonPath) {
        console.log(`\n✅ Exported interactive telemetry JSON to: ${savedJsonPath}`);
      }
    }
    return;
  }

  if (command === 'pr-audit') {
    const baseRef = typeof flags.base === 'string' ? flags.base : 'origin/main';
    let changedFiles: string[] = [];
    let diffStat = '';

    try {
      const filesRaw = execSync(
        `git diff --name-only ${baseRef}...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || git status --porcelain`,
        { encoding: 'utf8' }
      );
      changedFiles = filesRaw
        .split('\n')
        .map((s) => s.trim().replace(/^[ MADRCU?!]{1,2}\s+/, ''))
        .filter(Boolean);
      diffStat = execSync(
        `git diff --stat ${baseRef}...HEAD 2>/dev/null || git diff --stat HEAD~1 2>/dev/null || git diff --stat`,
        { encoding: 'utf8' }
      ).trim();
    } catch {
      changedFiles = [];
    }

    const prPrompt =
      typeof flags.title === 'string'
        ? flags.title
        : `Pull Request Audit on ${changedFiles.length} file(s)`;
    const { result } = engine.executeScoreTask({
      prompt: prPrompt,
      filePaths: changedFiles,
      gitDiffSummary: diffStat,
    });

    const isHighRisk = result.regretAlert.isHighRisk;
    const riskBadge = isHighRisk ? '🚨 HIGH REGRET RISK' : '✅ LOW RISK (Safe to Merge)';

    const prCommentMarkdown = [
      `### ⚡ AgentGauge Pull Request Audit`,
      ``,
      `| Metric | Audit Assessment | Details |`,
      `| :--- | :--- | :--- |`,
      `| **Complexity Score** | **\`${result.totalScore}/100\`** · **${result.recommendedTier.toUpperCase()}** | Model: \`${result.primaryModel}\` (${result.recommendedEffort.toUpperCase()} effort · \`${result.executionMode}\`) |`,
      `| **Blast Radius** | **\`${result.breakdown.blastRadius.filesTouched} file(s)\`** | Downstream fan-out: \`${result.breakdown.blastRadius.downstreamFanOut}\` modules |`,
      `| **Context Window Shield** | **\`Max ${result.contextBudget.maxPromptTokensRecommended.toLocaleString()} tokens\`** | Limit prompt context to \`≤ ${result.contextBudget.maxFilesToInject} files\` |`,
      `| **AI Quota Saved** | **\`${result.savings.costSavedPct}% saved\`** | Routed cost: **\`$${result.savings.recommendedCostUsd}\`** vs **\`$${result.savings.baselineDeepHighCostUsd}\`** on Opus High |`,
      `| **Regression / Regret Sentry** | **${riskBadge}** | Empirical survival rate: \`${100 - result.regretAlert.historicalRevertRatePct}%\` |`,
      ``,
      isHighRisk && result.regretAlert.warning ? `> ${result.regretAlert.warning}\n` : '',
      `> 💡 *Generated by [AgentGauge](https://github.com/Agent-Gauge/agent-gauge) — Deterministic <15ms coding task router and git diff survival telemetry.*`,
    ]
      .filter(Boolean)
      .join('\n');

    const outPath =
      typeof flags.output === 'string'
        ? flags.output
        : typeof flags.out === 'string'
        ? flags.out
        : undefined;

    if (outPath) {
      fs.writeFileSync(outPath, prCommentMarkdown, 'utf8');
      console.log(`✅ Saved PR Audit comment to: ${outPath}`);
    }

    if (flags.json) {
      console.log(JSON.stringify({ ...result, markdown: prCommentMarkdown }, null, 2));
    } else {
      console.log(prCommentMarkdown);
    }
    return;
  }

  console.log(`
⚡ AgentGauge CLI (v1.0.0) — Deterministic <15ms Task Router & Telemetry Engine

Usage:
  gauge score "<prompt>" [--files a.ts,b.ts] [--json]   Score a task in <15ms with Context Shield
  gauge pr-audit [--base origin/main] [--out pr.md]     Generate PR AI Cost & Complexity Badge
  gauge log --run-id <id> --model <name> --effort <lvl> Record turn outcome & calibrate
  gauge audit ["<nextPrompt>"]                          Audit git diff survival of last run
  gauge report [--out report.json]                      Generate Markdown ROI report & JSON
  gauge export [--out report.json]                      Export report.json for Web Dashboard
  gauge mcp                                             Start MCP stdio server
`);
}

main();


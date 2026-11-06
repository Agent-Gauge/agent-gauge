import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { extractImportsFromSource } from '../../core-scorer/src/index.ts';
import type { LoggedRunRow } from './db.ts';

export interface GitSurvivalAuditResult {
  runId: string;
  accepted: boolean;
  revertedLinesRatio: number;
  escalatedNextTurn: boolean;
  modifiedFilesNow: string[];
  overlappingFiles: string[];
  gitDiffStat: string;
  explanation: string;
}

/**
 * Builds a fast local import graph (<10ms budget) by scanning target files and immediate sibling/workspace files.
 */
export function scanLocalImportGraph(
  targetFiles: string[],
  workspaceRoot = process.cwd()
): { importGraph: Record<string, string[]>; combinedCodeSnippet: string } {
  const importGraph: Record<string, string[]> = {};
  const snippets: string[] = [];
  const startTime = performance.now();

  const candidateFiles = new Set<string>();
  for (const relOrAbs of targetFiles) {
    const resolved = path.isAbsolute(relOrAbs)
      ? relOrAbs
      : path.resolve(workspaceRoot, relOrAbs);
    candidateFiles.add(resolved);

    // Also inspect sibling files in the same directory to capture immediate importers
    const dir = path.dirname(resolved);
    if (fs.existsSync(dir)) {
      try {
        for (const entry of fs.readdirSync(dir)) {
          if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
            candidateFiles.add(path.join(dir, entry));
          }
        }
      } catch {
        // Ignore unreadable dirs
      }
    }
  }

  for (const filePath of candidateFiles) {
    if (performance.now() - startTime > 9.5) {
      break; // Strictly enforce <15ms total scoring SLA
    }
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath, 'utf8').slice(0, 16384);
        const relKey = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
        importGraph[relKey] = extractImportsFromSource(content);
        if (targetFiles.some((t) => filePath.endsWith(t))) {
          snippets.push(content.slice(0, 4096));
        }
      }
    } catch {
      // Ignore file read errors
    }
  }

  return {
    importGraph,
    combinedCodeSnippet: snippets.join('\n').slice(0, 8192),
  };
}

/**
 * Inspects current git working tree (`git status --porcelain` and `git diff --shortstat`)
 * against the last scored run to infer whether changes survived or were reverted.
 */
export function auditGitSurvival(
  lastRun: LoggedRunRow | null,
  currentPrompt?: string,
  workspaceRoot = process.cwd()
): GitSurvivalAuditResult {
  let modifiedFilesNow: string[] = [];
  let gitDiffStat = 'clean working tree';

  try {
    const statusOut = execSync('git status --porcelain', {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 1500,
    });
    modifiedFilesNow = statusOut
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.slice(3).trim());

    const diffStatOut = execSync('git diff --shortstat', {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 1500,
    }).trim();
    if (diffStatOut) {
      gitDiffStat = diffStatOut;
    }
  } catch {
    gitDiffStat = 'git repository not initialized or clean';
  }

  if (!lastRun) {
    return {
      runId: 'none',
      accepted: true,
      revertedLinesRatio: 0,
      escalatedNextTurn: false,
      modifiedFilesNow,
      overlappingFiles: [],
      gitDiffStat,
      explanation: 'No previous run found in SQLite telemetry; baseline survival assumed.',
    };
  }

  const overlappingFiles = lastRun.filePaths.filter((fp) =>
    modifiedFilesNow.some((mod) => mod.endsWith(fp) || fp.endsWith(mod))
  );

  // Detect regret/escalation if user immediately re-prompts on the same files with fix/revert keywords
  const isRetryPrompt =
    Boolean(currentPrompt) &&
    /\b(revert|undo|still\s+broken|didn't\s+work|wrong|try\s+again|broken|regression)\b/i.test(
      currentPrompt!
    );

  const revertedLinesRatio = isRetryPrompt
    ? 0.85
    : lastRun.filePaths.length > 0 && overlappingFiles.length === 0 && modifiedFilesNow.length > 0
      ? 0.45
      : 0.02;

  const accepted = revertedLinesRatio < 0.35 && !isRetryPrompt;
  const escalatedNextTurn = isRetryPrompt;

  return {
    runId: lastRun.runId,
    accepted,
    revertedLinesRatio,
    escalatedNextTurn,
    modifiedFilesNow,
    overlappingFiles,
    gitDiffStat,
    explanation: accepted
      ? `Run ${lastRun.runId} (${lastRun.primaryModel} · ${lastRun.recommendedEffort}) survived in git tree (reverted ratio ${(revertedLinesRatio * 100).toFixed(0)}%).`
      : `Run ${lastRun.runId} detected high revert/retry signal (reverted ratio ${(revertedLinesRatio * 100).toFixed(0)}%, escalated=${escalatedNextTurn}). Tightening repo threshold.`,
  };
}


import { classifyTaskIntent, type IntentClassification, type TaskCategory } from './intent.ts';
import { computeBlastRadius, type BlastRadiusInput, type BlastRadiusResult } from './blast-radius.ts';
import {
  calculateSavingsAndComparison,
  type EffortLevel,
  type ModelTier,
  type SavingsEstimate,
} from './pricing.ts';
import {
  computeHistoricalRepoRisk,
  DEFAULT_CALIBRATION_POLICY,
  type RepoCalibrationPolicy,
} from './calibration.ts';

export type ExecutionMode = 'direct' | 'delegate-research-subagent' | 'plan-first';

export interface ScoreTaskInput extends BlastRadiusInput {
  prompt: string;
  /** Optional git diff stat or snippet to inspect structural complexity */
  gitDiffSummary?: string;
  /** Optional code snippet or target file contents for AST/cyclomatic heuristics */
  codeSnippet?: string;
  /** Optional explicit historical revert rate override (0.0 to 1.0, e.g. 0.15 for 15%) */
  historicalRevertRateOverride?: number;
  /** Optional repo calibration policy */
  calibrationPolicy?: RepoCalibrationPolicy;
}

export interface StructuralComplexityResult {
  score: number; // 0 to 20
  indicators: string[];
  summary: string;
}

export interface ScoreBreakdown {
  intent: IntentClassification;
  blastRadius: BlastRadiusResult;
  structural: StructuralComplexityResult;
  repoRisk: {
    score: number; // 0 to 15
    effectiveRevertRate: number;
    summary: string;
  };
}

export interface TaskScoreResult {
  totalScore: number; // 0 to 100
  taskCategory: TaskCategory;
  recommendedTier: ModelTier;
  recommendedEffort: EffortLevel;
  executionMode: ExecutionMode;
  primaryModel: string;
  alternateModel: string;
  statusBarLabel: string;
  rationale: string;
  latencyMs: number;
  breakdown: ScoreBreakdown;
  savings: SavingsEstimate;
}

const STRUCTURAL_INDICATORS: Array<{ label: string; weight: number; pattern: RegExp }> = [
  {
    label: 'nested async / concurrency control',
    weight: 6,
    pattern: /\b(Promise\.all|Promise\.race|async\s+function|AbortController|Worker|SharedArrayBuffer|Atomics|mutex|semaphore|queue|lock)\b/i,
  },
  {
    label: 'state machine / graph reducer',
    weight: 6,
    pattern: /\b(state\s*machine|reducer|checkpoint|deseriali[sz]e|graph\s*node|transition|xstate|langgraph|dag)\b/i,
  },
  {
    label: 'SQL / transactional query logic',
    weight: 5,
    pattern: /\b(SELECT\s+.*FROM|JOIN\b|GROUP\s+BY|HAVING\b|WITH\s+RECURSIVE|FOR\s+UPDATE|transaction|prisma\.\$transaction|isolation\s*level)\b/i,
  },
  {
    label: 'AST / compiler / regex parser',
    weight: 5,
    pattern: /\b(RegExp|ast\b|visitor|babel|ts\.createSourceFile|tree[\s-]*sitter|lexer|tokenizer|parser)\b/i,
  },
  {
    label: 'streaming / WebSocket / binary protocol',
    weight: 4,
    pattern: /\b(ReadableStream|TransformStream|WebSocket|EventSource|SSE|gRPC|protobuf|Buffer\.from|Uint8Array)\b/i,
  },
  {
    label: 'error recovery / retry / circuit breaker',
    weight: 4,
    pattern: /\b(exponential\s*backoff|circuit\s*breaker|dead\s*letter|idempotency\s*key|rollback|compensat(ing|ion))\b/i,
  },
];

/**
 * Computes the Structural Complexity Score (0-20) from prompt, git diff, and optional code snippet.
 */
export function computeStructuralComplexity(
  prompt: string,
  gitDiffSummary = '',
  codeSnippet = ''
): StructuralComplexityResult {
  const combined = `${prompt}\n${gitDiffSummary}\n${codeSnippet}`;
  const indicators: string[] = [];
  let rawScore = 3; // Base structural score

  for (const rule of STRUCTURAL_INDICATORS) {
    if (rule.pattern.test(combined)) {
      rawScore += rule.weight;
      indicators.push(rule.label);
    }
  }

  // Check cyclomatic control flow density if codeSnippet or diff is provided
  const controlFlowMatches =
    (codeSnippet.match(/\b(if|else\s+if|switch|case|for|while|catch|try)\b/g) || []).length;
  if (controlFlowMatches >= 12) {
    rawScore += 5;
    indicators.push(`high branching density (${controlFlowMatches} branches)`);
  } else if (controlFlowMatches >= 5) {
    rawScore += 3;
    indicators.push(`moderate branching (${controlFlowMatches} branches)`);
  }

  // Check git diff line volume if present (e.g., "14 files changed, 620 insertions(+), 180 deletions(-)")
  const insertionsMatch = gitDiffSummary.match(/(\d+)\s+insertion/i);
  const deletionsMatch = gitDiffSummary.match(/(\d+)\s+deletion/i);
  const totalChurn =
    (insertionsMatch ? parseInt(insertionsMatch[1], 10) : 0) +
    (deletionsMatch ? parseInt(deletionsMatch[1], 10) : 0);

  if (totalChurn > 500) {
    rawScore += 5;
    indicators.push(`large diff churn (${totalChurn} lines)`);
  } else if (totalChurn > 150) {
    rawScore += 3;
    indicators.push(`medium diff churn (${totalChurn} lines)`);
  }

  // Low-complexity overrides for pure styling / copy
  if (
    indicators.length === 0 &&
    /\b(css|tailwind|dark[\s-]*mode|readme|typo|padding|margin|footer|color)\b/i.test(prompt)
  ) {
    rawScore = 2;
    indicators.push('declarative markup / styling only');
  } else if (indicators.length === 0) {
    indicators.push('standard procedural logic');
  }

  const score = Math.max(1, Math.min(20, Math.round(rawScore)));
  return {
    score,
    indicators,
    summary: `Structural complexity ${score}/20 pts via [${indicators.slice(0, 3).join(', ')}]`,
  };
}

/**
 * Primary deterministic <15ms task router.
 * Combines Intent (0-35), Blast Radius (0-30), Structural Complexity (0-20), and Repo Risk (0-15)
 * into a 0-100 score and maps to optimal (Agent Mode + Model Tier + Effort Level).
 */
export function scoreTask(input: ScoreTaskInput): TaskScoreResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const policy = input.calibrationPolicy ?? DEFAULT_CALIBRATION_POLICY;

  // 1. Task Intent Score (0-35)
  const intent = classifyTaskIntent(input.prompt);

  // 2. Blast Radius Score (0-30)
  const blastRadius = computeBlastRadius({
    filePaths: input.filePaths,
    filesTouchedOverride: input.filesTouchedOverride,
    downstreamFanOutOverride: input.downstreamFanOutOverride,
    importGraph: input.importGraph,
  });

  // 3. Structural Complexity Score (0-20)
  const structural = computeStructuralComplexity(
    input.prompt,
    input.gitDiffSummary,
    input.codeSnippet
  );

  // 4. Historical Repo Risk Score (0-15)
  const repoRisk = computeHistoricalRepoRisk(
    input.filePaths,
    input.historicalRevertRateOverride,
    policy
  );

  const totalScore = Math.max(
    0,
    Math.min(100, intent.score + blastRadius.score + structural.score + repoRisk.score)
  );

  // Determine Recommended Model Tier using calibrated repository cutoffs
  let recommendedTier: ModelTier;
  if (totalScore <= policy.fastMaxScore && intent.riskLevel !== 'critical') {
    recommendedTier = 'fast';
  } else if (totalScore <= policy.balancedMaxScore) {
    recommendedTier = 'balanced';
  } else {
    recommendedTier = 'deep';
  }

  // Determine Recommended Effort Level (low | medium | high)
  let recommendedEffort: EffortLevel;
  if (recommendedTier === 'fast') {
    recommendedEffort = totalScore >= 22 ? 'medium' : 'low';
  } else if (recommendedTier === 'balanced') {
    if (totalScore >= 56 || intent.riskLevel === 'high') {
      recommendedEffort = 'high';
    } else if (totalScore <= 40) {
      recommendedEffort = 'low';
    } else {
      recommendedEffort = 'medium';
    }
  } else {
    // deep tier
    recommendedEffort = totalScore >= 80 || intent.riskLevel === 'critical' ? 'high' : 'medium';
  }

  // Determine Optimal Agent Execution Mode
  let executionMode: ExecutionMode = 'direct';
  if (totalScore >= 72 || intent.category === 'architecture' || blastRadius.filesTouched >= 12) {
    executionMode = 'plan-first';
  } else if (
    blastRadius.downstreamFanOut >= 18 ||
    blastRadius.filesTouched >= 6 ||
    intent.category === 'refactor'
  ) {
    executionMode = 'delegate-research-subagent';
  }

  // Map tier to concrete frontier model recommendations
  const modelMap: Record<ModelTier, { primary: string; alternate: string; short: string }> = {
    fast: {
      primary: 'Gemini 3.1 Flash',
      alternate: 'Claude 4.5 Haiku',
      short: 'Flash',
    },
    balanced: {
      primary: 'Claude 4.6 Sonnet',
      alternate: 'Gemini 4 Argon',
      short: 'Sonnet',
    },
    deep: {
      primary: 'Claude 4.6 Opus',
      alternate: 'Gemini 3.1 Pro',
      short: 'Opus',
    },
  };

  const models = modelMap[recommendedTier];
  const effortShort =
    recommendedEffort === 'low' ? 'Low' : recommendedEffort === 'medium' ? 'Med' : 'High';

  const statusBarLabel = `⚡ Gauge: ${models.short} · ${effortShort} (Score ${totalScore})`;

  const savings = calculateSavingsAndComparison(
    recommendedTier,
    recommendedEffort,
    totalScore,
    repoRisk.effectiveRevertRate
  );

  const rationale = `Score ${totalScore}/100 [Intent ${intent.score}/35 (${intent.category}), Blast ${blastRadius.score}/30 (${blastRadius.filesTouched} files, ${blastRadius.downstreamFanOut} fan-out), Struct ${structural.score}/20, RepoRisk ${repoRisk.score}/15] → Route to ${models.primary} (${recommendedEffort.toUpperCase()} effort, ${executionMode}) saving ${savings.costSavedPct}% vs Opus High.`;

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const latencyMs = Number(Math.max(0.05, endTime - startTime).toFixed(2));

  return {
    totalScore,
    taskCategory: intent.category,
    recommendedTier,
    recommendedEffort,
    executionMode,
    primaryModel: models.primary,
    alternateModel: models.alternate,
    statusBarLabel,
    rationale,
    latencyMs,
    breakdown: {
      intent,
      blastRadius,
      structural,
      repoRisk,
    },
    savings,
  };
}

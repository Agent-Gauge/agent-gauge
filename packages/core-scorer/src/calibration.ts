import type { EffortLevel, ModelTier } from './pricing.ts';

export interface RepoCalibrationPolicy {
  repoId: string;
  /** Score cutoff (inclusive) up to which `fast` tier is used. Default: 32 */
  fastMaxScore: number;
  /** Score cutoff (inclusive) up to which `balanced` tier is used. Default: 68 */
  balancedMaxScore: number;
  /** Historical revert rate (0.0 to 1.0) observed per directory/file pattern */
  pathRevertRates: Record<string, number>;
  /** Total turns observed for Bayesian posterior weighting */
  totalTurns: number;
  /** Empirical first-pass git diff survival rate (0.0 to 1.0) */
  survivalRate: number;
  /** Last ISO timestamp updated */
  updatedAt: string;
}

export interface TurnOutcomeRecord {
  runId: string;
  score: number;
  tierUsed: ModelTier;
  effortUsed: EffortLevel;
  accepted: boolean;
  /** 0.0 (all lines survived) to 1.0 (all edited lines reverted) */
  revertedLinesRatio: number;
  /** True if user immediately re-prompted on the same files with a higher model/effort tier */
  escalatedNextTurn: boolean;
  filePaths?: string[];
}

export const DEFAULT_CALIBRATION_POLICY: RepoCalibrationPolicy = {
  repoId: 'default',
  fastMaxScore: 32,
  balancedMaxScore: 68,
  pathRevertRates: {},
  totalTurns: 0,
  survivalRate: 0.94,
  updatedAt: '2026-11-06T00:00:00.000Z',
};

/**
 * Computes Historical Repo Risk Score (0-15) given target file paths, explicit revert rate override,
 * and a calibrated repository policy.
 */
export function computeHistoricalRepoRisk(
  filePaths: string[] = [],
  revertRateOverride?: number,
  policy: RepoCalibrationPolicy = DEFAULT_CALIBRATION_POLICY
): { score: number; effectiveRevertRate: number; summary: string } {
  let effectiveRevertRate = revertRateOverride ?? Math.max(0, 1 - policy.survivalRate);

  if (revertRateOverride === undefined && filePaths.length > 0) {
    let matchedRates: number[] = [];
    for (const fp of filePaths) {
      for (const [pattern, rate] of Object.entries(policy.pathRevertRates)) {
        if (fp.includes(pattern)) {
          matchedRates.push(rate);
        }
      }
    }
    if (matchedRates.length > 0) {
      effectiveRevertRate = Math.max(...matchedRates);
    }
  }

  // Clamp revert rate to [0, 1]
  const clampedRate = Math.max(0, Math.min(1, effectiveRevertRate));
  // 0% revert -> 0 pts, 25% revert -> 8 pts, >=50% revert -> 15 pts
  const score = Math.min(15, Math.round(clampedRate * 30));

  return {
    score,
    effectiveRevertRate: Number(clampedRate.toFixed(3)),
    summary: `Historical revert rate ${(clampedRate * 100).toFixed(1)}% (${score}/15 pts)`,
  };
}

/**
 * Bayesian-smoothed policy calibration updater.
 * Adjusts `fastMaxScore`, `balancedMaxScore`, and per-path revert rates based on
 * real git diff survival and escalation telemetry.
 */
export function updateCalibrationPolicy(
  policy: RepoCalibrationPolicy,
  outcome: TurnOutcomeRecord
): RepoCalibrationPolicy {
  const next: RepoCalibrationPolicy = {
    ...policy,
    pathRevertRates: { ...policy.pathRevertRates },
    totalTurns: policy.totalTurns + 1,
    updatedAt: new Date().toISOString(),
  };

  const turnSurvived =
    outcome.accepted && outcome.revertedLinesRatio < 0.35 && !outcome.escalatedNextTurn;
  const survivalNumeric = turnSurvived ? 1.0 : Math.max(0, 1 - outcome.revertedLinesRatio);

  // Bayesian Beta posterior update with prior strength = 10 turns
  const priorWeight = Math.min(50, Math.max(10, policy.totalTurns));
  next.survivalRate = Number(
    ((policy.survivalRate * priorWeight + survivalNumeric) / (priorWeight + 1)).toFixed(4)
  );

  // Regret / Under-provisioning event: reverted or escalated on fast/balanced tier
  const isRegretEvent = !turnSurvived || outcome.escalatedNextTurn;

  if (isRegretEvent) {
    if (outcome.tierUsed === 'fast') {
      // Tighten fast cutoff downward so similar tasks route to balanced next time
      next.fastMaxScore = Math.max(15, policy.fastMaxScore - (outcome.escalatedNextTurn ? 3 : 2));
    } else if (outcome.tierUsed === 'balanced') {
      // Tighten balanced cutoff downward so similar tasks route to deep next time
      next.balancedMaxScore = Math.max(
        45,
        policy.balancedMaxScore - (outcome.escalatedNextTurn ? 4 : 2)
      );
    }
  } else {
    // High survival near threshold cutoff gradually relaxes cutoff (+1 pt after consistent wins)
    if (
      outcome.tierUsed === 'fast' &&
      outcome.score >= policy.fastMaxScore - 4 &&
      outcome.revertedLinesRatio === 0
    ) {
      next.fastMaxScore = Math.min(42, policy.fastMaxScore + 1);
    } else if (
      outcome.tierUsed === 'balanced' &&
      outcome.score >= policy.balancedMaxScore - 4 &&
      outcome.revertedLinesRatio === 0
    ) {
      next.balancedMaxScore = Math.min(78, policy.balancedMaxScore + 1);
    }
  }

  // Update per-path revert rate memory
  if (outcome.filePaths && outcome.filePaths.length > 0) {
    for (const fp of outcome.filePaths) {
      const prevRate = next.pathRevertRates[fp] ?? 0.06;
      const observedRevert = outcome.escalatedNextTurn
        ? Math.max(0.5, outcome.revertedLinesRatio)
        : outcome.revertedLinesRatio;
      next.pathRevertRates[fp] = Number((prevRate * 0.75 + observedRevert * 0.25).toFixed(3));
    }
  }

  return next;
}

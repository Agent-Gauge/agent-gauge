export type ModelTier = 'fast' | 'balanced' | 'deep';
export type EffortLevel = 'low' | 'medium' | 'high';

export interface FrontierModelSpec {
  id: string;
  name: string;
  provider: 'Anthropic' | 'Google' | 'OpenAI';
  tier: ModelTier;
  inputUsdPer1M: number;
  outputUsdPer1M: number;
  baseLatencySec: number;
  quotaMultiplier: number; // Relative to 1x standard turn
}

export interface ModelComparisonRow {
  modelId: string;
  modelName: string;
  provider: string;
  tier: ModelTier;
  effort: EffortLevel;
  estimatedCostUsd: number;
  estimatedLatencySec: number;
  quotaUnits: number;
  savingsVsDeepHighPct: number;
  isRecommended: boolean;
}

export interface SavingsEstimate {
  recommendedCostUsd: number;
  baselineDeepHighCostUsd: number;
  costSavedPct: number;
  quotaSavedPct: number;
  latencySpeedupMultiplier: number;
  winRateConfidencePct: number;
  comparisonTable: ModelComparisonRow[];
}

export const FRONTIER_MODELS: FrontierModelSpec[] = [
  {
    id: 'gemini-3.1-flash',
    name: 'Gemini 3.1 Flash',
    provider: 'Google',
    tier: 'fast',
    inputUsdPer1M: 0.15,
    outputUsdPer1M: 0.6,
    baseLatencySec: 1.8,
    quotaMultiplier: 0.25,
  },
  {
    id: 'claude-4.5-haiku',
    name: 'Claude 4.5 Haiku',
    provider: 'Anthropic',
    tier: 'fast',
    inputUsdPer1M: 0.8,
    outputUsdPer1M: 4.0,
    baseLatencySec: 2.4,
    quotaMultiplier: 0.35,
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    provider: 'Google',
    tier: 'balanced',
    inputUsdPer1M: 2.0,
    outputUsdPer1M: 10.0,
    baseLatencySec: 4.5,
    quotaMultiplier: 1.0,
  },
  {
    id: 'claude-4.6-sonnet',
    name: 'Claude 4.6 Sonnet',
    provider: 'Anthropic',
    tier: 'balanced',
    inputUsdPer1M: 3.0,
    outputUsdPer1M: 15.0,
    baseLatencySec: 5.8,
    quotaMultiplier: 1.2,
  },
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    tier: 'balanced',
    inputUsdPer1M: 2.5,
    outputUsdPer1M: 12.0,
    baseLatencySec: 5.2,
    quotaMultiplier: 1.1,
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    tier: 'deep',
    inputUsdPer1M: 4.0,
    outputUsdPer1M: 20.0,
    baseLatencySec: 11.5,
    quotaMultiplier: 2.5,
  },
  {
    id: 'claude-4.6-opus',
    name: 'Claude 4.6 Opus',
    provider: 'Anthropic',
    tier: 'deep',
    inputUsdPer1M: 15.0,
    outputUsdPer1M: 75.0,
    baseLatencySec: 18.0,
    quotaMultiplier: 5.0,
  },
];

export const EFFORT_MULTIPLIERS: Record<
  EffortLevel,
  { thinkingTokenMultiplier: number; latencyMultiplier: number; quotaFactor: number }
> = {
  low: {
    thinkingTokenMultiplier: 1.0,
    latencyMultiplier: 0.8,
    quotaFactor: 0.75,
  },
  medium: {
    thinkingTokenMultiplier: 1.65,
    latencyMultiplier: 1.15,
    quotaFactor: 1.0,
  },
  high: {
    thinkingTokenMultiplier: 2.8,
    latencyMultiplier: 1.85,
    quotaFactor: 1.65,
  },
};

/**
 * Estimates USD cost, latency, and quota usage for a given model + effort tier.
 */
export function estimateTurnCost(
  model: FrontierModelSpec,
  effort: EffortLevel,
  estimatedInputTokens = 18000,
  estimatedBaseOutputTokens = 2200
): { costUsd: number; latencySec: number; quotaUnits: number } {
  const eff = EFFORT_MULTIPLIERS[effort];
  const effectiveOutputTokens = estimatedBaseOutputTokens * eff.thinkingTokenMultiplier;

  const inputCost = (estimatedInputTokens / 1_000_000) * model.inputUsdPer1M;
  const outputCost = (effectiveOutputTokens / 1_000_000) * model.outputUsdPer1M;
  const costUsd = Number((inputCost + outputCost).toFixed(4));

  const latencySec = Number((model.baseLatencySec * eff.latencyMultiplier).toFixed(1));
  const quotaUnits = Number((model.quotaMultiplier * eff.quotaFactor).toFixed(2));

  return { costUsd, latencySec, quotaUnits };
}

/**
 * Computes comprehensive savings estimate and comparison table against defaulting to Deep + High.
 */
export function calculateSavingsAndComparison(
  recommendedTier: ModelTier,
  recommendedEffort: EffortLevel,
  complexityScore: number,
  historicalRevertRate = 0.06
): SavingsEstimate {
  const baselineModel = FRONTIER_MODELS.find((m) => m.id === 'claude-4.6-opus')!;
  const baseline = estimateTurnCost(baselineModel, 'high');

  const representativeByTier: Record<ModelTier, FrontierModelSpec> = {
    fast: FRONTIER_MODELS.find((m) => m.id === 'gemini-3.1-flash')!,
    balanced: FRONTIER_MODELS.find((m) => m.id === 'claude-4.6-sonnet')!,
    deep: FRONTIER_MODELS.find((m) => m.id === 'claude-4.6-opus')!,
  };

  const chosenModel = representativeByTier[recommendedTier];
  const chosen = estimateTurnCost(chosenModel, recommendedEffort);

  const costSavedPct = Math.max(
    0,
    Math.min(99, Math.round(((baseline.costUsd - chosen.costUsd) / baseline.costUsd) * 100))
  );
  const quotaSavedPct = Math.max(
    0,
    Math.min(98, Math.round(((baseline.quotaUnits - chosen.quotaUnits) / baseline.quotaUnits) * 100))
  );
  const latencySpeedupMultiplier = Number(
    Math.max(1.0, baseline.latencySec / Math.max(0.5, chosen.latencySec)).toFixed(1)
  );

  // Confidence starts high when tier matches score well, penalized slightly by high repo revert rates
  const tierCapacity =
    recommendedTier === 'fast' ? 38 : recommendedTier === 'balanced' ? 74 : 100;
  const headroom = Math.max(-15, tierCapacity - complexityScore);
  const rawConfidence = 91 + Math.min(7, headroom * 0.25) - historicalRevertRate * 25;
  const winRateConfidencePct = Number(
    Math.max(72, Math.min(99.2, rawConfidence)).toFixed(1)
  );

  const comparisonTable: ModelComparisonRow[] = FRONTIER_MODELS.map((model) => {
    const rowEffort: EffortLevel =
      model.tier === recommendedTier
        ? recommendedEffort
        : model.tier === 'fast'
          ? 'low'
          : model.tier === 'balanced'
            ? 'medium'
            : 'high';

    const stats = estimateTurnCost(model, rowEffort);
    const savingsVsDeepHighPct = Math.max(
      0,
      Math.round(((baseline.costUsd - stats.costUsd) / baseline.costUsd) * 100)
    );

    return {
      modelId: model.id,
      modelName: model.name,
      provider: model.provider,
      tier: model.tier,
      effort: rowEffort,
      estimatedCostUsd: stats.costUsd,
      estimatedLatencySec: stats.latencySec,
      quotaUnits: stats.quotaUnits,
      savingsVsDeepHighPct,
      isRecommended: model.tier === recommendedTier,
    };
  });

  return {
    recommendedCostUsd: chosen.costUsd,
    baselineDeepHighCostUsd: baseline.costUsd,
    costSavedPct,
    quotaSavedPct,
    latencySpeedupMultiplier,
    winRateConfidencePct,
    comparisonTable,
  };
}


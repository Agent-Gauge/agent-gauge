export * from './intent.ts';
export * from './blast-radius.ts';
export * from './pricing.ts';
export * from './calibration.ts';
export * from './scorer.ts';

export interface PlaygroundPreset {
  id: string;
  title: string;
  badge: string;
  prompt: string;
  filePaths: string[];
  filesTouched: number;
  downstreamFanOut: number;
  historicalRevertRate: number;
  gitDiffSummary?: string;
}

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'postgres-race',
    title: 'Fix Postgres billing race condition',
    badge: 'Deep · High Effort',
    prompt:
      'Fix a double-spend billing race condition in our Postgres ledger transaction handler using SELECT FOR UPDATE SKIP LOCKED and idempotency keys without breaking webhook retries.',
    filePaths: [
      'packages/billing/src/ledger-transaction.ts',
      'packages/db/prisma/schema.prisma',
      'packages/billing/src/webhook-middleware.ts',
    ],
    filesTouched: 8,
    downstreamFanOut: 44,
    historicalRevertRate: 0.24,
    gitDiffSummary: '8 files changed, 312 insertions(+), 94 deletions(-)',
  },
  {
    id: 'langgraph-checkpoint',
    title: 'Debug LangGraph checkpoint deserialization',
    badge: 'Deep · High Effort',
    prompt:
      'Debug a cyclic state graph checkpoint deserialization bug where concurrent subagent handoffs drop pending tool call state during durable replay.',
    filePaths: [
      'packages/orchestrator/src/state-graph.ts',
      'packages/orchestrator/src/checkpoint-serializer.ts',
      'packages/core/src/types.ts',
    ],
    filesTouched: 6,
    downstreamFanOut: 36,
    historicalRevertRate: 0.2,
    gitDiffSummary: '6 files changed, 245 insertions(+), 80 deletions(-)',
  },
  {
    id: 'golden-eval-runner',
    title: 'Write Golden Dataset eval runner',
    badge: 'Balanced · Med Effort',
    prompt:
      'Build a deterministic golden dataset eval runner CLI that runs 50 benchmark cases in parallel with retry backoff and outputs a JSON comparison table.',
    filePaths: [
      'packages/evals/src/runner.ts',
      'packages/evals/src/metrics.ts',
      'packages/evals/src/cli.ts',
    ],
    filesTouched: 4,
    downstreamFanOut: 7,
    historicalRevertRate: 0.08,
    gitDiffSummary: '4 files changed, 185 insertions(+), 22 deletions(-)',
  },
  {
    id: 'figma-storybook',
    title: 'Extract Figma tokens to Storybook',
    badge: 'Balanced · Low Effort',
    prompt:
      'Extract our spacing, border-radius, and elevation design tokens from Figma JSON into Tailwind CSS variables and create a Storybook token showcase story.',
    filePaths: [
      'apps/web/src/styles/tokens.css',
      'apps/web/src/stories/DesignTokens.stories.tsx',
    ],
    filesTouched: 3,
    downstreamFanOut: 9,
    historicalRevertRate: 0.04,
    gitDiffSummary: '3 files changed, 110 insertions(+), 15 deletions(-)',
  },
  {
    id: 'dark-mode-footer',
    title: 'Add dark-mode classes to footer',
    badge: 'Fast · Low Effort',
    prompt:
      'Add Tailwind dark-mode background, border, and muted text utility classes to the marketing footer component and update the copyright year.',
    filePaths: ['apps/web/src/components/Footer.tsx'],
    filesTouched: 1,
    downstreamFanOut: 1,
    historicalRevertRate: 0.02,
    gitDiffSummary: '1 file changed, 14 insertions(+), 12 deletions(-)',
  },
];

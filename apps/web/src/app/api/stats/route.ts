import { NextResponse } from 'next/server';

// Static JSON endpoint compatible with Next.js `output: 'export'` on GitHub Pages
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    service: 'agent-gauge-static-stats',
    version: '1.0.0',
    communityStats: {
      totalCommunityTurnsRouted: 148_920,
      avgQuotaSavedPct: 64.2,
      avgFirstPassDiffSurvivalPct: 94.6,
      avgDeterministicLatencyMs: 1.24,
    },
  });
}

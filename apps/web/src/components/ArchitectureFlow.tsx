'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Cpu,
  GitBranch,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

const ARCH_STEPS = [
  {
    step: '01',
    title: 'Pre-Flight AST & Import-Graph Scan (<15ms)',
    subtitle: 'packages/core-scorer + router-agent.md',
    badge: 'Zero LLM Cost · 100% Local',
    description:
      'Before any frontier model is invoked, AgentGauge runs a deterministic 4-dimension scan: Task Intent regex/heuristics (0–35), DFS transitive import fan-out & critical schema detection (0–30), structural cyclomatic indicators (0–20), and path-level historical revert risk (0–15).',
    codeSnippet: `const result = scoreTask({
  prompt: "Fix Postgres billing race condition with SELECT FOR UPDATE",
  filePaths: ["packages/billing/src/ledger.ts", "prisma/schema.prisma"],
  importGraph: scanLocalImportGraph(filePaths)
});
// -> Score: 86/100 in 1.18ms (Intent 35 + Blast 26 + Struct 17 + RepoRisk 8)`,
  },
  {
    step: '02',
    title: 'Tier, Effort Level & Subagent Mode Selection',
    subtitle: 'packages/mcp-server + packages/vscode-ext',
    badge: 'Fast / Balanced / Deep · Low / Med / High',
    description:
      'Maps the 0–100 score against the repository’s calibrated cutoffs (Default: Fast ≤ 32, Balanced ≤ 68, Deep > 68) and selects the exact thinking effort multiplier (Low 1.0x, Med 1.65x, High 2.8x) plus whether to execute directly, delegate discovery to a research subagent, or plan-first.',
    codeSnippet: `{
  "recommendedTier": "deep",
  "recommendedEffort": "high",
  "executionMode": "plan-first",
  "primaryModel": "Claude 4.6 Opus",
  "alternateModel": "Gemini 3.1 Pro",
  "statusBarLabel": "⚡ Gauge: Opus · High (Score 86)"
}`,
  },
  {
    step: '03',
    title: 'Closed-Loop Git Diff Survival Calibration',
    subtitle: 'git-watcher.ts + calibration-agent.md',
    badge: 'Bayesian Beta Posterior · node:sqlite',
    description:
      'Instead of annoying popups, AgentGauge inspects git status & diff on the next turn. If edited lines survive (<35% reverted and no immediate tier escalation retry), confidence increases. If lines are reverted via git checkout or re-prompted on a higher tier, repo cutoffs tighten automatically.',
    codeSnippet: `const audit = auditGitSurvival(lastRun, nextTurnPrompt);
// revertedLinesRatio: 0.016, escalatedNextTurn: false -> accepted: true
const updatedPolicy = updateCalibrationPolicy(repoPolicy, audit);
// Stored in ~/.agent-gauge/telemetry.db (runs, outcomes, repo_policies)`,
  },
];

export function ArchitectureFlow() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="architecture" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
            <Workflow className="w-4 h-4" />
            Closed-Loop Architecture &amp; skills.sh Specification
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How the 3-Stage Routing &amp; Git Survival Loop Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            One shared TypeScript scoring kernel (<code className="text-indigo-300">@agent-gauge/core-scorer</code>)
            powers the <code className="text-slate-200">skills.sh</code> multi-agent workflow, the
            MCP stdio server, the VS Code status-bar extension, and this browser playground.
          </p>
        </div>

        {/* 3 Interactive Architecture Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {ARCH_STEPS.map((item, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <div
                key={item.step}
                onClick={() => setActiveIdx(idx)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-surface/60 border-border hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      STAGE {item.step}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">{item.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <div className="text-xs font-mono text-slate-400 mb-3">{item.subtitle}</div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="bg-[#090A0F] border border-slate-800/90 rounded-xl p-3 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                  <pre className="leading-relaxed">{item.codeSnippet}</pre>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4-Channel Monorepo Architecture Diagram Strip */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            4 Distribution Channels Published from 1 Monorepo
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#090A0F] border border-slate-800">
              <div className="text-xs font-mono text-indigo-400 mb-1">Channel 1 · skills.sh</div>
              <div className="text-sm font-bold text-white mb-1">SKILL.md + agents/*.md</div>
              <p className="text-xs text-slate-400">
                Multi-agent skill definition routing between{' '}
                <code className="text-slate-300">router-agent</code>,{' '}
                <code className="text-slate-300">calibration-agent</code>, and{' '}
                <code className="text-slate-300">report-agent</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-slate-800">
              <div className="text-xs font-mono text-emerald-400 mb-1">
                Channel 2 · npm &amp; MCP Registry
              </div>
              <div className="text-sm font-bold text-white mb-1">packages/mcp-server</div>
              <p className="text-xs text-slate-400">
                Exposes <code className="text-slate-300">score_task</code>,{' '}
                <code className="text-slate-300">record_turn_outcome</code>,{' '}
                <code className="text-slate-300">audit_git_survival</code>, and{' '}
                <code className="text-slate-300">generate_roi_report</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-slate-800">
              <div className="text-xs font-mono text-cyan-400 mb-1">
                Channel 3 · VS Code / OpenVSX
              </div>
              <div className="text-sm font-bold text-white mb-1">packages/vscode-ext</div>
              <p className="text-xs text-slate-400">
                Live status-bar item (<code className="text-slate-300">⚡ Gauge: Sonnet · Med</code>)
                with quick-pick 4-dimension breakdown &amp; savings inspector.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-slate-800">
              <div className="text-xs font-mono text-amber-400 mb-1">Channel 4 · Vercel Web App</div>
              <div className="text-sm font-bold text-white mb-1">apps/web (Next.js 15)</div>
              <p className="text-xs text-slate-400">
                Interactive live router playground &amp; client-side{' '}
                <code className="text-slate-300">report.json</code> telemetry visualizer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


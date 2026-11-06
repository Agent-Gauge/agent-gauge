'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Workflow, Layers, Sparkles } from 'lucide-react';
import { Tilt3DSpotlightCard, DecryptedText, MagnetButton } from './ReactBits3D';

const ARCH_STEPS = [
  {
    step: '01',
    title: 'Pre-Flight AST & Import-Graph Scan (<15ms)',
    subtitle: 'packages/core-scorer + router-agent.md',
    badge: 'Zero LLM Cost · 100% Local',
    accent: 'rgba(0, 240, 255, 0.28)',
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
    accent: 'rgba(124, 92, 255, 0.3)',
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
    accent: 'rgba(16, 245, 160, 0.28)',
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
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.arch-3d-reveal',
        { opacity: 0, y: 40, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="architecture" ref={sectionRef} className="py-20 md:py-28 perspective-stage">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="arch-3d-reveal text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00F0FF] mb-2">
            <Workflow className="w-4 h-4" />
            Closed-Loop Architecture &amp; UI/UX Pro Max Skill
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How the 3-Stage Routing &amp; Git Survival Loop Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            One shared TypeScript scoring kernel (
            <code className="text-[#7C5CFF] font-mono">@agent-gauge/core-scorer</code>) powers the{' '}
            <code className="text-white font-mono">skills.sh</code> multi-agent workflow, the MCP
            stdio server, the VS Code status-bar extension, and this 3D web playground.
          </p>
        </div>

        {/* 3 Interactive 3D Architecture Cards */}
        <div className="arch-3d-reveal grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {ARCH_STEPS.map((item, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <Tilt3DSpotlightCard
                key={item.step}
                onClick={() => setActiveIdx(idx)}
                accentColor={item.accent}
                maxTiltDeg={6}
                className={`cursor-pointer p-6 flex flex-col justify-between ${
                  isSelected ? 'ring-1 ring-[#7C5CFF]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#7C5CFF]/20 text-[#c4b5fd] border border-[#7C5CFF]/40">
                      <DecryptedText text={`STAGE ${item.step}`} />
                    </span>
                    <span className="text-[11px] font-mono text-[#10F5A0]">{item.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <div className="text-xs font-mono text-[#00F0FF] mb-3">{item.subtitle}</div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="bg-[#040509]/95 border border-white/10 rounded-xl p-3.5 font-mono text-[11px] text-[#c4b5fd] overflow-x-auto">
                  <pre className="leading-relaxed">{item.codeSnippet}</pre>
                </div>
              </Tilt3DSpotlightCard>
            );
          })}
        </div>

        {/* 4-Channel Monorepo + UI/UX Pro Max Skill Strip */}
        <Tilt3DSpotlightCard
          className="arch-3d-reveal p-6"
          accentColor="rgba(124, 92, 255, 0.25)"
          maxTiltDeg={3}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C5CFF]" />
              4 Distribution Channels + UI/UX Pro Max Skill Included
            </div>
            <MagnetButton
              strength={0.2}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-xs font-mono text-[#c4b5fd]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              GetLayers.ai Obsidian 3D Theme
            </MagnetButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#040509]/90 border border-white/10">
              <div className="text-xs font-mono text-[#7C5CFF] mb-1">Channel 1 · skills.sh</div>
              <div className="text-sm font-bold text-white mb-1">
                Root SKILL.md Multi-Agent
              </div>
              <p className="text-xs text-slate-400">
                Deterministic skill routing across <code className="text-slate-200">router-agent</code>
                , <code className="text-slate-200">calibration-agent</code>, and{' '}
                <code className="text-[#00F0FF]">report-agent</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#040509]/90 border border-white/10">
              <div className="text-xs font-mono text-[#10F5A0] mb-1">
                Channel 2 · npm &amp; MCP Registry
              </div>
              <div className="text-sm font-bold text-white mb-1">packages/mcp-server</div>
              <p className="text-xs text-slate-400">
                Exposes <code className="text-slate-200">score_task</code>,{' '}
                <code className="text-slate-200">record_turn_outcome</code>,{' '}
                <code className="text-slate-200">audit_git_survival</code>, and{' '}
                <code className="text-slate-200">generate_roi_report</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#040509]/90 border border-white/10">
              <div className="text-xs font-mono text-[#00F0FF] mb-1">
                Channel 3 · VS Code / OpenVSX
              </div>
              <div className="text-sm font-bold text-white mb-1">packages/vscode-ext</div>
              <p className="text-xs text-slate-400">
                Live status-bar item (<code className="text-slate-200">⚡ Gauge: Sonnet · Med</code>
                ) with quick-pick 4-dimension breakdown &amp; savings inspector.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#040509]/90 border border-white/10">
              <div className="text-xs font-mono text-[#FF9E2C] mb-1">
                Channel 4 · GitHub Pages &amp; Vercel
              </div>
              <div className="text-sm font-bold text-white mb-1">
                apps/web (Lenis + GSAP + React Bits)
              </div>
              <p className="text-xs text-slate-400">
                Interactive 3D live router playground, 4-axis complexity radar, &amp; client-side{' '}
                <code className="text-slate-200">report.json</code> visualizer.
              </p>
            </div>
          </div>
        </Tilt3DSpotlightCard>
      </div>
    </section>
  );
}

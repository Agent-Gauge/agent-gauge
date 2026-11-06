'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Terminal,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  GitBranch,
  Cpu,
  ExternalLink,
  Play,
  Sparkles,
  Box,
} from 'lucide-react';
import {
  Tilt3DSpotlightCard,
  DecryptedText,
  MagnetButton,
  Neural3DPrismCanvas,
  CountUpMetric,
} from './ReactBits3D';

type InstallChannel = 'skills' | 'cursor' | 'mcp' | 'cli';

interface ChannelConfig {
  id: InstallChannel;
  label: string;
  badge: string;
  command: string;
  secondaryCode?: string;
  description: string;
  deeplinkUrl?: string;
}

const CURSOR_MCP_CONFIG_BASE64 =
  'eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImFnZW50LWdhdWdlLW1jcCJdfQ==';

const INSTALL_CHANNELS: ChannelConfig[] = [
  {
    id: 'skills',
    label: 'skills.sh',
    badge: '1-Command Skill',
    command: 'npx skills add haripriyarao26/agent-gauge',
    description:
      'Installs root SKILL.md + router, calibration, ROI report, and UI/UX Pro Max subagents into Claude Code, Antigravity, Cursor, and Windsurf.',
  },
  {
    id: 'cursor',
    label: 'Cursor MCP Deeplink',
    badge: '1-Click Install',
    command: 'npx -y agent-gauge-mcp',
    deeplinkUrl: `cursor://anysphere.cursor-deeplink/mcp/install?name=agent-gauge&config=${CURSOR_MCP_CONFIG_BASE64}`,
    description:
      'Registers the <15ms deterministic task scorer & SQLite git survival watcher directly inside Cursor MCP tools.',
  },
  {
    id: 'mcp',
    label: 'MCP Registry JSON',
    badge: 'Stdio Server',
    command: 'npx -y agent-gauge-mcp',
    secondaryCode: `{
  "mcpServers": {
    "agent-gauge": {
      "command": "npx",
      "args": ["-y", "agent-gauge-mcp"]
    }
  }
}`,
    description:
      'Drop into ~/.cursor/mcp.json, claude_desktop_config.json, or Antigravity MCP settings. Zero API keys required.',
  },
  {
    id: 'cli',
    label: 'CLI & VS Code Ext',
    badge: 'Status Bar + CLI',
    command: 'npx agent-gauge score "Fix Postgres billing race condition" --files src/ledger.ts',
    secondaryCode: 'code --install-extension agent-gauge.agent-gauge-vscode',
    description:
      'Run pre-flight scoring or export report.json from your terminal, plus live status-bar pill in VS Code / Cursor / Antigravity.',
  },
];

const TERMINAL_DEMO_STEPS = [
  {
    id: 'step-1',
    title: '1. Pre-Flight AST & Graph Scan (1.2ms)',
    tier: 'fast' as const,
    score: 12,
    cmd: '$ gauge score "Add dark-mode classes to footer" --files apps/web/src/components/Footer.tsx',
    output: [
      '⚡ Gauge: Flash · Low (Score 12/100) — Latency: 1.18 ms',
      '├─ Task Intent:       4/35   (ui · declarative markup / styling)',
      '├─ Blast Radius:      3/30   (1 file touched · 1 downstream dependent)',
      '├─ Structural:        2/20   (zero async/branching complexity)',
      '└─ Historical Risk:   3/15   (2.0% empirical repo revert rate)',
      '✅ Recommendation: Gemini 3.1 Flash / Haiku (LOW effort · direct mode) → Saves 98% vs Opus High',
    ],
    accent: 'text-[#10F5A0]',
  },
  {
    id: 'step-2',
    title: '2. Distributed Lock Bug Triage (1.5ms)',
    tier: 'deep' as const,
    score: 86,
    cmd: '$ gauge score "Fix Postgres billing double-spend race with SELECT FOR UPDATE" --files src/ledger.ts,prisma/schema.prisma',
    output: [
      '⚡ Gauge: Opus · High (Score 86/100) — Latency: 1.54 ms',
      '├─ Task Intent:      35/35   (concurrency-debug + database-migration)',
      '├─ Blast Radius:     26/30   (8 files · 44 transitive downstream fan-out · schema.prisma)',
      '├─ Structural:       17/20   (transactional lock + webhook retry idempotency)',
      '└─ Historical Risk:   8/15   (24.0% historical revert rate on src/ledger.ts)',
      '🛡️ Recommendation: Claude 4.6 Opus / Gemini 3.1 Pro (HIGH effort · plan-first mode)',
    ],
    accent: 'text-[#FF9E2C]',
  },
  {
    id: 'step-3',
    title: '3. Git Diff Survival Loop',
    tier: 'balanced' as const,
    score: 48,
    cmd: '$ gauge audit && gauge report --out report.json',
    output: [
      '🔍 Auditing previous turn run-mw52zd5o against git working tree...',
      '├─ Modified lines intact: 98.4% (revertedLinesRatio = 0.016, escalatedNextTurn = false)',
      '├─ Bayesian Policy Updated: ~/.agent-gauge/telemetry.db (Fast ≤ 31 · Balanced ≤ 64)',
      '📊 420 turns analyzed: 62.4% quota saved ($261.12 saved) · 94.2% first-pass diff survival',
      '✅ Exported report.json (ready to drop into the 3D Telemetry Visualizer below)',
    ],
    accent: 'text-[#00F0FF]',
  },
];

export function HeroInstallHub() {
  const [activeChannel, setActiveChannel] = useState<InstallChannel>('skills');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeDemoStep, setActiveDemoStep] = useState(1);
  const heroRef = useRef<HTMLElement | null>(null);

  const currentChannel = INSTALL_CHANNELS.find((c) => c.id === activeChannel)!;
  const activeStepData = TERMINAL_DEMO_STEPS[activeDemoStep];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-3d-stagger',
        { opacity: 0, y: 38, rotateX: 12 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const copyText = (text: string, isSecondary = false) => {
    navigator.clipboard.writeText(text);
    if (isSecondary) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative pt-14 pb-20 md:pt-20 md:pb-28 border-b border-border perspective-stage overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top React Bits Decrypted Badges */}
        <div className="hero-3d-stagger flex flex-wrap items-center justify-center gap-2.5 mb-7">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono bg-[#7C5CFF]/15 text-[#c4b5fd] border border-[#7C5CFF]/40 shadow-[0_0_20px_rgba(124,92,255,0.2)]">
            <Zap className="w-3.5 h-3.5 text-[#7C5CFF]" />
            <DecryptedText text="<15MS DETERMINISTIC AST/GRAPH ROUTER" />
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono bg-[#10F5A0]/10 text-[#10F5A0] border border-[#10F5A0]/30">
            <GitBranch className="w-3.5 h-3.5" />
            Closed-Loop Git Diff Survival
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            <Box className="w-3.5 h-3.5" />
            GetLayers.ai 3D × React Bits × GSAP
          </span>
        </div>

        {/* Main 3D Hero Headline */}
        <div className="hero-3d-stagger text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Stop burning{' '}
            <span className="bg-gradient-to-r from-[#FF9E2C] via-amber-300 to-rose-400 bg-clip-text text-transparent">
              Opus High
            </span>{' '}
            on CSS edits.
            <br />
            Stop under-powering{' '}
            <span className="bg-gradient-to-r from-[#7C5CFF] via-[#00F0FF] to-[#10F5A0] bg-clip-text text-transparent">
              distributed lock bugs.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300/90 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-white font-semibold">AgentGauge</strong> is an open-source Agent
            Skill, MCP Server, and IDE Status-Bar router that scores coding tasks across{' '}
            <span className="text-[#00F0FF]">Task Intent</span>,{' '}
            <span className="text-[#7C5CFF]">Import-Graph Blast Radius</span>,{' '}
            <span className="text-[#10F5A0]">AST Complexity</span>, and{' '}
            <span className="text-[#FF9E2C]">Git Diff Survival History</span> in under 15ms.
          </p>
        </div>

        {/* 2-Column 3D Tilt Cards: Left = 1-Click Install Hub | Right = 3D Neural Core + Live Terminal */}
        <div className="hero-3d-stagger grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Left Column: 3D Tilt Install Hub */}
          <Tilt3DSpotlightCard
            className="lg:col-span-6 p-6 sm:p-7 flex flex-col justify-between"
            accentColor="rgba(124, 92, 255, 0.32)"
            maxTiltDeg={5}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />4 Channels · 1 Monorepo Install Hub
                </span>
                <span className="text-xs font-mono text-[#10F5A0] bg-[#10F5A0]/10 px-2.5 py-0.5 rounded-full border border-[#10F5A0]/30">
                  v1.0.0 · UI/UX Pro Max
                </span>
              </div>

              {/* Channel Selector Tabs with Magnetic Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#040509]/90 rounded-xl border border-white/10 mb-5">
                {INSTALL_CHANNELS.map((ch) => {
                  const active = ch.id === activeChannel;
                  return (
                    <MagnetButton
                      key={ch.id}
                      strength={0.18}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                        active
                          ? 'bg-gradient-to-r from-[#7C5CFF] to-[#5B3DF5] text-white shadow-[0_0_20px_rgba(124,92,255,0.45)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {ch.label}
                    </MagnetButton>
                  );
                })}
              </div>

              {/* Channel Description */}
              <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                {currentChannel.description}
              </p>

              {/* Primary Copyable Command Box */}
              <div className="relative group mb-4">
                <div className="flex items-center justify-between bg-[#040509] border border-white/10 group-hover:border-[#00F0FF]/50 rounded-xl px-4 py-3.5 font-mono text-xs sm:text-sm text-[#10F5A0] overflow-x-auto transition-colors">
                  <div className="flex items-center gap-2.5 pr-6">
                    <span className="text-[#7C5CFF] select-none">$</span>
                    <span className="whitespace-nowrap">{currentChannel.command}</span>
                  </div>
                  <MagnetButton
                    strength={0.25}
                    onClick={() => copyText(currentChannel.command, false)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs transition-colors shrink-0"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10F5A0]" />
                        <span className="text-[#10F5A0]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </MagnetButton>
                </div>
              </div>

              {/* Cursor 1-Click Deeplink Button */}
              {currentChannel.deeplinkUrl && (
                <div className="mb-4">
                  <a
                    href={currentChannel.deeplinkUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] via-[#5B3DF5] to-[#00F0FF] text-white font-semibold text-sm shadow-[0_0_25px_rgba(124,92,255,0.4)] hover:opacity-95 transition-all"
                  >
                    <Cpu className="w-4 h-4" />
                    Open in Cursor (1-Click MCP Install Deeplink)
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              )}

              {/* Secondary Config Block */}
              {currentChannel.secondaryCode && (
                <div className="relative bg-[#040509]/95 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
                    <span>MCP / Extension Config</span>
                    <button
                      onClick={() => copyText(currentChannel.secondaryCode!, true)}
                      className="text-[#00F0FF] hover:underline flex items-center gap-1"
                    >
                      {copiedJson ? (
                        <span className="text-[#10F5A0]">Copied!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto leading-relaxed text-[#c4b5fd]">
                    {currentChannel.secondaryCode}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Live IDE Status Bar Preview Pill */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                IDE Status-Bar Live Pill:
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#040509] border border-[#7C5CFF]/40 font-mono text-white shadow-[0_0_15px_rgba(124,92,255,0.25)]">
                <DecryptedText text={`⚡ Gauge: ${activeStepData.tier.toUpperCase()} · Score ${activeStepData.score}`} />
              </span>
            </div>
          </Tilt3DSpotlightCard>

          {/* Right Column: Interactive 3D Polyhedron + Live Terminal Replay */}
          <Tilt3DSpotlightCard
            className="lg:col-span-6 p-6 flex flex-col justify-between"
            accentColor="rgba(0, 240, 255, 0.28)"
            maxTiltDeg={5}
          >
            <div>
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
                    3D Neural Router &amp; Terminal Replay
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#10F5A0]">60fps WebGL/Canvas</span>
              </div>

              {/* Interactive 3D Polyhedron Core that reacts to the selected step */}
              <div className="mb-4">
                <Neural3DPrismCanvas
                  score={activeStepData.score}
                  tier={activeStepData.tier}
                  height={165}
                />
              </div>

              {/* Step Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TERMINAL_DEMO_STEPS.map((s, idx) => (
                  <MagnetButton
                    key={s.id}
                    strength={0.15}
                    onClick={() => setActiveDemoStep(idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeDemoStep === idx
                        ? 'bg-[#7C5CFF]/25 text-white border border-[#7C5CFF] shadow-[0_0_15px_rgba(124,92,255,0.3)]'
                        : 'text-slate-400 hover:text-white bg-[#040509]/80 border border-white/10'
                    }`}
                  >
                    <Play className="w-3 h-3 text-[#00F0FF]" />
                    {s.title}
                  </MagnetButton>
                ))}
              </div>

              {/* Terminal Output */}
              <div className="p-4 rounded-xl bg-[#040509]/95 border border-white/10 font-mono text-xs leading-relaxed space-y-1.5 overflow-x-auto">
                <div className="text-white font-semibold">{activeStepData.cmd}</div>
                {activeStepData.output.map((line, i) => (
                  <div
                    key={i}
                    className={
                      i === 0 || i === activeStepData.output.length - 1
                        ? `${activeStepData.accent} font-semibold`
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Animated Counter Strip */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#040509]/60 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">ROUTING LATENCY</div>
                <div className="text-sm font-bold font-mono text-[#10F5A0]">
                  <CountUpMetric value={1.18} decimals={2} suffix=" ms" />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#040509]/60 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">QUOTA SAVED</div>
                <div className="text-sm font-bold font-mono text-[#7C5CFF]">
                  <CountUpMetric value={62.4} decimals={1} suffix="%" />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#040509]/60 border border-white/5">
                <div className="text-[10px] font-mono text-slate-400">DIFF SURVIVAL</div>
                <div className="text-sm font-bold font-mono text-[#00F0FF]">
                  <CountUpMetric value={94.2} decimals={1} suffix="%" />
                </div>
              </div>
            </div>
          </Tilt3DSpotlightCard>
        </div>
      </div>
    </section>
  );
}

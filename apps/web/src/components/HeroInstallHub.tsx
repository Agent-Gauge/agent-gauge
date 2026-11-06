'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

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
      'Installs root SKILL.md + router, calibration, and ROI report subagent workflows into Claude Code, Antigravity, Cursor, and Windsurf.',
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
    title: '1. Pre-Flight AST & Import Graph Scan (1.2ms)',
    cmd: '$ gauge score "Add dark-mode classes to footer" --files apps/web/src/components/Footer.tsx',
    output: [
      '⚡ Gauge: Flash · Low (Score 12/100) — Latency: 1.18 ms',
      '├─ Task Intent:       4/35   (ui · declarative markup / styling)',
      '├─ Blast Radius:      3/30   (1 file touched · 1 downstream dependent)',
      '├─ Structural:        2/20   (zero async/branching complexity)',
      '└─ Historical Risk:   3/15   (2.0% empirical repo revert rate)',
      '✅ Recommendation: Gemini 3.1 Flash / Haiku (LOW effort · direct mode) → Saves 98% vs Opus High',
    ],
    accent: 'text-emerald-400',
  },
  {
    id: 'step-2',
    title: '2. High-Risk Distributed Lock Detection (1.6ms)',
    cmd: '$ gauge score "Fix Postgres billing double-spend race with SELECT FOR UPDATE" --files src/ledger.ts,prisma/schema.prisma',
    output: [
      '⚡ Gauge: Opus · High (Score 86/100) — Latency: 1.54 ms',
      '├─ Task Intent:      35/35   (concurrency-debug + database-migration)',
      '├─ Blast Radius:     26/30   (8 files · 44 transitive downstream fan-out · schema.prisma)',
      '├─ Structural:       17/20   (transactional lock + webhook retry idempotency)',
      '└─ Historical Risk:   8/15   (24.0% historical revert rate on src/ledger.ts)',
      '🛡️ Recommendation: Claude 4.6 Opus / Gemini 3.1 Pro (HIGH effort · plan-first mode)',
    ],
    accent: 'text-amber-400',
  },
  {
    id: 'step-3',
    title: '3. Closed-Loop Git Diff Survival Calibration',
    cmd: '$ gauge audit && gauge report --out report.json',
    output: [
      '🔍 Auditing previous turn run-mw52zd5o against git working tree...',
      '├─ Modified lines intact: 98.4% (revertedLinesRatio = 0.016, escalatedNextTurn = false)',
      '├─ Bayesian Policy Updated: ~/.agent-gauge/telemetry.db (Fast ≤ 31 · Balanced ≤ 64)',
      '📊 420 turns analyzed: 84.9% quota saved ($261.12 saved) · 98.1% first-pass diff survival',
      '✅ Exported report.json (ready to drop into the Telemetry Visualizer below)',
    ],
    accent: 'text-indigo-400',
  },
];

export function HeroInstallHub() {
  const [activeChannel, setActiveChannel] = useState<InstallChannel>('skills');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeDemoStep, setActiveDemoStep] = useState(0);

  const currentChannel = INSTALL_CHANNELS.find((c) => c.id === activeChannel)!;

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
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border overflow-hidden">
      {/* Subtle radial background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.28) 0%, rgba(16, 185, 129, 0.08) 38%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top pill badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            &lt;15ms Deterministic Routing · Zero LLM Cost
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            Closed-Loop Git Diff Survival Learning
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            100% Local SQLite · Zero API Keys
          </span>
        </div>

        {/* Main Hero Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Stop burning{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Opus High
            </span>{' '}
            on CSS edits.
            <br />
            Stop under-powering{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              distributed lock bugs.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-slate-200 font-semibold">AgentGauge</strong> is an open-source
            Agent Skill, MCP Server, and IDE Status-Bar router that scores coding tasks across{' '}
            <span className="text-slate-200">Intent</span>,{' '}
            <span className="text-slate-200">Import-Graph Blast Radius</span>,{' '}
            <span className="text-slate-200">AST Complexity</span>, and{' '}
            <span className="text-slate-200">Git Survival History</span> to pick the exact{' '}
            <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-500/20 text-sm">
              Model Tier + Effort Level + Subagent Mode
            </code>{' '}
            in under 15ms.
          </p>
        </div>

        {/* 2-Column Install Hub & Interactive Terminal Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: 1-Click Install Hub */}
          <div className="lg:col-span-6 bg-surface/90 border border-border rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />4 Channels · 1 Monorepo Install Hub
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  v1.0.0 MIT
                </span>
              </div>

              {/* Channel Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#090A0F] rounded-xl border border-border mb-5">
                {INSTALL_CHANNELS.map((ch) => {
                  const active = ch.id === activeChannel;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>

              {/* Channel Description */}
              <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                {currentChannel.description}
              </p>

              {/* Primary Copyable Command Box */}
              <div className="relative group mb-4">
                <div className="flex items-center justify-between bg-[#090A0F] border border-slate-800 group-hover:border-indigo-500/40 rounded-xl px-4 py-3.5 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
                  <div className="flex items-center gap-2.5 pr-8">
                    <span className="text-slate-500 select-none">$</span>
                    <span className="whitespace-nowrap">{currentChannel.command}</span>
                  </div>
                  <button
                    onClick={() => copyText(currentChannel.command, false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cursor 1-Click Deeplink Button if on Cursor tab */}
              {currentChannel.deeplinkUrl && (
                <div className="mb-4">
                  <a
                    href={currentChannel.deeplinkUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Cpu className="w-4 h-4" />
                    Open in Cursor (1-Click MCP Install Deeplink)
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              )}

              {/* Optional Secondary Config Block */}
              {currentChannel.secondaryCode && (
                <div className="relative bg-[#090A0F] border border-slate-800/90 rounded-xl p-3.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-500">
                    <span>Configuration / Secondary Command</span>
                    <button
                      onClick={() => copyText(currentChannel.secondaryCode!, true)}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedJson ? (
                        <span className="text-emerald-400">Copied!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto leading-relaxed text-indigo-200">
                    {currentChannel.secondaryCode}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Live IDE Status Bar Preview Pill */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">IDE Status Bar Live Preview:</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#161926] border border-indigo-500/30 font-mono text-indigo-300">
                ⚡ Gauge: Sonnet · Med (Score 48)
                <span className="text-emerald-400 text-[11px]">· 85% saved</span>
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Terminal / Replay Preview Frame */}
          <div className="lg:col-span-6 bg-[#0B0D14] border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Terminal Window Header */}
            <div className="px-4 py-3 bg-[#121521] border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  agent-gauge — pre-flight &amp; survival loop
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">node:sqlite · &lt;15ms SLA</span>
            </div>

            {/* Step Selector Buttons */}
            <div className="px-4 pt-3 pb-2 bg-[#0E101A] border-b border-slate-800/70 flex flex-wrap gap-1.5">
              {TERMINAL_DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveDemoStep(idx)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeDemoStep === idx
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  {s.title}
                </button>
              ))}
            </div>

            {/* Terminal Output Body */}
            <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed flex-1 flex flex-col justify-center space-y-2.5 overflow-x-auto">
              <div className="text-slate-200 font-semibold">
                {TERMINAL_DEMO_STEPS[activeDemoStep].cmd}
              </div>
              <div className="space-y-1.5 pt-1">
                {TERMINAL_DEMO_STEPS[activeDemoStep].output.map((line, i) => (
                  <div
                    key={i}
                    className={
                      i === 0 || i === TERMINAL_DEMO_STEPS[activeDemoStep].output.length - 1
                        ? `${TERMINAL_DEMO_STEPS[activeDemoStep].accent} font-semibold`
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Metric Strip */}
            <div className="px-5 py-3 bg-[#121521]/90 border-t border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[11px] text-slate-400">Routing Latency</div>
                <div className="text-sm font-bold font-mono text-emerald-400">1.18 ms</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Avg Quota Saved</div>
                <div className="text-sm font-bold font-mono text-indigo-400">62% – 85%</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">1st-Pass Diff Survival</div>
                <div className="text-sm font-bold font-mono text-cyan-400">94.2%+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


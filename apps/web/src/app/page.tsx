import React from 'react';
import { HeroInstallHub } from '../components/HeroInstallHub';
import { LivePlayground } from '../components/LivePlayground';
import { TelemetryDashboard } from '../components/TelemetryDashboard';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { Gauge, Github, Terminal, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F]">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090A0F]/85 border-b border-[#1E2231]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">AgentGauge</span>
              <span className="ml-2 text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                v1.0.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#playground" className="hover:text-white transition-colors">
              Live Router Playground
            </a>
            <a href="#telemetry" className="hover:text-white transition-colors">
              Telemetry &amp; ROI Dashboard
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Skill &amp; MCP Architecture
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href="#playground"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-emerald-300 hover:border-emerald-500/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              &lt;15ms Scorer
            </a>
            <a
              href="https://github.com/haripriyarao26/agent-gauge"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Monorepo
            </a>
          </div>
        </div>
      </header>

      {/* Main 4 Interactive Product Sections */}
      <main className="flex-1">
        <HeroInstallHub />
        <LivePlayground />
        <TelemetryDashboard />
        <ArchitectureFlow />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E2231] py-10 bg-[#07080C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>
              <strong className="text-slate-200">AgentGauge</strong> — Open-Source Deterministic
              Coding Task Router (MIT License)
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Published across skills.sh · npm (agent-gauge-mcp) · OpenVSX · Vercel
          </div>
        </div>
      </footer>
    </div>
  );
}


'use client';

import React from 'react';
import { HeroInstallHub } from '../components/HeroInstallHub';
import { LivePlayground } from '../components/LivePlayground';
import { TelemetryDashboard } from '../components/TelemetryDashboard';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { LenisSmoothScrollProvider, DecryptedText } from '../components/ReactBits3D';
import { Gauge, Github, Terminal, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <LenisSmoothScrollProvider>
      <div className="min-h-screen flex flex-col">
        {/* Sticky Top Obsidian Glass Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020408]/85 border-b border-[#00F0FF]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10F5A0] to-[#00F0FF] flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(16,245,160,0.45)]">
                <Gauge className="w-5 h-5 text-black" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base">
                  <DecryptedText text="AgentGauge" />
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#10F5A0]/15 text-[#10F5A0] border border-[#10F5A0]/35">
                  &lt;15ms Router
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
              <a href="#playground" className="hover:text-[#10F5A0] transition-colors">
                01. 3D Router Playground
              </a>
              <a href="#telemetry" className="hover:text-[#00F0FF] transition-colors">
                02. Telemetry &amp; ROI
              </a>
              <a href="#architecture" className="hover:text-[#10F5A0] transition-colors">
                03. Skill Architecture
              </a>
            </nav>

            <div className="flex items-center gap-2.5">
              <a
                href="#playground"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000] border border-[#10F5A0]/50 text-xs font-mono text-[#10F5A0] hover:border-[#10F5A0] hover:shadow-[0_0_12px_rgba(16,245,160,0.3)] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                &lt;15ms Scorer
              </a>
              <a
                href="https://github.com/Agent-Gauge/agent-gauge"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#10F5A0] to-[#00F0FF] hover:opacity-95 text-xs font-bold text-black shadow-[0_0_18px_rgba(16,245,160,0.4)] transition-all"
              >
                <Github className="w-3.5 h-3.5 text-black" />
                GitHub Monorepo
              </a>
            </div>
          </div>
        </header>

        {/* Main 4 Interactive 3D Product Sections */}
        <main className="flex-1">
          <HeroInstallHub />
          <LivePlayground />
          <TelemetryDashboard />
          <ArchitectureFlow />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#00F0FF]/15 py-10 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#10F5A0]" />
              <span>
                <strong className="text-white">AgentGauge</strong> — Deterministic &lt;15ms Task Router &amp; Telemetry Engine
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#00F0FF]/80">
              skills.sh · npm (agent-gauge-mcp) · OpenVSX · GitHub Pages
            </div>
          </div>
        </footer>
      </div>
    </LenisSmoothScrollProvider>
  );
}

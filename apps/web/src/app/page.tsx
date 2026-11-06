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
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#040509]/80 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00F0FF] flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(124,92,255,0.45)]">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base">
                  <DecryptedText text="AgentGauge" />
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#c4b5fd] border border-[#7C5CFF]/40">
                  3D Pro Max
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
              <a href="#playground" className="hover:text-[#00F0FF] transition-colors">
                01. 3D Router Playground
              </a>
              <a href="#telemetry" className="hover:text-[#10F5A0] transition-colors">
                02. Telemetry &amp; ROI
              </a>
              <a href="#architecture" className="hover:text-[#7C5CFF] transition-colors">
                03. Skill Architecture
              </a>
            </nav>

            <div className="flex items-center gap-2.5">
              <a
                href="#playground"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#040509] border border-[#10F5A0]/40 text-xs font-mono text-[#10F5A0] hover:border-[#10F5A0] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                &lt;15ms Scorer
              </a>
              <a
                href="https://github.com/Agent-Gauge/agent-gauge"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5B3DF5] hover:opacity-95 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,92,255,0.35)] transition-all"
              >
                <Github className="w-3.5 h-3.5" />
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
        <footer className="border-t border-white/10 py-10 bg-[#030407]/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#7C5CFF]" />
              <span>
                <strong className="text-white">AgentGauge</strong> — GetLayers.ai Obsidian 3D ×
                React Bits × Lenis × GSAP
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              skills.sh · npm (agent-gauge-mcp) · OpenVSX · GitHub Pages
            </div>
          </div>
        </footer>
      </div>
    </LenisSmoothScrollProvider>
  );
}

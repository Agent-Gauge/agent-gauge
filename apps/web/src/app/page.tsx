'use client';

import React, { useState } from 'react';
import { HeroInstallHub } from '../components/HeroInstallHub';
import { LivePlayground } from '../components/LivePlayground';
import { TelemetryDashboard } from '../components/TelemetryDashboard';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { SlideDrawer } from '../components/SlideDrawer';
import { LenisSmoothScrollProvider, DecryptedText } from '../components/ReactBits3D';
import { Gauge, Github, Terminal, Sparkles, BarChart3, Layers } from 'lucide-react';

export default function HomePage() {
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  return (
    <LenisSmoothScrollProvider>
      <div className="min-h-screen flex flex-col bg-[#020408]">
        {/* Sticky Top Obsidian Glass Navigation Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#020408]/90 border-b border-[#00F0FF]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#081512] border border-[#10F5A0]/40 flex items-center justify-center text-[#10F5A0] shadow-[0_0_10px_rgba(16,245,160,0.15)]">
                <Gauge className="w-5 h-5 text-[#10F5A0]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base">
                  <DecryptedText text="AgentGauge" />
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#10F5A0]/10 text-[#10F5A0] border border-[#10F5A0]/30">
                  &lt;15ms Router
                </span>
              </div>
            </div>

            {/* Navigation: Playground + 2 Drawer Openers */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
              <a href="#playground" className="hover:text-[#10F5A0] transition-colors">
                01. Live Playground
              </a>
              <button
                onClick={() => setIsTelemetryOpen(true)}
                className="hover:text-[#00F0FF] transition-colors flex items-center gap-1.5"
              >
                <span>02. Telemetry &amp; ROI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                  Drawer
                </span>
              </button>
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="hover:text-[#10F5A0] transition-colors flex items-center gap-1.5"
              >
                <span>03. Architecture Spec</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#10F5A0]/10 text-[#10F5A0] border border-[#10F5A0]/30">
                  Drawer
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-2.5">
              <a
                href="#playground"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#000000] border border-[#10F5A0]/40 text-xs font-mono text-[#10F5A0] hover:border-[#10F5A0] hover:bg-[#10F5A0]/10 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                &lt;15ms Scorer
              </a>
              <a
                href="https://github.com/Agent-Gauge/agent-gauge"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#081216] hover:bg-[#0C1C24] border border-[#00F0FF]/30 hover:border-[#00F0FF] text-xs font-semibold text-[#00F0FF] hover:text-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              >
                <Github className="w-3.5 h-3.5 text-[#00F0FF]" />
                GitHub Monorepo
              </a>
            </div>
          </div>
        </header>

        {/* Clean, Focused Main Experience */}
        <main className="flex-1">
          <HeroInstallHub
            onOpenTelemetry={() => setIsTelemetryOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
          <LivePlayground />
        </main>

        {/* Slide-Out Drawers for Deep Content */}
        <SlideDrawer
          isOpen={isTelemetryOpen}
          onClose={() => setIsTelemetryOpen(false)}
          title="Telemetry &amp; Quota ROI Dashboard"
          subtitle="Closed-loop git diff survival rates, empirical quota savings, and automated calibration"
          badge="Live Simulator"
          icon={<BarChart3 className="w-5 h-5 text-[#00F0FF]" />}
        >
          <TelemetryDashboard />
        </SlideDrawer>

        <SlideDrawer
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
          title="Architecture, Blast Shield &amp; PR Audit"
          subtitle="5-stage deterministic AST/Graph scoring pipeline, token limits &amp; GitHub Action"
          badge="v1.0 Spec"
          icon={<Layers className="w-5 h-5 text-[#10F5A0]" />}
        >
          <ArchitectureFlow />
        </SlideDrawer>

        {/* Minimalist Footer */}
        <footer className="border-t border-[#00F0FF]/15 py-10 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#10F5A0]" />
              <span>
                <strong className="text-white">AgentGauge</strong> — Deterministic &lt;15ms Task Router &amp; Telemetry Engine
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
              <button
                onClick={() => setIsTelemetryOpen(true)}
                className="hover:text-[#00F0FF] transition-colors"
              >
                Telemetry Drawer
              </button>
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="hover:text-[#10F5A0] transition-colors"
              >
                Architecture Drawer
              </button>
              <a
                href="https://github.com/Agent-Gauge/agent-gauge"
                target="_blank"
                rel="noreferrer"
                className="text-[#00F0FF]/80 hover:text-[#00F0FF]"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </LenisSmoothScrollProvider>
  );
}

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  scoreTask,
  PLAYGROUND_PRESETS,
  type PlaygroundPreset,
} from '@agent-gauge/core-scorer';
import {
  Gauge,
  Sliders,
  Sparkles,
  FileCode2,
  GitFork,
  History,
  Layers,
  CheckCircle2,
  Clock,
  Coins,
  Radar,
} from 'lucide-react';
import {
  Tilt3DSpotlightCard,
  DecryptedText,
  CountUpMetric,
  MagnetButton,
  InteractiveRadarVectorChart,
} from './ReactBits3D';

export function LivePlayground() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PLAYGROUND_PRESETS[0].id);
  const [prompt, setPrompt] = useState<string>(PLAYGROUND_PRESETS[0].prompt);
  const [filePaths, setFilePaths] = useState<string[]>(PLAYGROUND_PRESETS[0].filePaths);
  const [filesTouched, setFilesTouched] = useState<number>(PLAYGROUND_PRESETS[0].filesTouched);
  const [downstreamFanOut, setDownstreamFanOut] = useState<number>(
    PLAYGROUND_PRESETS[0].downstreamFanOut
  );
  const [historicalRevertPct, setHistoricalRevertPct] = useState<number>(
    Math.round(PLAYGROUND_PRESETS[0].historicalRevertRate * 100)
  );
  const sectionRef = useRef<HTMLElement | null>(null);

  const applyPreset = (preset: PlaygroundPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setFilePaths(preset.filePaths);
    setFilesTouched(preset.filesTouched);
    setDownstreamFanOut(preset.downstreamFanOut);
    setHistoricalRevertPct(Math.round(preset.historicalRevertRate * 100));
  };

  const result = useMemo(() => {
    return scoreTask({
      prompt,
      filePaths,
      filesTouchedOverride: filesTouched,
      downstreamFanOutOverride: downstreamFanOut,
      historicalRevertRateOverride: historicalRevertPct / 100,
    });
  }, [prompt, filePaths, filesTouched, downstreamFanOut, historicalRevertPct]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.playground-3d-reveal',
        { opacity: 0, y: 42, rotateX: 8 },
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

  const tierColors = {
    fast: {
      badge: 'bg-[#10F5A0]/15 text-[#10F5A0] border-[#10F5A0]/40',
      stroke: '#10F5A0',
      spot: 'rgba(16, 245, 160, 0.26)',
    },
    balanced: {
      badge: 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40',
      stroke: '#00F0FF',
      spot: 'rgba(0, 240, 255, 0.28)',
    },
    deep: {
      badge: 'bg-[#FF9E2C]/15 text-[#FF9E2C] border-[#FF9E2C]/40',
      stroke: '#FF9E2C',
      spot: 'rgba(255, 158, 44, 0.28)',
    },
  }[result.recommendedTier];

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.totalScore / 100) * circumference;

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="py-20 md:py-28 border-b border-border perspective-stage"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="playground-3d-reveal flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00F0FF] mb-2">
              <Gauge className="w-4 h-4" />
              Live Browser Kernel · @agent-gauge/core-scorer
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive 3D Router &amp; Vector Playground
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Select a preset scenario or type any prompt, then drag the blast-radius &amp; repo
              revert sliders to watch the 4-axis complexity radar and model routing morph in real
              time.
            </p>
          </div>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#000000] border border-[#00F0FF]/35 font-mono text-xs text-white shadow-[0_0_12px_rgba(0,240,255,0.12)] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10F5A0]" />
            <DecryptedText text={result.statusBarLabel} />
          </div>
        </div>

        {/* 5 Clickable 3D Preset Scenarios */}
        <div className="playground-3d-reveal mb-8">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#10F5A0]" />
            Click a Preset Engineering Scenario:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PLAYGROUND_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <MagnetButton
                  key={preset.id}
                  strength={0.14}
                  onClick={() => applyPreset(preset)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#081814] border-[#10F5A0]/60 text-white shadow-[0_0_12px_rgba(16,245,160,0.12)]'
                      : 'layers-glass text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold leading-snug mb-2.5">{preset.title}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#00F0FF]">
                    <span>{preset.badge}</span>
                    <span className="text-slate-400">{preset.filesTouched}f</span>
                  </div>
                </MagnetButton>
              );
            })}
          </div>
        </div>

        {/* Main Playground 3D Grid */}
        <div className="playground-3d-reveal grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 5 Columns: 3D Tilt Prompt + Interactive Sliders */}
          <Tilt3DSpotlightCard
            className="lg:col-span-5 p-6 space-y-6"
            accentColor="rgba(0, 240, 255, 0.25)"
            maxTiltDeg={4}
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#00F0FF] mb-2">
                Task Prompt / Specification
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => {
                  setSelectedPresetId('custom');
                  setPrompt(e.target.value);
                }}
                placeholder="Describe any coding task, bug fix, or architectural change..."
                className="w-full rounded-xl bg-[#000000] border border-white/10 focus:border-[#00F0FF] focus:outline-none p-3.5 text-sm text-white placeholder-slate-500 font-sans leading-relaxed transition-colors"
              />
            </div>

            {/* Target Files Chips */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                Target File Paths Inspected:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filePaths.map((fp) => (
                  <span
                    key={fp}
                    className="px-2.5 py-1 rounded-md bg-[#000000] border border-white/10 font-mono text-[11px] text-slate-300"
                  >
                    {fp}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-5 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-[#10F5A0]" />
                Interactive Blast Radius &amp; Repo Sliders
              </div>

              {/* Slider 1: Files Touched */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#10F5A0]" />
                    Files Touched
                  </span>
                  <span className="font-mono font-bold text-[#10F5A0]">
                    {filesTouched} {filesTouched === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={filesTouched}
                  onChange={(e) => setFilesTouched(Number(e.target.value))}
                  className="w-full accent-[#10F5A0] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1 (Localized)</span>
                  <span>12</span>
                  <span>25 (Cross-Repo)</span>
                </div>
              </div>

              {/* Slider 2: Downstream Import Fan-Out */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5 text-[#00F0FF]" />
                    Downstream Import Fan-Out (DFS)
                  </span>
                  <span className="font-mono font-bold text-[#00F0FF]">
                    {downstreamFanOut} dependents
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={downstreamFanOut}
                  onChange={(e) => setDownstreamFanOut(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 (Leaf)</span>
                  <span>50</span>
                  <span>100 (Core Contract)</span>
                </div>
              </div>

              {/* Slider 3: Historical Revert Rate */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#FF9E2C]" />
                    Historical Repo Revert Rate
                  </span>
                  <span className="font-mono font-bold text-[#FF9E2C]">{historicalRevertPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={historicalRevertPct}
                  onChange={(e) => setHistoricalRevertPct(Number(e.target.value))}
                  className="w-full accent-[#FF9E2C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Stable)</span>
                  <span>25%</span>
                  <span>50% (Regret Hotspot)</span>
                </div>
              </div>
            </div>
          </Tilt3DSpotlightCard>

          {/* Right 7 Columns: 3D Gauge + 4-Axis Radar Vector + Model Comparison Cards */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top 3D Card: Radial Gauge + 4-Axis Vector Radar + Sub-Score Bars */}
            <Tilt3DSpotlightCard
              className="p-6"
              accentColor={tierColors.spot}
              maxTiltDeg={4}
            >
              {/* Recommendation Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
                <div>
                  <div className="text-xs font-mono text-slate-400">OPTIMAL ROUTE DECISION</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                    <DecryptedText text={result.primaryModel} />
                    <span className="text-xs font-normal font-mono text-slate-400">
                      (Alt: {result.alternateModel})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${tierColors.badge}`}
                  >
                    {result.recommendedTier.toUpperCase()} ·{' '}
                    {result.recommendedEffort.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 font-mono text-xs text-[#00F0FF]">
                    {result.executionMode}
                  </span>
                </div>
              </div>

              {/* Dual Visuals: Animated SVG Circular Gauge + 4-Axis Complexity Radar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-5">
                {/* Circular Gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-[#050711]/90 border border-white/10">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke={tierColors.stroke}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <CountUpMetric
                        value={result.totalScore}
                        decimals={0}
                        className="text-3xl font-extrabold font-mono text-white"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        SCORE / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Axis Radar Polygon Component */}
                <div className="md:col-span-4">
                  <InteractiveRadarVectorChart
                    intentScore={result.breakdown.intent.score}
                    blastScore={result.breakdown.blastRadius.score}
                    structuralScore={result.breakdown.structural.score}
                    repoRiskScore={result.breakdown.repoRisk.score}
                  />
                </div>

                {/* 4 Dimension Animated Bars */}
                <div className="md:col-span-4 space-y-3 text-xs">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Radar className="w-3.5 h-3.5 text-[#00F0FF]" />
                    4-DIMENSION VECTOR
                  </div>
                  {[
                    {
                      label: `Intent (${result.breakdown.intent.category})`,
                      score: result.breakdown.intent.score,
                      max: 35,
                      color: 'bg-[#00F0FF]',
                    },
                    {
                      label: `Blast (${result.breakdown.blastRadius.filesTouched}f · ${result.breakdown.blastRadius.downstreamFanOut} fan)`,
                      score: result.breakdown.blastRadius.score,
                      max: 30,
                      color: 'bg-[#10F5A0]',
                    },
                    {
                      label: 'AST Structure',
                      score: result.breakdown.structural.score,
                      max: 20,
                      color: 'bg-[#00F0FF]',
                    },
                    {
                      label: `Repo Risk (${historicalRevertPct}%)`,
                      score: result.breakdown.repoRisk.score,
                      max: 15,
                      color: 'bg-[#10F5A0]',
                    },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 truncate pr-2">{d.label}</span>
                        <span className="font-mono text-white font-semibold">
                          {d.score}/{d.max}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#000000] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.color} transition-all duration-300`}
                          style={{ width: `${(d.score / d.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 KPI Motion Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#000000] border border-white/10">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#10F5A0]" /> Saved vs Opus High
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#10F5A0] mt-0.5">
                    <CountUpMetric value={result.savings.costSavedPct} suffix="%" /> (
                    <CountUpMetric
                      value={result.savings.recommendedCostUsd}
                      decimals={4}
                      prefix="$"
                    />
                    )
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#000000] border border-white/10">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00F0FF]" /> Speedup Multiplier
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#00F0FF] mt-0.5">
                    <CountUpMetric
                      value={result.savings.latencySpeedupMultiplier}
                      decimals={1}
                      suffix="x faster"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#000000] border border-white/10">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10F5A0]" /> 1st-Pass Confidence
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#10F5A0] mt-0.5">
                    <CountUpMetric
                      value={result.savings.winRateConfidencePct}
                      decimals={1}
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
            </Tilt3DSpotlightCard>

            {/* Bottom 3D Card: Interactive Visual Model Cost & Latency Comparison Matrix */}
            <Tilt3DSpotlightCard
              className="overflow-hidden"
              accentColor="rgba(0, 240, 255, 0.22)"
              maxTiltDeg={3}
            >
              <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-200">
                  Frontier Model Cost, Effort &amp; Visual Quota Matrix
                </span>
                <span className="text-[11px] font-mono text-[#00F0FF]">
                  18k input / 2.2k base output tokens
                </span>
              </div>
              <div className="p-4 space-y-2">
                {result.savings.comparisonTable.map((row) => {
                  const costBarPct = Math.max(
                    4,
                    Math.min(100, (row.estimatedCostUsd / 0.75) * 100)
                  );
                  return (
                    <div
                      key={row.modelId}
                      className={`p-3 rounded-xl border transition-all grid grid-cols-12 items-center gap-2 text-xs font-mono ${
                        row.isRecommended
                          ? 'bg-[#061418] border-[#00F0FF]/40 text-white shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                          : 'bg-[#000000] border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="col-span-4 font-sans font-semibold flex items-center gap-2 truncate">
                        {row.isRecommended && (
                          <span className="w-2 h-2 rounded-full bg-[#10F5A0] shrink-0" />
                        )}
                        <span className="truncate">{row.modelName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">
                          {row.tier} · {row.effort}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              row.tier === 'fast'
                                ? 'bg-[#10F5A0]'
                                : row.tier === 'balanced'
                                  ? 'bg-[#00F0FF]'
                                  : 'bg-white'
                            }`}
                            style={{ width: `${costBarPct}%` }}
                          />
                        </div>
                        <span className="text-[#10F5A0] w-16 text-right font-bold">
                          ${row.estimatedCostUsd.toFixed(4)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-bold text-[#00F0FF]">
                        {row.savingsVsDeepHighPct}% saved
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tilt3DSpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

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

  const applyPreset = (preset: PlaygroundPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setFilePaths(preset.filePaths);
    setFilesTouched(preset.filesTouched);
    setDownstreamFanOut(preset.downstreamFanOut);
    setHistoricalRevertPct(Math.round(preset.historicalRevertRate * 100));
  };

  // Run the actual @agent-gauge/core-scorer engine synchronously in browser memory (<1ms)
  const result = useMemo(() => {
    return scoreTask({
      prompt,
      filePaths,
      filesTouchedOverride: filesTouched,
      downstreamFanOutOverride: downstreamFanOut,
      historicalRevertRateOverride: historicalRevertPct / 100,
    });
  }, [prompt, filePaths, filesTouched, downstreamFanOut, historicalRevertPct]);

  const tierColors = {
    fast: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      stroke: '#10B981',
      text: 'text-emerald-400',
    },
    balanced: {
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      stroke: '#6366F1',
      text: 'text-indigo-400',
    },
    deep: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      stroke: '#F59E0B',
      text: 'text-amber-400',
    },
  }[result.recommendedTier];

  // SVG circular arc math
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.totalScore / 100) * circumference;

  return (
    <section id="playground" className="py-16 md:py-24 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
              <Gauge className="w-4 h-4" />
              Powered Live by @agent-gauge/core-scorer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Interactive Pre-Flight Router Playground
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Click a preset scenario or type any prompt, then adjust blast-radius &amp; repo revert
              sliders to watch the deterministic 0–100 score and model routing update in real time.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border font-mono text-xs text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {result.statusBarLabel}
          </div>
        </div>

        {/* 5 Clickable Preset Scenarios */}
        <div className="mb-6">
          <div className="text-xs font-medium text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Preset Engineering Scenarios:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PLAYGROUND_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-surface/70 border-border text-slate-300 hover:border-slate-700 hover:bg-surface'
                  }`}
                >
                  <div className="text-xs font-semibold leading-snug mb-2">{preset.title}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{preset.badge}</span>
                    <span>{preset.filesTouched}f</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: Prompt Editor + 3 Interactive Sliders */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
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
                className="w-full rounded-xl bg-[#090A0F] border border-slate-800 focus:border-indigo-500 focus:outline-none p-3.5 text-sm text-slate-100 placeholder-slate-500 font-sans leading-relaxed"
              />
            </div>

            {/* Target Files Chips */}
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                Target File Paths Inspected:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filePaths.map((fp) => (
                  <span
                    key={fp}
                    className="px-2.5 py-1 rounded-md bg-[#090A0F] border border-slate-800 font-mono text-[11px] text-slate-300"
                  >
                    {fp}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Blast Radius &amp; Repo Calibration Sliders
              </div>

              {/* Slider 1: Files Touched (1-25) */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Files Touched
                  </span>
                  <span className="font-mono font-semibold text-indigo-300">
                    {filesTouched} {filesTouched === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={filesTouched}
                  onChange={(e) => setFilesTouched(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1 file (Localized)</span>
                  <span>12 files</span>
                  <span>25 files (Cross-Repo)</span>
                </div>
              </div>

              {/* Slider 2: Downstream Import Fan-Out (0-100) */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                    Downstream Import Fan-Out (DFS)
                  </span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {downstreamFanOut} dependents
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={downstreamFanOut}
                  onChange={(e) => setDownstreamFanOut(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 (Leaf module)</span>
                  <span>50</span>
                  <span>100 (Core shared contract)</span>
                </div>
              </div>

              {/* Slider 3: Historical Revert Rate (0-50%) */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    Historical Repo Revert Rate
                  </span>
                  <span className="font-mono font-semibold text-amber-300">
                    {historicalRevertPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={historicalRevertPct}
                  onChange={(e) => setHistoricalRevertPct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Stable path)</span>
                  <span>25%</span>
                  <span>50% (High regret hotspot)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Live Animated Gauge + 4-Dim Breakdown + Frontier Model Comparison Table */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Card: Score Gauge + Recommendation Banner */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Animated SVG Gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="#1E2231"
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
                      <span className="text-3xl font-extrabold font-mono text-white">
                        {result.totalScore}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        / 100 pts
                      </span>
                    </div>
                  </div>
                  <span
                    className={`mt-2 px-3 py-0.5 rounded-full text-xs font-mono font-semibold border ${tierColors.badge}`}
                  >
                    {result.recommendedTier.toUpperCase()} TIER ·{' '}
                    {result.recommendedEffort.toUpperCase()} EFFORT
                  </span>
                </div>

                {/* Routing Recommendation + 4 Sub-Score Progress Bars */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">Optimal Route Recommendation</div>
                      <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        {result.primaryModel}
                        <span className="text-xs font-normal text-slate-400">
                          (or {result.alternateModel})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Agent Execution Mode</div>
                      <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 font-mono text-xs text-indigo-300">
                        {result.executionMode}
                      </span>
                    </div>
                  </div>

                  {/* 4 Weighted Dimension Bars */}
                  <div className="space-y-2.5 text-xs">
                    {/* 1. Task Intent (0-35) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-medium">
                          1. Task Intent ({result.breakdown.intent.category})
                        </span>
                        <span className="font-mono text-indigo-300">
                          {result.breakdown.intent.score} / 35
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#090A0F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${(result.breakdown.intent.score / 35) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 2. Blast Radius (0-30) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-medium">
                          2. Import-Graph Blast Radius ({result.breakdown.blastRadius.filesTouched}f,{' '}
                          {result.breakdown.blastRadius.downstreamFanOut} fan-out)
                        </span>
                        <span className="font-mono text-cyan-300">
                          {result.breakdown.blastRadius.score} / 30
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#090A0F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${(result.breakdown.blastRadius.score / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 3. Structural Complexity (0-20) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-medium">
                          3. Structural / AST Complexity (
                          {result.breakdown.structural.indicators[0] ?? 'standard'})
                        </span>
                        <span className="font-mono text-emerald-300">
                          {result.breakdown.structural.score} / 20
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#090A0F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${(result.breakdown.structural.score / 20) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 4. Historical Repo Risk (0-15) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-medium">
                          4. Historical Repo Risk ({historicalRevertPct}% revert rate)
                        </span>
                        <span className="font-mono text-amber-300">
                          {result.breakdown.repoRisk.score} / 15
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#090A0F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${(result.breakdown.repoRisk.score / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Savings Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-[#090A0F] border border-slate-800/90">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-emerald-400" /> Cost Saved vs Opus High
                      </div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                        {result.savings.costSavedPct}% (${result.savings.recommendedCostUsd})
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#090A0F] border border-slate-800/90">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Speedup vs Deep High
                      </div>
                      <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                        {result.savings.latencySpeedupMultiplier}x faster
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#090A0F] border border-slate-800/90">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400" /> 1st-Pass Confidence
                      </div>
                      <div className="text-sm font-bold font-mono text-indigo-300 mt-0.5">
                        {result.savings.winRateConfidencePct}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Side-by-Side Frontier Model Cost & Effort Comparison Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Frontier Model Cost, Effort Multiplier &amp; Latency Comparison
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  18k input / 2.2k base output tokens
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] bg-[#0B0D14]">
                      <th className="py-2.5 px-4">Model</th>
                      <th className="py-2.5 px-3">Tier · Effort</th>
                      <th className="py-2.5 px-3">Est. Turn Cost</th>
                      <th className="py-2.5 px-3">Est. Latency</th>
                      <th className="py-2.5 px-3">Quota Units</th>
                      <th className="py-2.5 px-4 text-right">Savings vs Opus High</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.savings.comparisonTable.map((row) => (
                      <tr
                        key={row.modelId}
                        className={
                          row.isRecommended
                            ? 'bg-indigo-500/10 text-white'
                            : 'text-slate-300 hover:bg-slate-900/40'
                        }
                      >
                        <td className="py-2.5 px-4 font-sans font-medium flex items-center gap-2">
                          {row.isRecommended && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                          <span>{row.modelName}</span>
                          <span className="text-[10px] text-slate-500">{row.provider}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                            {row.tier} · {row.effort}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-300">
                          ${row.estimatedCostUsd.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{row.estimatedLatencySec}s</td>
                        <td className="py-2.5 px-3 text-slate-300">{row.quotaUnits}x</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-indigo-300">
                          {row.savingsVsDeepHighPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


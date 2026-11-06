'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import sampleReportData from '../data/sample-report.json';
import {
  BarChart3,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Download,
  Database,
  Check,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  Tilt3DSpotlightCard,
  CountUpMetric,
  MagnetButton,
  DecryptedText,
} from './ReactBits3D';

export interface TelemetryReport {
  generatedAt: string;
  repoId: string;
  totalTurns: number;
  quotaSavedPct: number;
  totalSavedUsd: number;
  actualSpendUsd: number;
  baselineDeepHighUsd: number;
  firstPassSurvivalPct: number;
  regretEscalationRatePct: number;
  avgRoutingLatencyMs: number;
  tierDistribution: {
    fast: { turns: number; pct: number; survivalPct: number; avgScore: number };
    balanced: { turns: number; pct: number; survivalPct: number; avgScore: number };
    deep: { turns: number; pct: number; survivalPct: number; avgScore: number };
  };
  categoryBreakdown: Array<{
    category: string;
    turns: number;
    avgScore: number;
    dominantTier: string;
    survivalPct: number;
    savedUsd: number;
  }>;
  calibratedPolicy: {
    fastMaxScore: number;
    balancedMaxScore: number;
    learnedRules: Array<{
      pattern: string;
      revertRatePct: number;
      policyAction: string;
    }>;
  };
  recentTurns: Array<{
    runId: string;
    timestamp: string;
    promptSummary: string;
    category: string;
    score: number;
    routedTo: string;
    effort: string;
    survived: boolean;
    revertedRatio: number;
    savedUsd: number;
  }>;
}

export function TelemetryDashboard() {
  const [report, setReport] = useState<TelemetryReport>(sampleReportData as TelemetryReport);
  const [isCustomLoaded, setIsCustomLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.telemetry-3d-reveal',
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

  const handleFileContent = (content: string) => {
    try {
      const parsed = JSON.parse(content) as TelemetryReport;
      if (typeof parsed.totalTurns !== 'number' || !parsed.tierDistribution) {
        throw new Error('Invalid report.json schema: missing totalTurns or tierDistribution.');
      }
      setReport(parsed);
      setIsCustomLoaded(true);
      setUploadError(null);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Could not parse JSON file. Run `npx agent-gauge report --out report.json`.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        handleFileContent(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        handleFileContent(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-gauge-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCatTurns = Math.max(...report.categoryBreakdown.map((c) => c.turns), 1);

  return (
    <section
      id="telemetry"
      ref={sectionRef}
      className="py-20 md:py-28 border-b border-border perspective-stage"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Client-Side Dropzone Bar */}
        <div className="telemetry-3d-reveal flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#10F5A0] mb-2">
              <BarChart3 className="w-4 h-4" />
              Closed-Loop SQLite Telemetry &amp; 3D ROI Visualizer
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Git Diff Survival &amp; Quota Savings Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Pre-loaded with a 420-turn production benchmark dataset (
              <code className="text-white font-mono">{report.repoId}</code>), or drag-and-drop your
              exported <code className="text-[#10F5A0] font-mono">report.json</code> to visualize
              100% client-side in browser memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isCustomLoaded && (
              <MagnetButton
                strength={0.2}
                onClick={() => {
                  setReport(sampleReportData as TelemetryReport);
                  setIsCustomLoaded(false);
                  setUploadError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to 420-Turn Benchmark
              </MagnetButton>
            )}
            <MagnetButton
              strength={0.2}
              onClick={downloadSampleJson}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl layers-glass hover:border-[#00F0FF]/60 text-xs font-mono text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
              Download report.json
            </MagnetButton>
          </div>
        </div>

        {/* Client-Side 3D Drag-and-Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`telemetry-3d-reveal mb-8 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
            dragActive
              ? 'border-[#00F0FF] bg-[#00F0FF]/10'
              : isCustomLoaded
                ? 'border-[#10F5A0]/50 bg-[#10F5A0]/5'
                : 'border-white/15 hover:border-[#00F0FF]/60 layers-glass'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/35 flex items-center justify-center text-[#00F0FF] shrink-0">
              {isCustomLoaded ? (
                <Check className="w-5 h-5 text-[#10F5A0]" />
              ) : (
                <UploadCloud className="w-5 h-5 text-[#00F0FF]" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {isCustomLoaded
                  ? `Loaded Custom Telemetry (${report.repoId} · ${report.totalTurns} turns)`
                  : 'Drop Your Local report.json Here (100% Client-Side in Browser Memory)'}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Run{' '}
                <span className="text-[#10F5A0]">npx agent-gauge report --out report.json</span>{' '}
                and drop the file here to inspect your repository&apos;s survival &amp; savings.
              </div>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-xs font-mono font-semibold text-[#00F0FF] shrink-0">
            Browse report.json
          </span>
        </div>

        {uploadError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Top 4 3D Tilt KPI Metric Cards with Animated Counters */}
        <div className="telemetry-3d-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Tilt3DSpotlightCard className="p-5" accentColor="rgba(124, 92, 255, 0.3)">
            <div className="text-xs font-mono text-slate-400">TOTAL ROUTED TURNS</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1.5">
              <CountUpMetric value={report.totalTurns} decimals={0} />
            </div>
            <div className="text-[11px] font-mono text-[#00F0FF] mt-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Avg routing latency: {report.avgRoutingLatencyMs}ms
            </div>
          </Tilt3DSpotlightCard>

          <Tilt3DSpotlightCard className="p-5" accentColor="rgba(16, 245, 160, 0.3)">
            <div className="text-xs font-mono text-slate-400">QUOTA &amp; BUDGET SAVED</div>
            <div className="text-3xl font-extrabold font-mono text-[#10F5A0] mt-1.5">
              <CountUpMetric value={report.quotaSavedPct} decimals={1} suffix="%" />
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-2">
              $<CountUpMetric value={report.totalSavedUsd} decimals={2} /> saved ($
              {report.actualSpendUsd.toFixed(2)} vs ${report.baselineDeepHighUsd.toFixed(2)})
            </div>
          </Tilt3DSpotlightCard>

          <Tilt3DSpotlightCard className="p-5" accentColor="rgba(0, 240, 255, 0.3)">
            <div className="text-xs font-mono text-slate-400">1ST-PASS GIT DIFF SURVIVAL</div>
            <div className="text-3xl font-extrabold font-mono text-[#00F0FF] mt-1.5">
              <CountUpMetric value={report.firstPassSurvivalPct} decimals={1} suffix="%" />
            </div>
            <div className="text-[11px] font-mono text-slate-300 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10F5A0]" />
              Regret escalation rate: {report.regretEscalationRatePct}%
            </div>
          </Tilt3DSpotlightCard>

          <Tilt3DSpotlightCard className="p-5" accentColor="rgba(255, 158, 44, 0.3)">
            <div className="text-xs font-mono text-slate-400">CALIBRATED REPO CUTOFFS</div>
            <div className="text-2xl font-extrabold font-mono text-[#c4b5fd] mt-2">
              <DecryptedText
                text={`Fast ≤ ${report.calibratedPolicy.fastMaxScore} · Bal ≤ ${report.calibratedPolicy.balancedMaxScore}`}
              />
            </div>
            <div className="text-[11px] font-mono text-[#FF9E2C] mt-2">
              Bayesian Beta-smoothed policy
            </div>
          </Tilt3DSpotlightCard>
        </div>

        {/* Middle Row: 3D Segmented Tier Ring + Interactive Category ROI Motion Chart */}
        <div className="telemetry-3d-reveal grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left 5 Cols: Tier Distribution Ring & Survival Cards */}
          <Tilt3DSpotlightCard
            className="lg:col-span-5 p-6 flex flex-col justify-between"
            accentColor="rgba(124, 92, 255, 0.25)"
          >
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#00F0FF] mb-4 flex items-center gap-1.5">
                <PieChart className="w-4 h-4" />
                Tier Distribution &amp; Survival Ring
              </h3>

              <div className="space-y-3.5">
                {(
                  [
                    {
                      key: 'fast',
                      label: 'Fast Tier (Flash / Haiku)',
                      color: 'bg-[#10F5A0]',
                      text: 'text-[#10F5A0]',
                      data: report.tierDistribution.fast,
                    },
                    {
                      key: 'balanced',
                      label: 'Balanced Tier (Sonnet / Argon)',
                      color: 'bg-[#00F0FF]',
                      text: 'text-[#00F0FF]',
                      data: report.tierDistribution.balanced,
                    },
                    {
                      key: 'deep',
                      label: 'Deep Tier (Opus / Pro High)',
                      color: 'bg-white',
                      text: 'text-white',
                      data: report.tierDistribution.deep,
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-xl bg-[#000000] border border-white/10"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white">{item.label}</span>
                      <span className={`font-mono font-bold ${item.text}`}>
                        {item.data.turns} turns ({item.data.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black/70 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${item.color} transition-all duration-700`}
                        style={{ width: `${item.data.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Avg Score: {item.data.avgScore}/100</span>
                      <span className="text-[#10F5A0]">
                        Diff Survival: {item.data.survivalPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
              88.6% of repository turns safely route to Fast or Balanced tiers while maintaining
              94.2% first-pass git diff survival.
            </div>
          </Tilt3DSpotlightCard>

          {/* Right 7 Cols: Interactive Category Breakdown Motion Chart + Learned Repo Policies */}
          <Tilt3DSpotlightCard
            className="lg:col-span-7 p-6 flex flex-col justify-between"
            accentColor="rgba(0, 240, 255, 0.25)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#10F5A0] flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Interactive Task Category ROI &amp; Survival Breakdown
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Hover a bar to inspect category policy
                </span>
              </div>

              <div className="space-y-2.5 mb-6">
                {report.categoryBreakdown.map((cat) => {
                  const widthPct = Math.max(8, Math.round((cat.turns / maxCatTurns) * 100));
                  const isHovered = activeCategory === cat.category;
                  const barColor =
                    cat.dominantTier === 'fast'
                      ? 'from-[#10F5A0] to-[#00F0FF]'
                      : cat.dominantTier === 'balanced'
                        ? 'from-[#00F0FF] to-[#10F5A0]'
                        : 'from-[#00F0FF] to-white';

                  return (
                    <div
                      key={cat.category}
                      onMouseEnter={() => setActiveCategory(cat.category)}
                      onMouseLeave={() => setActiveCategory(null)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 translate-x-1'
                          : 'bg-[#000000] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{cat.category}</span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {cat.dominantTier} · avg {cat.avgScore} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#00F0FF]">{cat.survivalPct}% survival</span>
                          <span className="text-[#10F5A0] font-bold">
                            +${cat.savedUsd.toFixed(2)} saved
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Learned Repository Calibration Rules */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs font-mono uppercase tracking-wider text-[#00F0FF] mb-2.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#10F5A0]" />
                  Learned Path-Specific Escalation Rules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {report.calibratedPolicy.learnedRules.map((rule) => (
                    <div
                      key={rule.pattern}
                      className="p-3 rounded-xl bg-[#000000] border border-white/10 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs text-[#00F0FF] truncate">
                          {rule.pattern}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#10F5A0] shrink-0">
                          {rule.revertRatePct}% revert
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">{rule.policyAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tilt3DSpotlightCard>
        </div>

        {/* Bottom 3D Interactive Cards Grid: Recent Routed Turns & Git Survival Outcomes */}
        <div className="telemetry-3d-reveal">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-200">
              Recent Routed Turns &amp; Implicit Git Survival Stream
            </h3>
            <span className="text-xs font-mono text-[#00F0FF]">~/.agent-gauge/telemetry.db</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.recentTurns.map((t) => (
              <Tilt3DSpotlightCard
                key={t.runId}
                className="p-4 flex flex-col justify-between"
                accentColor={
                  t.survived ? 'rgba(16, 245, 160, 0.24)' : 'rgba(244, 63, 94, 0.3)'
                }
                maxTiltDeg={5}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#00F0FF] font-bold">{t.runId}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                      Score {t.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed mb-3 line-clamp-2">
                    {t.promptSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t.routedTo}</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF]">
                      {t.effort} effort
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {t.survived ? (
                      <span className="inline-flex items-center gap-1 text-[#10F5A0]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Survived ({Math.round((1 - t.revertedRatio) * 100)}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Reverted ({Math.round(t.revertedRatio * 100)}%)
                      </span>
                    )}
                    <span className="text-[#00F0FF] font-bold">+${t.savedUsd.toFixed(3)}</span>
                  </div>
                </div>
              </Tilt3DSpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        err instanceof Error ? err.message : 'Could not parse JSON file. Run `npx agent-gauge report --out report.json`.'
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

  return (
    <section id="telemetry" className="py-16 md:py-24 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Client-Side Dropzone Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              <BarChart3 className="w-4 h-4" />
              Closed-Loop SQLite Telemetry &amp; ROI Visualizer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Real Git Diff Survival &amp; Quota Savings Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Pre-loaded with a 420-turn production benchmark dataset (
              <code className="text-slate-200 font-mono">{report.repoId}</code>), or drop your own
              exported <code className="text-emerald-300 font-mono">report.json</code> to inspect
              100% client-side in browser memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isCustomLoaded && (
              <button
                onClick={() => {
                  setReport(sampleReportData as TelemetryReport);
                  setIsCustomLoaded(false);
                  setUploadError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to 420-Turn Benchmark
              </button>
            )}
            <button
              onClick={downloadSampleJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-border text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Download report.json
            </button>
          </div>
        </div>

        {/* Client-Side Drag-and-Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-8 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
            dragActive
              ? 'border-indigo-400 bg-indigo-500/10'
              : isCustomLoaded
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-slate-800 hover:border-indigo-500/40 bg-surface/50'
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
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              {isCustomLoaded ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {isCustomLoaded
                  ? `Loaded Custom Telemetry (${report.repoId} · ${report.totalTurns} turns)`
                  : 'Load Your Local report.json (100% Client-Side in Browser Memory)'}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Run{' '}
                <span className="text-emerald-300">npx agent-gauge report --out report.json</span>{' '}
                and drag the file here to visualize your repo&apos;s survival &amp; savings.
              </div>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 shrink-0">
            Browse report.json
          </span>
        </div>

        {uploadError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-medium">Total Routed Turns</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {report.totalTurns}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Avg routing latency: {report.avgRoutingLatencyMs}ms
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-medium">Quota &amp; Token Budget Saved</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {report.quotaSavedPct}%
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              ${report.totalSavedUsd.toFixed(2)} saved (${report.actualSpendUsd.toFixed(2)} vs $
              {report.baselineDeepHighUsd.toFixed(2)} Opus High)
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-medium">First-Pass Git Diff Survival</div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
              {report.firstPassSurvivalPct}%
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Regret / escalation rate: {report.regretEscalationRatePct}%
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-slate-400 font-medium">Calibrated Repo Thresholds</div>
            <div className="text-2xl font-extrabold font-mono text-indigo-300 mt-1.5">
              Fast ≤ {report.calibratedPolicy.fastMaxScore} · Bal ≤{' '}
              {report.calibratedPolicy.balancedMaxScore}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Bayesian Beta-smoothed cutoffs
            </div>
          </div>
        </div>

        {/* Middle Row: Tier Distribution + Learned Repository Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Tier Distribution & Survival */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Model Tier Distribution &amp; First-Pass Diff Survival
            </h3>
            <div className="space-y-4">
              {(
                [
                  {
                    key: 'fast',
                    label: 'Fast Tier (Gemini 3.1 Flash / Claude 4.5 Haiku)',
                    color: 'bg-emerald-500',
                    text: 'text-emerald-400',
                    data: report.tierDistribution.fast,
                  },
                  {
                    key: 'balanced',
                    label: 'Balanced Tier (Claude 4.6 Sonnet / Gemini 4 Argon)',
                    color: 'bg-indigo-500',
                    text: 'text-indigo-400',
                    data: report.tierDistribution.balanced,
                  },
                  {
                    key: 'deep',
                    label: 'Deep Tier (Claude 4.6 Opus / Gemini 3.1 Pro)',
                    color: 'bg-amber-500',
                    text: 'text-amber-400',
                    data: report.tierDistribution.deep,
                  },
                ] as const
              ).map((item) => (
                <div key={item.key} className="p-3.5 rounded-xl bg-[#090A0F] border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200">{item.label}</span>
                    <span className={`font-mono font-semibold ${item.text}`}>
                      {item.data.turns} turns ({item.data.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.data.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Avg Complexity Score: {item.data.avgScore}/100</span>
                    <span className="text-emerald-300">
                      Git Diff Survival: {item.data.survivalPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learned Repository Rules Table */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Learned Repository Calibration Policies
                </h3>
                <span className="text-[11px] font-mono text-slate-400">repo_policies table</span>
              </div>
              <div className="space-y-3">
                {report.calibratedPolicy.learnedRules.map((rule) => (
                  <div
                    key={rule.pattern}
                    className="p-3.5 rounded-xl bg-[#090A0F] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono text-xs text-indigo-300 font-semibold">
                        {rule.pattern}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{rule.policyAction}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono text-xs font-semibold ${
                          rule.revertRatePct >= 15
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : rule.revertRatePct >= 10
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {rule.revertRatePct}% revert rate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              When a file path experiences repeated reverts or same-turn escalations, AgentGauge
              automatically raises its Historical Repo Risk score (+0–15 pts).
            </div>
          </div>
        </div>

        {/* Bottom Table: Recent Routed Turns & Git Survival Log */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Recent Routed Turns &amp; Implicit Git Survival Outcomes
            </h3>
            <span className="text-xs font-mono text-slate-400">~/.agent-gauge/telemetry.db</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] bg-[#0B0D14]">
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Task Prompt Summary</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Routed Model · Effort</th>
                  <th className="py-3 px-3">Git Survival</th>
                  <th className="py-3 px-4 text-right">Saved USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.recentTurns.map((t) => (
                  <tr key={t.runId} className="hover:bg-slate-900/40 text-slate-200">
                    <td className="py-3 px-4 font-mono text-indigo-300">{t.runId}</td>
                    <td className="py-3 px-4 max-w-md truncate">{t.promptSummary}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{t.category}</td>
                    <td className="py-3 px-3 font-mono font-bold">{t.score}/100</td>
                    <td className="py-3 px-3 font-mono">
                      {t.routedTo}{' '}
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t.effort}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {t.survived ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Survived ({Math.round((1 - t.revertedRatio) * 100)}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reverted ({Math.round(t.revertedRatio * 100)}%) · Escalated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-300">
                      ${t.savedUsd.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}


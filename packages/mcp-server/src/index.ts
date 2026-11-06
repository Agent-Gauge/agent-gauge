#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { scoreTask, type EffortLevel, type TaskScoreResult } from '../../core-scorer/src/index.ts';
import { formatReportMarkdown, TelemetryDatabase, type RoiReportData } from './db.ts';
import { auditGitSurvival, scanLocalImportGraph } from './git-watcher.ts';

export const MCP_TOOLS_MANIFEST = [
  {
    name: 'score_task',
    description:
      'Deterministically scores a coding task (0-100) in <15ms across Task Intent, Blast Radius (import fan-out), Structural Complexity, and Historical Repo Risk. Returns recommended Model Tier, Effort Level (low/medium/high), Execution Mode, and cost savings.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The user prompt or coding task description to score.',
        },
        filePaths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of target file paths being created or modified.',
        },
        gitDiffSummary: {
          type: 'string',
          description: 'Optional git diff stat or summary string.',
        },
        repoId: {
          type: 'string',
          description: 'Optional repository identifier (defaults to "default").',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'record_turn_outcome',
    description:
      'Records the outcome of an agent turn into local SQLite telemetry (~/.agent-gauge/telemetry.db) and updates Bayesian repository calibration cutoffs.',
    inputSchema: {
      type: 'object',
      properties: {
        runId: { type: 'string' },
        modelUsed: { type: 'string' },
        effortUsed: { type: 'string', enum: ['low', 'medium', 'high'] },
        accepted: { type: 'boolean' },
        revertedLinesRatio: { type: 'number', minimum: 0, maximum: 1 },
        escalatedNextTurn: { type: 'boolean' },
        tokensUsed: { type: 'number' },
        repoId: { type: 'string' },
      },
      required: [
        'runId',
        'modelUsed',
        'effortUsed',
        'accepted',
        'revertedLinesRatio',
        'escalatedNextTurn',
      ],
    },
  },
  {
    name: 'audit_git_survival',
    description:
      'Inspects local git diff and git status against the previous logged turn to automatically infer whether edited lines survived or were reverted.',
    inputSchema: {
      type: 'object',
      properties: {
        currentPrompt: {
          type: 'string',
          description: 'Optional current prompt to detect escalation/retry intent.',
        },
        repoId: { type: 'string' },
      },
    },
  },
  {
    name: 'generate_roi_report',
    description:
      'Queries local SQLite telemetry and generates both a Markdown ROI report and a report.json file compatible with the AgentGauge web dashboard.',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: { type: 'string' },
        outputJsonPath: {
          type: 'string',
          description: 'Optional file path to write report.json',
        },
      },
    },
  },
];

export class AgentGaugeMcpEngine {
  private db: TelemetryDatabase;

  constructor(customDbPath?: string) {
    this.db = new TelemetryDatabase(customDbPath);
  }

  public executeScoreTask(args: {
    prompt: string;
    filePaths?: string[];
    gitDiffSummary?: string;
    repoId?: string;
  }): { runId: string; result: TaskScoreResult } {
    const repoId = args.repoId ?? 'default';
    const filePaths = args.filePaths ?? [];
    const policy = this.db.getPolicy(repoId);
    const { importGraph, combinedCodeSnippet } = scanLocalImportGraph(filePaths);

    const result = scoreTask({
      prompt: args.prompt,
      filePaths,
      gitDiffSummary: args.gitDiffSummary,
      codeSnippet: combinedCodeSnippet,
      importGraph: Object.keys(importGraph).length > 0 ? importGraph : undefined,
      calibrationPolicy: policy,
    });

    const runId = `run-${Date.now().toString(36)}`;
    this.db.logScoredRun(runId, args.prompt, filePaths, result, repoId);
    return { runId, result };
  }

  public executeRecordOutcome(args: {
    runId: string;
    modelUsed: string;
    effortUsed: EffortLevel;
    accepted: boolean;
    revertedLinesRatio: number;
    escalatedNextTurn: boolean;
    tokensUsed?: number;
    repoId?: string;
  }) {
    const updatedPolicy = this.db.recordOutcome(args);
    return {
      status: 'recorded',
      runId: args.runId,
      updatedPolicy,
    };
  }

  public executeAuditGitSurvival(args: { currentPrompt?: string; repoId?: string }) {
    const repoId = args.repoId ?? 'default';
    const lastRun = this.db.getLastRun(repoId);
    const audit = auditGitSurvival(lastRun, args.currentPrompt);

    if (lastRun) {
      this.db.recordOutcome({
        runId: lastRun.runId,
        repoId,
        modelUsed: lastRun.primaryModel,
        tierUsed: lastRun.recommendedTier,
        effortUsed: lastRun.recommendedEffort,
        accepted: audit.accepted,
        revertedLinesRatio: audit.revertedLinesRatio,
        escalatedNextTurn: audit.escalatedNextTurn,
      });
    }
    return audit;
  }

  public executeGenerateRoiReport(args: {
    repoId?: string;
    outputJsonPath?: string;
  }): { report: RoiReportData; markdown: string; savedJsonPath?: string } {
    const repoId = args.repoId ?? 'default';
    const report = this.db.generateReport(repoId);
    const markdown = formatReportMarkdown(report);

    let savedJsonPath: string | undefined;
    if (args.outputJsonPath) {
      savedJsonPath = path.resolve(args.outputJsonPath);
      fs.mkdirSync(path.dirname(savedJsonPath), { recursive: true });
      fs.writeFileSync(savedJsonPath, JSON.stringify(report, null, 2), 'utf8');
    }

    return { report, markdown, savedJsonPath };
  }
}

/**
 * Starts the standard MCP JSON-RPC 2.0 stdio server.
 */
export function startMcpStdioServer(): void {
  const engine = new AgentGaugeMcpEngine();
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  const sendResponse = (id: string | number | null, result: unknown) => {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  };

  const sendError = (id: string | number | null, code: number, message: string) => {
    process.stdout.write(
      JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'
    );
  };

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let msg: { id?: string | number | null; method?: string; params?: Record<string, unknown> };
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }

    const id = msg.id ?? null;
    const method = msg.method ?? '';

    try {
      if (method === 'initialize') {
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'agent-gauge-mcp',
            version: '1.0.0',
          },
        });
      } else if (method === 'notifications/initialized') {
        // No response required for notifications
      } else if (method === 'tools/list') {
        sendResponse(id, { tools: MCP_TOOLS_MANIFEST });
      } else if (method === 'tools/call') {
        const toolName = String(msg.params?.name ?? '');
        const toolArgs = (msg.params?.arguments ?? {}) as Record<string, unknown>;

        if (toolName === 'score_task') {
          const out = engine.executeScoreTask({
            prompt: String(toolArgs.prompt ?? ''),
            filePaths: Array.isArray(toolArgs.filePaths) ? (toolArgs.filePaths as string[]) : [],
            gitDiffSummary: toolArgs.gitDiffSummary ? String(toolArgs.gitDiffSummary) : undefined,
            repoId: toolArgs.repoId ? String(toolArgs.repoId) : undefined,
          });
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
          });
        } else if (toolName === 'record_turn_outcome') {
          const out = engine.executeRecordOutcome({
            runId: String(toolArgs.runId ?? 'run-manual'),
            modelUsed: String(toolArgs.modelUsed ?? 'Claude 4.6 Sonnet'),
            effortUsed: (String(toolArgs.effortUsed ?? 'medium') as EffortLevel),
            accepted: Boolean(toolArgs.accepted ?? true),
            revertedLinesRatio: Number(toolArgs.revertedLinesRatio ?? 0),
            escalatedNextTurn: Boolean(toolArgs.escalatedNextTurn ?? false),
            tokensUsed: toolArgs.tokensUsed ? Number(toolArgs.tokensUsed) : undefined,
            repoId: toolArgs.repoId ? String(toolArgs.repoId) : undefined,
          });
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
          });
        } else if (toolName === 'audit_git_survival') {
          const out = engine.executeAuditGitSurvival({
            currentPrompt: toolArgs.currentPrompt ? String(toolArgs.currentPrompt) : undefined,
            repoId: toolArgs.repoId ? String(toolArgs.repoId) : undefined,
          });
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
          });
        } else if (toolName === 'generate_roi_report') {
          const out = engine.executeGenerateRoiReport({
            repoId: toolArgs.repoId ? String(toolArgs.repoId) : undefined,
            outputJsonPath: toolArgs.outputJsonPath ? String(toolArgs.outputJsonPath) : undefined,
          });
          sendResponse(id, {
            content: [{ type: 'text', text: out.markdown }],
          });
        } else {
          sendError(id, -32601, `Unknown tool: ${toolName}`);
        }
      } else if (id !== null) {
        sendResponse(id, {});
      }
    } catch (err) {
      sendError(id, -32000, err instanceof Error ? err.message : String(err));
    }
  });
}

// Run stdio server if invoked directly as main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpStdioServer();
}


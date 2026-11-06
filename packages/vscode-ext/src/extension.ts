import {
  scoreTask,
  PLAYGROUND_PRESETS,
  type TaskScoreResult,
} from '../../core-scorer/src/index.ts';

// Minimal ambient VS Code API interface so the extension compiles & runs cleanly
// even before `@types/vscode` is installed in offline environments.
export interface VsCodeStatusBarItem {
  text: string;
  tooltip: string;
  command?: string;
  backgroundColor?: unknown;
  show(): void;
  dispose(): void;
}

export interface VsCodeExtensionContext {
  subscriptions: Array<{ dispose(): void }>;
}

export interface VsCodeApi {
  StatusBarAlignment: { Left: number; Right: number };
  window: {
    createStatusBarItem(alignment: number, priority?: number): VsCodeStatusBarItem;
    activeTextEditor?: {
      document: {
        fileName: string;
        getText(): string;
      };
    };
    showInputBox(options: { prompt: string; placeHolder?: string; value?: string }): Promise<string | undefined>;
    showQuickPick(
      items: Array<{ label: string; description?: string; detail?: string }>,
      options?: { placeHolder?: string; title?: string }
    ): Promise<{ label: string; description?: string; detail?: string } | undefined>;
    showInformationMessage(message: string): void;
    onDidChangeActiveTextEditor(listener: (editor: unknown) => void): { dispose(): void };
  };
  workspace: {
    onDidSaveTextDocument(listener: (doc: { fileName: string; getText(): string }) => void): { dispose(): void };
  };
  commands: {
    registerCommand(command: string, callback: (...args: unknown[]) => unknown): { dispose(): void };
  };
}

let lastScoreResult: TaskScoreResult = scoreTask({
  prompt: 'Refactor multi-module authentication middleware and add integration tests',
  filePaths: ['packages/auth/src/middleware.ts', 'packages/auth/test/middleware.test.ts'],
  filesTouchedOverride: 3,
  downstreamFanOutOverride: 11,
});

/**
 * Computes a live status-bar score for the currently active editor document and prompt.
 */
export function evaluateWorkspaceState(promptText: string, activeFilePath?: string, fileContent?: string): TaskScoreResult {
  lastScoreResult = scoreTask({
    prompt: promptText,
    filePaths: activeFilePath ? [activeFilePath] : [],
    codeSnippet: fileContent ? fileContent.slice(0, 4096) : undefined,
  });
  return lastScoreResult;
}

/**
 * VS Code / Cursor / Antigravity / Windsurf Extension Entrypoint
 */
export function activate(context: VsCodeExtensionContext, vscodeApi?: VsCodeApi): void {
  // Dynamically resolve runtime vscode module when running inside Extension Host
  let vscode = vscodeApi;
  if (!vscode) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      vscode = require('vscode') as VsCodeApi;
    } catch {
      return;
    }
  }

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'agentGauge.showBreakdown';

  const refreshStatusBar = (result: TaskScoreResult) => {
    statusBar.text = result.statusBarLabel;
    statusBar.tooltip = [
      `⚡ AgentGauge Deterministic Pre-Flight Router (${result.latencyMs}ms)`,
      `• Recommended Model: ${result.primaryModel} (Alt: ${result.alternateModel})`,
      `• Effort Level: ${result.recommendedEffort.toUpperCase()} | Mode: ${result.executionMode}`,
      `• Breakdown: Intent ${result.breakdown.intent.score}/35 · Blast ${result.breakdown.blastRadius.score}/30 · Struct ${result.breakdown.structural.score}/20 · RepoRisk ${result.breakdown.repoRisk.score}/15`,
      `• Savings vs Opus High: ${result.savings.costSavedPct}% ($${result.savings.recommendedCostUsd} vs $${result.savings.baselineDeepHighCostUsd})`,
    ].join('\n');
    statusBar.show();
  };

  refreshStatusBar(lastScoreResult);

  const scorePromptCmd = vscode.commands.registerCommand('agentGauge.scorePrompt', async () => {
    const editor = vscode!.window.activeTextEditor;
    const promptInput = await vscode!.window.showInputBox({
      prompt: 'Enter your coding task prompt to compute optimal Model + Effort tier (<15ms)',
      placeHolder: 'e.g., Fix Postgres billing race condition in ledger transaction handler',
      value: PLAYGROUND_PRESETS[0].prompt,
    });
    if (!promptInput) return;

    const res = evaluateWorkspaceState(
      promptInput,
      editor?.document.fileName,
      editor?.document.getText()
    );
    refreshStatusBar(res);
    vscode!.window.showInformationMessage(
      `${res.statusBarLabel} → ${res.primaryModel} (${res.recommendedEffort.toUpperCase()} effort, ${res.executionMode}) — Saves ${res.savings.costSavedPct}%`
    );
  });

  const showBreakdownCmd = vscode.commands.registerCommand('agentGauge.showBreakdown', async () => {
    const r = lastScoreResult;
    const items = [
      {
        label: `$(zap) Recommended: ${r.primaryModel} · ${r.recommendedEffort.toUpperCase()} Effort`,
        description: `Score ${r.totalScore}/100 · Mode: ${r.executionMode}`,
        detail: `Saves ${r.savings.costSavedPct}% vs Opus High ($${r.savings.recommendedCostUsd} vs $${r.savings.baselineDeepHighCostUsd}) · Confidence: ${r.savings.winRateConfidencePct}%`,
      },
      {
        label: `$(symbol-event) 1. Task Intent: ${r.breakdown.intent.score}/35 pts`,
        description: `Category: ${r.breakdown.intent.category} (${r.breakdown.intent.riskLevel} risk)`,
        detail: r.breakdown.intent.summary,
      },
      {
        label: `$(references) 2. Blast Radius: ${r.breakdown.blastRadius.score}/30 pts`,
        description: `${r.breakdown.blastRadius.filesTouched} file(s) · ${r.breakdown.blastRadius.downstreamFanOut} downstream fan-out`,
        detail: r.breakdown.blastRadius.summary,
      },
      {
        label: `$(symbol-structure) 3. Structural Complexity: ${r.breakdown.structural.score}/20 pts`,
        description: r.breakdown.structural.indicators.slice(0, 2).join(', '),
        detail: r.breakdown.structural.summary,
      },
      {
        label: `$(history) 4. Historical Repo Risk: ${r.breakdown.repoRisk.score}/15 pts`,
        description: `Empirical revert rate: ${(r.breakdown.repoRisk.effectiveRevertRate * 100).toFixed(1)}%`,
        detail: r.breakdown.repoRisk.summary,
      },
      {
        label: `$(edit) Score a New Task Prompt...`,
        description: 'Run AgentGauge pre-flight scorer on a custom prompt',
        detail: 'Triggers agentGauge.scorePrompt',
      },
    ];

    const picked = await vscode!.window.showQuickPick(items, {
      title: `AgentGauge Pre-Flight Breakdown (${r.latencyMs}ms)`,
      placeHolder: 'Select an item to inspect or re-score a custom task prompt',
    });

    if (picked && picked.label.includes('Score a New Task Prompt')) {
      await vscode!.commands.registerCommand('agentGauge.scorePrompt', () => {});
    }
  });

  const editorListener = vscode.window.onDidChangeActiveTextEditor(() => {
    const editor = vscode!.window.activeTextEditor;
    if (editor) {
      const res = evaluateWorkspaceState(
        `Inspect and update ${editor.document.fileName.split('/').pop()}`,
        editor.document.fileName,
        editor.document.getText()
      );
      refreshStatusBar(res);
    }
  });

  context.subscriptions.push(statusBar, scorePromptCmd, showBreakdownCmd, editorListener);
}

export function deactivate(): void {}


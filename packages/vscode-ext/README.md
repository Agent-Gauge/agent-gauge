# ⚡ AgentGauge — Deterministic Model & Effort Router

> **Stop burning Opus High on CSS edits. Stop under-powering distributed lock bugs.**

**AgentGauge** computes a `<15ms` deterministic 0–100 task complexity score right in your VS Code / Cursor / Windsurf / Antigravity status bar and recommends the optimal **(Execution Mode + Model Tier + Effort Level: Low / Medium / High)**.

## Features

- **Live Status Bar Pill (`⚡ Gauge: Sonnet · Med (Score 48)`):** Automatically evaluates the active file and task context in `<15ms` with zero LLM API calls.
- **4-Dimension Score Breakdown:** Click the status bar item (or run `AgentGauge: Inspect Score Breakdown & Savings`) to inspect:
  1. **Task Intent (`0–35 pts`):** High-risk concurrency/security/migration vs UI/docs.
  2. **Blast Radius (`0–30 pts`):** Files touched, critical schemas, and downstream fan-out.
  3. **Structural Complexity (`0–20 pts`):** Cyclomatic control flow, locks, SQL transactions, AST patterns.
  4. **Historical Repo Risk (`0–15 pts`):** Bayesian-smoothed empirical git diff revert rate.
- **Custom Prompt Pre-Flight Check:** Run `AgentGauge: Score Coding Task & Recommend Model/Effort` from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) to score any prompt before starting an agent turn.

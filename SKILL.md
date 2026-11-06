---
name: agent-gauge
description: "Deterministic <15ms pre-flight task router and closed-loop git diff survival telemetry engine. Activate before starting coding tasks to select the optimal Agent Execution Mode, Model Tier, and Effort Level (Low, Medium, or High), when auditing git diff survival after edits, or when generating a repository ROI and quota savings report."
---

# ⚡ AgentGauge (`agent-gauge`)

**Stop burning Opus High on CSS edits. Stop under-powering distributed lock bugs.**

`agent-gauge` is a 100% deterministic, zero-LLM-cost (<15ms latency) routing skill and MCP engine that scores coding tasks from `0` to `100` across four transparent dimensions and calibrates per-repository cutoffs using closed-loop **Git Diff Survival** telemetry stored in `~/.agent-gauge/telemetry.db`.

---

## Multi-Agent Routing Table

Depending on the phase of the coding turn, route execution to the appropriate specialized instruction file in [`agents/`](./agents/):

| Lifecycle Phase | Target Agent File | When to Activate | MCP Tool / CLI Command |
| :--- | :--- | :--- | :--- |
| **1. Pre-Flight Task Triage** | [`agents/router-agent.md`](./agents/router-agent.md) | At the start of any coding task to compute the 0–100 score and select Model Tier + Effort Level + Execution Mode. | `score_task` / `npx agent-gauge score` |
| **2. Post-Turn Git Survival Audit** | [`agents/calibration-agent.md`](./agents/calibration-agent.md) | At the start of the next turn or after a task completes to check whether edited lines survived in `git diff` or triggered a regret/escalation retry. | `audit_git_survival` & `record_turn_outcome` |
| **3. Telemetry & ROI Reporting** | [`agents/report-agent.md`](./agents/report-agent.md) | When the user asks for token/quota savings, model win-rates, or wants to export `report.json` for the web visualizer. | `generate_roi_report` / `npx agent-gauge report --out report.json` |

---

## Deterministic 4-Dimension Scoring Formula (0–100)

1. **Task Intent Score (0–35 pts):** Classifies high-risk domains (`concurrency-debug`, `multi-agent`, `security-auth`, `database-migration`, `architecture`) vs medium (`refactor`, `testing`, `scaffold`) vs low-risk (`ui`, `docs`).
2. **Blast Radius Score (0–30 pts):** Evaluates files touched, critical-path schema/config files (`schema.prisma`, `types.ts`, `auth`), and transitive downstream import fan-out via Depth-First Search (DFS).
3. **Structural Complexity Score (0–20 pts):** Scans cyclomatic indicators (nested async/await, lock primitives, state machines, SQL transactions, AST visitors, diff churn).
4. **Historical Repo Risk Score (0–15 pts):** Applies Bayesian-smoothed revert & escalation rates learned for the specific repository path.

### Default Routing Matrix (Calibrated per Repo)

| Score Band | Recommended Tier | Recommended Effort | Execution Mode | Representative Models |
| :--- | :--- | :--- | :--- | :--- |
| **0 – 32** | `fast` | `low` / `medium` | `direct` | Gemini 3.1 Flash · Claude 4.5 Haiku |
| **33 – 68** | `balanced` | `low` / `medium` / `high` | `direct` or `delegate-research-subagent` | Claude 4.6 Sonnet · Gemini 4 Argon · GPT-5.4 |
| **69 – 100** | `deep` | `medium` / `high` | `plan-first` | Claude 4.6 Opus · Gemini 3.1 Pro |


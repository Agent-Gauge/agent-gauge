---
name: agent-gauge
description: "Deterministic <15ms pre-flight task router and closed-loop git diff survival telemetry engine. Computes a 0–100 task score across Intent, Blast Radius, Structural Complexity, and Historical Risk to select optimal Model Tier (Fast/Balanced/Deep), Effort Level (Low/Med/High), and Execution Mode (direct/delegate/plan-first)."
---

# ⚡ AgentGauge (`agent-gauge`)

> **Stop burning Opus High on CSS edits. Stop under-powering distributed lock bugs.**

`agent-gauge` is a 100% deterministic, zero-LLM-cost (<15ms latency) task complexity router and git diff survival telemetry engine. It ensures AI coding agents run at the optimal **Model Tier**, **Effort Level (`low` | `medium` | `high`)**, and **Execution Mode (`direct` | `delegate-research-subagent` | `plan-first`)**.

---

## 1. Pre-Flight Protocol (Run at Start of Every Turn)

Whenever the user asks you to implement, edit, refactor, or debug code, follow this sequence **before** generating any code or deep architectural responses:

### Step 1: Context Extraction
Extract the target task attributes:
1. **Task Description (`prompt`):** The user's prompt or instruction.
2. **Target File Paths (`filePaths`):** Files explicitly mentioned or discovered in workspace context.
3. **Touched File Count & Downstream Fan-Out:** How many files are edited and how many other modules import them.

### Step 2: Deterministic 0–100 Scoring
* **If the `agent-gauge-mcp` server is available:** Call the `score_task` tool:
  ```json
  { "prompt": "<user prompt>", "filePaths": ["path/to/file.ts"] }
  ```
* **If CLI is preferred:** Run `npx agent-gauge score "<user prompt>" --files path/to/file.ts`
* **If no MCP or CLI tool is running (In-Context Deterministic Fallback):**
  Apply the transparent 4-dimension scoring rubric directly:

| Dimension | Points | Criteria & Keyword Signals |
| :--- | :--- | :--- |
| **1. Task Intent** | `0–35 pts` | • **Critical (30–35 pts):** `concurrency`, `race condition`, `lock`, `deadlock`, `mutex`, `semaphore`, `migration`, `auth`, `jwt`, `rbac`, `encryption`, `architecture`<br>• **Medium (15–22 pts):** `refactor`, `test`, `eval`, `benchmark`, `scaffold`, `api-endpoint`<br>• **Low (4–10 pts):** `css`, `tailwind`, `dark mode`, `readme`, `docs`, `copy`, `color`, `padding` |
| **2. Blast Radius** | `0–30 pts` | • **Base points by files touched:** 1 file = 4 pts, 2–3 files = 9 pts, 4–7 files = 18 pts, ≥8 files = 26 pts<br>• **Schema/Core multiplier:** +5 pts if modifying `schema.prisma`, `types.ts`, `database.sql`, or auth middleware<br>• **Transitive Fan-Out:** +1 pt per 5 downstream importing modules (up to +8 pts) |
| **3. Structural Complexity** | `0–20 pts` | • Nested async / Promise.all / AbortController (+6 pts)<br>• State machines, DAG nodes, serializers, reducers (+6 pts)<br>• Raw SQL transactions / `FOR UPDATE SKIP LOCKED` (+5 pts)<br>• AST parsing / visitor / compiler tokens (+5 pts)<br>• Heavy branching (≥10 `if`/`switch`/`catch` blocks) (+5 pts)<br>• Declarative styling / markup only (clamp to 2 pts) |
| **4. Historical Repo Risk** | `0–15 pts` | • Default uncalibrated path: 3 pts<br>• Path with high historical churn/reverts (`billing`, `db`, `auth`): 8–15 pts |

$$\text{Total Score} = \min(100, \text{Intent} + \text{BlastRadius} + \text{Structural} + \text{RepoRisk})$$

---

## 2. Default Routing & Model Tier Matrix

| Score Band | Model Tier | Effort Level | Execution Mode | Representative Frontier Models |
| :--- | :--- | :--- | :--- | :--- |
| **0 – 32** | `fast` | `low` (0–21) / `medium` (22–32) | `direct` | Gemini 3.1 Flash · Claude 4.5 Haiku |
| **33 – 68** | `balanced` | `low` (33–40) / `medium` (41–55) / `high` (56–68) | `direct` or `delegate-research-subagent` | Claude 4.6 Sonnet · Gemini 4 Argon · GPT-5.4 |
| **69 – 100** | `deep` | `medium` (69–79) / `high` (80–100) | `plan-first` | Claude 4.6 Opus · Gemini 3.1 Pro |

### Step 3: Surface the Pre-Flight Status Badge
Include this 1-line badge at the beginning of your response:
```text
⚡ Gauge: [ModelShort] · [EffortShort] (Score [Score]/100 · [TIER] · [Mode] · [Savings]% saved vs Opus High)
```
*Example:* `⚡ Gauge: Sonnet · Med (Score 48/100 · BALANCED · direct · 85% saved vs Opus High)`

---

## 3. Tier-Specific Behavioral Directives

Coding agents must strictly adapt their problem-solving behavior based on the routed tier:

### When Routed to `fast` Tier (Score 0–32 · Low/Med Effort)
- **Eliminate Over-Thinking:** Do **not** write lengthy architectural essays, design docs, or theoretical explanations.
- **Immediate Diff:** Produce the targeted code edit or patch directly.
- **Zero Subagent Overhead:** Do not spawn subagents for localized UI, markup, or copy edits.

### When Routed to `balanced` Tier (Score 33–68 · Low/Med/High Effort)
- **Focused Verification:** Identify 1–2 key edge cases (e.g. null safety, empty list handling, timeout backoff).
- **Subagent Delegation Threshold:** If downstream fan-out $\ge 18$ or more than 5 files are touched, delegate import/usage discovery to a read-only research subagent first to keep the primary context window lean.
- **Run Unit Tests:** Always run targeted unit tests after modifying files.

### When Routed to `deep` Tier (Score 69–100 · High Effort · `plan-first`)
- **Mandatory Pause (`plan-first`):** Do **not** mutate code in the first response turn. Present a concise verification plan first:
  1. Concurrency / isolation invariant checklist (e.g. atomicity, lock acquisition order, retry backoff).
  2. Data migration safety & rollback path (e.g. additive schema changes before column drops).
  3. Blast-radius containment: verify that call sites won't throw uncaught exceptions.
- **Strict Verification:** Write a reproduction test case or failure assertion before making the fix.

---

## 4. Few-Shot Scoring Calibration Benchmarks

Use these reference benchmarks to calibrate task complexity ratings:

```yaml
- task: "Add Tailwind dark-mode background and muted text classes to marketing footer"
  files: ["apps/web/src/components/Footer.tsx"]
  score: 12
  breakdown: { intent: 4, blast: 4, structural: 2, repoRisk: 2 }
  tier: "fast"
  effort: "low"
  mode: "direct"
  recommendedModel: "Gemini 3.1 Flash"
  costSavedVsOpusHigh: "98%"

- task: "Build deterministic golden dataset eval runner CLI with retry backoff and JSON table output"
  files: ["packages/evals/src/runner.ts", "packages/evals/src/cli.ts"]
  score: 52
  breakdown: { intent: 22, blast: 14, structural: 12, repoRisk: 4 }
  tier: "balanced"
  effort: "medium"
  mode: "direct"
  recommendedModel: "Claude 4.6 Sonnet"
  costSavedVsOpusHigh: "80%"

- task: "Refactor multi-module authentication middleware, JWT refresh, and permission guards"
  files: ["packages/auth/src/middleware.ts", "packages/auth/src/jwt.ts", "packages/auth/src/rbac.ts"]
  score: 66
  breakdown: { intent: 32, blast: 18, structural: 10, repoRisk: 6 }
  tier: "balanced"
  effort: "high"
  mode: "delegate-research-subagent"
  recommendedModel: "Claude 4.6 Sonnet"
  costSavedVsOpusHigh: "75%"

- task: "Fix double-spend billing race condition in Postgres ledger using SELECT FOR UPDATE SKIP LOCKED"
  files: ["packages/billing/src/ledger.ts", "packages/db/prisma/schema.prisma", "packages/billing/src/webhook.ts"]
  score: 92
  breakdown: { intent: 35, blast: 27, structural: 18, repoRisk: 12 }
  tier: "deep"
  effort: "high"
  mode: "plan-first"
  recommendedModel: "Claude 4.6 Opus"
  costSavedVsOpusHigh: "0% (Frontier Deep Tier Warranted)"
```

---

## 5. Closed-Loop Git Diff Survival Audit

AgentGauge eliminates intrusive thumbs-up/down ratings by tracking real **code survival**:

1. **At the start of turn $N+1$:** Check `git status --porcelain` and `git diff --stat`.
2. **Reverted Lines Ratio:**
   - If edited lines from turn $N$ survived or were committed: `revertedLinesRatio < 0.10` $\rightarrow$ Outcome: **`accepted`**.
   - If user ran `git checkout`, `git restore`, or manually removed $>35\%$ of generated changes: Outcome: **`reverted`**.
   - If user immediately followed up with keywords (`"still broken"`, `"revert"`, `"didn't work"`, `"race condition remains"`): Outcome: **`regret_escalation`**.
3. **Outcome Logging:** Record telemetry via `record_turn_outcome` or CLI:
   ```bash
   npx agent-gauge audit "<current prompt>"
   ```
4. **Bayesian Cutoff Learning:** Frequent regret on `fast` lowers `fastMaxScore` from 32 to 28 for that repository; frequent regret on `balanced` lowers `balancedMaxScore` from 68 to 62.

---

## 6. Multi-Agent Instruction Routing

Depending on the lifecycle phase, reference the dedicated subagent instruction files in [`agents/`](./agents/):

| Phase | Specialized File | Objective | Tool / CLI |
| :--- | :--- | :--- | :--- |
| **Triage** | [`agents/router-agent.md`](./agents/router-agent.md) | Pre-flight 0–100 scoring & model selection | `score_task` / `npx agent-gauge score` |
| **Calibration** | [`agents/calibration-agent.md`](./agents/calibration-agent.md) | Implicit git diff survival & regret detection | `audit_git_survival` & `record_turn_outcome` |
| **ROI Report** | [`agents/report-agent.md`](./agents/report-agent.md) | Generate USD quota savings & export `report.json` | `generate_roi_report` / `npx agent-gauge report` |

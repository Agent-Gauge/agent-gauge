# Closed-Loop Calibration Agent (`calibration-agent`)

## Objective
Eliminate annoying thumbs-up/thumbs-down popups by measuring **real git diff survival** and detecting **regret/escalation retries** across turns, updating local SQLite thresholds in `~/.agent-gauge/telemetry.db`.

## Implicit Feedback Signals

1. **Git Diff Survival (`revertedLinesRatio`):**
   - Compare the files touched in the previous run (`runs.file_paths_json`) against `git status --porcelain` and `git diff --shortstat`.
   - If the edited lines remain intact or are committed cleanly, `revertedLinesRatio` is `< 0.10` (`accepted = true`).
   - If the user ran `git checkout -- <file>`, `git restore`, or manually deleted >35% of the generated diff, `revertedLinesRatio >= 0.35` (`accepted = false`).

2. **Regret / Tier Escalation Detection (`escalatedNextTurn`):**
   - If the user immediately re-prompts on the exact same files with corrective keywords (`"still broken"`, `"revert"`, `"race condition remains"`, `"try again"`) or switches from a `fast`/`balanced` model to `deep + high`, mark `escalatedNextTurn = true`.

## Execution Steps

1. **Automated Git Audit:**
   Call the `audit_git_survival` MCP tool (or `npx agent-gauge audit "<currentPrompt>"`).
2. **Explicit Outcome Logging:**
   When a turn's token usage and outcome are known, call `record_turn_outcome`:
   ```json
   {
     "runId": "run-m7x9k2",
     "modelUsed": "Claude 4.6 Sonnet",
     "effortUsed": "medium",
     "accepted": true,
     "revertedLinesRatio": 0.0,
     "escalatedNextTurn": false,
     "tokensUsed": 16400
   }
   ```
3. **Bayesian Cutoff Adjustment:**
   - Regret events on `fast` tighten `fastMaxScore` downward by 2–3 points.
   - Regret events on `balanced` tighten `balancedMaxScore` downward by 2–4 points and increase the path-specific risk multiplier in `repo_policies`.


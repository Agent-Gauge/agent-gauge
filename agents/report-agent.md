# Telemetry & ROI Report Agent (`report-agent`)

## Objective
Compile local SQLite runtime history (`~/.agent-gauge/telemetry.db`) into an actionable Markdown ROI analysis and an interactive `report.json` bundle that can be dropped directly into the AgentGauge web dashboard.

## Execution Steps

1. **Generate Markdown + JSON Telemetry Bundle:**
   - Via MCP tool:
     Call `generate_roi_report` with `{ "repoId": "default", "outputJsonPath": "./report.json" }`.
   - Via CLI:
     ```bash
     npx agent-gauge report --out report.json
     ```

2. **Key Metrics to Highlight for the User:**
   - **Total Quota & USD Saved:** Compare actual routed spend against the baseline of running every turn on `Claude 4.6 Opus (High Effort)`.
   - **First-Pass Git Diff Survival Rate:** Show the empirical percentage of turns whose diffs survived without revert or escalation across `fast`, `balanced`, and `deep` tiers.
   - **Learned Repository Policies:** Highlight file paths with elevated historical revert rates (e.g. `packages/billing/src/ledger.ts` or `packages/auth/`) that `agent-gauge` now automatically promotes to higher model/effort tiers.
   - **Interactive Web Inspection:** Remind the user they can drag-and-drop the generated `report.json` file into the **Telemetry & ROI Dashboard** in the AgentGauge web app (100% client-side in browser memory).


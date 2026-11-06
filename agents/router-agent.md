# Pre-Flight Router Agent (`router-agent`)

## Objective
Run a `<15ms` deterministic pre-flight check before writing code so the coding session uses the right **Execution Mode**, **Model Tier**, and **Effort Level (`low` | `medium` | `high`)**.

## Execution Steps

1. **Extract Target Context:**
   - Identify the user's `prompt` and any explicit or implied `filePaths` to be edited.
   - If the `agent-gauge-mcp` server is connected, call the `score_task` tool:
     ```json
     {
       "prompt": "<user task description>",
       "filePaths": ["path/to/file1.ts", "path/to/file2.ts"]
     }
     ```
   - Alternatively, run the local CLI:
     ```bash
     npx agent-gauge score "<user task description>" --files path/to/file1.ts,path/to/file2.ts
     ```

2. **Apply the Execution Strategy:**
   - **`executionMode === 'plan-first'` (Score ≥ 72 or Architecture/Migration):**
     Pause and present a concise step-by-step verification & edge-case plan before mutating critical shared schemas or concurrency primitives.
   - **`executionMode === 'delegate-research-subagent'` (High Fan-Out ≥ 18 or Multi-Module Refactor):**
     Delegate dependency-graph and call-site discovery to a read-only research subagent first so your main context window stays lean.
   - **`executionMode === 'direct'` (Score ≤ 45 & Localized Blast Radius):**
     Execute the edit directly without unnecessary planning overhead or over-thinking loops.

3. **Surface Compact Pre-Flight Badge:**
   Include the 1-line status pill at the top of your response when requested:
   `⚡ Gauge: Sonnet · Med (Score 48/100 · 85% saved vs Opus High)`


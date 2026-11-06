import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(__dirname, '..');
const coreSrc = path.resolve(mcpRoot, '../core-scorer/src');

const coreFiles = [
  path.join(coreSrc, 'intent.ts'),
  path.join(coreSrc, 'blast-radius.ts'),
  path.join(coreSrc, 'pricing.ts'),
  path.join(coreSrc, 'calibration.ts'),
  path.join(coreSrc, 'scorer.ts'),
  path.join(coreSrc, 'index.ts'),
];

function cleanTypescript(filePath) {
  const rawTs = fs.readFileSync(filePath, 'utf8');
  const strippedJs = stripTypeScriptTypes(rawTs, { mode: 'strip' });
  return strippedJs
    .replace(/^#!\/usr\/bin\/env node\s*$/m, '')
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+\*\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(async\s+function|function|const|let|var|class)\s+/gm, '$1 ');
}

// 1. Build inlined core bundle string
const coreInlined = coreFiles.map((f) => cleanTypescript(f)).join('\n\n');

// 2. Build dist/index.js (Stdio MCP server & AgentGaugeMcpEngine)
const mcpEngineFiles = [
  path.join(mcpRoot, 'src/db.ts'),
  path.join(mcpRoot, 'src/git-watcher.ts'),
  path.join(mcpRoot, 'src/index.ts'),
];

const mcpInlined = mcpEngineFiles.map((f) => cleanTypescript(f)).join('\n\n');

const indexBundle = `#!/usr/bin/env node
/* AgentGauge MCP Server (v1.0.0) — Standalone Bundle */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

${coreInlined}

${mcpInlined}

export { AgentGaugeMcpEngine, startMcpStdioServer, MCP_TOOLS_MANIFEST };

// Auto-run stdio server if invoked directly
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('dist/index.js') || 
  process.argv[1].endsWith('agent-gauge-mcp') ||
  process.argv[1].includes('agent-gauge-mcp')
);
if (isDirectRun && !process.argv.includes('score') && !process.argv.includes('pr-audit')) {
  startMcpStdioServer();
}
`;

// 3. Build dist/cli.js (CLI tool)
const cliRaw = cleanTypescript(path.join(mcpRoot, 'src/cli.ts'));

const cliBundle = `#!/usr/bin/env node
/* AgentGauge CLI (v1.0.0) — Standalone Bundle */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

${coreInlined}

${mcpInlined}

${cliRaw}
`;

const distDir = path.join(mcpRoot, 'dist');
fs.mkdirSync(distDir, { recursive: true });

const indexOut = path.join(distDir, 'index.js');
const cliOut = path.join(distDir, 'cli.js');

fs.writeFileSync(indexOut, indexBundle, { encoding: 'utf8', mode: 0o755 });
fs.writeFileSync(cliOut, cliBundle, { encoding: 'utf8', mode: 0o755 });

console.log(`Bundled standalone MCP server -> ${path.relative(process.cwd(), indexOut)}`);
console.log(`Bundled standalone CLI tool   -> ${path.relative(process.cwd(), cliOut)}`);

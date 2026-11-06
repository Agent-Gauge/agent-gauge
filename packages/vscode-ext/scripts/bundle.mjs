import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.resolve(__dirname, '..');
const coreSrc = path.resolve(extRoot, '../core-scorer/src');

const sourceFiles = [
  path.join(coreSrc, 'intent.ts'),
  path.join(coreSrc, 'blast-radius.ts'),
  path.join(coreSrc, 'pricing.ts'),
  path.join(coreSrc, 'calibration.ts'),
  path.join(coreSrc, 'scorer.ts'),
  path.join(coreSrc, 'index.ts'),
  path.join(extRoot, 'src/extension.ts'),
];

const chunks = [
  '/* Auto-generated self-contained VS Code / Open VSX bundle for AgentGauge */',
  '"use strict";',
];

for (const filePath of sourceFiles) {
  const rawTs = fs.readFileSync(filePath, 'utf8');
  const strippedJs = stripTypeScriptTypes(rawTs, { mode: 'strip' });

  // Remove ESM local imports/re-exports and convert top-level `export ` declarations
  const cleaned = strippedJs
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+\*\s+from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(async\s+function|function|const|let|var|class)\s+/gm, '$1 ');

  chunks.push(`// --- ${path.relative(extRoot, filePath)} ---\n${cleaned.trim()}`);
}

chunks.push(`
module.exports = {
  activate,
  deactivate,
  evaluateWorkspaceState,
  scoreTask,
  PLAYGROUND_PRESETS,
};
`);

const distDir = path.join(extRoot, 'dist');
fs.mkdirSync(distDir, { recursive: true });
const outFile = path.join(distDir, 'extension.js');
fs.writeFileSync(outFile, chunks.join('\n\n') + '\n', 'utf8');
console.log(`Bundled standalone VS Code extension -> ${path.relative(process.cwd(), outFile)}`);

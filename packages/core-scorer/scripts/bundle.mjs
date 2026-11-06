import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');
const srcDir = path.join(pkgRoot, 'src');
const distDir = path.join(pkgRoot, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Inline modules in dependency order
const order = ['pricing.ts', 'intent.ts', 'blast-radius.ts', 'calibration.ts', 'scorer.ts'];
const collectedExports = [];
const collectedCode = [];

for (const mod of order) {
  const filePath = path.join(srcDir, mod);
  let src = fs.readFileSync(filePath, 'utf8');

  // Strip internal relative imports
  src = src.replace(/import\s+[^;]+from\s+['"]\.\/[^'"]+['"];?\n?/g, '');

  // Strip TypeScript types
  const js = stripTypeScriptTypes(src, { mode: 'strip' });
  collectedCode.push(`// --- ${mod} ---\n` + js);
}

// Read index.ts for export statements
const indexTs = fs.readFileSync(path.join(srcDir, 'index.ts'), 'utf8');
const indexJs = stripTypeScriptTypes(indexTs, { mode: 'strip' });

const finalBundle = `/**
 * @agent-gauge/core-scorer v1.0.0
 * Zero-dependency deterministic <15ms coding task complexity & model pricing engine.
 * https://github.com/Agent-Gauge/agent-gauge
 */

${collectedCode.join('\n\n')}

// --- index.ts exports ---
${indexJs.replace(/export\s+\*\s+from\s+['"]\.\/[^'"]+['"];?\n?/g, '')}
`;

fs.writeFileSync(path.join(distDir, 'index.js'), finalBundle, 'utf8');
console.log('Bundled @agent-gauge/core-scorer -> packages/core-scorer/dist/index.js');

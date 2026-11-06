export interface BlastRadiusInput {
  /** Target file paths being modified or inspected */
  filePaths?: string[];
  /** Explicit override for number of files touched (e.g. from interactive sliders or git diff) */
  filesTouchedOverride?: number;
  /** Explicit override for downstream import fan-out count */
  downstreamFanOutOverride?: number;
  /**
   * Optional import graph mapping `importerFilePath -> importedFilePaths[]`.
   * Used to run a deterministic DFS to count transitive dependents of `filePaths`.
   */
  importGraph?: Record<string, string[]>;
}

export interface BlastRadiusResult {
  score: number; // 0 to 30
  filesTouched: number;
  downstreamFanOut: number;
  criticalFiles: string[];
  isSharedSchemaOrConfig: boolean;
  summary: string;
}

const CRITICAL_FILE_PATTERNS: Array<{ label: string; pattern: RegExp; weight: number }> = [
  {
    label: 'database schema / migration',
    pattern: /(schema\.prisma|migrations?\/|drizzle\/|\.sql$|models\/|entities\/)/i,
    weight: 7,
  },
  {
    label: 'shared types / core contracts',
    pattern: /(\btypes\.ts$|\binterfaces\.ts$|\bcontracts\.ts$|\bindex\.ts$|packages\/core|shared\/)/i,
    weight: 5,
  },
  {
    label: 'security / auth / middleware',
    pattern: /(middleware|auth|permissions|rbac|session|jwt|crypto)/i,
    weight: 6,
  },
  {
    label: 'workspace / build configuration',
    pattern: /(package\.json|pnpm-workspace\.yaml|tsconfig.*|\.env|docker-compose|Dockerfile|next\.config|vite\.config)/i,
    weight: 4,
  },
];

/**
 * Extracts static and dynamic module specifiers from JS/TS/Python source text.
 * Pure string/regex implementation with zero Node dependencies.
 */
export function extractImportsFromSource(sourceCode: string): string[] {
  const imports = new Set<string>();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /^\s*from\s+([a-zA-Z0-9_.]+)\s+import\b/gm,
  ];

  for (const regex of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sourceCode)) !== null) {
      if (match[1]) {
        imports.add(match[1].trim());
      }
    }
  }
  return Array.from(imports);
}

/**
 * Computes transitive downstream dependents (fan-out) using Depth-First Search (DFS)
 * over the reverse dependency graph.
 */
export function computeTransitiveFanOut(
  targetFiles: string[],
  importGraph: Record<string, string[]>
): number {
  if (!targetFiles.length || !Object.keys(importGraph).length) {
    return 0;
  }

  // Normalize path helper (strips leading ./ and extensions for resilient matching)
  const normalize = (p: string) =>
    p
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '');

  // Build reverse adjacency list: importedNormalized -> Set<importerNormalized>
  const reverseGraph = new Map<string, Set<string>>();

  for (const [importer, importedList] of Object.entries(importGraph)) {
    const normImporter = normalize(importer);
    for (const imported of importedList) {
      const normImported = normalize(imported);
      if (!reverseGraph.has(normImported)) {
        reverseGraph.set(normImported, new Set());
      }
      reverseGraph.get(normImported)!.add(normImporter);
    }
  }

  const visitedDependents = new Set<string>();
  const stack: string[] = targetFiles.map(normalize);
  const initialTargets = new Set(stack);

  while (stack.length > 0) {
    const current = stack.pop()!;
    // Match exact normalized key or suffix match for relative imports
    for (const [importedKey, importers] of reverseGraph.entries()) {
      if (
        importedKey === current ||
        current.endsWith('/' + importedKey) ||
        importedKey.endsWith('/' + current)
      ) {
        for (const dep of importers) {
          if (!visitedDependents.has(dep) && !initialTargets.has(dep)) {
            visitedDependents.add(dep);
            stack.push(dep);
          }
        }
      }
    }
  }

  return visitedDependents.size;
}

/**
 * Calculates the Blast Radius Score (0-30) from files touched, critical-path patterns,
 * and downstream import fan-out.
 */
export function computeBlastRadius(input: BlastRadiusInput): BlastRadiusResult {
  const filePaths = input.filePaths ?? [];
  const filesTouched =
    input.filesTouchedOverride !== undefined
      ? Math.max(0, input.filesTouchedOverride)
      : Math.max(1, filePaths.length);

  // 1. File count contribution (0 to 10 pts)
  let fileCountPts = 0;
  if (filesTouched <= 1) fileCountPts = 1;
  else if (filesTouched <= 3) fileCountPts = 3;
  else if (filesTouched <= 7) fileCountPts = 6;
  else if (filesTouched <= 14) fileCountPts = 8;
  else fileCountPts = 10;

  // 2. Critical-path / shared schema detection (0 to 10 pts)
  const criticalFiles: string[] = [];
  let criticalPts = 0;
  for (const fp of filePaths) {
    for (const rule of CRITICAL_FILE_PATTERNS) {
      if (rule.pattern.test(fp)) {
        criticalFiles.push(`${fp} (${rule.label})`);
        criticalPts += rule.weight;
        break;
      }
    }
  }
  criticalPts = Math.min(10, criticalPts);

  // 3. Downstream import fan-out (0 to 12 pts)
  const computedFanOut =
    input.downstreamFanOutOverride !== undefined
      ? Math.max(0, input.downstreamFanOutOverride)
      : input.importGraph
        ? computeTransitiveFanOut(filePaths, input.importGraph)
        : Math.max(0, (filesTouched - 1) * 2 + (criticalFiles.length > 0 ? 8 : 1));

  let fanOutPts = 0;
  if (computedFanOut === 0) fanOutPts = 0;
  else if (computedFanOut <= 3) fanOutPts = 2;
  else if (computedFanOut <= 10) fanOutPts = 5;
  else if (computedFanOut <= 25) fanOutPts = 8;
  else if (computedFanOut <= 50) fanOutPts = 10;
  else fanOutPts = 12;

  const totalScore = Math.max(0, Math.min(30, Math.round(fileCountPts + criticalPts + fanOutPts)));

  return {
    score: totalScore,
    filesTouched,
    downstreamFanOut: computedFanOut,
    criticalFiles,
    isSharedSchemaOrConfig: criticalFiles.length > 0,
    summary: `${filesTouched} file(s) touched, ${computedFanOut} downstream dependents${
      criticalFiles.length > 0 ? `, critical path [${criticalFiles.length}]` : ''
    } (${totalScore}/30 pts)`,
  };
}


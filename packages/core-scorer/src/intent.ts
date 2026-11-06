export type TaskCategory =
  | 'concurrency-debug'
  | 'architecture'
  | 'security-auth'
  | 'database-migration'
  | 'multi-agent'
  | 'refactor'
  | 'testing'
  | 'scaffold'
  | 'ui'
  | 'docs';

export interface IntentClassification {
  category: TaskCategory;
  score: number; // 0 to 35
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchedSignals: string[];
  summary: string;
}

interface SignalRule {
  category: TaskCategory;
  weight: number;
  label: string;
  pattern: RegExp;
}

const HIGH_RISK_RULES: SignalRule[] = [
  {
    category: 'concurrency-debug',
    weight: 16,
    label: 'concurrency / race condition',
    pattern: /\b(race\s*condition|deadlock|livelock|mutex|semaphore|distributed\s*lock|idempoten(t|cy)|thread[\s-]*safe|atomic|cas\b|compare[\s-]*and[\s-]*swap|optimistic\s*lock|pessimistic\s*lock|double[\s-]*spend|billing\s*race)\b/i,
  },
  {
    category: 'multi-agent',
    weight: 15,
    label: 'multi-agent state / checkpoint orchestration',
    pattern: /\b(langgraph|checkpoint\s*deseriali[sz]ation|state\s*graph|subagent|handoff|agent\s*orchestrat|dag\s*scheduler|cyclic\s*graph|tool[\s-]*call\s*loop|durable\s*execution|temporal\s*workflow)\b/i,
  },
  {
    category: 'security-auth',
    weight: 14,
    label: 'security / cryptography / auth flow',
    pattern: /\b(oauth2?|oidc|jwt|pkce|rbac|abac|zero[\s-]*trust|csrf|xss|sql\s*injection|ssrf|encryption|kms|hmac|signature\s*verification|session\s*fixation|privilege\s*escalation|auth\s*middleware)\b/i,
  },
  {
    category: 'database-migration',
    weight: 13,
    label: 'database schema / transaction isolation',
    pattern: /\b(serializable|repeatable\s*read|advisory\s*lock|zero[\s-]*downtime\s*migration|backfill|sharding|partitioning|wal\b|replication\s*lag|foreign\s*key\s*cascade|postgres\s*lock|select\s+for\s+update)\b/i,
  },
  {
    category: 'architecture',
    weight: 13,
    label: 'system architecture / cross-cutting design',
    pattern: /\b(system\s*design|event[\s-]*driven|cqrs|event\s*sourcing|consensus|raft|paxos|raft\s*log|schema\s*evolution|breaking\s*change|monorepo\s*migration|compiler\s*pass|ast\s*transform|bytecode)\b/i,
  },
];

const MEDIUM_RISK_RULES: SignalRule[] = [
  {
    category: 'refactor',
    weight: 9,
    label: 'multi-module refactoring',
    pattern: /\b(refactor|decouple|extract\s*service|modularize|deprecate|migrate\s*api|consolidate|re-?architect|dependency\s*injection|invert\s*control)\b/i,
  },
  {
    category: 'testing',
    weight: 8,
    label: 'eval runner / integration test harness',
    pattern: /\b(eval\s*runner|golden\s*dataset|property[\s-]*based\s*test|fuzz(ing)?|integration\s*test|e2e\s*harness|benchmark\s*suite|load\s*test|deterministic\s*replay)\b/i,
  },
  {
    category: 'database-migration',
    weight: 8,
    label: 'query optimization / indexing',
    pattern: /\b(query\s*plan|explain\s*analyze|n\+1\s*query|composite\s*index|prisma\s*migration|drizzle\s*migration|typeorm|knex|transaction)\b/i,
  },
  {
    category: 'concurrency-debug',
    weight: 9,
    label: 'memory leak / async root-cause debugging',
    pattern: /\b(memory\s*leak|heap\s*snapshot|flamegraph|uncaught\s*rejection|zombie\s*process|backpressure|stream\s*pipeline|abortcontroller|retry\s*backoff|flaky\s*test)\b/i,
  },
  {
    category: 'scaffold',
    weight: 6,
    label: 'feature scaffolding / endpoint creation',
    pattern: /\b(scaffold|crud|endpoint|rest\s*api|graphql\s*resolver|webhook\s*handler|cli\s*command|sdk\s*wrapper)\b/i,
  },
];

const LOW_RISK_REDUCERS: SignalRule[] = [
  {
    category: 'ui',
    weight: -6,
    label: 'UI styling / CSS / presentation tokens',
    pattern: /\b(tailwind|css|scss|dark[\s-]*mode|footer|header|padding|margin|flex|grid|color\s*palette|figma\s*tokens|storybook|icon|button\s*style|hover\s*state|typography|responsive\s*layout)\b/i,
  },
  {
    category: 'docs',
    weight: -8,
    label: 'documentation / copy / comments',
    pattern: /\b(readme|changelog|jsdoc|tsdoc|typo|copy\s*edit|markdown|comment|license|contributing\.md|badge)\b/i,
  },
  {
    category: 'testing',
    weight: -4,
    label: 'simple unit test / mock',
    pattern: /\b(unit\s*test\s*mock|snapshot\s*test|stub|fixture\s*json)\b/i,
  },
];

/**
 * Deterministically classifies task intent and computes the Task Intent Score (0-35).
 */
export function classifyTaskIntent(prompt: string): IntentClassification {
  const normalized = prompt.trim();
  if (!normalized) {
    return {
      category: 'scaffold',
      score: 10,
      riskLevel: 'low',
      matchedSignals: ['default baseline'],
      summary: 'Empty or minimal prompt; defaulting to baseline scaffold score.',
    };
  }

  let rawScore = 10; // Baseline starting intent score
  const matchedSignals: string[] = [];
  const categoryScores = new Map<TaskCategory, number>();

  const addCategoryScore = (cat: TaskCategory, pts: number) => {
    categoryScores.set(cat, (categoryScores.get(cat) ?? 0) + pts);
  };

  for (const rule of HIGH_RISK_RULES) {
    if (rule.pattern.test(normalized)) {
      rawScore += rule.weight;
      matchedSignals.push(rule.label);
      addCategoryScore(rule.category, rule.weight + 5);
    }
  }

  for (const rule of MEDIUM_RISK_RULES) {
    if (rule.pattern.test(normalized)) {
      rawScore += rule.weight;
      matchedSignals.push(rule.label);
      addCategoryScore(rule.category, rule.weight);
    }
  }

  for (const rule of LOW_RISK_REDUCERS) {
    if (rule.pattern.test(normalized)) {
      rawScore += rule.weight;
      matchedSignals.push(rule.label);
      addCategoryScore(rule.category, Math.abs(rule.weight));
    }
  }

  // Prompt multi-step complexity heuristics (numbered lists, multiple requirements, constraints)
  const bulletCount = (normalized.match(/^(\s*[-*•]|\s*\d+\.)\s+/gm) || []).length;
  if (bulletCount >= 4) {
    rawScore += 5;
    matchedSignals.push(`multi-step specification (${bulletCount} items)`);
  } else if (bulletCount >= 2) {
    rawScore += 2;
  }

  if (/\b(without\s+breaking|backward[\s-]*compatible|zero[\s-]*downtime|strict\s+sla|production\s+incident|p0|sev1)\b/i.test(normalized)) {
    rawScore += 5;
    matchedSignals.push('strict reliability constraint');
  }

  const clampedScore = Math.max(2, Math.min(35, Math.round(rawScore)));

  // Determine dominant category
  let dominantCategory: TaskCategory = 'scaffold';
  let maxCatScore = -1;
  for (const [cat, pts] of categoryScores.entries()) {
    if (pts > maxCatScore) {
      maxCatScore = pts;
      dominantCategory = cat;
    }
  }

  // Fallback heuristics if no explicit pattern matched
  if (matchedSignals.length === 0) {
    if (/\b(fix|bug|error|issue|crash|fail)\b/i.test(normalized)) {
      dominantCategory = 'concurrency-debug';
      matchedSignals.push('general bug fix');
    } else if (/\b(style|component|page|modal|view|card)\b/i.test(normalized)) {
      dominantCategory = 'ui';
      matchedSignals.push('UI component task');
    } else {
      matchedSignals.push('general feature implementation');
    }
  }

  const riskLevel: IntentClassification['riskLevel'] =
    clampedScore >= 28
      ? 'critical'
      : clampedScore >= 19
        ? 'high'
        : clampedScore >= 11
          ? 'medium'
          : 'low';

  return {
    category: dominantCategory,
    score: clampedScore,
    riskLevel,
    matchedSignals,
    summary: `Classified as ${dominantCategory} (${riskLevel} risk, ${clampedScore}/35 pts) via [${matchedSignals.slice(0, 3).join(', ')}]`,
  };
}


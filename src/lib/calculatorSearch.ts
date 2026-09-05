import type { CalculatorConfig } from '@/types';

const SYMBOL_WORDS: ReadonlyArray<readonly [RegExp, string]> = [
  [/[Ωω]/g, ' ohm '],
  [/[µμ]/g, ' micro '],
  [/λ/g, ' lambda '],
  [/τ/g, ' tau '],
  [/∑/g, ' sum '],
  [/∫/g, ' integral '],
  [/√/g, ' sqrt '],
  [/π/g, ' pi '],
  [/²/g, ' squared '],
  [/³/g, ' cubed '],
];

export function normalizeCalculatorQuery(value: string) {
  let normalized = value.normalize('NFKD').toLowerCase();
  for (const [symbol, word] of SYMBOL_WORDS) normalized = normalized.replace(symbol, word);
  return normalized
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function searchableParts(calculator: CalculatorConfig) {
  return {
    shortTitle: normalizeCalculatorQuery(calculator.meta.shortTitle),
    title: normalizeCalculatorQuery(calculator.meta.title),
    keywords: calculator.meta.keywords.map(normalizeCalculatorQuery),
    formula: normalizeCalculatorQuery(calculator.formula),
    description: normalizeCalculatorQuery(calculator.meta.description),
  };
}

export function calculatorSearchScore(calculator: CalculatorConfig, rawQuery: string) {
  const query = normalizeCalculatorQuery(rawQuery);
  if (!query) return 0;

  const parts = searchableParts(calculator);
  const haystack = [
    parts.shortTitle,
    parts.title,
    ...parts.keywords,
    parts.formula,
    parts.description,
  ].join(' ');
  const tokens = query.split(' ');
  if (!tokens.every((token) => haystack.includes(token))) return -1;

  let score = 0;
  if (parts.shortTitle === query) score += 180;
  if (parts.shortTitle.startsWith(query)) score += 100;
  if (parts.title.startsWith(query)) score += 70;
  if (parts.keywords.some((keyword) => keyword === query)) score += 90;
  if (parts.keywords.some((keyword) => keyword.startsWith(query))) score += 55;
  if (parts.formula.includes(query)) score += 35;

  for (const token of tokens) {
    if (parts.shortTitle.split(' ').some((word) => word.startsWith(token))) score += 24;
    if (parts.title.split(' ').some((word) => word.startsWith(token))) score += 16;
    if (parts.keywords.some((keyword) => keyword.split(' ').some((word) => word.startsWith(token)))) {
      score += 14;
    }
    if (parts.formula.includes(token)) score += 6;
    if (parts.description.includes(token)) score += 2;
  }

  if (calculator.meta.popular) score += 3;
  if (calculator.meta.new) score += 1;
  return score;
}

export function rankCalculators(calculators: CalculatorConfig[], query: string) {
  const normalized = normalizeCalculatorQuery(query);
  if (!normalized) return calculators;

  return calculators
    .map((calculator, index) => ({
      calculator,
      index,
      score: calculatorSearchScore(calculator, normalized),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.calculator);
}

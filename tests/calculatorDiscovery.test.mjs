import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FAVORITES_STORAGE_KEY,
  RECENT_CALCULATORS_STORAGE_KEY,
  getCalculatorActivity,
  recordRecentCalculator,
  toggleFavoriteCalculator,
} from '../src/lib/calculatorActivity.ts';
import {
  normalizeCalculatorQuery,
  rankCalculators,
} from '../src/lib/calculatorSearch.ts';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

class FailingStorage extends MemoryStorage {
  setItem() {
    throw new Error('Storage quota exceeded');
  }
}

function calculator(slug, shortTitle, description, formula, keywords = [], flags = {}) {
  return {
    meta: {
      slug,
      shortTitle,
      title: `${shortTitle} – Engineering Calculator`,
      description,
      category: 'electrical',
      icon: 'E',
      keywords,
      ...flags,
    },
    formula,
    formulaExplanation: '',
    exampleUsage: '',
    faqs: [],
    relatedSlugs: [],
  };
}

const searchFixtures = [
  calculator(
    'ohms-law-calculator',
    "Ohm's Law",
    'Calculate voltage, current, and resistance.',
    'V = I × R',
    ['ohm', 'voltage', 'resistance'],
    { popular: true },
  ),
  calculator(
    'voltage-divider-calculator',
    'Voltage Divider',
    'Design a loaded resistor divider.',
    'Vout = Vin × R2 / (R1 + R2)',
    ['voltage divider', 'resistor network'],
  ),
  calculator(
    'integral-calculator',
    'Integral',
    'Find the area under a curve.',
    '∫ f(x) dx',
    ['calculus', 'integration'],
  ),
];

test('calculator search ranks an exact title ahead of a description match', () => {
  const ranked = rankCalculators(searchFixtures, 'voltage divider');
  assert.equal(ranked[0].meta.slug, 'voltage-divider-calculator');
  assert.equal(ranked.length, 1);
});

test('calculator search supports multi-word intent and engineering symbols', () => {
  assert.equal(rankCalculators(searchFixtures, 'voltage resistance')[0].meta.slug, 'ohms-law-calculator');
  assert.equal(rankCalculators(searchFixtures, '∫')[0].meta.slug, 'integral-calculator');
  assert.equal(normalizeCalculatorQuery('10 µF · 2 kΩ'), '10 micro f 2 k ohm');
});

test('activity storage recovers from malformed data and deduplicates values', () => {
  const storage = new MemoryStorage();
  storage.setItem(FAVORITES_STORAGE_KEY, '{bad json');
  storage.setItem(
    RECENT_CALCULATORS_STORAGE_KEY,
    JSON.stringify(['ohms-law-calculator', 'ohms-law-calculator', '../unsafe', 42]),
  );
  assert.deepEqual(getCalculatorActivity(storage), {
    favorites: [],
    recent: ['ohms-law-calculator'],
  });
});

test('favourites toggle and recent calculators stay ordered and bounded', () => {
  const storage = new MemoryStorage();
  assert.equal(toggleFavoriteCalculator('ohms-law-calculator', storage), true);
  assert.equal(toggleFavoriteCalculator('ohms-law-calculator', storage), false);
  assert.deepEqual(getCalculatorActivity(storage).favorites, []);

  for (let index = 0; index < 12; index += 1) {
    recordRecentCalculator(`tool-${index}`, storage);
  }
  recordRecentCalculator('tool-5', storage);
  const recent = getCalculatorActivity(storage).recent;
  assert.equal(recent.length, 8);
  assert.equal(recent[0], 'tool-5');
  assert.equal(new Set(recent).size, recent.length);
});

test('favourite toggles report the persisted state when storage writes fail', () => {
  const emptyStorage = new FailingStorage();
  assert.equal(toggleFavoriteCalculator('ohms-law-calculator', emptyStorage), false);
  assert.deepEqual(getCalculatorActivity(emptyStorage).favorites, []);

  const savedStorage = new FailingStorage();
  savedStorage.values.set(FAVORITES_STORAGE_KEY, JSON.stringify(['ohms-law-calculator']));
  assert.equal(toggleFavoriteCalculator('ohms-law-calculator', savedStorage), true);
  assert.deepEqual(getCalculatorActivity(savedStorage).favorites, ['ohms-law-calculator']);
});

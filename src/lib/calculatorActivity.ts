export const FAVORITES_STORAGE_KEY = 'ech-favorites';
export const RECENT_CALCULATORS_STORAGE_KEY = 'ech-recent-calculators';
export const CALCULATOR_ACTIVITY_EVENT = 'engcalc:calculator-activity';
export const OPEN_CALCULATOR_SEARCH_EVENT = 'engcalc:open-calculator-search';

const MAX_FAVORITES = 50;
const MAX_RECENT = 8;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface CalculatorActivity {
  favorites: string[];
  recent: string[];
}

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = Pick<Storage, 'getItem' | 'setItem'>;

function cleanSlugList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !SLUG_PATTERN.test(item) || seen.has(item)) continue;
    seen.add(item);
    cleaned.push(item);
    if (cleaned.length === limit) break;
  }
  return cleaned;
}

export function readSlugList(storage: StorageReader, key: string, limit: number) {
  try {
    return cleanSlugList(JSON.parse(storage.getItem(key) || '[]'), limit);
  } catch {
    return [];
  }
}

function writeSlugList(storage: StorageWriter, key: string, value: string[]) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function browserStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function announceActivityChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CALCULATOR_ACTIVITY_EVENT));
  }
}

export function getCalculatorActivity(storage: StorageReader | null = browserStorage()): CalculatorActivity {
  if (!storage) return { favorites: [], recent: [] };
  return {
    favorites: readSlugList(storage, FAVORITES_STORAGE_KEY, MAX_FAVORITES),
    recent: readSlugList(storage, RECENT_CALCULATORS_STORAGE_KEY, MAX_RECENT),
  };
}

export function isFavoriteCalculator(slug: string, storage: StorageReader | null = browserStorage()) {
  return getCalculatorActivity(storage).favorites.includes(slug);
}

export function toggleFavoriteCalculator(slug: string, storage: StorageWriter | null = browserStorage()) {
  if (!storage || !SLUG_PATTERN.test(slug)) return false;
  const favorites = readSlugList(storage, FAVORITES_STORAGE_KEY, MAX_FAVORITES);
  const isFavorite = favorites.includes(slug);
  const next = isFavorite
    ? favorites.filter((item) => item !== slug)
    : [slug, ...favorites].slice(0, MAX_FAVORITES);
  if (!writeSlugList(storage, FAVORITES_STORAGE_KEY, next)) return isFavorite;
  announceActivityChange();
  return !isFavorite;
}

export function recordRecentCalculator(slug: string, storage: StorageWriter | null = browserStorage()) {
  if (!storage || !SLUG_PATTERN.test(slug)) return;
  const recent = readSlugList(storage, RECENT_CALCULATORS_STORAGE_KEY, MAX_RECENT);
  const next = [slug, ...recent.filter((item) => item !== slug)].slice(0, MAX_RECENT);
  if (next.join('|') === recent.join('|')) return;
  if (writeSlugList(storage, RECENT_CALCULATORS_STORAGE_KEY, next)) announceActivityChange();
}

export function openCalculatorSearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_CALCULATOR_SEARCH_EVENT));
  }
}

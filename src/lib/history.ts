"use client";

import { useEffect, useRef } from "react";

export type HistoryEntry = {
  slug: string;
  title: string;
  inputPreview: string;
  result: string;
  at: number;
};

export const HISTORY_STORAGE_KEY = "ech-history";
export const HISTORY_LIMIT = 20;

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as HistoryEntry;
  return (
    typeof entry.slug === "string" &&
    typeof entry.title === "string" &&
    typeof entry.inputPreview === "string" &&
    typeof entry.result === "string" &&
    typeof entry.at === "number"
  );
}

export function getHistory(): HistoryEntry[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function appendHistory(entry: Omit<HistoryEntry, "at">): HistoryEntry[] {
  const storage = getStorage();
  if (!storage) return [];

  const item: HistoryEntry = {
    slug: entry.slug,
    title: entry.title,
    inputPreview: entry.inputPreview,
    result: entry.result,
    at: Date.now(),
  };

  const prev = getHistory();
  const next = [
    item,
    ...prev.filter((existing) => existing.slug !== item.slug || existing.result !== item.result),
  ].slice(0, HISTORY_LIMIT);

  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — history is best-effort only.
  }

  return next;
}

export function clearHistory(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function isErrorResult(result: string): boolean {
  return /^(please\b|enter valid|invalid\b|unable\b|no unique|undefined)/i.test(result.trim());
}

export function useRecordHistory(
  slug: string,
  title: string,
  result: string | undefined,
  inputPreview?: string,
): void {
  const lastRecorded = useRef("");

  useEffect(() => {
    if (!result || result === lastRecorded.current) return;
    if (isErrorResult(result)) return;
    lastRecorded.current = result;
    appendHistory({
      slug,
      title,
      inputPreview: inputPreview?.trim() || result.slice(0, 80),
      result,
    });
  }, [inputPreview, result, slug, title]);
}

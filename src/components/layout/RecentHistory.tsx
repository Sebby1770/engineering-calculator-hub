"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, type HistoryEntry } from "@/lib/history";

function formatAgo(at: number): string {
  const delta = Date.now() - at;
  if (delta < 45_000) return "just now";
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)}h ago`;
  if (delta < 172_800_000) return "yesterday";
  return new Date(at).toLocaleDateString();
}

export default function RecentHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8" aria-label="Recent calculations">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-surface-950 dark:text-white">Recent</h2>
        <p className="text-xs text-surface-400">Stored only in this browser</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {entries.map((entry) => (
          <Link
            key={`${entry.slug}-${entry.at}`}
            href={`/${entry.slug}`}
            className="min-w-[16rem] max-w-xs shrink-0 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-brand-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-700"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">{entry.title}</p>
              <time className="shrink-0 text-[11px] text-surface-400" dateTime={new Date(entry.at).toISOString()}>
                {formatAgo(entry.at)}
              </time>
            </div>
            <p className="mt-1 truncate text-xs text-surface-500 dark:text-surface-400">{entry.inputPreview}</p>
            <p className="mt-2 truncate font-mono text-sm text-brand-600 dark:text-brand-400">{entry.result}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

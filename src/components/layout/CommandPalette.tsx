"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { calculators } from "@/data/calculators";

function matchesQuery(
  title: string,
  shortTitle: string,
  keywords: string[],
  query: string,
): boolean {
  if (!query) return true;
  const haystack = [title, shortTitle, ...keywords].join(" ").toLowerCase();
  return haystack.includes(query);
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return calculators.filter((calculator) =>
      matchesQuery(
        calculator.meta.title,
        calculator.meta.shortTitle,
        calculator.meta.keywords,
        trimmed,
      ),
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, results.length]);

  const close = () => setOpen(false);

  const go = (slug: string) => {
    close();
    router.push(`/${slug}`);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) go(selected.meta.slug);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-2.5 py-1.5 text-sm text-surface-500 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400 dark:hover:border-brand-700 dark:hover:text-brand-300"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-surface-200 px-1.5 font-mono text-[10px] text-surface-400 sm:inline dark:border-surface-700">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm"
            aria-label="Close command palette"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search calculators"
            className="relative mx-auto mt-[12vh] w-[min(36rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="flex items-center gap-3 border-b border-surface-200 px-4 dark:border-surface-800">
              <svg className="h-5 w-5 shrink-0 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search calculators by name or keyword…"
                className="h-12 w-full bg-transparent text-base text-surface-900 outline-none placeholder:text-surface-400 dark:text-white"
                aria-autocomplete="list"
                aria-controls="command-palette-results"
              />
              <kbd className="hidden rounded border border-surface-200 px-1.5 py-0.5 font-mono text-[10px] text-surface-400 sm:inline dark:border-surface-700">
                Esc
              </kbd>
            </div>
            <ul
              id="command-palette-results"
              ref={listRef}
              role="listbox"
              className="max-h-80 overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-surface-500">
                  No calculators match “{query.trim()}”
                </li>
              ) : (
                results.map((calculator, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={calculator.meta.slug} role="option" aria-selected={active}>
                      <button
                        type="button"
                        data-active={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => go(calculator.meta.slug)}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          active
                            ? "bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
                            : "text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                        }`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-100 font-mono text-xs font-bold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                          {calculator.meta.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium">{calculator.meta.shortTitle}</span>
                          <span className="block truncate text-xs text-surface-500 dark:text-surface-400">
                            {calculator.meta.keywords.slice(0, 3).join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="flex items-center justify-between border-t border-surface-200 px-4 py-2 text-[11px] text-surface-400 dark:border-surface-800">
              <span>↑↓ to move · Enter to open</span>
              <span>{results.length} of {calculators.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

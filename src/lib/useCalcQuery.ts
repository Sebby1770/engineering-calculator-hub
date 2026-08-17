"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type QueryFields = Record<string, string>;

function readParams<T extends QueryFields>(defaults: T): T {
  if (typeof window === "undefined") return defaults;
  const params = new URLSearchParams(window.location.search);
  const next = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = params.get(key);
    if (value !== null) {
      next[key as keyof T] = value as T[keyof T];
    }
  }
  return next;
}

function writeParams<T extends QueryFields>(values: T): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState(null, "", next);
  }
}

/**
 * Persist named string fields to the URL search string so a result is shareable.
 * Client-only (reads/writes window.location) so static generation stays intact.
 */
export function useCalcQuery<T extends QueryFields>(defaults: T): [T, (patch: Partial<T>) => void] {
  const defaultsRef = useRef(defaults);
  const [values, setValues] = useState<T>(defaults);

  useEffect(() => {
    const apply = () => setValues(readParams(defaultsRef.current));
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  const update = useCallback((patch: Partial<T>) => {
    setValues((prev) => {
      const next = { ...prev, ...patch };
      writeParams(next);
      return next;
    });
  }, []);

  return [values, update];
}

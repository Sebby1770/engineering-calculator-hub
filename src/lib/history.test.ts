import { afterEach, describe, expect, it } from "vitest";
import {
  appendHistory,
  clearHistory,
  getHistory,
  HISTORY_LIMIT,
  HISTORY_STORAGE_KEY,
} from "@/lib/history";

const memory = new Map<string, string>();

const storage: Storage = {
  get length() {
    return memory.size;
  },
  clear() {
    memory.clear();
  },
  getItem(key) {
    return memory.get(key) ?? null;
  },
  key(index) {
    return Array.from(memory.keys())[index] ?? null;
  },
  removeItem(key) {
    memory.delete(key);
  },
  setItem(key, value) {
    memory.set(key, value);
  },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storage,
});

afterEach(() => {
  memory.clear();
});

describe("history", () => {
  it("stores the newest evaluation first and caps at 20", () => {
    for (let i = 0; i < 25; i += 1) {
      appendHistory({
        slug: "ohms-law-calculator",
        title: "Ohm's Law",
        inputPreview: `I=${i}`,
        result: `${i} V`,
      });
    }

    const history = getHistory();
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0].result).toBe("24 V");
    expect(history[history.length - 1].result).toBe("5 V");
    expect(history[0].at).toBeGreaterThan(0);
  });

  it("deduplicates the same slug and result", () => {
    appendHistory({
      slug: "unit-converter-calculator",
      title: "Unit Converter",
      inputPreview: "1 m",
      result: "3.28083989501 ft",
    });
    appendHistory({
      slug: "unit-converter-calculator",
      title: "Unit Converter",
      inputPreview: "1 m",
      result: "3.28083989501 ft",
    });
    expect(getHistory()).toHaveLength(1);
  });

  it("clears stored history", () => {
    appendHistory({
      slug: "decibel-calculator",
      title: "Decibel",
      inputPreview: "2/1",
      result: "3.01029996 dB",
    });
    clearHistory();
    expect(getHistory()).toEqual([]);
    expect(memory.get(HISTORY_STORAGE_KEY)).toBeUndefined();
  });
});

"use client";

import { useState, useRef } from "react";
import { create, all } from "mathjs";

const math = create(all);

math.config({
  number: "BigNumber",
  precision: 20,
});

// Harden mathjs against expression-based function injection (defense in depth).
// This evaluator runs entirely client-side on the user's own input, but we still
// disable the documented injection vectors so a typed expression can't redefine
// functions or mutate the math instance.
math.import(
  {
    import: function denied() {
      throw new Error("import is disabled");
    },
    createUnit: function denied() {
      throw new Error("createUnit is disabled");
    },
  },
  { override: true },
);

// Reject absurdly long expressions before parsing (cheap DoS guard).
const MAX_EXPRESSION_LENGTH = 1000;

export default function UniversalCalculator({
  onResult,
}: {
  onResult?: (result: string) => void;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ input: string; result: string }[]>(
    [],
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const formatResult = (value: unknown) => {
    return math.format(value, {
      precision: 12,
      lowerExp: -9,
      upperExp: 12,
    });
  };

  const calculate = (expression?: string) => {
    const rawExpression = expression ?? inputRef.current?.value ?? input;
    const trimmedExpression = rawExpression.trim();
    if (!trimmedExpression) return;

    if (trimmedExpression.length > MAX_EXPRESSION_LENGTH) {
      setResult(
        `Expression is too long (max ${MAX_EXPRESSION_LENGTH} characters).`,
      );
      setIsError(true);
      return;
    }

    try {
      const evaluated = math.evaluate(trimmedExpression);
      const formattedResult = formatResult(evaluated);

      setResult(formattedResult);
      setIsError(false);
      setCopied(false);
      setHistory((prev) => [
        { input: trimmedExpression, result: formattedResult },
        ...prev.slice(0, 9),
      ]);
      if (onResult) onResult(formattedResult);
    } catch {
      setResult("Invalid expression or unsupported operation");
      setIsError(true);
    }
  };

  const copyResult = async () => {
    if (!result || isError) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      calculate();
    }
  };

  const clear = () => {
    setInput("");
    setResult("");
    setIsError(false);
    inputRef.current?.focus();
  };

  const exampleQuestions = [
    "2 + 3 * sin(45 deg)",
    "integrate(x^2, x, 0, 2)",
    "derivative(x^3 + 2*x, x)",
    "det([[2,3],[1,4]])",
    "sqrt(-1)",
    "2^20",
    "5 m + 30 cm",
    "solve(x^2 - 5*x + 6 = 0, x)",
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Input */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-sm font-medium text-surface-600 dark:text-surface-400">
            Expression
          </label>
          <span className="hidden sm:inline text-[11px] font-mono text-surface-400 dark:text-surface-500">
            <kbd className="px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              Enter
            </kbd>{" "}
            to calculate ·{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              Shift
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              Enter
            </kbd>{" "}
            for newline
          </span>
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="2 + 3 * sin(pi/3) or 5 m + 30 cm"
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-lg text-surface-900 dark:text-white outline-none transition-all resize-y focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => calculate()}
          disabled={!input.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 font-semibold text-white transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          Calculate
        </button>
        <button
          onClick={clear}
          className="inline-flex items-center justify-center rounded-lg border border-surface-300 dark:border-surface-700 px-6 py-3 font-medium text-surface-700 dark:text-surface-300 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          Clear
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`mt-5 rounded-xl border p-5 transition-colors ${
            isError
              ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30"
              : "border-brand-200 dark:border-brand-900/50 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/30 dark:to-surface-900"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isError
                    ? "text-red-500 dark:text-red-400"
                    : "text-brand-600 dark:text-brand-400"
                }`}
              >
                {isError ? "Error" : "Result"}
              </div>
              <div
                className={`mt-1.5 break-all font-mono font-bold leading-tight ${
                  isError
                    ? "text-base text-red-700 dark:text-red-300"
                    : "text-3xl sm:text-4xl text-surface-900 dark:text-white"
                }`}
              >
                {result}
              </div>
            </div>
            {!isError && (
              <button
                onClick={copyResult}
                aria-label="Copy result"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-surface-300 dark:border-surface-700 bg-white/60 dark:bg-surface-900/60 text-surface-600 dark:text-surface-300 hover:bg-white dark:hover:bg-surface-800 transition-colors"
              >
                {copied ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-surface-400">
          Quick examples
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex);
                calculate(ex);
              }}
              className="rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 font-mono text-xs text-surface-600 dark:text-surface-300 transition-colors hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">
              History
            </p>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-surface-200 dark:border-surface-700 divide-y divide-surface-100 dark:divide-surface-700">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(item.input);
                  inputRef.current?.focus();
                }}
                className="w-full text-left flex flex-col gap-1 px-4 py-3 text-sm transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono text-surface-600 dark:text-surface-400 truncate">
                  {item.input}
                </span>
                <span className="font-mono font-semibold text-surface-900 dark:text-white shrink-0">
                  = {item.result}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-surface-400 mt-6">
        Powered by mathjs • Supports derivatives, integrals, matrices, complex
        numbers, units, and advanced expressions
      </p>
    </div>
  );
}

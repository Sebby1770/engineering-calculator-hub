"use client";

import { useState, useRef } from "react";
import { smartEvaluate } from "@/lib/smartMath";
import WorkSteps from "@/components/ui/WorkSteps";

const MAX_EXPRESSION_LENGTH = 1000;

export default function UniversalCalculator({
  onResult,
}: {
  onResult?: (result: string) => void;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [kind, setKind] = useState("");
  const [steps, setSteps] = useState<ReturnType<typeof smartEvaluate>["steps"]>([]);
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ input: string; result: string; kind: string }[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const calculate = (expression?: string) => {
    const rawExpression = expression ?? inputRef.current?.value ?? input;
    const trimmedExpression = rawExpression.trim();
    if (!trimmedExpression) return;

    if (trimmedExpression.length > MAX_EXPRESSION_LENGTH) {
      setResult(`Expression is too long (max ${MAX_EXPRESSION_LENGTH} characters).`);
      setIsError(true);
      setSteps([]);
      return;
    }

    try {
      const evaluation = smartEvaluate(trimmedExpression);
      setResult(evaluation.result);
      setKind(evaluation.kind);
      setSteps(evaluation.steps);
      setIsError(false);
      setCopied(false);
      setHistory((prev) => [
        { input: trimmedExpression, result: evaluation.result, kind: evaluation.kind },
        ...prev.slice(0, 9),
      ]);
      if (onResult) onResult(evaluation.result);
    } catch {
      setResult("Invalid expression or unsupported operation");
      setIsError(true);
      setSteps([]);
      setKind("");
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
    setKind("");
    setSteps([]);
    setIsError(false);
    inputRef.current?.focus();
  };

  const exampleQuestions = [
    "x^2 - 7*x + 12 = 0",
    "solve(x^3 - 6*x^2 + 11*x - 6 = 0, x)",
    "derivative(sin(x)*exp(x), x)",
    "integrate(x^2*exp(x), x, 0, 1)",
    "limit(sin(x)/x, x, 0)",
    "simplify((x^2 - 1)/(x - 1))",
    "det([[2,3,1],[1,4,0],[0,2,5]])",
    "2 + 3 * sin(45 deg)",
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-sm font-medium text-surface-600 dark:text-surface-400">
            Smart expression
          </label>
          <span className="hidden sm:inline text-[11px] font-mono text-surface-400 dark:text-surface-500">
            Auto-solves equations, simplifies, differentiates, and integrates
          </span>
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="x^2 - 5*x + 6 = 0  or  derivative(exp(x)*sin(x), x)"
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-lg text-surface-900 dark:text-white outline-none transition-all resize-y focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => calculate()}
          disabled={!input.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 font-semibold text-white transition-colors"
        >
          Calculate
        </button>
        <button
          onClick={clear}
          className="inline-flex items-center justify-center rounded-lg border border-surface-300 dark:border-surface-700 px-6 py-3 font-medium text-surface-700 dark:text-surface-300 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          Clear
        </button>
      </div>

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
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    isError
                      ? "text-red-500 dark:text-red-400"
                      : "text-brand-600 dark:text-brand-400"
                  }`}
                >
                  {isError ? "Error" : "Result"}
                </div>
                {!isError && kind && (
                  <span className="rounded-full bg-brand-100 dark:bg-brand-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                    {kind}
                  </span>
                )}
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
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      )}

      {!isError && <WorkSteps steps={steps} />}

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-surface-400">
          Smart examples
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
        Smart mode detects equations, simplifies expressions, and shows step-by-step work
      </p>
    </div>
  );
}
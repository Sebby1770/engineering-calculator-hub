"use client";

import { useState } from "react";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { smartEvaluate } from "@/lib/smartMath";

export default function EquationSolverCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [mode, setMode] = useState("quadratic");
  const [expression, setExpression] = useState("x^2 - 5*x + 6");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<ReturnType<typeof smartEvaluate>["steps"]>([]);
  const [kind, setKind] = useState("");

  const presets: Record<string, string> = {
    quadratic: "x^2 - 5*x + 6",
    cubic: "x^3 - 6*x^2 + 11*x - 6",
    trig: "sin(x) - 0.5",
    exponential: "2^x - 8",
  };

  const calculate = () => {
    const query =
      mode === "general"
        ? `solve(${expression} = 0, x)`
        : `${expression} = 0`;

    try {
      const evaluation = smartEvaluate(query);
      setResult(evaluation.result);
      setSteps(evaluation.steps);
      setKind(evaluation.kind);
      onResult(evaluation.result);
    } catch {
      setResult("Could not solve this equation. Try a polynomial or use the universal calculator.");
      setSteps([]);
      setKind("");
      onResult("Could not solve");
    }
  };

  return (
    <div>
      <CalcSelect
        label="Equation type"
        value={mode}
        onChange={(value) => {
          setMode(value);
          setExpression(presets[value] ?? expression);
        }}
        options={[
          { value: "quadratic", label: "Quadratic (ax² + bx + c = 0)" },
          { value: "cubic", label: "Cubic polynomial" },
          { value: "trig", label: "Trigonometric" },
          { value: "exponential", label: "Exponential" },
          { value: "general", label: "General solve(f(x)=0, x)" },
        ]}
      />
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mt-4 mb-1.5">
        {mode === "general" ? "f(x)" : "Equation (= 0)"}
      </label>
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-base text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Solve Equation
      </button>
      {result && (
        <>
          <CalcResult label={kind || "Solution"} value={result} />
          <WorkSteps steps={steps} />
        </>
      )}
    </div>
  );
}
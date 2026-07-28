"use client";

import { useState } from "react";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { solveQuadraticWithSteps } from "@/lib/smartMath";

export default function EquationSolverCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("x^2 - 5*x + 6");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<NonNullable<ReturnType<typeof solveQuadraticWithSteps>>["steps"]>([]);
  const [kind, setKind] = useState("");

  const calculate = () => {
    const evaluation = solveQuadraticWithSteps(expression, "x");
    if (!evaluation) {
      setResult("Enter an expanded quadratic in x, such as x^2 - 5*x + 6 = 0.");
      setSteps([]);
      setKind("");
      onResult("Could not solve");
      return;
    }

    setResult(evaluation.result);
    setSteps(evaluation.steps);
    setKind(evaluation.kind);
    onResult(evaluation.result);
  };

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-surface-600 dark:text-surface-400">
        Solve an expanded quadratic in x. You can enter just the left side (assumed equal to zero)
        or a complete equation such as x^2 = 4.
      </p>
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        Quadratic equation
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

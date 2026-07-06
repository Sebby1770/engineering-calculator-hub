"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { integralWithSteps } from "@/lib/smartMath";

export default function IntegralCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("x^2 + 3*x");
  const [variable, setVariable] = useState("x");
  const [lower, setLower] = useState("0");
  const [upper, setUpper] = useState("2");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<ReturnType<typeof integralWithSteps>["steps"]>([]);

  const calculate = () => {
    try {
      const a = parseFloat(lower);
      const b = parseFloat(upper);
      if (Number.isNaN(a) || Number.isNaN(b)) return;

      const evaluation = integralWithSteps(expression, variable, a, b);
      const res = `∫[${a}, ${b}] ${expression} d${variable} ≈ ${evaluation.result}`;
      setResult(res);
      setSteps(evaluation.steps);
      onResult(evaluation.result);
    } catch {
      setResult("Invalid expression or bounds. Try polynomials, sin(x), exp(x), or 1/x.");
      setSteps([]);
      onResult("Invalid expression");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        Integrand
      </label>
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-base text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <CalcInput label="Variable" value={variable} onChange={setVariable} />
        <CalcInput label="Lower bound" value={lower} onChange={setLower} />
        <CalcInput label="Upper bound" value={upper} onChange={setUpper} />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Integrate
      </button>
      {result && <CalcResult value={result} />}
      <WorkSteps steps={steps} />
    </div>
  );
}
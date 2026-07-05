"use client";

import { useState } from "react";
import { create, all } from "mathjs";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";

const math = create(all);

export default function DerivativeCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("x^3 + 2*x^2 - 5*x + 1");
  const [variable, setVariable] = useState("x");
  const [evaluateAt, setEvaluateAt] = useState("2");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    try {
      const derivative = math.derivative(expression, variable);
      const simplified = math.simplify(derivative);
      const symbolic = simplified.toString();
      const numeric = math.evaluate(simplified, { [variable]: parseFloat(evaluateAt) });
      const res = `f'(${variable}) = ${symbolic}\nf'(${evaluateAt}) = ${math.format(numeric, { precision: 10 })}`;
      setResult(res);
      onResult(symbolic);
    } catch {
      setResult("Invalid expression. Use variables like x, sin(x), exp(x), ln(x).");
      onResult("Invalid expression");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        Function f({variable})
      </label>
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-base text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput label="Variable" value={variable} onChange={setVariable} />
        <CalcInput label="Evaluate at" value={evaluateAt} onChange={setEvaluateAt} />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Differentiate
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
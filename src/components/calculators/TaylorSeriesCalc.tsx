"use client";

import { useState } from "react";
import { create, all, type MathNode } from "mathjs";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";

const math = create(all);

export default function TaylorSeriesCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("exp(x)");
  const [variable, setVariable] = useState("x");
  const [center, setCenter] = useState("0");
  const [order, setOrder] = useState("5");
  const [evaluateAt, setEvaluateAt] = useState("1");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    try {
      const x0 = parseFloat(center);
      const n = parseInt(order, 10);
      const x = parseFloat(evaluateAt);
      if ([x0, n, x].some((value) => Number.isNaN(value)) || n < 0) return;

      const compiled = math.compile(expression);
      const terms: string[] = [];
      let factorial = 1;

      for (let k = 0; k <= n; k += 1) {
        if (k > 0) factorial *= k;
        let current = expression;
        for (let step = 0; step < k; step += 1) {
          current = math.derivative(current, variable).toString();
        }
        const coefficient =
          Number(math.parse(current).evaluate({ [variable]: x0 })) / factorial;
        terms.push(`${coefficient} * (${variable} - ${x0})^${k}`);
      }

      const polynomial = math.simplify(math.parse(terms.join(" + "))) as MathNode;
      const approximation = Number(polynomial.evaluate({ [variable]: x }));
      const exact = Number(compiled.evaluate({ [variable]: x }));
      const error = Math.abs(approximation - exact);

      const res = `T_${n}(${variable}) ≈ ${polynomial.toString()}\nT_${n}(${x}) ≈ ${math.format(approximation, { precision: 10 })}\nExact f(${x}) = ${math.format(exact, { precision: 10 })}\n|Error| ≈ ${error.toExponential(3)}`;
      setResult(res);
      onResult(math.format(approximation, { precision: 10 }));
    } catch {
      setResult("Could not build Taylor polynomial for this expression.");
      onResult("Invalid expression");
    }
  };

  return (
    <div>
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-base text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput label="Variable" value={variable} onChange={setVariable} />
        <CalcInput label="Center a" value={center} onChange={setCenter} />
        <CalcInput label="Order n" value={order} onChange={setOrder} />
        <CalcInput label="Evaluate at" value={evaluateAt} onChange={setEvaluateAt} />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Build Taylor Polynomial
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
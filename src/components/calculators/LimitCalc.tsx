"use client";

import { useState } from "react";
import { create, all } from "mathjs";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import { numericalLimit } from "@/lib/mathUtils";

const math = create(all);

export default function LimitCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("sin(x)/x");
  const [variable, setVariable] = useState("x");
  const [point, setPoint] = useState("0");
  const [direction, setDirection] = useState("both");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    try {
      const compiled = math.compile(expression);
      const x0 = parseFloat(point);
      if (Number.isNaN(x0)) return;

      const evaluate = (x: number) => Number(compiled.evaluate({ [variable]: x }));
      const limit = numericalLimit(evaluate, x0, direction as "both" | "left" | "right");

      if (limit === null) {
        setResult("Limit could not be estimated. Try a different expression or approach point.");
        onResult("Undefined");
        return;
      }

      const res = `lim(${variable}→${x0}) ${expression} ≈ ${limit.toPrecision(10)}`;
      setResult(res);
      onResult(limit.toPrecision(10));
    } catch {
      setResult("Invalid expression.");
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <CalcInput label="Variable" value={variable} onChange={setVariable} />
        <CalcInput label="Approach point" value={point} onChange={setPoint} />
        <CalcSelect
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "both", label: "Two-sided" },
            { value: "left", label: "From left" },
            { value: "right", label: "From right" },
          ]}
        />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Estimate Limit
      </button>
      {result && <CalcResult value={result} detail="Uses numerical sampling near the approach point." />}
    </div>
  );
}
"use client";

import { useState } from "react";
import { create, all } from "mathjs";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";
import { eulerSolve } from "@/lib/mathUtils";

const math = create(all);

export default function DifferentialEquationCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [expression, setExpression] = useState("x + y");
  const [x0, setX0] = useState("0");
  const [y0, setY0] = useState("1");
  const [xEnd, setXEnd] = useState("2");
  const [steps, setSteps] = useState("200");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    try {
      const compiled = math.compile(expression);
      const startX = parseFloat(x0);
      const startY = parseFloat(y0);
      const endX = parseFloat(xEnd);
      const stepCount = parseInt(steps, 10);

      if ([startX, startY, endX, stepCount].some((value) => Number.isNaN(value)) || stepCount <= 0) {
        return;
      }

      const derivative = (x: number, y: number) =>
        Number(compiled.evaluate({ x, y, t: x }));

      const solution = eulerSolve(derivative, startX, startY, endX, stepCount);
      const res = `y(${solution.x.toPrecision(6)}) ≈ ${solution.y.toPrecision(10)} using Euler's method`;
      setResult(res);
      onResult(solution.y.toPrecision(10));
    } catch {
      setResult("Invalid ODE. Enter dy/dx as an expression using x and y.");
      onResult("Invalid expression");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        dy/dx =
      </label>
      <input
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-base text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput label="x₀" value={x0} onChange={setX0} />
        <CalcInput label="y(x₀)" value={y0} onChange={setY0} />
        <CalcInput label="Solve to x" value={xEnd} onChange={setXEnd} />
        <CalcInput label="Steps" value={steps} onChange={setSteps} />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Solve ODE
      </button>
      {result && <CalcResult value={result} detail="First-order ODE solver using fixed-step Euler integration." />}
    </div>
  );
}
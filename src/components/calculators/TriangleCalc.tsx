"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";
import { solveTriangle } from "@/lib/mathUtils";

export default function TriangleCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [sideA, setSideA] = useState("7");
  const [sideB, setSideB] = useState("9");
  const [angleC, setAngleC] = useState("48");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(angleC);
    const solved = solveTriangle(a, b, c);

    if (!solved) {
      setResult("Enter positive sides and an included angle between 0° and 180°.");
      onResult("Invalid triangle");
      return;
    }

    const res = `c = ${solved.sideC.toPrecision(6)}\n∠A = ${solved.angleAdeg.toPrecision(6)}°\n∠B = ${solved.angleBdeg.toPrecision(6)}°\nArea = ${solved.area.toPrecision(6)}`;
    setResult(res);
    onResult(`c = ${solved.sideC.toPrecision(6)}`);
  };

  return (
    <div>
      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
        Solve a triangle using two sides and the included angle (SAS).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CalcInput label="Side a" unit="units" value={sideA} onChange={setSideA} />
        <CalcInput label="Side b" unit="units" value={sideB} onChange={setSideB} />
        <CalcInput label="Included angle C" unit="°" value={angleC} onChange={setAngleC} />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Solve Triangle
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";

export default function PythagoreanCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [solveFor, setSolveFor] = useState("c");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const sideA = parseFloat(a);
    const sideB = parseFloat(b);
    const sideC = parseFloat(c);

    if (solveFor === "c") {
      if (Number.isNaN(sideA) || Number.isNaN(sideB)) return;
      const hypotenuse = Math.hypot(sideA, sideB);
      const res = `c = √(a² + b²) = ${hypotenuse.toPrecision(10)}`;
      setResult(res);
      onResult(hypotenuse.toPrecision(10));
      return;
    }

    if (Number.isNaN(sideC) || Number.isNaN(solveFor === "a" ? sideB : sideA)) return;
    const known = solveFor === "a" ? sideB : sideA;
    if (sideC <= known) {
      setResult("Hypotenuse must be longer than the known leg.");
      onResult("Invalid triangle");
      return;
    }

    const missing = Math.sqrt(sideC * sideC - known * known);
    const res = `${solveFor} = ${missing.toPrecision(10)}`;
    setResult(res);
    onResult(missing.toPrecision(10));
  };

  return (
    <div>
      <CalcSelect
        label="Solve for"
        value={solveFor}
        onChange={setSolveFor}
        options={[
          { value: "c", label: "Hypotenuse c" },
          { value: "a", label: "Leg a" },
          { value: "b", label: "Leg b" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {solveFor !== "a" && <CalcInput label="Leg a" value={a} onChange={setA} />}
        {solveFor !== "b" && <CalcInput label="Leg b" value={b} onChange={setB} />}
        {solveFor !== "c" && <CalcInput label="Hypotenuse c" value={c} onChange={setC} />}
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Calculate
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
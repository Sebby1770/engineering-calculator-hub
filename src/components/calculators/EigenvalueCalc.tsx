"use client";

import { useState } from "react";
import MatrixInput from "@/components/ui/MatrixInput";
import CalcResult from "@/components/ui/CalcResult";
import { eigenvalues2x2, parseMatrix } from "@/lib/mathUtils";

export default function EigenvalueCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [matrixText, setMatrixText] = useState("4, 1\n2, 3");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const matrix = parseMatrix(matrixText, 2, 2);
    if (!matrix) {
      setResult("Enter a valid 2×2 matrix.");
      onResult("Invalid matrix");
      return;
    }

    const eigenvalues = eigenvalues2x2(matrix);
    if (!eigenvalues) {
      setResult("Matrix has complex eigenvalues. This tool currently supports real eigenvalues only.");
      onResult("Complex eigenvalues");
      return;
    }

    const res = `λ₁ = ${eigenvalues[0].toPrecision(10)}\nλ₂ = ${eigenvalues[1].toPrecision(10)}`;
    setResult(res);
    onResult(`λ₁=${eigenvalues[0].toPrecision(6)}, λ₂=${eigenvalues[1].toPrecision(6)}`);
  };

  return (
    <div>
      <MatrixInput label="Matrix A (2×2)" rows={2} cols={2} value={matrixText} onChange={setMatrixText} />
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Compute Eigenvalues
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
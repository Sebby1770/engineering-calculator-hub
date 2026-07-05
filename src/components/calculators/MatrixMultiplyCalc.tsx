"use client";

import { useState } from "react";
import MatrixInput from "@/components/ui/MatrixInput";
import CalcResult from "@/components/ui/CalcResult";
import { formatMatrix, multiplyMatrices, parseMatrix } from "@/lib/mathUtils";

export default function MatrixMultiplyCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [matrixA, setMatrixA] = useState("1, 2\n3, 4");
  const [matrixB, setMatrixB] = useState("5, 6\n7, 8");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseMatrix(matrixA, 2, 2);
    const b = parseMatrix(matrixB, 2, 2);
    if (!a || !b) {
      setResult("Enter valid 2×2 matrices.");
      onResult("Invalid matrix");
      return;
    }

    const product = multiplyMatrices(a, b);
    if (!product) {
      setResult("Matrices cannot be multiplied with the given dimensions.");
      onResult("Invalid dimensions");
      return;
    }

    const res = `A × B =\n${formatMatrix(product)}`;
    setResult(res);
    onResult(formatMatrix(product, 4));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MatrixInput label="Matrix A (2×2)" rows={2} cols={2} value={matrixA} onChange={setMatrixA} />
      <MatrixInput label="Matrix B (2×2)" rows={2} cols={2} value={matrixB} onChange={setMatrixB} />
      <button
        onClick={calculate}
        className="lg:col-span-2 mt-1 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Multiply Matrices
      </button>
      {result && <div className="lg:col-span-2"><CalcResult value={result} /></div>}
    </div>
  );
}
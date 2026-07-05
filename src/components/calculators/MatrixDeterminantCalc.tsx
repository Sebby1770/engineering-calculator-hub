"use client";

import { useState } from "react";
import CalcSelect from "@/components/ui/CalcSelect";
import MatrixInput from "@/components/ui/MatrixInput";
import CalcResult from "@/components/ui/CalcResult";
import { determinant2, determinant3, parseMatrix } from "@/lib/mathUtils";

export default function MatrixDeterminantCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [size, setSize] = useState("2");
  const [matrixText, setMatrixText] = useState("4, 7\n2, 6");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const dimension = parseInt(size, 10);
    const matrix = parseMatrix(matrixText, dimension, dimension);
    if (!matrix) {
      setResult("Enter a valid square matrix.");
      onResult("Invalid matrix");
      return;
    }

    const det = dimension === 2 ? determinant2(matrix) : determinant3(matrix);
    const res = `det(A) = ${det.toPrecision(10)}`;
    setResult(res);
    onResult(det.toPrecision(10));
  };

  return (
    <div>
      <CalcSelect
        label="Matrix size"
        value={size}
        onChange={(value) => {
          setSize(value);
          setMatrixText(value === "2" ? "4, 7\n2, 6" : "1, 2, 3\n0, 4, 5\n1, 0, 6");
        }}
        options={[
          { value: "2", label: "2 × 2" },
          { value: "3", label: "3 × 3" },
        ]}
      />
      <div className="mt-4">
        <MatrixInput
          label="Matrix A"
          rows={parseInt(size, 10)}
          cols={parseInt(size, 10)}
          value={matrixText}
          onChange={setMatrixText}
        />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Compute Determinant
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
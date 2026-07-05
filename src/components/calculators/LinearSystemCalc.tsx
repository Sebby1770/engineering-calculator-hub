"use client";

import { useState } from "react";
import CalcSelect from "@/components/ui/CalcSelect";
import MatrixInput from "@/components/ui/MatrixInput";
import CalcResult from "@/components/ui/CalcResult";
import { parseMatrix, solveLinearSystem } from "@/lib/mathUtils";

export default function LinearSystemCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [size, setSize] = useState("2");
  const [matrixText, setMatrixText] = useState("3, 1\n1, 2");
  const [vectorText, setVectorText] = useState("9\n8");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const dimension = parseInt(size, 10);
    const matrix = parseMatrix(matrixText, dimension, dimension);
    const vector = parseMatrix(vectorText, dimension, 1)?.map((row) => row[0]);

    if (!matrix || !vector) {
      setResult("Enter a valid coefficient matrix and result vector.");
      onResult("Invalid system");
      return;
    }

    const solution = solveLinearSystem(matrix, vector);
    if (!solution) {
      setResult("System is singular or has no unique solution.");
      onResult("No unique solution");
      return;
    }

    const labels = dimension === 2 ? ["x", "y"] : ["x", "y", "z"];
    const res = solution
      .map((value, index) => `${labels[index]} = ${value.toPrecision(10)}`)
      .join("\n");
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <CalcSelect
        label="System size"
        value={size}
        onChange={(value) => {
          setSize(value);
          setMatrixText(value === "2" ? "3, 1\n1, 2" : "2, 1, -1\n-3, -1, 2\n-2, 1, 2");
          setVectorText(value === "2" ? "9\n8" : "8\n-11\n-3");
        }}
        options={[
          { value: "2", label: "2 equations" },
          { value: "3", label: "3 equations" },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <MatrixInput
          label="Coefficient matrix A"
          rows={parseInt(size, 10)}
          cols={parseInt(size, 10)}
          value={matrixText}
          onChange={setMatrixText}
        />
        <MatrixInput
          label="Result vector b"
          rows={parseInt(size, 10)}
          cols={1}
          value={vectorText}
          onChange={setVectorText}
        />
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Solve Ax = b
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
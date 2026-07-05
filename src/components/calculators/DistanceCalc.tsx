"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import { distance2d, distance3d } from "@/lib/mathUtils";

export default function DistanceCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [mode, setMode] = useState("2d");
  const [x1, setX1] = useState("1");
  const [y1, setY1] = useState("2");
  const [z1, setZ1] = useState("0");
  const [x2, setX2] = useState("4");
  const [y2, setY2] = useState("6");
  const [z2, setZ2] = useState("3");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const values = [x1, y1, z1, x2, y2, z2].map(parseFloat);
    if (values.some((value) => Number.isNaN(value))) return;

    const dist =
      mode === "2d"
        ? distance2d(values[0], values[1], values[3], values[4])
        : distance3d(values[0], values[1], values[2], values[3], values[4], values[5]);

    const res = `Distance = ${dist.toPrecision(10)} units`;
    setResult(res);
    onResult(dist.toPrecision(10));
  };

  return (
    <div>
      <CalcSelect
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "2d", label: "2D distance" },
          { value: "3d", label: "3D distance" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <CalcInput label="x₁" value={x1} onChange={setX1} />
        <CalcInput label="y₁" value={y1} onChange={setY1} />
        {mode === "3d" && <CalcInput label="z₁" value={z1} onChange={setZ1} />}
        <CalcInput label="x₂" value={x2} onChange={setX2} />
        <CalcInput label="y₂" value={y2} onChange={setY2} />
        {mode === "3d" && <CalcInput label="z₂" value={z2} onChange={setZ2} />}
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Calculate Distance
      </button>
      {result && <CalcResult value={result} />}
    </div>
  );
}
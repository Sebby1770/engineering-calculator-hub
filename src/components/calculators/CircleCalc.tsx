"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";

export default function CircleCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [mode, setMode] = useState("radius");
  const [value, setValue] = useState("5");
  const [arcAngle, setArcAngle] = useState("60");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const input = parseFloat(value);
    if (Number.isNaN(input) || input <= 0) return;

    const radius = mode === "radius" ? input : input / 2;
    const diameter = radius * 2;
    const circumference = 2 * Math.PI * radius;
    const area = Math.PI * radius * radius;
    const angle = parseFloat(arcAngle);
    const arcLength =
      !Number.isNaN(angle) && angle > 0 ? (angle / 360) * circumference : null;

    const res = [
      `Radius = ${radius.toPrecision(6)}`,
      `Diameter = ${diameter.toPrecision(6)}`,
      `Circumference = ${circumference.toPrecision(6)}`,
      `Area = ${area.toPrecision(6)}`,
      arcLength !== null ? `Arc length (${angle}°) = ${arcLength.toPrecision(6)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setResult(res);
    onResult(`Area = ${area.toPrecision(6)}`);
  };

  return (
    <div>
      <CalcSelect
        label="Known value"
        value={mode}
        onChange={setMode}
        options={[
          { value: "radius", label: "Radius" },
          { value: "diameter", label: "Diameter" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput
          label={mode === "radius" ? "Radius" : "Diameter"}
          unit="units"
          value={value}
          onChange={setValue}
        />
        <CalcInput label="Arc angle (optional)" unit="°" value={arcAngle} onChange={setArcAngle} />
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
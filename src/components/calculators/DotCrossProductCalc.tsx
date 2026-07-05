"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";

export default function DotCrossProductCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [mode, setMode] = useState("dot");
  const [ax, setAx] = useState("2");
  const [ay, setAy] = useState("3");
  const [az, setAz] = useState("1");
  const [bx, setBx] = useState("4");
  const [by, setBy] = useState("-1");
  const [bz, setBz] = useState("2");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = [ax, ay, az].map(parseFloat);
    const b = [bx, by, bz].map(parseFloat);
    if (a.some((value) => Number.isNaN(value)) || b.some((value) => Number.isNaN(value))) return;

    if (mode === "dot") {
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const magA = Math.hypot(a[0], a[1], a[2]);
      const magB = Math.hypot(b[0], b[1], b[2]);
      const angle =
        magA > 0 && magB > 0
          ? (Math.acos(dot / (magA * magB)) * 180) / Math.PI
          : null;
      const res = `a · b = ${dot.toPrecision(10)}${angle !== null ? `\nAngle ≈ ${angle.toPrecision(6)}°` : ""}`;
      setResult(res);
      onResult(dot.toPrecision(10));
      return;
    }

    const cross = [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const res = `a × b = [${cross.map((value) => value.toPrecision(6)).join(", ")}]`;
    setResult(res);
    onResult(`[${cross.map((value) => value.toPrecision(6)).join(", ")}]`);
  };

  return (
    <div>
      <CalcSelect
        label="Operation"
        value={mode}
        onChange={setMode}
        options={[
          { value: "dot", label: "Dot product" },
          { value: "cross", label: "Cross product" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <CalcInput label="aₓ" value={ax} onChange={setAx} />
        <CalcInput label="aᵧ" value={ay} onChange={setAy} />
        <CalcInput label="a_z" value={az} onChange={setAz} />
        <CalcInput label="bₓ" value={bx} onChange={setBx} />
        <CalcInput label="bᵧ" value={by} onChange={setBy} />
        <CalcInput label="b_z" value={bz} onChange={setBz} />
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
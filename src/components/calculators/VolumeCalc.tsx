"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";

export default function VolumeCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [shape, setShape] = useState("sphere");
  const [a, setA] = useState("3");
  const [b, setB] = useState("5");
  const [c, setC] = useState("8");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    const z = parseFloat(c);
    let volume = 0;
    let surface = 0;

    switch (shape) {
      case "sphere":
        if (Number.isNaN(x) || x <= 0) return;
        volume = (4 / 3) * Math.PI * x ** 3;
        surface = 4 * Math.PI * x ** 2;
        break;
      case "cylinder":
        if (Number.isNaN(x) || Number.isNaN(y) || x <= 0 || y <= 0) return;
        volume = Math.PI * x ** 2 * y;
        surface = 2 * Math.PI * x * (x + y);
        break;
      case "cone":
        if (Number.isNaN(x) || Number.isNaN(y) || x <= 0 || y <= 0) return;
        volume = (Math.PI * x ** 2 * y) / 3;
        surface = Math.PI * x * (x + Math.hypot(x, y));
        break;
      case "box":
        if ([x, y, z].some((value) => Number.isNaN(value) || value <= 0)) return;
        volume = x * y * z;
        surface = 2 * (x * y + y * z + x * z);
        break;
      default:
        return;
    }

    const res = `Volume = ${volume.toPrecision(8)} units³\nSurface area = ${surface.toPrecision(8)} units²`;
    setResult(res);
    onResult(`${volume.toPrecision(8)} units³`);
  };

  return (
    <div>
      <CalcSelect
        label="Shape"
        value={shape}
        onChange={setShape}
        options={[
          { value: "sphere", label: "Sphere (radius)" },
          { value: "cylinder", label: "Cylinder (radius, height)" },
          { value: "cone", label: "Cone (radius, height)" },
          { value: "box", label: "Rectangular prism (l, w, h)" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <CalcInput
          label={shape === "box" ? "Length" : shape === "sphere" ? "Radius" : "Radius"}
          value={a}
          onChange={setA}
        />
        {shape !== "sphere" && (
          <CalcInput
            label={shape === "box" ? "Width" : "Height"}
            value={b}
            onChange={setB}
          />
        )}
        {shape === "box" && <CalcInput label="Height" value={c} onChange={setC} />}
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
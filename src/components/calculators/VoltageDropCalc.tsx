"use client";

import { useMemo, useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import {
  AWG_TABLE,
  computeVoltageDrop,
  findAwg,
  type Conductor,
  type Phase,
} from "@/lib/voltageDrop";
import type { WorkStep } from "@/lib/smartMath";

export default function VoltageDropCalc({ onResult }: { onResult: (r: string) => void }) {
  const [phase, setPhase] = useState<Phase>("single");
  const [conductor, setConductor] = useState<Conductor>("copper");
  const [gauge, setGauge] = useState("12");
  const [customArea, setCustomArea] = useState("");
  const [current, setCurrent] = useState("");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState<"m" | "ft">("m");
  const [sourceVoltage, setSourceVoltage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkStep[]>([]);

  const selectedAwg = useMemo(() => findAwg(gauge), [gauge]);

  const calculate = () => {
    const areaMm2 = gauge === "custom" ? parseFloat(customArea) : selectedAwg?.areaMm2;
    const evaluation = computeVoltageDrop({
      phase,
      conductor,
      currentA: parseFloat(current),
      length: parseFloat(length),
      lengthUnit,
      areaMm2: areaMm2 ?? Number.NaN,
      sourceVoltage: sourceVoltage.trim() ? parseFloat(sourceVoltage) : undefined,
    });

    if (!evaluation) {
      const message = "Please enter valid current, length, and conductor size.";
      setResult(message);
      setSteps([]);
      onResult(message);
      return;
    }

    const percentText =
      evaluation.percent !== null ? ` (${evaluation.percent.toPrecision(4)}% of Vs)` : "";
    const text = `Vd = ${evaluation.vd.toPrecision(8)} V${percentText}`;
    setResult(text);
    setSteps(evaluation.steps);
    onResult(text);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CalcSelect
          label="System"
          value={phase}
          onChange={(value) => setPhase(value as Phase)}
          options={[
            { value: "single", label: "Single-phase  Vd = 2·I·R·L" },
            { value: "three", label: "Three-phase  Vd = √3·I·R·L" },
          ]}
        />
        <CalcSelect
          label="Conductor"
          value={conductor}
          onChange={(value) => setConductor(value as Conductor)}
          options={[
            { value: "copper", label: "Copper  (1.68×10⁻⁸ Ω·m)" },
            { value: "aluminum", label: "Aluminum  (2.65×10⁻⁸ Ω·m)" },
          ]}
        />
        <CalcSelect
          label="Size (AWG)"
          value={gauge}
          onChange={setGauge}
          options={[
            ...AWG_TABLE.map((row) => ({
              value: row.gauge,
              label: `AWG ${row.gauge}  (${row.areaMm2.toPrecision(4)} mm²)`,
            })),
            { value: "custom", label: "Custom area…" },
          ]}
        />
        {gauge === "custom" && (
          <CalcInput label="Cross-section" unit="mm²" value={customArea} onChange={setCustomArea} />
        )}
        <CalcInput label="Current (I)" unit="A" value={current} onChange={setCurrent} />
        <CalcInput label="One-way length (L)" unit={lengthUnit} value={length} onChange={setLength} />
        <CalcSelect
          label="Length unit"
          value={lengthUnit}
          onChange={(value) => setLengthUnit(value as "m" | "ft")}
          options={[
            { value: "m", label: "Metres" },
            { value: "ft", label: "Feet" },
          ]}
        />
        <CalcInput
          label="Source voltage (optional)"
          unit="V"
          value={sourceVoltage}
          onChange={setSourceVoltage}
        />
      </div>
      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
      >
        Calculate
      </button>
      {result && (
        <>
          <CalcResult value={result} />
          <WorkSteps steps={steps} />
        </>
      )}
    </div>
  );
}

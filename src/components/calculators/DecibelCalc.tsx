"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { combineDbSteps, powerRatioSteps, voltageRatioSteps } from "@/lib/decibel";
import type { WorkStep } from "@/lib/smartMath";

type Mode = "power" | "voltage" | "sum" | "difference";

export default function DecibelCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState<Mode>("power");
  const [p1, setP1] = useState("1");
  const [p2, setP2] = useState("");
  const [v1, setV1] = useState("1");
  const [v2, setV2] = useState("");
  const [dbA, setDbA] = useState("");
  const [dbB, setDbB] = useState("");
  const [dbC, setDbC] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkStep[]>([]);

  const calculate = () => {
    let evaluation: { result: string; steps: WorkStep[] } | null = null;

    if (mode === "power") {
      evaluation = powerRatioSteps(parseFloat(p2), parseFloat(p1));
    } else if (mode === "voltage") {
      evaluation = voltageRatioSteps(parseFloat(v2), parseFloat(v1));
    } else if (mode === "sum") {
      const levels = [dbA, dbB, dbC]
        .map((value) => value.trim())
        .filter(Boolean)
        .map(Number);
      evaluation = combineDbSteps(levels, "sum");
    } else {
      evaluation = combineDbSteps([parseFloat(dbA), parseFloat(dbB)], "difference");
    }

    if (!evaluation) {
      const message = "Please enter valid positive values for this mode.";
      setResult(message);
      setSteps([]);
      onResult(message);
      return;
    }

    setResult(evaluation.result);
    setSteps(evaluation.steps);
    onResult(evaluation.result);
  };

  return (
    <div>
      <CalcSelect
        label="Mode"
        value={mode}
        onChange={(value) => setMode(value as Mode)}
        options={[
          { value: "power", label: "dB from two powers  (10 log₁₀)" },
          { value: "voltage", label: "dB from two voltages  (20 log₁₀)" },
          { value: "sum", label: "Add independent dB sources" },
          { value: "difference", label: "Subtract independent dB sources" },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mode === "power" && (
          <>
            <CalcInput label="Reference power P₁" unit="W" value={p1} onChange={setP1} />
            <CalcInput label="Measured power P₂" unit="W" value={p2} onChange={setP2} />
          </>
        )}
        {mode === "voltage" && (
          <>
            <CalcInput label="Reference voltage V₁" unit="V" value={v1} onChange={setV1} />
            <CalcInput label="Measured voltage V₂" unit="V" value={v2} onChange={setV2} />
          </>
        )}
        {mode === "sum" && (
          <>
            <CalcInput label="Source A" unit="dB" value={dbA} onChange={setDbA} />
            <CalcInput label="Source B" unit="dB" value={dbB} onChange={setDbB} />
            <CalcInput label="Source C (optional)" unit="dB" value={dbC} onChange={setDbC} />
          </>
        )}
        {mode === "difference" && (
          <>
            <CalcInput label="Minuend A" unit="dB" value={dbA} onChange={setDbA} />
            <CalcInput label="Subtrahend B" unit="dB" value={dbB} onChange={setDbB} />
          </>
        )}
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

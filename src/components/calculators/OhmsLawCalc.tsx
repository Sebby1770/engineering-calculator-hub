"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { ohmsLawWithSteps, type WorkStep } from "@/lib/smartMath";

export default function OhmsLawCalc({ onResult }: { onResult: (r: string) => void }) {
  const [solveFor, setSolveFor] = useState("voltage");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkStep[]>([]);

  const calculate = () => {
    const v = voltage.trim() ? parseFloat(voltage) : undefined;
    const i = current.trim() ? parseFloat(current) : undefined;
    const r = resistance.trim() ? parseFloat(resistance) : undefined;

    const evaluation = ohmsLawWithSteps(
      solveFor as "voltage" | "current" | "resistance",
      v,
      i,
      r,
    );

    if (!evaluation) {
      const message = "Please enter valid values for the known quantities.";
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
        label="Solve for"
        value={solveFor}
        onChange={setSolveFor}
        options={[
          { value: "voltage", label: "Voltage (V)" },
          { value: "current", label: "Current (I)" },
          { value: "resistance", label: "Resistance (R)" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {solveFor !== "voltage" && (
          <CalcInput label="Voltage (V)" unit="V" value={voltage} onChange={setVoltage} />
        )}
        {solveFor !== "current" && (
          <CalcInput label="Current (I)" unit="A" value={current} onChange={setCurrent} />
        )}
        {solveFor !== "resistance" && (
          <CalcInput label="Resistance (R)" unit="Ω" value={resistance} onChange={setResistance} />
        )}
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
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
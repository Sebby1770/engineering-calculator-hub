"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";

export default function PowerCalc({
  onResult,
}: {
  onResult: (r: string) => void;
}) {
  const [mode, setMode] = useState("vi");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");
  const [torque, setTorque] = useState("");
  const [omega, setOmega] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v = parseFloat(voltage),
      i = parseFloat(current),
      r = parseFloat(resistance),
      t = parseFloat(torque),
      w = parseFloat(omega);
    let power = 0;
    let res = "";
    if (mode === "vi" && !isNaN(v) && !isNaN(i)) {
      power = v * i;
      res = `P = ${power.toPrecision(6)} W`;
    } else if (mode === "ir" && !isNaN(i) && !isNaN(r)) {
      power = i * i * r;
      res = `P = ${power.toPrecision(6)} W`;
    } else if (mode === "vr" && !isNaN(v) && !isNaN(r) && r !== 0) {
      power = (v * v) / r;
      res = `P = ${power.toPrecision(6)} W`;
    } else if (mode === "torque" && !isNaN(t) && !isNaN(w)) {
      power = t * w;
      res = `P = ${power.toPrecision(6)} W (${(power / 1000).toPrecision(4)} kW)`;
    } else {
      res = "Enter valid values";
    }
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <CalcSelect
        label="Formula"
        value={mode}
        onChange={setMode}
        options={[
          { value: "vi", label: "P = V × I" },
          { value: "ir", label: "P = I² × R" },
          { value: "vr", label: "P = V² / R" },
          { value: "torque", label: "P = τ × ω" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {mode === "torque" && (
          <>
            <CalcInput label="Torque" unit="N·m" value={torque} onChange={setTorque} />
            <CalcInput label="Angular velocity" unit="rad/s" value={omega} onChange={setOmega} />
          </>
        )}
        {mode !== "ir" && mode !== "torque" && (
          <CalcInput
            label="Voltage"
            unit="V"
            value={voltage}
            onChange={setVoltage}
          />
        )}
        {mode !== "vr" && mode !== "torque" && (
          <CalcInput
            label="Current"
            unit="A"
            value={current}
            onChange={setCurrent}
          />
        )}
        {mode !== "vi" && mode !== "torque" && (
          <CalcInput
            label="Resistance"
            unit="Ω"
            value={resistance}
            onChange={setResistance}
          />
        )}
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Calculate
      </button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">
            Result:
          </span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

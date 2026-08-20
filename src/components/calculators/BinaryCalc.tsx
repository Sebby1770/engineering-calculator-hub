"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import {
  BINARY_WIDTHS,
  bitwise,
  convertInteger,
  twosComplement,
  type BinaryRadix,
  type BinaryWidth,
  type BitwiseOp,
} from "@/lib/binary";

const WIDTH_OPTIONS = BINARY_WIDTHS.map((w) => ({ value: String(w), label: `${w}-bit` }));
const RADIX_OPTIONS = [
  { value: "10", label: "Decimal" },
  { value: "2", label: "Binary" },
  { value: "16", label: "Hexadecimal" },
  { value: "8", label: "Octal" },
];
const OP_OPTIONS: { value: BitwiseOp; label: string }[] = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
  { value: "xor", label: "XOR" },
  { value: "nand", label: "NAND" },
  { value: "nor", label: "NOR" },
  { value: "not", label: "NOT (A)" },
  { value: "shl", label: "Shift left" },
  { value: "shr", label: "Shift right" },
];

export default function BinaryCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState("convert");
  const [width, setWidth] = useState("8");
  const [radix, setRadix] = useState("10");
  const [value, setValue] = useState("42");
  const [a, setA] = useState("12");
  const [b, setB] = useState("10");
  const [op, setOp] = useState<BitwiseOp>("and");
  const [signed, setSigned] = useState("-5");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [steps, setSteps] = useState<{ label: string; value: string }[]>([]);

  const w = Number(width) as BinaryWidth;
  const r = Number(radix) as BinaryRadix;

  const calculate = () => {
    try {
      if (mode === "convert") {
        const result = convertInteger(value, r, w);
        const text = `dec ${result.decimal}  bin ${result.grouped}  hex 0x${result.hex}`;
        setSummary(text);
        setDetail(`signed ${result.signed} · octal ${result.octal}`);
        setSteps(result.steps);
        onResult(text);
      } else if (mode === "bitwise") {
        const result = bitwise(a, b, op, w, r);
        const text = `${op.toUpperCase()} = ${result.grouped} (unsigned ${result.decimal})`;
        setSummary(text);
        setDetail(`hex 0x${result.hex} · signed ${result.signed}`);
        setSteps(result.steps);
        onResult(text);
      } else {
        const result = twosComplement(signed, w);
        const text = `${signed} → ${result.grouped}`;
        setSummary(text);
        setDetail(`unsigned ${result.unsigned} · hex 0x${result.hex}`);
        setSteps(result.steps);
        onResult(text);
      }
      setError("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Check the inputs and try again.";
      setError(message);
      setSummary(null);
      setSteps([]);
      onResult("");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcSelect
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "convert", label: "Base convert" },
            { value: "bitwise", label: "Bitwise" },
            { value: "twos", label: "Two's complement" },
          ]}
        />
        <CalcSelect label="Width" value={width} onChange={setWidth} options={WIDTH_OPTIONS} />
      </div>

      {mode !== "twos" && (
        <div className="mt-4">
          <CalcSelect label="Input base" value={radix} onChange={setRadix} options={RADIX_OPTIONS} />
        </div>
      )}

      {mode === "convert" && (
        <div className="mt-4">
          <CalcInput
            type="text"
            inputMode="text"
            label="Value"
            value={value}
            onChange={setValue}
            placeholder="42, 0b101010, or 0x2A"
          />
        </div>
      )}

      {mode === "bitwise" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <CalcInput type="text" inputMode="text" label="A" value={a} onChange={setA} />
          <CalcSelect
            label="Operation"
            value={op}
            onChange={(next) => setOp(next as BitwiseOp)}
            options={OP_OPTIONS}
          />
          <CalcInput
            type="text"
            inputMode="text"
            label={op === "shl" || op === "shr" ? "Shift count" : "B"}
            value={b}
            onChange={setB}
            disabled={op === "not"}
          />
        </div>
      )}

      {mode === "twos" && (
        <div className="mt-4">
          <CalcInput
            type="text"
            inputMode="numeric"
            label="Signed integer"
            value={signed}
            onChange={setSigned}
            placeholder="-5"
          />
        </div>
      )}

      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Calculate
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {summary && (
        <>
          <CalcResult value={summary} detail={detail} />
          <WorkSteps steps={steps} />
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { simplifyBoolean, truthTable } from "@/lib/booleanAlgebra";

export default function BooleanAlgebraCalc({ onResult }: { onResult: (r: string) => void }) {
  const [expression, setExpression] = useState("A + A'B");
  const [error, setError] = useState("");
  const [sop, setSop] = useState<string | null>(null);
  const [canonical, setCanonical] = useState("");
  const [pos, setPos] = useState("");
  const [vars, setVars] = useState<string[]>([]);
  const [rows, setRows] = useState<{ index: number; bits: boolean[]; value: boolean }[]>([]);
  const [steps, setSteps] = useState<{ label: string; value: string }[]>([]);

  const calculate = () => {
    try {
      const simplified = simplifyBoolean(expression);
      const table = truthTable(expression);
      setSop(simplified.sop);
      setCanonical(simplified.canonicalSop);
      setPos(simplified.canonicalPos);
      setVars(table.vars);
      setRows(table.rows);
      setSteps(simplified.steps);
      setError("");
      onResult(`${expression.trim()} → ${simplified.sop}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Check the expression and try again.";
      setError(message);
      setSop(null);
      setRows([]);
      setSteps([]);
      onResult("");
    }
  };

  return (
    <div>
      <CalcInput
        type="text"
        inputMode="text"
        label="Boolean expression"
        value={expression}
        onChange={setExpression}
        placeholder="A + A'B"
      />
      <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
        Variables A–F. AND is juxtaposition or AND · &amp; *; OR is + | OR; NOT is &apos; ! ~ NOT;
        also XOR, NAND, NOR. Example: <code>AB + A&apos;C</code>
      </p>
      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Simplify
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {sop !== null && (
        <>
          <CalcResult label="Minimal SOP" value={sop} />
          <CalcResult label="Canonical SOP" value={canonical} />
          <CalcResult label="Canonical POS" value={pos} />
          <WorkSteps steps={steps} />

          {rows.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
              <table className="min-w-full text-sm font-mono">
                <thead className="bg-surface-50 dark:bg-surface-800 text-surface-500 dark:text-surface-400">
                  <tr>
                    {vars.map((name) => (
                      <th key={name} className="px-3 py-2 text-left font-semibold">
                        {name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left font-semibold">F</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.index}
                      className="border-t border-surface-200 dark:border-surface-800"
                    >
                      {row.bits.map((bit, i) => (
                        <td key={`${row.index}-${i}`} className="px-3 py-1.5">
                          {bit ? "1" : "0"}
                        </td>
                      ))}
                      <td
                        className={`px-3 py-1.5 font-bold ${
                          row.value
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-surface-500"
                        }`}
                      >
                        {row.value ? "1" : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

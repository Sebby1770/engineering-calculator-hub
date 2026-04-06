'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function SeriesResistorCalc({ onResult }: { onResult: (r: string) => void }) {
  const [resistors, setResistors] = useState(['', '']);
  const [result, setResult] = useState<string | null>(null);

  const update = (i: number, v: string) => {
    const next = [...resistors];
    next[i] = v;
    setResistors(next);
  };

  const addResistor = () => { if (resistors.length < 10) setResistors([...resistors, '']); };
  const removeResistor = (i: number) => { if (resistors.length > 2) setResistors(resistors.filter((_, j) => j !== i)); };

  const calculate = () => {
    const vals = resistors.map(Number).filter((v) => !isNaN(v) && v > 0);
    if (vals.length < 2) return;
    const total = vals.reduce((s, r) => s + r, 0);
    const res = `${total.toPrecision(6)} Ω`;
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <div className="space-y-3">
        {resistors.map((r, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <CalcInput label={`R${i + 1}`} unit="Ω" value={r} onChange={(v) => update(i, v)} />
            </div>
            {resistors.length > 2 && (
              <button onClick={() => removeResistor(i)} className="px-3 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Remove">✕</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={addResistor} className="px-4 py-2 text-sm rounded-lg border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">+ Add Resistor</button>
        <button onClick={calculate} className="px-8 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Calculate</button>
      </div>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Total Resistance:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

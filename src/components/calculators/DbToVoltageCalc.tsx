'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function DbToVoltageCalc({ onResult }: { onResult: (r: string) => void }) {
  const [db, setDb] = useState('');
  const [refVoltage, setRefVoltage] = useState('1');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const d = parseFloat(db), ref = parseFloat(refVoltage);
    if (isNaN(d) || isNaN(ref)) return;
    const ratio = Math.pow(10, d / 20);
    const voltage = ratio * ref;
    const res = `Ratio = ${ratio.toPrecision(6)} | Voltage = ${voltage.toPrecision(6)} V`;
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcInput label="Decibels (dB)" unit="dB" value={db} onChange={setDb} />
        <CalcInput label="Reference Voltage" unit="V" value={refVoltage} onChange={setRefVoltage} />
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Convert</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Result:</span>
          <div className="font-mono text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

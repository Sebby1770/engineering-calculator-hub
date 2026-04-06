'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function VoltageToDbCalc({ onResult }: { onResult: (r: string) => void }) {
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseFloat(v1), b = parseFloat(v2);
    if (isNaN(a) || isNaN(b) || a <= 0) return;
    const db = 20 * Math.log10(b / a);
    const res = `${db.toPrecision(6)} dB`;
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcInput label="Reference Voltage (V₁)" unit="V" value={v1} onChange={setV1} />
        <CalcInput label="Measured Voltage (V₂)" unit="V" value={v2} onChange={setV2} />
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Convert</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Gain/Loss:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

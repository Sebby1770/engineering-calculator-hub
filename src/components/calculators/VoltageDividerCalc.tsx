'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function VoltageDividerCalc({ onResult }: { onResult: (r: string) => void }) {
  const [vin, setVin] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v = parseFloat(vin), a = parseFloat(r1), b = parseFloat(r2);
    if (!isNaN(v) && !isNaN(a) && !isNaN(b) && a + b !== 0) {
      const vout = v * (b / (a + b));
      const ratio = (b / (a + b) * 100).toFixed(2);
      const res = `Vout = ${vout.toPrecision(6)} V (${ratio}% of Vin)`;
      setResult(res);
      onResult(res);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CalcInput label="Input Voltage (Vin)" unit="V" value={vin} onChange={setVin} />
        <CalcInput label="Resistor R1" unit="Ω" value={r1} onChange={setR1} />
        <CalcInput label="Resistor R2" unit="Ω" value={r2} onChange={setR2} />
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">
        Calculate
      </button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Result:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

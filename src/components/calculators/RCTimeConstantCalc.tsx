'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function RCTimeConstantCalc({ onResult }: { onResult: (r: string) => void }) {
  const [resistance, setResistance] = useState('');
  const [capacitance, setCapacitance] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const r = parseFloat(resistance), c = parseFloat(capacitance);
    if (!isNaN(r) && !isNaN(c)) {
      const tau = r * c;
      const fc = 1 / (2 * Math.PI * tau);
      const lines = [
        `τ = ${tau.toExponential(4)} s`,
        `1τ (63.2%) = ${tau.toExponential(4)} s`,
        `3τ (95.0%) = ${(3 * tau).toExponential(4)} s`,
        `5τ (99.3%) = ${(5 * tau).toExponential(4)} s`,
        `Cutoff freq = ${fc.toPrecision(4)} Hz`,
      ];
      const res = lines.join('\n');
      setResult(res);
      onResult(`τ = ${tau.toExponential(4)} s`);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcInput label="Resistance (R)" unit="Ω" value={resistance} onChange={setResistance} />
        <CalcInput label="Capacitance (C)" unit="F" value={capacitance} onChange={setCapacitance} placeholder="e.g. 0.0001 for 100μF" />
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">
        Calculate
      </button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Results:</span>
          <pre className="font-mono text-lg font-bold text-brand-600 dark:text-brand-400 mt-1 whitespace-pre-line">{result}</pre>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function WavelengthCalc({ onResult }: { onResult: (r: string) => void }) {
  const [frequency, setFrequency] = useState('');
  const [velocity, setVelocity] = useState('299792458');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const f = parseFloat(frequency), v = parseFloat(velocity);
    if (isNaN(f) || isNaN(v) || f === 0) return;
    const lambda = v / f;
    let res: string;
    if (lambda >= 1) res = `${lambda.toPrecision(6)} m`;
    else if (lambda >= 1e-3) res = `${(lambda * 1e3).toPrecision(6)} mm`;
    else if (lambda >= 1e-6) res = `${(lambda * 1e6).toPrecision(6)} μm`;
    else res = `${(lambda * 1e9).toPrecision(6)} nm`;
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcInput label="Frequency" unit="Hz" value={frequency} onChange={setFrequency} />
        <CalcInput label="Wave Velocity" unit="m/s" value={velocity} onChange={setVelocity} />
      </div>
      <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">Default velocity = speed of light (299,792,458 m/s). Use 343 for sound in air.</p>
      <button onClick={calculate} className="mt-4 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Wavelength (λ):</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

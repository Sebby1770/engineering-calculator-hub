'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';

export default function FreqPeriodCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState('f2t');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const formatTime = (s: number) => {
    if (s >= 1) return `${s.toPrecision(6)} s`;
    if (s >= 1e-3) return `${(s * 1e3).toPrecision(6)} ms`;
    if (s >= 1e-6) return `${(s * 1e6).toPrecision(6)} μs`;
    return `${(s * 1e9).toPrecision(6)} ns`;
  };

  const formatFreq = (hz: number) => {
    if (hz >= 1e9) return `${(hz / 1e9).toPrecision(6)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toPrecision(6)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toPrecision(6)} kHz`;
    return `${hz.toPrecision(6)} Hz`;
  };

  const calculate = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v === 0) return;
    const reciprocal = 1 / v;
    const res = mode === 'f2t' ? formatTime(reciprocal) : formatFreq(reciprocal);
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <CalcSelect label="Convert" value={mode} onChange={setMode} options={[
        { value: 'f2t', label: 'Frequency → Period' },
        { value: 't2f', label: 'Period → Frequency' },
      ]} />
      <div className="mt-4">
        <CalcInput
          label={mode === 'f2t' ? 'Frequency' : 'Period'}
          unit={mode === 'f2t' ? 'Hz' : 's'}
          value={value}
          onChange={setValue}
        />
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Convert</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">{mode === 'f2t' ? 'Period' : 'Frequency'}:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

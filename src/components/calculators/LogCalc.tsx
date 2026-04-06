'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';

export default function LogCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState('log10');
  const [value, setValue] = useState('');
  const [base, setBase] = useState('2');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) { setResult('Enter a positive number'); return; }
    let res = 0;
    if (mode === 'log10') res = Math.log10(v);
    else if (mode === 'ln') res = Math.log(v);
    else if (mode === 'log2') res = Math.log2(v);
    else {
      const b = parseFloat(base);
      if (isNaN(b) || b <= 0 || b === 1) { setResult('Invalid base'); return; }
      res = Math.log(v) / Math.log(b);
    }
    const r = `${res.toPrecision(10)}`;
    setResult(r);
    onResult(r);
  };

  return (
    <div>
      <CalcSelect label="Logarithm Type" value={mode} onChange={setMode} options={[
        { value: 'log10', label: 'Common Log (log₁₀)' },
        { value: 'ln', label: 'Natural Log (ln)' },
        { value: 'log2', label: 'Binary Log (log₂)' },
        { value: 'custom', label: 'Custom Base' },
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput label="Value (x)" value={value} onChange={setValue} />
        {mode === 'custom' && <CalcInput label="Base (a)" value={base} onChange={setBase} />}
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Result:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';

export default function OhmsLawCalc({ onResult }: { onResult: (r: string) => void }) {
  const [solveFor, setSolveFor] = useState('voltage');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v = parseFloat(voltage);
    const i = parseFloat(current);
    const r = parseFloat(resistance);
    let res = '';
    if (solveFor === 'voltage' && !isNaN(i) && !isNaN(r)) {
      res = `${(i * r).toPrecision(6)} V`;
    } else if (solveFor === 'current' && !isNaN(v) && !isNaN(r) && r !== 0) {
      res = `${(v / r).toPrecision(6)} A`;
    } else if (solveFor === 'resistance' && !isNaN(v) && !isNaN(i) && i !== 0) {
      res = `${(v / i).toPrecision(6)} Ω`;
    } else {
      res = 'Please enter valid values';
    }
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <CalcSelect
        label="Solve for"
        value={solveFor}
        onChange={setSolveFor}
        options={[
          { value: 'voltage', label: 'Voltage (V)' },
          { value: 'current', label: 'Current (I)' },
          { value: 'resistance', label: 'Resistance (R)' },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {solveFor !== 'voltage' && (
          <CalcInput label="Voltage (V)" unit="V" value={voltage} onChange={setVoltage} />
        )}
        {solveFor !== 'current' && (
          <CalcInput label="Current (I)" unit="A" value={current} onChange={setCurrent} />
        )}
        {solveFor !== 'resistance' && (
          <CalcInput label="Resistance (R)" unit="Ω" value={resistance} onChange={setResistance} />
        )}
      </div>
      <button
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
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

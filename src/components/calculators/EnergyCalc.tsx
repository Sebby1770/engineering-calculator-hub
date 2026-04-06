'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';

export default function EnergyCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState('kinetic');
  const [mass, setMass] = useState('');
  const [velocity, setVelocity] = useState('');
  const [height, setHeight] = useState('');
  const [power, setPower] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    let energy = 0;
    if (mode === 'kinetic') {
      const m = parseFloat(mass), v = parseFloat(velocity);
      if (isNaN(m) || isNaN(v)) return;
      energy = 0.5 * m * v * v;
    } else if (mode === 'potential') {
      const m = parseFloat(mass), h = parseFloat(height);
      if (isNaN(m) || isNaN(h)) return;
      energy = m * 9.81 * h;
    } else {
      const p = parseFloat(power), t = parseFloat(time);
      if (isNaN(p) || isNaN(t)) return;
      energy = p * t;
    }
    const res = `${energy.toPrecision(6)} J (${(energy / 4.184).toPrecision(4)} cal, ${(energy / 1.602e-19).toExponential(3)} eV)`;
    setResult(res);
    onResult(`${energy.toPrecision(6)} J`);
  };

  return (
    <div>
      <CalcSelect label="Energy Type" value={mode} onChange={setMode} options={[
        { value: 'kinetic', label: 'Kinetic Energy (½mv²)' },
        { value: 'potential', label: 'Potential Energy (mgh)' },
        { value: 'electrical', label: 'Electrical Energy (Pt)' },
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {(mode === 'kinetic' || mode === 'potential') && <CalcInput label="Mass" unit="kg" value={mass} onChange={setMass} />}
        {mode === 'kinetic' && <CalcInput label="Velocity" unit="m/s" value={velocity} onChange={setVelocity} />}
        {mode === 'potential' && <CalcInput label="Height" unit="m" value={height} onChange={setHeight} />}
        {mode === 'electrical' && <CalcInput label="Power" unit="W" value={power} onChange={setPower} />}
        {mode === 'electrical' && <CalcInput label="Time" unit="s" value={time} onChange={setTime} />}
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Energy:</span>
          <div className="font-mono text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

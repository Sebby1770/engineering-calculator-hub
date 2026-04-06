'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';

export default function FrequencyCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState('from_period');
  const [period, setPeriod] = useState('');
  const [wavelength, setWavelength] = useState('');
  const [velocity, setVelocity] = useState('299792458');
  const [result, setResult] = useState<string | null>(null);

  const formatFreq = (hz: number) => {
    if (hz >= 1e9) return `${(hz / 1e9).toPrecision(6)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toPrecision(6)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toPrecision(6)} kHz`;
    return `${hz.toPrecision(6)} Hz`;
  };

  const calculate = () => {
    let freq = 0;
    if (mode === 'from_period') {
      const t = parseFloat(period);
      if (isNaN(t) || t === 0) return;
      freq = 1 / t;
    } else {
      const l = parseFloat(wavelength), v = parseFloat(velocity);
      if (isNaN(l) || isNaN(v) || l === 0) return;
      freq = v / l;
    }
    const res = formatFreq(freq);
    setResult(res);
    onResult(res);
  };

  return (
    <div>
      <CalcSelect label="Calculate from" value={mode} onChange={setMode} options={[
        { value: 'from_period', label: 'Period (f = 1/T)' },
        { value: 'from_wavelength', label: 'Wavelength (f = v/λ)' },
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {mode === 'from_period' && <CalcInput label="Period (T)" unit="s" value={period} onChange={setPeriod} />}
        {mode === 'from_wavelength' && (
          <>
            <CalcInput label="Wavelength (λ)" unit="m" value={wavelength} onChange={setWavelength} />
            <CalcInput label="Velocity (v)" unit="m/s" value={velocity} onChange={setVelocity} />
          </>
        )}
      </div>
      <button onClick={calculate} className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">Calculate</button>
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <span className="text-sm text-surface-500 dark:text-surface-400">Frequency:</span>
          <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
        </div>
      )}
    </div>
  );
}

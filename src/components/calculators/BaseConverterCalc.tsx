'use client';

import { useState } from 'react';

export default function BaseConverterCalc({ onResult }: { onResult: (r: string) => void }) {
  const [decimal, setDecimal] = useState('');
  const [binary, setBinary] = useState('');
  const [hex, setHex] = useState('');
  const [octal, setOctal] = useState('');
  const [source, setSource] = useState<'dec' | 'bin' | 'hex' | 'oct'>('dec');

  const convert = (value: string, from: typeof source) => {
    let num: number;
    try {
      if (from === 'dec') num = parseInt(value, 10);
      else if (from === 'bin') num = parseInt(value, 2);
      else if (from === 'hex') num = parseInt(value, 16);
      else num = parseInt(value, 8);
    } catch { return; }

    if (isNaN(num) || num < 0) return;

    setDecimal(num.toString(10));
    setBinary(num.toString(2));
    setHex(num.toString(16).toUpperCase());
    setOctal(num.toString(8));
    setSource(from);
    onResult(`Dec: ${num} | Bin: ${num.toString(2)} | Hex: ${num.toString(16).toUpperCase()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Decimal</label>
        <input
          type="text"
          value={decimal}
          onChange={(e) => { setDecimal(e.target.value); convert(e.target.value, 'dec'); }}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-base outline-none transition-all ${source === 'dec' ? 'border-brand-400 ring-2 ring-brand-200 dark:ring-brand-800' : 'border-surface-300 dark:border-surface-700'} bg-white dark:bg-surface-900 text-surface-900 dark:text-white`}
          placeholder="Enter decimal number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Binary</label>
        <input
          type="text"
          value={binary}
          onChange={(e) => { setBinary(e.target.value); convert(e.target.value, 'bin'); }}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-base outline-none transition-all ${source === 'bin' ? 'border-brand-400 ring-2 ring-brand-200 dark:ring-brand-800' : 'border-surface-300 dark:border-surface-700'} bg-white dark:bg-surface-900 text-surface-900 dark:text-white`}
          placeholder="Enter binary number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Hexadecimal</label>
        <input
          type="text"
          value={hex}
          onChange={(e) => { setHex(e.target.value); convert(e.target.value, 'hex'); }}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-base outline-none transition-all ${source === 'hex' ? 'border-brand-400 ring-2 ring-brand-200 dark:ring-brand-800' : 'border-surface-300 dark:border-surface-700'} bg-white dark:bg-surface-900 text-surface-900 dark:text-white`}
          placeholder="Enter hex number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Octal</label>
        <input
          type="text"
          value={octal}
          onChange={(e) => { setOctal(e.target.value); convert(e.target.value, 'oct'); }}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-base outline-none transition-all ${source === 'oct' ? 'border-brand-400 ring-2 ring-brand-200 dark:ring-brand-800' : 'border-surface-300 dark:border-surface-700'} bg-white dark:bg-surface-900 text-surface-900 dark:text-white`}
          placeholder="Enter octal number"
        />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import CalcSelect from '@/components/ui/CalcSelect';

const COLORS = [
  { name: 'Black', value: 0, mult: 1, hex: '#000000' },
  { name: 'Brown', value: 1, mult: 10, hex: '#8B4513' },
  { name: 'Red', value: 2, mult: 100, hex: '#FF0000' },
  { name: 'Orange', value: 3, mult: 1000, hex: '#FF8C00' },
  { name: 'Yellow', value: 4, mult: 10000, hex: '#FFD700' },
  { name: 'Green', value: 5, mult: 100000, hex: '#228B22' },
  { name: 'Blue', value: 6, mult: 1000000, hex: '#0000FF' },
  { name: 'Violet', value: 7, mult: 10000000, hex: '#8B008B' },
  { name: 'Grey', value: 8, mult: 100000000, hex: '#808080' },
  { name: 'White', value: 9, mult: 1000000000, hex: '#F5F5F5' },
];

const TOLERANCE = [
  { name: 'Brown (±1%)', value: 1, hex: '#8B4513' },
  { name: 'Red (±2%)', value: 2, hex: '#FF0000' },
  { name: 'Gold (±5%)', value: 5, hex: '#DAA520' },
  { name: 'Silver (±10%)', value: 10, hex: '#C0C0C0' },
];

function formatResistance(ohms: number): string {
  if (ohms >= 1e9) return `${(ohms / 1e9).toPrecision(4)} GΩ`;
  if (ohms >= 1e6) return `${(ohms / 1e6).toPrecision(4)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toPrecision(4)} kΩ`;
  return `${ohms} Ω`;
}

export default function ResistorColorCodeCalc({ onResult }: { onResult: (r: string) => void }) {
  const [band1, setBand1] = useState('1');
  const [band2, setBand2] = useState('0');
  const [mult, setMult] = useState('2');
  const [tol, setTol] = useState('5');

  const resistance = (parseInt(band1) * 10 + parseInt(band2)) * COLORS[parseInt(mult)].mult;
  const result = `${formatResistance(resistance)} ±${tol}%`;

  const colorOpts = COLORS.map((c) => ({ value: String(c.value), label: c.name }));
  const tolOpts = TOLERANCE.map((t) => ({ value: String(t.value), label: t.name }));

  return (
    <div>
      {/* Visual resistor */}
      <div className="flex items-center justify-center mb-6 p-6 bg-surface-50 dark:bg-surface-800 rounded-lg">
        <div className="flex items-center">
          <div className="w-8 h-1 bg-surface-400" />
          <div className="relative w-48 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center gap-3 px-6">
            {[band1, band2, mult].map((b, i) => (
              <div
                key={i}
                className="w-5 h-12 rounded-sm border border-black/20"
                style={{ backgroundColor: COLORS[parseInt(b)]?.hex }}
              />
            ))}
            <div
              className="w-5 h-12 rounded-sm border border-black/20 ml-2"
              style={{ backgroundColor: TOLERANCE.find((t) => String(t.value) === tol)?.hex }}
            />
          </div>
          <div className="w-8 h-1 bg-surface-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CalcSelect label="Band 1 (Digit)" value={band1} onChange={setBand1} options={colorOpts} />
        <CalcSelect label="Band 2 (Digit)" value={band2} onChange={setBand2} options={colorOpts} />
        <CalcSelect label="Band 3 (Multiplier)" value={mult} onChange={(v) => { setMult(v); }} options={colorOpts} />
        <CalcSelect label="Band 4 (Tolerance)" value={tol} onChange={setTol} options={tolOpts} />
      </div>

      <div className="mt-5 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
        <span className="text-sm text-surface-500 dark:text-surface-400">Resistance:</span>
        <div className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{result}</div>
      </div>
    </div>
  );
}

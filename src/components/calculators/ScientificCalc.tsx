'use client';

import { useState } from 'react';

export default function ScientificCalc({ onResult }: { onResult: (r: string) => void }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  const toRad = (x: number) => (angleMode === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (angleMode === 'deg' ? (x * 180) / Math.PI : x);

  const append = (val: string) => {
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const clear = () => { setDisplay('0'); setExpression(''); };

  const evaluate = () => {
    try {
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/e(?![x])/g, String(Math.E));
      const result = Function('"use strict"; return (' + expr + ')')();
      const res = String(Number(result.toPrecision(12)));
      setExpression(display);
      setDisplay(res);
      onResult(res);
    } catch {
      setDisplay('Error');
    }
  };

  const applyFunc = (fn: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      let result: number;
      switch (fn) {
        case 'sin': result = Math.sin(toRad(val)); break;
        case 'cos': result = Math.cos(toRad(val)); break;
        case 'tan': result = Math.tan(toRad(val)); break;
        case 'asin': result = fromRad(Math.asin(val)); break;
        case 'acos': result = fromRad(Math.acos(val)); break;
        case 'atan': result = fromRad(Math.atan(val)); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'x2': result = val * val; break;
        case '1/x': result = 1 / val; break;
        case 'fact': result = factorial(val); break;
        default: return;
      }
      const res = String(Number(result.toPrecision(12)));
      setDisplay(res);
      onResult(res);
    } catch {
      setDisplay('Error');
    }
  };

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const btnClass = "flex items-center justify-center rounded-lg font-mono text-sm h-12 transition-colors active:scale-95";
  const numBtn = `${btnClass} bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700`;
  const opBtn = `${btnClass} bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40`;
  const fnBtn = `${btnClass} bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 text-xs`;

  return (
    <div className="max-w-md mx-auto">
      {/* Display */}
      <div className="mb-4 p-4 rounded-lg bg-surface-900 dark:bg-black text-right">
        {expression && <div className="text-surface-500 text-sm font-mono mb-1">{expression}</div>}
        <div className="font-mono text-3xl text-white truncate">{display}</div>
      </div>

      {/* Angle mode */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setAngleMode('deg')}
          className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${angleMode === 'deg' ? 'bg-brand-600 text-white' : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}
        >DEG</button>
        <button
          onClick={() => setAngleMode('rad')}
          className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${angleMode === 'rad' ? 'bg-brand-600 text-white' : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}
        >RAD</button>
      </div>

      {/* Scientific functions */}
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {['sin', 'cos', 'tan', 'log', 'ln'].map((fn) => (
          <button key={fn} onClick={() => applyFunc(fn)} className={fnBtn}>{fn}</button>
        ))}
        {['asin', 'acos', 'atan', 'sqrt', 'x2'].map((fn) => (
          <button key={fn} onClick={() => applyFunc(fn)} className={fnBtn}>
            {fn === 'sqrt' ? '√' : fn === 'x2' ? 'x²' : fn}
          </button>
        ))}
        <button onClick={() => applyFunc('1/x')} className={fnBtn}>1/x</button>
        <button onClick={() => applyFunc('fact')} className={fnBtn}>n!</button>
        <button onClick={() => append('π')} className={fnBtn}>π</button>
        <button onClick={() => append('e')} className={fnBtn}>e</button>
        <button onClick={() => append('(')} className={fnBtn}>(</button>
      </div>

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={clear} className={`${btnClass} bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 col-span-2`}>Clear</button>
        <button onClick={() => append(')')} className={opBtn}>)</button>
        <button onClick={() => append('÷')} className={opBtn}>÷</button>

        {['7', '8', '9'].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append('×')} className={opBtn}>×</button>

        {['4', '5', '6'].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append('-')} className={opBtn}>−</button>

        {['1', '2', '3'].map((n) => <button key={n} onClick={() => append(n)} className={numBtn}>{n}</button>)}
        <button onClick={() => append('+')} className={opBtn}>+</button>

        <button onClick={() => append('0')} className={`${numBtn} col-span-2`}>0</button>
        <button onClick={() => append('.')} className={numBtn}>.</button>
        <button onClick={evaluate} className={`${btnClass} bg-brand-600 text-white font-bold hover:bg-brand-700`}>=</button>
      </div>
    </div>
  );
}

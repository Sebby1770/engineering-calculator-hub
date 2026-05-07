'use client';

import { useState, useRef } from 'react';
import { create, all } from 'mathjs';

const math = create(all);

// Configure mathjs for engineering use (units, etc.)
math.config({
  number: 'BigNumber',
  precision: 20
});

export default function UniversalCalculator({ onResult }: { onResult?: (result: string) => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<{input: string; result: string}[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const calculate = () => {
    if (!input.trim()) return;

    try {
      // Try to evaluate with mathjs
      let evaluated = math.evaluate(input);
      
      // Format result nicely
      let formattedResult: string;
      if (typeof evaluated === 'number' || (evaluated && evaluated.valueOf)) {
        formattedResult = Number(evaluated).toPrecision(12).replace(/0+$/, '').replace(/\.$/, '');
      } else {
        formattedResult = String(evaluated);
      }

      setResult(formattedResult);
      
      // Add to history
      setHistory(prev => [{ input, result: formattedResult }, ...prev.slice(0, 9)]);
      
      if (onResult) onResult(formattedResult);
      
    } catch (error) {
      setResult('Error: Invalid expression or unsupported operation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      calculate();
    }
  };

  const clear = () => {
    setInput('');
    setResult('');
  };

  const exampleQuestions = [
    '2 + 3 * sin(45 deg)',
    '5 m + 30 cm',
    '10!',
    'sin(pi/2)',
    '2^10',
    'sqrt(144)'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 p-6">
        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
            Enter any math, engineering expression or question
          </label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type here... e.g. 2 + 3 * sin(pi/3) or 5 m + 30 cm"
            rows={3}
            className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-800 resize-y"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={calculate}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Calculate</span>
          </button>
          <button
            onClick={clear}
            className="px-8 border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 font-medium rounded-xl transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 p-5 bg-surface-50 dark:bg-surface-800 rounded-2xl">
            <div className="text-sm text-surface-500 dark:text-surface-400 mb-1">Result</div>
            <div className="font-mono text-4xl font-light text-surface-900 dark:text-white break-all">
              {result}
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest text-surface-400 mb-3">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setInput(ex);
                  setTimeout(() => calculate(), 10);
                }}
                className="text-xs px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl hover:border-brand-300 font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-surface-400 mb-3">History</p>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {history.map((item, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-surface-100 dark:border-surface-700 pb-3">
                  <span className="font-mono text-surface-600 dark:text-surface-400">{item.input}</span>
                  <span className="font-medium font-mono">= {item.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-surface-400 mt-6">
        Powered by mathjs • Supports units, trig, factorials, complex math & more
      </p>
    </div>
  );
}

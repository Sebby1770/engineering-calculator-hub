'use client';

import { useEffect, useMemo, useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import CalcSelect from '@/components/ui/CalcSelect';
import WorkSteps from '@/components/ui/WorkSteps';
import type { EngineeringResult } from '@/lib/engineeringCalculations';
import type { EngineeringToolDefinition } from '@/data/professionalCalculators';
import type { CalculatorCapture } from '@/lib/workspace';

export default function EngineeringFormulaTool({
  definition,
  onResult,
}: {
  definition: EngineeringToolDefinition;
  onResult: (result: string | CalculatorCapture) => void;
}) {
  const initialValues = useMemo(
    () => Object.fromEntries(definition.fields.map((field) => [field.id, String(field.defaultValue)])),
    [definition],
  );
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [calculation, setCalculation] = useState<EngineeringResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValues((current) => {
      const next = { ...current };
      for (const field of definition.fields) {
        const queryValue = params.get(field.id);
        if (queryValue === null || queryValue.length > 100 || !Number.isFinite(Number(queryValue))) continue;
        if (field.options && !field.options.some((option) => String(option.value) === queryValue)) continue;
        next[field.id] = queryValue;
      }
      return next;
    });
  }, [definition]);

  const calculate = () => {
    const numericValues = Object.fromEntries(
      definition.fields.map((field) => [field.id, Number(values[field.id])]),
    );
    try {
      const next = definition.calculate(numericValues);
      setCalculation(next);
      setError('');
      onResult({
        summary: next.summary,
        calculatorVersion: '2026-07-28',
        inputs: definition.fields.map((field) => {
          const rawValue = values[field.id] ?? '';
          const selectedLabel = field.options?.find((option) => String(option.value) === rawValue)?.label;
          return {
            id: field.id,
            label: field.label,
            value: selectedLabel || rawValue,
            reopenValue: selectedLabel ? rawValue : undefined,
            unit: field.unit,
          };
        }),
        outputs: next.outputs.map((output) => ({
          label: output.label,
          value: String(output.value),
          unit: output.unit,
        })),
        steps: next.steps.map((step) => ({ label: step.label, value: step.value })),
        warning: next.warning,
      });
    } catch (caught) {
      setCalculation(null);
      setError(caught instanceof Error ? caught.message : 'Check the inputs and try again.');
      onResult('');
    }
  };

  const reset = () => {
    setValues(initialValues);
    setCalculation(null);
    setError('');
    onResult('');
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {definition.fields.map((field) => (
          <div key={field.id}>
            {field.options ? (
              <CalcSelect
                label={field.label}
                value={values[field.id] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [field.id]: value }))}
                options={field.options.map((option) => ({
                  value: String(option.value),
                  label: option.label,
                }))}
              />
            ) : (
              <CalcInput
                label={field.label}
                unit={field.unit}
                value={values[field.id] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [field.id]: value }))}
                min={field.min}
                max={field.max}
                step={field.step ?? 'any'}
              />
            )}
            {field.help && <p className="mt-1.5 text-xs leading-relaxed text-surface-400">{field.help}</p>}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={calculate} className="rounded-lg bg-forge-600 px-8 py-3 font-semibold text-white shadow-sm shadow-forge-500/20 transition-colors hover:bg-forge-700">
          Calculate design
        </button>
        <button type="button" onClick={reset} className="rounded-lg border border-surface-300 px-5 py-3 text-sm font-semibold text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {calculation && (
        <div className="mt-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {calculation.outputs.map((output) => (
              <div
                key={output.label}
                className={`rounded-xl border p-4 ${
                  output.emphasis
                    ? 'border-forge-300 bg-forge-50 dark:border-forge-800 dark:bg-forge-900/30'
                    : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{output.label}</p>
                <p className={`mt-2 break-words font-mono text-xl font-bold ${output.emphasis ? 'text-forge-800 dark:text-forge-200' : 'text-surface-900 dark:text-white'}`}>
                  {output.value}{output.unit ? ` ${output.unit}` : ''}
                </p>
              </div>
            ))}
          </div>

          <WorkSteps title="Calculation trail" steps={calculation.steps} />

          {calculation.warning && (
            <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="mt-0.5 font-bold" aria-hidden="true">!</span>
              <p><strong>Design check:</strong> {calculation.warning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

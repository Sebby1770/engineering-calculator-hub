'use client';

import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';
import WorkSteps from '@/components/ui/WorkSteps';
import {
  analyzeVoltageDivider,
  designVoltageDivider,
  formatEngineering,
  type VoltageDividerAnalysis,
} from '@/lib/engineeringCalculations';

type Mode = 'analyse' | 'design';

interface DividerResult {
  r1Ohm: number;
  r2Ohm: number;
  analysis: VoltageDividerAnalysis;
  designed: boolean;
}

export default function VoltageDividerCalc({ onResult }: { onResult: (result: string) => void }) {
  const [mode, setMode] = useState<Mode>('design');
  const [inputVoltage, setInputVoltage] = useState('12');
  const [targetVoltage, setTargetVoltage] = useState('3.3');
  const [r1Kohm, setR1Kohm] = useState('27');
  const [r2Kohm, setR2Kohm] = useState('10');
  const [targetCurrentMa, setTargetCurrentMa] = useState('1');
  const [loadEnabled, setLoadEnabled] = useState(true);
  const [loadKohm, setLoadKohm] = useState('100');
  const [resistorTolerance, setResistorTolerance] = useState('1');
  const [supplyTolerance, setSupplyTolerance] = useState('5');
  const [result, setResult] = useState<DividerResult | null>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    const shared = {
      inputVoltage: Number(inputVoltage),
      loadOhm: loadEnabled ? Number(loadKohm) * 1_000 : undefined,
      resistorTolerancePercent: Number(resistorTolerance),
      supplyTolerancePercent: Number(supplyTolerance),
    };
    try {
      let next: DividerResult;
      if (mode === 'design') {
        const design = designVoltageDivider({
          ...shared,
          targetVoltage: Number(targetVoltage),
          targetCurrentMa: Number(targetCurrentMa),
        });
        next = { r1Ohm: design.r1Ohm, r2Ohm: design.r2Ohm, analysis: design.analysis, designed: true };
        setR1Kohm(formatEngineering(design.r1Ohm / 1_000));
        setR2Kohm(formatEngineering(design.r2Ohm / 1_000));
      } else {
        const r1Ohm = Number(r1Kohm) * 1_000;
        const r2Ohm = Number(r2Kohm) * 1_000;
        next = {
          r1Ohm,
          r2Ohm,
          analysis: analyzeVoltageDivider({ ...shared, r1Ohm, r2Ohm }),
          designed: false,
        };
      }
      setResult(next);
      setError('');
      const summary = `R1 = ${formatEngineering(next.r1Ohm)} Ω, R2 = ${formatEngineering(next.r2Ohm)} Ω; loaded Vout = ${formatEngineering(next.analysis.loadedVoltage)} V; worst-case range = ${formatEngineering(next.analysis.worstCaseLow)}–${formatEngineering(next.analysis.worstCaseHigh)} V.`;
      onResult(summary);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Check the divider inputs and try again.');
      onResult('');
    }
  };

  const outputs = result
    ? [
        ['Loaded output', formatEngineering(result.analysis.loadedVoltage), 'V', true],
        ['Worst-case low', formatEngineering(result.analysis.worstCaseLow), 'V', false],
        ['Worst-case high', formatEngineering(result.analysis.worstCaseHigh), 'V', false],
        ['Source current', formatEngineering(result.analysis.sourceCurrent * 1_000), 'mA', false],
        ['Output resistance', formatEngineering(result.analysis.outputResistance / 1_000), 'kΩ', false],
        ['Total resistor loss', formatEngineering(result.analysis.r1Power + result.analysis.r2Power), 'W', false],
      ] as const
    : [];

  return (
    <div>
      <div className="mb-6 inline-flex rounded-xl border border-surface-200 bg-surface-50 p-1 dark:border-surface-700 dark:bg-surface-800" aria-label="Voltage divider mode">
        {([
          ['design', 'Design an E24 divider'],
          ['analyse', 'Analyse known values'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setResult(null);
              setError('');
              onResult('');
            }}
            aria-pressed={mode === value}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === value
                ? 'bg-white text-brand-700 shadow-sm dark:bg-surface-900 dark:text-brand-300'
                : 'text-surface-500 hover:text-surface-800 dark:text-surface-400 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CalcInput label="Input voltage" unit="V" value={inputVoltage} onChange={setInputVoltage} min="0.001" step="0.1" />
        {mode === 'design' ? (
          <>
            <CalcInput label="Target output" unit="V" value={targetVoltage} onChange={setTargetVoltage} min="0.001" step="0.1" />
            <CalcInput label="Preferred source current" unit="mA" value={targetCurrentMa} onChange={setTargetCurrentMa} min="0.001" step="0.1" />
          </>
        ) : (
          <>
            <CalcInput label="Resistor R1" unit="kΩ" value={r1Kohm} onChange={setR1Kohm} min="0.0001" step="0.1" />
            <CalcInput label="Resistor R2" unit="kΩ" value={r2Kohm} onChange={setR2Kohm} min="0.0001" step="0.1" />
          </>
        )}
        <CalcInput label="Resistor tolerance" unit="%" value={resistorTolerance} onChange={setResistorTolerance} min="0" max="50" step="0.1" />
        <CalcInput label="Supply tolerance" unit="%" value={supplyTolerance} onChange={setSupplyTolerance} min="0" max="50" step="0.1" />
        {loadEnabled && <CalcInput label="Load resistance" unit="kΩ" value={loadKohm} onChange={setLoadKohm} min="0.0001" step="1" />}
      </div>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300">
        <input
          type="checkbox"
          checked={loadEnabled}
          onChange={(event) => setLoadEnabled(event.target.checked)}
          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
        />
        Include load resistance in the design
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={calculate} className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-700">
          {mode === 'design' ? 'Find E24 pair' : 'Analyse divider'}
        </button>
        <p className="text-xs leading-relaxed text-surface-400">
          {mode === 'design'
            ? 'Searches practical E24 pairs from 10 Ω to 10 MΩ and balances voltage accuracy with the preferred source current.'
            : 'Includes loading, tolerance corners, dissipation, and Thevenin output resistance.'}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 animate-fade-in">
          {result.designed && (
            <div className="mb-4 rounded-xl border border-brand-300 bg-gradient-to-r from-brand-50 to-cyan-50 p-5 dark:border-brand-800 dark:from-brand-950/50 dark:to-cyan-950/30">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">Recommended E24 pair</p>
              <p className="mt-2 font-mono text-2xl font-bold text-brand-900 dark:text-brand-100">
                R1 = {formatEngineering(result.r1Ohm / 1_000)} kΩ · R2 = {formatEngineering(result.r2Ohm / 1_000)} kΩ
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {outputs.map(([label, value, unit, emphasis]) => (
              <div key={label} className={`rounded-xl border p-4 ${emphasis ? 'border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/40' : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{label}</p>
                <p className={`mt-2 font-mono text-xl font-bold ${emphasis ? 'text-brand-700 dark:text-brand-300' : 'text-surface-900 dark:text-white'}`}>{value} {unit}</p>
              </div>
            ))}
          </div>

          <WorkSteps
            title="Loaded and tolerance calculation"
            steps={[
              { label: 'Nominal unloaded output', value: `Vin × R2/(R1+R2) = ${formatEngineering(result.analysis.unloadedVoltage)} V` },
              { label: 'Load-adjusted output', value: `${formatEngineering(result.analysis.loadedVoltage)} V (${formatEngineering(result.analysis.loadingErrorPercent)}% loading shift)` },
              { label: 'Worst-case tolerance range', value: `${formatEngineering(result.analysis.worstCaseLow)} V to ${formatEngineering(result.analysis.worstCaseHigh)} V` },
              { label: 'Resistor dissipation', value: `R1: ${formatEngineering(result.analysis.r1Power)} W; R2: ${formatEngineering(result.analysis.r2Power)} W` },
            ]}
          />

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Design check:</strong> This model treats the load as fixed and the source as ideal. For an ADC input, include sampling transients, leakage, source-impedance limits, reference tolerance, and settling time from the datasheet.
          </div>
        </div>
      )}
    </div>
  );
}

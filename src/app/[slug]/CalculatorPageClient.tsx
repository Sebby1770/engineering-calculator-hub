"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getCalculatorBySlug, getEngineeringToolBySlug } from "@/data/calculators";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import ProGate from "@/components/billing/ProGate";
import type { CalculatorCapture } from "@/lib/workspace";

function CalculatorLoading() {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading calculator">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-20 rounded-lg bg-surface-100 dark:bg-surface-800" />
        <div className="h-20 rounded-lg bg-surface-100 dark:bg-surface-800" />
      </div>
      <div className="mt-5 h-12 w-40 rounded-lg bg-brand-100 dark:bg-brand-950" />
      <span className="sr-only">Loading calculator…</span>
    </div>
  );
}

// Keep each calculator in its own browser chunk. A visitor opening one tool no
// longer downloads the implementation code for every other calculator.
const OhmsLawCalc = dynamic(() => import("@/components/calculators/OhmsLawCalc"), { loading: CalculatorLoading });
const VoltageDividerCalc = dynamic(() => import("@/components/calculators/VoltageDividerCalc"), { loading: CalculatorLoading });
const ResistorColorCodeCalc = dynamic(() => import("@/components/calculators/ResistorColorCodeCalc"), { loading: CalculatorLoading });
const RCTimeConstantCalc = dynamic(() => import("@/components/calculators/RCTimeConstantCalc"), { loading: CalculatorLoading });
const PowerCalc = dynamic(() => import("@/components/calculators/PowerCalc"), { loading: CalculatorLoading });
const ParallelResistorCalc = dynamic(() => import("@/components/calculators/ParallelResistorCalc"), { loading: CalculatorLoading });
const SeriesResistorCalc = dynamic(() => import("@/components/calculators/SeriesResistorCalc"), { loading: CalculatorLoading });
const ScientificCalc = dynamic(() => import("@/components/calculators/ScientificCalc"), { loading: CalculatorLoading });
const LogCalc = dynamic(() => import("@/components/calculators/LogCalc"), { loading: CalculatorLoading });
const BaseConverterCalc = dynamic(() => import("@/components/calculators/BaseConverterCalc"), { loading: CalculatorLoading });
const EnergyCalc = dynamic(() => import("@/components/calculators/EnergyCalc"), { loading: CalculatorLoading });
const FrequencyCalc = dynamic(() => import("@/components/calculators/FrequencyCalc"), { loading: CalculatorLoading });
const WavelengthCalc = dynamic(() => import("@/components/calculators/WavelengthCalc"), { loading: CalculatorLoading });
const DbToVoltageCalc = dynamic(() => import("@/components/calculators/DbToVoltageCalc"), { loading: CalculatorLoading });
const VoltageToDbCalc = dynamic(() => import("@/components/calculators/VoltageToDbCalc"), { loading: CalculatorLoading });
const FreqPeriodCalc = dynamic(() => import("@/components/calculators/FreqPeriodCalc"), { loading: CalculatorLoading });
const UniversalCalculator = dynamic(() => import("@/components/calculators/UniversalCalculator"), { loading: CalculatorLoading });
const DerivativeCalc = dynamic(() => import("@/components/calculators/DerivativeCalc"), { loading: CalculatorLoading });
const IntegralCalc = dynamic(() => import("@/components/calculators/IntegralCalc"), { loading: CalculatorLoading });
const LimitCalc = dynamic(() => import("@/components/calculators/LimitCalc"), { loading: CalculatorLoading });
const DifferentialEquationCalc = dynamic(() => import("@/components/calculators/DifferentialEquationCalc"), { loading: CalculatorLoading });
const TaylorSeriesCalc = dynamic(() => import("@/components/calculators/TaylorSeriesCalc"), { loading: CalculatorLoading });
const TriangleCalc = dynamic(() => import("@/components/calculators/TriangleCalc"), { loading: CalculatorLoading });
const CircleCalc = dynamic(() => import("@/components/calculators/CircleCalc"), { loading: CalculatorLoading });
const PythagoreanCalc = dynamic(() => import("@/components/calculators/PythagoreanCalc"), { loading: CalculatorLoading });
const VolumeCalc = dynamic(() => import("@/components/calculators/VolumeCalc"), { loading: CalculatorLoading });
const DistanceCalc = dynamic(() => import("@/components/calculators/DistanceCalc"), { loading: CalculatorLoading });
const MatrixDeterminantCalc = dynamic(() => import("@/components/calculators/MatrixDeterminantCalc"), { loading: CalculatorLoading });
const MatrixInverseCalc = dynamic(() => import("@/components/calculators/MatrixInverseCalc"), { loading: CalculatorLoading });
const MatrixMultiplyCalc = dynamic(() => import("@/components/calculators/MatrixMultiplyCalc"), { loading: CalculatorLoading });
const LinearSystemCalc = dynamic(() => import("@/components/calculators/LinearSystemCalc"), { loading: CalculatorLoading });
const DotCrossProductCalc = dynamic(() => import("@/components/calculators/DotCrossProductCalc"), { loading: CalculatorLoading });
const EigenvalueCalc = dynamic(() => import("@/components/calculators/EigenvalueCalc"), { loading: CalculatorLoading });
const EquationSolverCalc = dynamic(() => import("@/components/calculators/EquationSolverCalc"), { loading: CalculatorLoading });
const BinaryCalc = dynamic(() => import("@/components/calculators/BinaryCalc"), { loading: CalculatorLoading });
const BooleanAlgebraCalc = dynamic(() => import("@/components/calculators/BooleanAlgebraCalc"), { loading: CalculatorLoading });
const IpSubnetCalc = dynamic(() => import("@/components/calculators/IpSubnetCalc"), { loading: CalculatorLoading });
const EngineeringFormulaTool = dynamic(() => import("@/components/calculators/EngineeringFormulaTool"), { loading: CalculatorLoading });

type ResultHandler = (result: string | CalculatorCapture) => void;
type CalculatorRenderer = (onResult: ResultHandler) => React.ReactNode;

const CALCULATOR_RENDERERS: Record<string, CalculatorRenderer> = {
  "ohms-law-calculator": (onResult) => <OhmsLawCalc onResult={onResult} />,
  "voltage-divider-calculator": (onResult) => <VoltageDividerCalc onResult={onResult} />,
  "resistor-color-code-calculator": (onResult) => <ResistorColorCodeCalc onResult={onResult} />,
  "rc-time-constant-calculator": (onResult) => <RCTimeConstantCalc onResult={onResult} />,
  "power-calculator": (onResult) => <PowerCalc onResult={onResult} />,
  "parallel-resistor-calculator": (onResult) => <ParallelResistorCalc onResult={onResult} />,
  "series-resistor-calculator": (onResult) => <SeriesResistorCalc onResult={onResult} />,
  "scientific-calculator": (onResult) => <ScientificCalc onResult={onResult} />,
  "log-calculator": (onResult) => <LogCalc onResult={onResult} />,
  "binary-hex-decimal-converter": (onResult) => <BaseConverterCalc onResult={onResult} />,
  "energy-calculator": (onResult) => <EnergyCalc onResult={onResult} />,
  "frequency-calculator": (onResult) => <FrequencyCalc onResult={onResult} />,
  "wavelength-calculator": (onResult) => <WavelengthCalc onResult={onResult} />,
  "db-to-voltage-converter": (onResult) => <DbToVoltageCalc onResult={onResult} />,
  "voltage-to-db-converter": (onResult) => <VoltageToDbCalc onResult={onResult} />,
  "frequency-to-period-converter": (onResult) => <FreqPeriodCalc onResult={onResult} />,
  "universal-calculator": (onResult) => <UniversalCalculator onResult={onResult} />,
  "equation-solver-calculator": (onResult) => <EquationSolverCalc onResult={onResult} />,
  "derivative-calculator": (onResult) => <DerivativeCalc onResult={onResult} />,
  "integral-calculator": (onResult) => <IntegralCalc onResult={onResult} />,
  "limit-calculator": (onResult) => <LimitCalc onResult={onResult} />,
  "differential-equation-calculator": (onResult) => <DifferentialEquationCalc onResult={onResult} />,
  "taylor-series-calculator": (onResult) => <TaylorSeriesCalc onResult={onResult} />,
  "triangle-calculator": (onResult) => <TriangleCalc onResult={onResult} />,
  "circle-calculator": (onResult) => <CircleCalc onResult={onResult} />,
  "pythagorean-calculator": (onResult) => <PythagoreanCalc onResult={onResult} />,
  "volume-calculator": (onResult) => <VolumeCalc onResult={onResult} />,
  "distance-calculator": (onResult) => <DistanceCalc onResult={onResult} />,
  "matrix-determinant-calculator": (onResult) => <MatrixDeterminantCalc onResult={onResult} />,
  "matrix-inverse-calculator": (onResult) => <MatrixInverseCalc onResult={onResult} />,
  "matrix-multiply-calculator": (onResult) => <MatrixMultiplyCalc onResult={onResult} />,
  "linear-system-calculator": (onResult) => <LinearSystemCalc onResult={onResult} />,
  "dot-cross-product-calculator": (onResult) => <DotCrossProductCalc onResult={onResult} />,
  "eigenvalue-calculator": (onResult) => <EigenvalueCalc onResult={onResult} />,
  "binary-calculator": (onResult) => <BinaryCalc onResult={onResult} />,
  "boolean-algebra-calculator": (onResult) => <BooleanAlgebraCalc onResult={onResult} />,
  "ip-subnet-calculator": (onResult) => <IpSubnetCalc onResult={onResult} />,
};

export default function CalculatorPageClient({ slug }: { slug: string }) {
  const [calculation, setCalculation] = useState<CalculatorCapture | null>(null);
  const config = getCalculatorBySlug(slug);
  if (!config) return null;

  const handleResult = (result: string | CalculatorCapture) => {
    setCalculation(
      typeof result === 'string'
        ? result
          ? { summary: result }
          : null
        : result,
    );
  };

  const renderCalculator = CALCULATOR_RENDERERS[slug];
  const engineeringTool = getEngineeringToolBySlug(slug);
  if (!renderCalculator && !engineeringTool) return null;

  const calculatorContent = engineeringTool ? (
    <EngineeringFormulaTool definition={engineeringTool} onResult={handleResult} />
  ) : renderCalculator?.(handleResult);

  const calculator = config.meta.pro ? (
    <ProGate>
      {calculatorContent}
    </ProGate>
  ) : (
    calculatorContent
  );

  return (
    <CalculatorLayout config={config} result={calculation?.summary} evidence={calculation || undefined}>
      {calculator}
    </CalculatorLayout>
  );
}

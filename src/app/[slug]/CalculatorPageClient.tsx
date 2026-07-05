"use client";

import { useState } from "react";
import { getCalculatorBySlug } from "@/data/calculators";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import ProGate from "@/components/billing/ProGate";

// Calculator components
import OhmsLawCalc from "@/components/calculators/OhmsLawCalc";
import VoltageDividerCalc from "@/components/calculators/VoltageDividerCalc";
import ResistorColorCodeCalc from "@/components/calculators/ResistorColorCodeCalc";
import RCTimeConstantCalc from "@/components/calculators/RCTimeConstantCalc";
import PowerCalc from "@/components/calculators/PowerCalc";
import ParallelResistorCalc from "@/components/calculators/ParallelResistorCalc";
import SeriesResistorCalc from "@/components/calculators/SeriesResistorCalc";
import ScientificCalc from "@/components/calculators/ScientificCalc";
import LogCalc from "@/components/calculators/LogCalc";
import BaseConverterCalc from "@/components/calculators/BaseConverterCalc";
import EnergyCalc from "@/components/calculators/EnergyCalc";
import FrequencyCalc from "@/components/calculators/FrequencyCalc";
import WavelengthCalc from "@/components/calculators/WavelengthCalc";
import DbToVoltageCalc from "@/components/calculators/DbToVoltageCalc";
import VoltageToDbCalc from "@/components/calculators/VoltageToDbCalc";
import FreqPeriodCalc from "@/components/calculators/FreqPeriodCalc";
import UniversalCalculator from "@/components/calculators/UniversalCalculator";
import DerivativeCalc from "@/components/calculators/DerivativeCalc";
import IntegralCalc from "@/components/calculators/IntegralCalc";
import LimitCalc from "@/components/calculators/LimitCalc";
import DifferentialEquationCalc from "@/components/calculators/DifferentialEquationCalc";
import TaylorSeriesCalc from "@/components/calculators/TaylorSeriesCalc";
import TriangleCalc from "@/components/calculators/TriangleCalc";
import CircleCalc from "@/components/calculators/CircleCalc";
import PythagoreanCalc from "@/components/calculators/PythagoreanCalc";
import VolumeCalc from "@/components/calculators/VolumeCalc";
import DistanceCalc from "@/components/calculators/DistanceCalc";
import MatrixDeterminantCalc from "@/components/calculators/MatrixDeterminantCalc";
import MatrixInverseCalc from "@/components/calculators/MatrixInverseCalc";
import MatrixMultiplyCalc from "@/components/calculators/MatrixMultiplyCalc";
import LinearSystemCalc from "@/components/calculators/LinearSystemCalc";
import DotCrossProductCalc from "@/components/calculators/DotCrossProductCalc";
import EigenvalueCalc from "@/components/calculators/EigenvalueCalc";

const CALCULATOR_MAP: Record<
  string,
  React.ComponentType<{ onResult: (r: string) => void }>
> = {
  "ohms-law-calculator": OhmsLawCalc,
  "voltage-divider-calculator": VoltageDividerCalc,
  "resistor-color-code-calculator": ResistorColorCodeCalc,
  "rc-time-constant-calculator": RCTimeConstantCalc,
  "power-calculator": PowerCalc,
  "parallel-resistor-calculator": ParallelResistorCalc,
  "series-resistor-calculator": SeriesResistorCalc,
  "scientific-calculator": ScientificCalc,
  "log-calculator": LogCalc,
  "binary-hex-decimal-converter": BaseConverterCalc,
  "energy-calculator": EnergyCalc,
  "frequency-calculator": FrequencyCalc,
  "wavelength-calculator": WavelengthCalc,
  "db-to-voltage-converter": DbToVoltageCalc,
  "voltage-to-db-converter": VoltageToDbCalc,
  "frequency-to-period-converter": FreqPeriodCalc,
  "universal-calculator": UniversalCalculator,
  "derivative-calculator": DerivativeCalc,
  "integral-calculator": IntegralCalc,
  "limit-calculator": LimitCalc,
  "differential-equation-calculator": DifferentialEquationCalc,
  "taylor-series-calculator": TaylorSeriesCalc,
  "triangle-calculator": TriangleCalc,
  "circle-calculator": CircleCalc,
  "pythagorean-calculator": PythagoreanCalc,
  "volume-calculator": VolumeCalc,
  "distance-calculator": DistanceCalc,
  "matrix-determinant-calculator": MatrixDeterminantCalc,
  "matrix-inverse-calculator": MatrixInverseCalc,
  "matrix-multiply-calculator": MatrixMultiplyCalc,
  "linear-system-calculator": LinearSystemCalc,
  "dot-cross-product-calculator": DotCrossProductCalc,
  "eigenvalue-calculator": EigenvalueCalc,
};

export default function CalculatorPageClient({ slug }: { slug: string }) {
  const [result, setResult] = useState("");
  const config = getCalculatorBySlug(slug);
  if (!config) return null;

  const CalcComponent = CALCULATOR_MAP[slug];
  if (!CalcComponent) return null;

  const calculator = config.meta.pro ? (
    <ProGate>
      <CalcComponent onResult={setResult} />
    </ProGate>
  ) : (
    <CalcComponent onResult={setResult} />
  );

  return (
    <CalculatorLayout config={config} result={result}>
      {calculator}
    </CalculatorLayout>
  );
}

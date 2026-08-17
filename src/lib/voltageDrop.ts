import type { WorkStep } from "@/lib/smartMath";

export type Phase = "single" | "three";
export type Conductor = "copper" | "aluminum";

/** Resistivity at 20 °C, Ω·m. */
export const RESISTIVITY_OHM_M: Record<Conductor, number> = {
  copper: 1.68e-8,
  aluminum: 2.65e-8,
};

export type AwgSize = {
  gauge: string;
  diameterMm: number;
  areaMm2: number;
};

/** Common AWG sizes used in branch-circuit and feeder estimates. */
export const AWG_TABLE: AwgSize[] = [
  { gauge: "14", diameterMm: 1.62814, areaMm2: 2.080982 },
  { gauge: "12", diameterMm: 2.05232, areaMm2: 3.309072 },
  { gauge: "10", diameterMm: 2.58826, areaMm2: 5.261244 },
  { gauge: "8", diameterMm: 3.2639, areaMm2: 8.365627 },
  { gauge: "6", diameterMm: 4.1148, areaMm2: 13.30177 },
  { gauge: "4", diameterMm: 5.18922, areaMm2: 21.1507 },
  { gauge: "2", diameterMm: 6.54304, areaMm2: 33.63083 },
  { gauge: "1", diameterMm: 7.34822, areaMm2: 42.40766 },
  { gauge: "1/0", diameterMm: 8.25246, areaMm2: 53.47512 },
  { gauge: "2/0", diameterMm: 9.26592, areaMm2: 67.43086 },
  { gauge: "3/0", diameterMm: 10.4038, areaMm2: 85.02884 },
  { gauge: "4/0", diameterMm: 11.684, areaMm2: 107.2193 },
];

export function findAwg(gauge: string): AwgSize | undefined {
  return AWG_TABLE.find((row) => row.gauge === gauge);
}

export function areaM2FromMm2(areaMm2: number): number {
  return areaMm2 * 1e-6;
}

export function lengthToMetres(length: number, unit: "m" | "ft"): number {
  return unit === "ft" ? length * 0.3048 : length;
}

export function resistancePerMetre(resistivityOhmM: number, areaM2: number): number {
  return resistivityOhmM / areaM2;
}

/**
 * Single-phase: Vd = 2 · I · R · L
 * Three-phase:  Vd = √3 · I · R · L
 * R is conductor resistance per unit length (Ω/m), L is one-way length (m).
 */
export function voltageDropVolts(phase: Phase, currentA: number, rPerMetre: number, lengthM: number): number {
  const k = phase === "single" ? 2 : Math.sqrt(3);
  return k * currentA * rPerMetre * lengthM;
}

export function computeVoltageDrop(input: {
  phase: Phase;
  conductor: Conductor;
  currentA: number;
  length: number;
  lengthUnit: "m" | "ft";
  areaMm2: number;
  sourceVoltage?: number;
}): {
  lengthM: number;
  areaM2: number;
  resistivity: number;
  rPerMetre: number;
  oneWayOhm: number;
  vd: number;
  percent: number | null;
  steps: WorkStep[];
} | null {
  const { phase, conductor, currentA, length, lengthUnit, areaMm2, sourceVoltage } = input;
  if (
    !Number.isFinite(currentA) ||
    !Number.isFinite(length) ||
    !Number.isFinite(areaMm2) ||
    currentA < 0 ||
    length <= 0 ||
    areaMm2 <= 0
  ) {
    return null;
  }

  const resistivity = RESISTIVITY_OHM_M[conductor];
  const lengthM = lengthToMetres(length, lengthUnit);
  const areaM2 = areaM2FromMm2(areaMm2);
  const rPerMetre = resistancePerMetre(resistivity, areaM2);
  const oneWayOhm = rPerMetre * lengthM;
  const k = phase === "single" ? 2 : Math.sqrt(3);
  const kLabel = phase === "single" ? "2" : "√3";
  const vd = voltageDropVolts(phase, currentA, rPerMetre, lengthM);
  const percent =
    sourceVoltage !== undefined && Number.isFinite(sourceVoltage) && sourceVoltage !== 0
      ? (vd / sourceVoltage) * 100
      : null;

  const steps: WorkStep[] = [
    {
      label: "Resistivity (20 °C)",
      value: `ρ_${conductor} = ${resistivity} Ω·m`,
    },
    {
      label: "Cross-section",
      value: `A = ${areaMm2} mm² = ${areaM2.toExponential(6)} m²`,
    },
    {
      label: "Resistance per metre",
      value: `R = ρ / A = ${rPerMetre.toPrecision(8)} Ω/m`,
    },
    {
      label: "One-way length",
      value:
        lengthUnit === "ft"
          ? `L = ${length} ft × 0.3048 = ${lengthM.toPrecision(8)} m`
          : `L = ${lengthM.toPrecision(8)} m`,
    },
    {
      label: "One-way conductor resistance",
      value: `R·L = ${oneWayOhm.toPrecision(8)} Ω`,
    },
    {
      label: phase === "single" ? "Single-phase drop" : "Three-phase drop",
      value: `Vd = ${kLabel} × I × R × L = ${k.toPrecision(8)} × ${currentA} × ${rPerMetre.toPrecision(6)} × ${lengthM.toPrecision(6)}`,
    },
    { label: "Voltage drop", value: `${vd.toPrecision(8)} V` },
  ];

  if (percent !== null) {
    steps.push({
      label: "Percent drop",
      value: `Vd / Vs × 100 = ${percent.toPrecision(6)} %`,
    });
  }

  return { lengthM, areaM2, resistivity, rPerMetre, oneWayOhm, vd, percent, steps };
}

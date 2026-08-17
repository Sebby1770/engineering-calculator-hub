import type { WorkStep } from "@/lib/smartMath";

export function dbFromPowerRatio(p2: number, p1: number): number | null {
  if (!Number.isFinite(p1) || !Number.isFinite(p2) || p1 <= 0 || p2 <= 0) return null;
  return 10 * Math.log10(p2 / p1);
}

export function dbFromVoltageRatio(v2: number, v1: number): number | null {
  if (!Number.isFinite(v1) || !Number.isFinite(v2) || v1 === 0) return null;
  const ratio = Math.abs(v2 / v1);
  if (ratio <= 0) return null;
  return 20 * Math.log10(ratio);
}

export function linearPowerFromDb(db: number): number {
  return 10 ** (db / 10);
}

export function dbFromLinearPower(linear: number): number | null {
  if (!Number.isFinite(linear) || linear <= 0) return null;
  return 10 * Math.log10(linear);
}

/** Independent uncorrelated sources: convert each dB to power, sum, convert back. */
export function sumIndependentDb(levels: number[]): number | null {
  if (levels.length === 0 || levels.some((value) => !Number.isFinite(value))) return null;
  const linear = levels.reduce((sum, db) => sum + linearPowerFromDb(db), 0);
  return dbFromLinearPower(linear);
}

export function subtractIndependentDb(minuend: number, subtrahend: number): number | null {
  if (!Number.isFinite(minuend) || !Number.isFinite(subtrahend)) return null;
  return dbFromLinearPower(linearPowerFromDb(minuend) - linearPowerFromDb(subtrahend));
}

export function powerRatioSteps(p2: number, p1: number): { result: string; steps: WorkStep[] } | null {
  const db = dbFromPowerRatio(p2, p1);
  if (db === null) return null;
  const ratio = p2 / p1;
  const result = `${db.toPrecision(8)} dB`;
  return {
    result,
    steps: [
      { label: "Power ratio", value: `P₂ / P₁ = ${p2} / ${p1} = ${ratio.toPrecision(8)}` },
      { label: "Definition", value: "dB = 10 × log₁₀(P₂ / P₁)" },
      { label: "Substitute", value: `dB = 10 × log₁₀(${ratio.toPrecision(8)})` },
      { label: "Result", value: result },
    ],
  };
}

export function voltageRatioSteps(v2: number, v1: number): { result: string; steps: WorkStep[] } | null {
  const db = dbFromVoltageRatio(v2, v1);
  if (db === null) return null;
  const ratio = Math.abs(v2 / v1);
  const result = `${db.toPrecision(8)} dB`;
  return {
    result,
    steps: [
      { label: "Voltage ratio", value: `|V₂ / V₁| = |${v2} / ${v1}| = ${ratio.toPrecision(8)}` },
      { label: "Definition", value: "dB = 20 × log₁₀(|V₂ / V₁|)" },
      { label: "Substitute", value: `dB = 20 × log₁₀(${ratio.toPrecision(8)})` },
      { label: "Result", value: result },
    ],
  };
}

export function combineDbSteps(
  levels: number[],
  mode: "sum" | "difference",
): { result: string; steps: WorkStep[] } | null {
  if (mode === "difference") {
    if (levels.length < 2) return null;
    const [a, b] = levels;
    const linA = linearPowerFromDb(a);
    const linB = linearPowerFromDb(b);
    const db = subtractIndependentDb(a, b);
    const steps: WorkStep[] = [
      { label: "Linear power (A)", value: `10^(${a}/10) = ${linA.toPrecision(8)}` },
      { label: "Linear power (B)", value: `10^(${b}/10) = ${linB.toPrecision(8)}` },
      { label: "Subtract", value: `${linA.toPrecision(8)} − ${linB.toPrecision(8)} = ${(linA - linB).toPrecision(8)}` },
    ];
    if (db === null) {
      return {
        result: "Difference is not positive — cannot form a real dB value",
        steps: [...steps, { label: "Result", value: "Linear difference ≤ 0" }],
      };
    }
    const result = `${db.toPrecision(8)} dB`;
    steps.push({ label: "Back to dB", value: `10 × log₁₀(Δ) = ${result}` });
    return { result, steps };
  }

  const db = sumIndependentDb(levels);
  if (db === null) return null;
  const steps: WorkStep[] = levels.map((level, index) => ({
    label: `Source ${index + 1} → linear`,
    value: `10^(${level}/10) = ${linearPowerFromDb(level).toPrecision(8)}`,
  }));
  const linearSum = levels.reduce((sum, level) => sum + linearPowerFromDb(level), 0);
  steps.push({ label: "Sum of powers", value: `${linearSum.toPrecision(8)}` });
  const result = `${db.toPrecision(8)} dB`;
  steps.push({ label: "Combined level", value: `10 × log₁₀(Σ) = ${result}` });
  return { result, steps };
}

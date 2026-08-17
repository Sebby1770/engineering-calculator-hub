import { describe, expect, it } from "vitest";
import { computeVoltageDrop, voltageDropVolts } from "@/lib/voltageDrop";

describe("voltageDropVolts", () => {
  it("uses Vd = 2·I·R·L for single-phase", () => {
    expect(voltageDropVolts("single", 10, 0.01, 20)).toBeCloseTo(4, 12);
  });

  it("uses Vd = √3·I·R·L for three-phase", () => {
    expect(voltageDropVolts("three", 10, 0.01, 20)).toBeCloseTo(Math.sqrt(3) * 2, 12);
  });
});

describe("computeVoltageDrop", () => {
  it("returns null for invalid inputs", () => {
    expect(
      computeVoltageDrop({
        phase: "single",
        conductor: "copper",
        currentA: 10,
        length: 0,
        lengthUnit: "m",
        areaMm2: 3.31,
      }),
    ).toBeNull();
  });

  it("includes percent drop when a source voltage is provided", () => {
    const evaluation = computeVoltageDrop({
      phase: "single",
      conductor: "copper",
      currentA: 15,
      length: 30,
      lengthUnit: "m",
      areaMm2: 3.31,
      sourceVoltage: 120,
    });
    expect(evaluation).not.toBeNull();
    expect(evaluation!.vd).toBeGreaterThan(0);
    expect(evaluation!.percent).toBeCloseTo((evaluation!.vd / 120) * 100, 10);
    expect(evaluation!.steps.some((step) => /single-phase/i.test(step.label))).toBe(true);
  });
});

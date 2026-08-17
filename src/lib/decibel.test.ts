import { describe, expect, it } from "vitest";
import {
  dbFromPowerRatio,
  dbFromVoltageRatio,
  subtractIndependentDb,
  sumIndependentDb,
} from "@/lib/decibel";

describe("decibel helpers", () => {
  it("converts a 2:1 power ratio to about 3.01 dB", () => {
    expect(dbFromPowerRatio(2, 1)).toBeCloseTo(10 * Math.log10(2), 12);
  });

  it("uses the factor of 20 for voltages", () => {
    expect(dbFromVoltageRatio(10, 1)).toBeCloseTo(20, 12);
  });

  it("adds independent sources in the linear domain", () => {
    expect(sumIndependentDb([0, 0])).toBeCloseTo(10 * Math.log10(2), 12);
  });

  it("subtracts independent sources in the linear domain", () => {
    expect(subtractIndependentDb(10, 3)).toBeCloseTo(10 * Math.log10(10 - 10 ** 0.3), 10);
    expect(subtractIndependentDb(0, 10)).toBeNull();
  });
});

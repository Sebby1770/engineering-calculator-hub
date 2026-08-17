import { describe, expect, it } from "vitest";
import {
  celsiusFrom,
  celsiusTo,
  convert,
  convertWithSteps,
  getUnit,
  getUnits,
  isUnitCategory,
} from "@/lib/units";

describe("unit metadata", () => {
  it("lists units for each supported category", () => {
    expect(isUnitCategory("length")).toBe(true);
    expect(isUnitCategory("widgets")).toBe(false);
    expect(getUnits("length").some((unit) => unit.id === "m")).toBe(true);
    expect(getUnit("mass", "lb")?.toSi).toBe(0.45359237);
  });
});

describe("convert — length / mass / pressure / energy / frequency", () => {
  it("uses exact length factors", () => {
    expect(convert(1, "m", "cm", "length")).toBe(100);
    expect(convert(1, "in", "mm", "length")).toBeCloseTo(25.4, 12);
    expect(convert(1, "ft", "m", "length")).toBe(0.3048);
    expect(convert(1, "mi", "m", "length")).toBe(1609.344);
    expect(convert(1, "nmi", "m", "length")).toBe(1852);
  });

  it("uses exact mass factors", () => {
    expect(convert(1, "kg", "g", "mass")).toBe(1000);
    expect(convert(1, "lb", "kg", "mass")).toBe(0.45359237);
    expect(convert(16, "oz", "lb", "mass")).toBeCloseTo(1, 12);
  });

  it("uses exact pressure factors", () => {
    expect(convert(1, "atm", "Pa", "pressure")).toBe(101325);
    expect(convert(1, "bar", "Pa", "pressure")).toBe(100000);
    expect(convert(760, "torr", "atm", "pressure")).toBeCloseTo(1, 12);
  });

  it("uses exact energy factors", () => {
    expect(convert(1, "kWh", "J", "energy")).toBe(3.6e6);
    expect(convert(1, "cal", "J", "energy")).toBe(4.184);
    expect(convert(1, "eV", "J", "energy")).toBe(1.602176634e-19);
  });

  it("uses exact frequency factors", () => {
    expect(convert(1, "kHz", "Hz", "frequency")).toBe(1000);
    expect(convert(60, "rpm", "Hz", "frequency")).toBe(1);
    expect(convert(1, "GHz", "MHz", "frequency")).toBe(1000);
  });

  it("round-trips linear units", () => {
    const value = convert(convert(12.5, "ft", "mm", "length"), "mm", "ft", "length");
    expect(value).toBeCloseTo(12.5, 10);
  });
});

describe("convert — temperature (affine)", () => {
  it("converts through the Celsius pivot", () => {
    expect(convert(0, "C", "F", "temperature")).toBe(32);
    expect(convert(100, "C", "F", "temperature")).toBe(212);
    expect(convert(32, "F", "C", "temperature")).toBe(0);
    expect(convert(0, "C", "K", "temperature")).toBeCloseTo(273.15, 12);
    expect(convert(273.15, "K", "C", "temperature")).toBeCloseTo(0, 12);
    expect(convert(-40, "C", "F", "temperature")).toBe(-40);
    expect(convert(-40, "F", "C", "temperature")).toBe(-40);
  });

  it("exposes the affine helpers", () => {
    expect(celsiusFrom(212, "F")).toBe(100);
    expect(celsiusTo(100, "F")).toBe(212);
    expect(celsiusTo(celsiusFrom(300, "K"), "K")).toBeCloseTo(300, 12);
  });
});

describe("convert — errors", () => {
  it("rejects unknown units and non-finite values", () => {
    expect(() => convert(1, "parsec", "m", "length")).toThrow(/unknown/i);
    expect(() => convert(Number.NaN, "m", "ft", "length")).toThrow(/finite/i);
  });
});

describe("convertWithSteps", () => {
  it("returns a numeric result and labeled steps", () => {
    const conversion = convertWithSteps(1, "m", "ft", "length");
    expect(conversion.result).toBeCloseTo(1 / 0.3048, 10);
    expect(conversion.steps.length).toBeGreaterThanOrEqual(3);
  });

  it("explains the Celsius pivot for temperature", () => {
    const conversion = convertWithSteps(0, "C", "F", "temperature");
    expect(conversion.result).toBe(32);
    expect(conversion.steps.some((step) => /celsius/i.test(step.label + step.value))).toBe(true);
  });
});

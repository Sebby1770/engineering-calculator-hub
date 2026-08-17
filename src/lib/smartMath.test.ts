import { describe, expect, it } from "vitest";
import { smartEvaluate } from "@/lib/smartMath";

describe("smartEvaluate", () => {
  it("solves the quadratic x^2-5x+6=0", () => {
    const evaluation = smartEvaluate("x^2-5x+6=0");
    expect(evaluation.kind).toMatch(/quadratic/i);
    expect(evaluation.result).toMatch(/3/);
    expect(evaluation.result).toMatch(/2/);
    expect(evaluation.steps.length).toBeGreaterThan(0);
    expect(evaluation.steps.some((step) => /discriminant/i.test(step.label))).toBe(true);
  });

  it("differentiates a polynomial", () => {
    const evaluation = smartEvaluate("derivative(x^2, x)");
    expect(evaluation.kind).toMatch(/derivative/i);
    expect(evaluation.result.replace(/\s+/g, "")).toMatch(/2\*x|2x/);
  });

  it("evaluates a simple expression", () => {
    const evaluation = smartEvaluate("2 + 2 * 3");
    expect(evaluation.result).toBe("8");
    expect(evaluation.kind).toBe("expression");
  });
});

import { create, all } from "mathjs";
import { numericalLimit, simpsonIntegral } from "@/lib/mathUtils";

const math = create(all);

type SolvableMath = {
  solve: (equation: unknown, variable: string) => unknown;
};

type IntegrableNode = {
  integrate: (variable: string) => { toString: () => string; evaluate: (scope: Record<string, number>) => number };
};

function integrateAndSimplify(fn: string, variable: string) {
  const integrated = (math.parse(fn) as unknown as IntegrableNode).integrate(variable);
  return math.simplify(math.parse(integrated.toString()));
}

export type WorkStep = {
  label: string;
  value: string;
};

export type SmartEvaluation = {
  result: string;
  kind: string;
  steps: WorkStep[];
};

function formatValue(value: unknown): string {
  return math.format(value, { precision: 12, lowerExp: -9, upperExp: 12 });
}

function normalizeEquation(expression: string): string {
  return expression.replace(/\s+/g, " ").trim();
}

function detectKind(expression: string): string {
  const trimmed = normalizeEquation(expression);
  if (/=/.test(trimmed) && /solve\s*\(/i.test(trimmed)) return "equation";
  if (/=/.test(trimmed) && /[a-zA-Z]/.test(trimmed)) return "equation";
  if (/^d\/d[a-zA-Z]/.test(trimmed) || /^derivative\s*\(/i.test(trimmed)) return "derivative";
  if (/^integrate\s*\(/i.test(trimmed) || /∫/.test(trimmed)) return "integral";
  if (/^simplify\s*\(/i.test(trimmed)) return "simplify";
  if (/^det\s*\(/i.test(trimmed) || /^inv\s*\(/i.test(trimmed)) return "matrix";
  if (/^limit\s*\(/i.test(trimmed) || /^lim\s*\(/i.test(trimmed)) return "limit";
  return "expression";
}

function parseQuadratic(expression: string): { a: number; b: number; c: number } | null {
  const eq = normalizeEquation(expression).replace(/\s*=\s*0\s*$/, "");
  const compiled = math.compile(eq);
  const evaluateAt = (x: number) => Number(compiled.evaluate({ x }));

  const f0 = evaluateAt(0);
  const f1 = evaluateAt(1);
  const f2 = evaluateAt(2);
  const c = f0;
  const a = (f2 - 2 * f1 + c) / 2;
  const b = f1 - a - c;

  if (![a, b, c].every((value) => Number.isFinite(value))) return null;
  if (Math.abs(a) < 1e-12) return null;
  return { a, b, c };
}

function solveQuadraticWithSteps(expression: string): SmartEvaluation | null {
  const coeffs = parseQuadratic(expression);
  if (!coeffs) return null;

  const { a, b, c } = coeffs;
  const discriminant = b * b - 4 * a * c;
  const steps: WorkStep[] = [
    { label: "Standard form", value: `${a}x² + ${b}x + ${c} = 0` },
    { label: "Discriminant", value: `Δ = b² − 4ac = ${discriminant.toPrecision(10)}` },
  ];

  if (discriminant < 0) {
    const real = (-b / (2 * a)).toPrecision(10);
    const imag = (Math.sqrt(-discriminant) / (2 * a)).toPrecision(10);
    const result = `x = ${real} ± ${imag}i`;
    steps.push({ label: "Complex roots", value: result });
    return { result, kind: "Quadratic equation", steps };
  }

  const sqrtDelta = Math.sqrt(discriminant);
  const x1 = (-b + sqrtDelta) / (2 * a);
  const x2 = (-b - sqrtDelta) / (2 * a);
  const result =
    Math.abs(x1 - x2) < 1e-10
      ? `x = ${x1.toPrecision(10)} (repeated root)`
      : `x₁ = ${x1.toPrecision(10)}, x₂ = ${x2.toPrecision(10)}`;

  steps.push({ label: "Apply quadratic formula", value: "x = (−b ± √Δ) / 2a" });
  if (Math.abs(x1 - x2) >= 1e-10) {
    const r1 = Math.abs(x1) < 1e-10 ? 0 : x1;
    const r2 = Math.abs(x2) < 1e-10 ? 0 : x2;
    const sign1 = r1 >= 0 ? `- ${r1}` : `+ ${Math.abs(r1)}`;
    const sign2 = r2 >= 0 ? `- ${r2}` : `+ ${Math.abs(r2)}`;
    steps.push({ label: "Factor form", value: `(x ${sign1})(x ${sign2}) = 0` });
  }
  steps.push({ label: "Roots", value: result });
  return { result, kind: "Quadratic equation", steps };
}

function tryEquationSolve(expression: string): SmartEvaluation | null {
  const trimmed = normalizeEquation(expression);
  const quadratic = solveQuadraticWithSteps(trimmed);
  if (quadratic) return quadratic;

  const solveMatch = trimmed.match(/^solve\s*\((.+),\s*([a-zA-Z]+)\s*\)$/i);
  const equation = solveMatch ? solveMatch[1] : trimmed.includes("=") ? trimmed : null;
  const variable = solveMatch?.[2] ?? "x";

  if (!equation) return null;

  try {
    const solutions = (math as unknown as SolvableMath).solve(math.parse(equation), variable);
    const formatted = Array.isArray(solutions)
      ? solutions.map((value, index) => `${variable}${index + 1} = ${formatValue(value)}`).join(", ")
      : `${variable} = ${formatValue(solutions)}`;

    return {
      result: formatted,
      kind: "Equation solver",
      steps: [
        { label: "Equation", value: equation },
        { label: "Solve for", value: variable },
        { label: "Solutions", value: formatted },
      ],
    };
  } catch {
    return null;
  }
}

function tryDerivative(expression: string): SmartEvaluation | null {
  const match = expression.match(/^derivative\s*\((.+),\s*([a-zA-Z]+)\s*\)$/i);
  if (!match) return null;

  const [, fn, variable] = match;
  const derivative = math.simplify(math.derivative(fn, variable));
  const result = derivative.toString();

  return {
    result,
    kind: "Derivative",
    steps: [
      { label: "Function", value: `f(${variable}) = ${fn}` },
      { label: "Differentiate", value: `d/d${variable}` },
      { label: "Result", value: `f'(${variable}) = ${result}` },
    ],
  };
}

function tryIntegral(expression: string): SmartEvaluation | null {
  const match = expression.match(/^integrate\s*\((.+),\s*([a-zA-Z]+)(?:,\s*([^,]+),\s*([^)]+))?\s*\)$/i);
  if (!match) return null;

  const [, fn, variable, lower, upper] = match;
  if (lower !== undefined && upper !== undefined) {
    const a = parseFloat(lower);
    const b = parseFloat(upper);
    const compiled = math.compile(fn);
    const numeric = simpsonIntegral((x) => Number(compiled.evaluate({ [variable]: x })), a, b);
    const result = formatValue(numeric);

    return {
      result,
      kind: "Definite integral",
      steps: [
        { label: "Integrand", value: fn },
        { label: "Bounds", value: `[${a}, ${b}]` },
        { label: "Simpson estimate", value: result },
      ],
    };
  }

  try {
    const antiderivative = integrateAndSimplify(fn, variable);
    const result = antiderivative.toString();
    return {
      result: `∫ ${fn} d${variable} = ${result} + C`,
      kind: "Indefinite integral",
      steps: [
        { label: "Integrand", value: fn },
        { label: "Antiderivative", value: result },
      ],
    };
  } catch {
    return null;
  }
}

function tryLimit(expression: string): SmartEvaluation | null {
  const limitMatch = expression.match(/^limit\s*\((.+),\s*([a-zA-Z]+)\s*,\s*([^)]+)\s*\)$/i);
  const limMatch = expression.match(/^lim\s*\(\s*([a-zA-Z]+)\s*->\s*([^,]+)\s*,\s*(.+)\s*\)$/i);
  const fn = limitMatch?.[1] ?? limMatch?.[3];
  const variable = limitMatch?.[2] ?? limMatch?.[1];
  const pointText = limitMatch?.[3] ?? limMatch?.[2];

  if (!fn || !variable || pointText === undefined) return null;

  const point = Number(math.evaluate(pointText));
  if (!Number.isFinite(point)) return null;

  return limitWithSteps(fn, variable, point, "both");
}

function tryMatrix(expression: string): SmartEvaluation | null {
  const detMatch = expression.match(/^det\s*\((.+)\)$/i);
  if (detMatch) {
    try {
      const matrix = math.evaluate(detMatch[1]) as number[][];
      const det = math.det(matrix) as number;
      const result = formatValue(det);
      return {
        result,
        kind: "Matrix determinant",
        steps: [
          { label: "Matrix", value: detMatch[1] },
          { label: "Determinant", value: `det(A) = ${result}` },
        ],
      };
    } catch {
      return null;
    }
  }

  const invMatch = expression.match(/^inv\s*\((.+)\)$/i);
  if (invMatch) {
    try {
      const matrix = math.evaluate(invMatch[1]) as number[][];
      const inverse = math.inv(matrix) as number[][];
      const result = inverse.map((row) => `[${row.map((value) => formatValue(value)).join(", ")}]`).join("\n");
      return {
        result,
        kind: "Matrix inverse",
        steps: [
          { label: "Matrix", value: invMatch[1] },
          { label: "Inverse", value: result },
        ],
      };
    } catch {
      return null;
    }
  }

  return null;
}

function trySimplify(expression: string): SmartEvaluation | null {
  const match = expression.match(/^simplify\s*\((.+)\)$/i);
  if (!match) return null;

  const simplified = math.simplify(match[1]);
  const result = simplified.toString();
  return {
    result,
    kind: "Simplification",
    steps: [
      { label: "Input", value: match[1] },
      { label: "Simplified", value: result },
    ],
  };
}

export function smartEvaluate(expression: string): SmartEvaluation {
  const trimmed = normalizeEquation(expression);
  const kind = detectKind(trimmed);

  const specialized =
    tryEquationSolve(trimmed) ??
    tryDerivative(trimmed) ??
    tryIntegral(trimmed) ??
    tryLimit(trimmed) ??
    tryMatrix(trimmed) ??
    trySimplify(trimmed);

  if (specialized) return specialized;

  try {
    const parsed = math.parse(trimmed);
    const simplified = math.simplify(parsed);
    const simplifiedText = simplified.toString();
    const evaluated = simplified.evaluate();
    const result = formatValue(evaluated);

    const steps: WorkStep[] = [{ label: "Input", value: trimmed }];
    if (simplifiedText !== trimmed) {
      steps.push({ label: "Simplified", value: simplifiedText });
    }
    steps.push({ label: "Evaluated", value: result });

    return { result, kind, steps };
  } catch {
    const evaluated = math.evaluate(trimmed);
    return {
      result: formatValue(evaluated),
      kind,
      steps: [
        { label: "Input", value: trimmed },
        { label: "Evaluated", value: formatValue(evaluated) },
      ],
    };
  }
}

export function derivativeWithSteps(expression: string, variable: string, at?: number): SmartEvaluation {
  const derivative = math.simplify(math.derivative(expression, variable));
  const symbolic = derivative.toString();
  const steps: WorkStep[] = [
    { label: "Function", value: `f(${variable}) = ${expression}` },
    { label: "First derivative", value: `f'(${variable}) = ${symbolic}` },
  ];

  if (at !== undefined && Number.isFinite(at)) {
    const numeric = Number(derivative.evaluate({ [variable]: at }));
    steps.push({ label: `Evaluate at ${variable} = ${at}`, value: formatValue(numeric) });
    return {
      result: `f'(${at}) = ${formatValue(numeric)}`,
      kind: "Derivative",
      steps,
    };
  }

  return { result: symbolic, kind: "Derivative", steps };
}

export function integralWithSteps(
  expression: string,
  variable: string,
  lower: number,
  upper: number,
): SmartEvaluation {
  const compiled = math.compile(expression);
  const numeric = simpsonIntegral((x) => Number(compiled.evaluate({ [variable]: x })), lower, upper);
  const steps: WorkStep[] = [
    { label: "Integrand", value: expression },
    { label: "Variable", value: variable },
    { label: "Bounds", value: `[${lower}, ${upper}]` },
  ];

  try {
    const antiderivative = integrateAndSimplify(expression, variable);
    const antiText = antiderivative.toString();
    const fa = Number(antiderivative.evaluate({ [variable]: upper }));
    const fb = Number(antiderivative.evaluate({ [variable]: lower }));
    const symbolic = fa - fb;
    steps.push({ label: "Antiderivative", value: `F(${variable}) = ${antiText}` });
    steps.push({ label: "Fundamental theorem", value: `F(${upper}) − F(${lower}) = ${formatValue(symbolic)}` });
  } catch {
    steps.push({ label: "Symbolic form", value: "No closed-form antiderivative detected" });
  }

  steps.push({ label: "Simpson estimate", value: formatValue(numeric) });
  return {
    result: formatValue(numeric),
    kind: "Definite integral",
    steps,
  };
}

export function linearSystemWithSteps(matrix: number[][], vector: number[]): SmartEvaluation | null {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  const steps: WorkStep[] = [
    {
      label: "Augmented matrix",
      value: augmented.map((row) => `[${row.map((value) => value.toPrecision(6)).join(", ")}]`).join("\n"),
    },
  ];

  for (let pivot = 0; pivot < size; pivot += 1) {
    let maxRow = pivot;
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[maxRow][pivot])) {
        maxRow = row;
      }
    }

    if (Math.abs(augmented[maxRow][pivot]) < 1e-12) {
      return null;
    }

    if (maxRow !== pivot) {
      [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];
      steps.push({ label: `Swap row ${pivot + 1} and ${maxRow + 1}`, value: "Pivot selection" });
    }

    for (let row = pivot + 1; row < size; row += 1) {
      const factor = augmented[row][pivot] / augmented[pivot][pivot];
      for (let col = pivot; col <= size; col += 1) {
        augmented[row][col] -= factor * augmented[pivot][col];
      }
      steps.push({
        label: `Eliminate row ${row + 1}`,
        value: `R${row + 1} ← R${row + 1} − (${factor.toPrecision(6)})R${pivot + 1}`,
      });
    }
  }

  const solution = Array.from({ length: size }, () => 0);
  for (let row = size - 1; row >= 0; row -= 1) {
    let sum = augmented[row][size];
    for (let col = row + 1; col < size; col += 1) {
      sum -= augmented[row][col] * solution[col];
    }
    solution[row] = sum / augmented[row][row];
  }

  const labels = size === 2 ? ["x", "y"] : ["x", "y", "z"];
  const result = solution.map((value, index) => `${labels[index]} = ${value.toPrecision(10)}`).join(", ");
  steps.push({ label: "Back substitution", value: result });

  return { result, kind: "Linear system", steps };
}

export function limitWithSteps(
  expression: string,
  variable: string,
  point: number,
  direction: "both" | "left" | "right" = "both",
): SmartEvaluation {
  const compiled = math.compile(expression);
  const evaluate = (x: number) => Number(compiled.evaluate({ [variable]: x }));
  const limit = numericalLimit(evaluate, point, direction);
  const steps: WorkStep[] = [
    { label: "Expression", value: `f(${variable}) = ${expression}` },
    { label: "Approach", value: `${variable} → ${point} (${direction === "both" ? "two-sided" : direction})` },
  ];

  const probeSteps = [1e-2, 1e-4, 1e-6];
  for (const step of probeSteps) {
    if (direction === "both" || direction === "right") {
      const value = evaluate(point + step);
      if (Number.isFinite(value)) {
        steps.push({ label: `Sample at ${variable} = ${point + step}`, value: formatValue(value) });
      }
    }
    if (direction === "both" || direction === "left") {
      const value = evaluate(point - step);
      if (Number.isFinite(value)) {
        steps.push({ label: `Sample at ${variable} = ${point - step}`, value: formatValue(value) });
      }
    }
  }

  if (limit === null) {
    steps.push({ label: "Estimate", value: "Limit could not be estimated numerically" });
    return {
      result: "Undefined / could not estimate",
      kind: "Limit",
      steps,
    };
  }

  try {
    const derivative = math.simplify(math.derivative(expression, variable));
    const direct = Number(derivative.evaluate({ [variable]: point }));
    if (Number.isFinite(direct) && Math.abs(direct - limit) < 1e-4) {
      steps.push({ label: "Direct substitution", value: `f(${point}) = ${formatValue(direct)}` });
    }
  } catch {
    // Expression may be undefined at the approach point; numerical limit still applies.
  }

  steps.push({ label: "Richardson estimate", value: formatValue(limit) });
  return {
    result: `lim(${variable}→${point}) ${expression} ≈ ${formatValue(limit)}`,
    kind: "Limit",
    steps,
  };
}

export function ohmsLawWithSteps(
  solveFor: "voltage" | "current" | "resistance",
  voltage?: number,
  current?: number,
  resistance?: number,
): SmartEvaluation | null {
  const v = voltage;
  const i = current;
  const r = resistance;

  const steps: WorkStep[] = [{ label: "Ohm's law", value: "V = I × R" }];

  if (solveFor === "voltage") {
    if (i === undefined || r === undefined || !Number.isFinite(i) || !Number.isFinite(r)) return null;
    const result = i * r;
    steps.push({ label: "Rearrange", value: "V = I × R" });
    steps.push({ label: "Substitute", value: `V = ${i} × ${r}` });
    steps.push({ label: "Result", value: `${result.toPrecision(10)} V` });
    return { result: `${result.toPrecision(10)} V`, kind: "Ohm's law", steps };
  }

  if (solveFor === "current") {
    if (v === undefined || r === undefined || !Number.isFinite(v) || !Number.isFinite(r) || r === 0) return null;
    const result = v / r;
    steps.push({ label: "Rearrange", value: "I = V / R" });
    steps.push({ label: "Substitute", value: `I = ${v} / ${r}` });
    steps.push({ label: "Result", value: `${result.toPrecision(10)} A` });
    return { result: `${result.toPrecision(10)} A`, kind: "Ohm's law", steps };
  }

  if (v === undefined || i === undefined || !Number.isFinite(v) || !Number.isFinite(i) || i === 0) return null;
  const result = v / i;
  steps.push({ label: "Rearrange", value: "R = V / I" });
  steps.push({ label: "Substitute", value: `R = ${v} / ${i}` });
  steps.push({ label: "Result", value: `${result.toPrecision(10)} Ω` });
  return { result: `${result.toPrecision(10)} Ω`, kind: "Ohm's law", steps };
}
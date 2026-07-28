export interface QuadraticRoot {
  real: number;
  imaginary: number;
}

export interface QuadraticSolution {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  roots: [QuadraticRoot, QuadraticRoot];
}

interface PolynomialCoefficients {
  quadratic: number;
  linear: number;
  constant: number;
}

const NUMBER_SOURCE = String.raw`(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?`;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitSignedTerms(expression: string): string[] {
  const terms: string[] = [];
  let start = 0;

  for (let index = 1; index < expression.length; index += 1) {
    const character = expression[index];
    const previous = expression[index - 1];
    if ((character === "+" || character === "-") && previous !== "e" && previous !== "E") {
      terms.push(expression.slice(start, index));
      start = index;
    }
  }

  terms.push(expression.slice(start));
  return terms.filter(Boolean);
}

function parsePolynomialSide(expression: string, variable: string): PolynomialCoefficients | null {
  let normalized = expression
    .replace(/\s+/g, "")
    .replaceAll("−", "-")
    .replaceAll("–", "-")
    .replaceAll("×", "*")
    .replaceAll("**", "^")
    .replaceAll("²", "^2");

  if (!normalized) return null;
  if (normalized[0] !== "+" && normalized[0] !== "-") normalized = `+${normalized}`;

  const escapedVariable = escapeRegExp(variable);
  const quadraticPattern = new RegExp(
    `^(?:(${NUMBER_SOURCE})\\*?)?${escapedVariable}\\^2$`,
    "i",
  );
  const linearPattern = new RegExp(`^(?:(${NUMBER_SOURCE})\\*?)?${escapedVariable}$`, "i");
  const constantPattern = new RegExp(`^${NUMBER_SOURCE}$`, "i");
  const coefficients: PolynomialCoefficients = { quadratic: 0, linear: 0, constant: 0 };

  for (const term of splitSignedTerms(normalized)) {
    const sign = term[0] === "-" ? -1 : 1;
    const body = term.slice(1);
    if (!body) return null;

    const quadraticMatch = body.match(quadraticPattern);
    if (quadraticMatch) {
      coefficients.quadratic += sign * Number(quadraticMatch[1] ?? 1);
      continue;
    }

    const linearMatch = body.match(linearPattern);
    if (linearMatch) {
      coefficients.linear += sign * Number(linearMatch[1] ?? 1);
      continue;
    }

    if (constantPattern.test(body)) {
      coefficients.constant += sign * Number(body);
      continue;
    }

    // Refuse to infer coefficients from samples. Unsupported functions or
    // higher-order terms must not be presented as a quadratic solution.
    return null;
  }

  return Object.values(coefficients).every(Number.isFinite) ? coefficients : null;
}

export function solveQuadraticEquation(
  expression: string,
  variable = "x",
): QuadraticSolution | null {
  if (!/^[a-zA-Z]$/.test(variable)) return null;

  const sides = expression.split("=");
  if (sides.length > 2) return null;

  const left = parsePolynomialSide(sides[0], variable);
  const right = sides.length === 2
    ? parsePolynomialSide(sides[1], variable)
    : { quadratic: 0, linear: 0, constant: 0 };
  if (!left || !right) return null;

  const a = left.quadratic - right.quadratic;
  const b = left.linear - right.linear;
  const c = left.constant - right.constant;
  if (![a, b, c].every(Number.isFinite) || Math.abs(a) < 1e-12) return null;

  const rawDiscriminant = b * b - 4 * a * c;
  const discriminantTolerance = 1e-12 * Math.max(1, b * b, Math.abs(4 * a * c));
  const discriminant = Math.abs(rawDiscriminant) <= discriminantTolerance
    ? 0
    : rawDiscriminant;

  if (discriminant < 0) {
    const real = -b / (2 * a);
    const imaginary = Math.sqrt(-discriminant) / Math.abs(2 * a);
    return {
      a,
      b,
      c,
      discriminant,
      roots: [
        { real, imaginary },
        { real, imaginary: -imaginary },
      ],
    };
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  if (sqrtDiscriminant === 0) {
    const root = -b / (2 * a);
    return {
      a,
      b,
      c,
      discriminant,
      roots: [
        { real: root, imaginary: 0 },
        { real: root, imaginary: 0 },
      ],
    };
  }

  // This equivalent form avoids losing the smaller root to cancellation when
  // |b| is much larger than the discriminant contribution.
  const q = -0.5 * (b + (b >= 0 ? sqrtDiscriminant : -sqrtDiscriminant));
  const first = q / a;
  const second = c / q;

  return {
    a,
    b,
    c,
    discriminant,
    roots: [
      { real: first, imaginary: 0 },
      { real: second, imaginary: 0 },
    ],
  };
}

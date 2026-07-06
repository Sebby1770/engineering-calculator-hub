export type Matrix = number[][];

export function parseMatrix(text: string, rows: number, cols: number): Matrix | null {
  const values = text
    .split(/[\s,;]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);

  if (values.length !== rows * cols || values.some((value) => Number.isNaN(value))) {
    return null;
  }

  const matrix: Matrix = [];
  for (let row = 0; row < rows; row += 1) {
    matrix.push(values.slice(row * cols, row * cols + cols));
  }
  return matrix;
}

export function determinant2(matrix: Matrix): number {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

export function determinant3(matrix: Matrix): number {
  const [
    [a, b, c],
    [d, e, f],
    [g, h, i],
  ] = matrix;

  return (
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g)
  );
}

export function inverse2(matrix: Matrix): Matrix | null {
  const det = determinant2(matrix);
  if (Math.abs(det) < 1e-12) return null;

  const [[a, b], [c, d]] = matrix;
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ];
}

export function inverse3(matrix: Matrix): Matrix | null {
  const det = determinant3(matrix);
  if (Math.abs(det) < 1e-12) return null;

  const [
    [a, b, c],
    [d, e, f],
    [g, h, i],
  ] = matrix;

  return [
    [
      (e * i - f * h) / det,
      (c * h - b * i) / det,
      (b * f - c * e) / det,
    ],
    [
      (f * g - d * i) / det,
      (a * i - c * g) / det,
      (c * d - a * f) / det,
    ],
    [
      (d * h - e * g) / det,
      (b * g - a * h) / det,
      (a * e - b * d) / det,
    ],
  ];
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a[0].length !== b.length) return null;

  const result: Matrix = Array.from({ length: a.length }, () =>
    Array.from({ length: b[0].length }, () => 0),
  );

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b[0].length; j += 1) {
      for (let k = 0; k < b.length; k += 1) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

export function solveLinearSystem(matrix: Matrix, vector: number[]): number[] | null {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

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

    [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];

    for (let row = pivot + 1; row < size; row += 1) {
      const factor = augmented[row][pivot] / augmented[pivot][pivot];
      for (let col = pivot; col <= size; col += 1) {
        augmented[row][col] -= factor * augmented[pivot][col];
      }
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

  return solution;
}

export function eigenvalues2x2(matrix: Matrix): [number, number] | null {
  const [[a, b], [c, d]] = matrix;
  const trace = a + d;
  const det = a * d - b * c;
  const discriminant = trace * trace - 4 * det;
  if (discriminant < 0) return null;

  const root = Math.sqrt(discriminant);
  return [(trace + root) / 2, (trace - root) / 2];
}

export function formatMatrix(matrix: Matrix, precision = 6): string {
  return matrix
    .map((row) => `[${row.map((value) => value.toPrecision(precision)).join(", ")}]`)
    .join("\n");
}

export function distance2d(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function distance3d(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
): number {
  return Math.hypot(x2 - x1, y2 - y1, z2 - z1);
}

export function solveTriangle(
  sideA: number,
  sideB: number,
  angleCdeg: number,
): { sideC: number; angleAdeg: number; angleBdeg: number; area: number } | null {
  if (sideA <= 0 || sideB <= 0 || angleCdeg <= 0 || angleCdeg >= 180) {
    return null;
  }

  const angleC = (angleCdeg * Math.PI) / 180;
  const sideC = Math.sqrt(
    sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(angleC),
  );

  if (!Number.isFinite(sideC) || sideC <= 0) return null;

  const angleA = Math.asin((sideA * Math.sin(angleC)) / sideC);
  const angleB = Math.PI - angleA - angleC;

  return {
    sideC,
    angleAdeg: (angleA * 180) / Math.PI,
    angleBdeg: (angleB * 180) / Math.PI,
    area: 0.5 * sideA * sideB * Math.sin(angleC),
  };
}

function richardsonExtrapolate(values: number[]): number | null {
  if (values.length < 2) return null;

  let sequence = [...values];
  while (sequence.length > 1) {
    const next: number[] = [];
    for (let i = 0; i < sequence.length - 1; i += 1) {
      const factor = 2 ** (i + 1);
      next.push((factor * sequence[i + 1] - sequence[i]) / (factor - 1));
    }
    sequence = next;
  }

  return Number.isFinite(sequence[0]) ? sequence[0] : null;
}

export function numericalLimit(
  evaluate: (x: number) => number,
  point: number,
  direction: "both" | "left" | "right" = "both",
): number | null {
  const offsets = [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8];
  const rightSamples: number[] = [];
  const leftSamples: number[] = [];
  const centralSamples: number[] = [];

  for (const step of offsets) {
    if (direction === "both" || direction === "right") {
      const value = evaluate(point + step);
      if (Number.isFinite(value)) rightSamples.push(value);
    }
    if (direction === "both" || direction === "left") {
      const value = evaluate(point - step);
      if (Number.isFinite(value)) leftSamples.push(value);
    }
    if (direction === "both" && rightSamples.length > 0 && leftSamples.length > 0) {
      const right = evaluate(point + step);
      const left = evaluate(point - step);
      if (Number.isFinite(right) && Number.isFinite(left)) {
        centralSamples.push((right + left) / 2);
      }
    }
  }

  const candidates = [
    richardsonExtrapolate(centralSamples),
    richardsonExtrapolate(rightSamples),
    richardsonExtrapolate(leftSamples),
  ].filter((value): value is number => value !== null);

  if (candidates.length === 0) return null;
  return candidates[0];
}

export function simpsonIntegral(
  evaluate: (x: number) => number,
  a: number,
  b: number,
  steps = 400,
): number {
  if (a === b) {
    return 0;
  }

  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = (b - a) / n;
  let sum = evaluate(a) + evaluate(b);

  for (let i = 1; i < n; i += 1) {
    const x = a + h * i;
    const weight = i % 2 === 0 ? 2 : 4;
    sum += weight * evaluate(x);
  }

  return (h / 3) * sum;
}

export function eulerSolve(
  derivative: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  steps: number,
): { x: number; y: number } {
  const h = (xEnd - x0) / steps;
  let x = x0;
  let y = y0;

  for (let i = 0; i < steps; i += 1) {
    y += h * derivative(x, y);
    x += h;
  }

  return { x, y };
}
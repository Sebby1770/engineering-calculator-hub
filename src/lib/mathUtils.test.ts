import { describe, expect, it } from "vitest";
import {
  determinant2,
  determinant3,
  distance2d,
  distance3d,
  eigenvalues2x2,
  eulerSolve,
  formatMatrix,
  inverse2,
  inverse3,
  multiplyMatrices,
  numericalLimit,
  parseMatrix,
  simpsonIntegral,
  solveLinearSystem,
  solveTriangle,
} from "@/lib/mathUtils";

describe("parseMatrix", () => {
  it("parses space-separated values into the requested shape", () => {
    expect(parseMatrix("1 2 3 4", 2, 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("parses comma and semicolon separators", () => {
    expect(parseMatrix("1,2;3,4", 2, 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("returns null when the value count does not match", () => {
    expect(parseMatrix("1 2 3", 2, 2)).toBeNull();
  });

  it("returns null when a token is not numeric", () => {
    expect(parseMatrix("1 2 a 4", 2, 2)).toBeNull();
  });
});

describe("determinant2 / determinant3", () => {
  it("computes a 2×2 determinant", () => {
    expect(determinant2([
      [1, 2],
      [3, 4],
    ])).toBe(-2);
  });

  it("computes a 3×3 determinant", () => {
    expect(
      determinant3([
        [6, 1, 1],
        [4, -2, 5],
        [2, 8, 7],
      ]),
    ).toBe(-306);
  });

  it("returns 1 for the 3×3 identity", () => {
    expect(
      determinant3([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
    ).toBe(1);
  });
});

describe("inverse2 / inverse3", () => {
  it("inverts a non-singular 2×2 matrix", () => {
    const inverse = inverse2([
      [4, 7],
      [2, 6],
    ]);
    expect(inverse).not.toBeNull();
    expect(inverse![0][0]).toBeCloseTo(0.6, 10);
    expect(inverse![0][1]).toBeCloseTo(-0.7, 10);
    expect(inverse![1][0]).toBeCloseTo(-0.2, 10);
    expect(inverse![1][1]).toBeCloseTo(0.4, 10);
  });

  it("returns null for a singular 2×2 matrix", () => {
    expect(
      inverse2([
        [1, 2],
        [2, 4],
      ]),
    ).toBeNull();
  });

  it("inverts the 3×3 identity", () => {
    expect(
      inverse3([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
    ).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it("returns null for a singular 3×3 matrix", () => {
    expect(
      inverse3([
        [1, 2, 3],
        [2, 4, 6],
        [0, 1, 1],
      ]),
    ).toBeNull();
  });
});

describe("multiplyMatrices", () => {
  it("multiplies two compatible 2×2 matrices", () => {
    expect(
      multiplyMatrices(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ),
    ).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it("returns null when inner dimensions do not match", () => {
    expect(
      multiplyMatrices(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [
          [1, 2],
          [3, 4],
        ],
      ),
    ).toBeNull();
  });
});

describe("solveLinearSystem", () => {
  it("solves a 2×2 system", () => {
    const solution = solveLinearSystem(
      [
        [3, 1],
        [1, 2],
      ],
      [9, 8],
    );
    expect(solution).not.toBeNull();
    expect(solution![0]).toBeCloseTo(2, 10);
    expect(solution![1]).toBeCloseTo(3, 10);
  });

  it("returns null when the matrix is singular", () => {
    expect(
      solveLinearSystem(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeNull();
  });
});

describe("eigenvalues2x2", () => {
  it("returns real eigenvalues", () => {
    const values = eigenvalues2x2([
      [4, 1],
      [2, 3],
    ]);
    expect(values).not.toBeNull();
    expect(values![0]).toBeCloseTo(5, 10);
    expect(values![1]).toBeCloseTo(2, 10);
  });

  it("returns null when eigenvalues are complex", () => {
    expect(
      eigenvalues2x2([
        [0, -1],
        [1, 0],
      ]),
    ).toBeNull();
  });
});

describe("formatMatrix", () => {
  it("formats rows with the requested precision", () => {
    expect(
      formatMatrix(
        [
          [1, 2],
          [3, 4],
        ],
        4,
      ),
    ).toBe("[1.000, 2.000]\n[3.000, 4.000]");
  });
});

describe("distance2d / distance3d", () => {
  it("computes planar distance", () => {
    expect(distance2d(0, 0, 3, 4)).toBe(5);
  });

  it("computes spatial distance", () => {
    expect(distance3d(0, 0, 0, 1, 2, 2)).toBe(3);
  });
});

describe("solveTriangle", () => {
  it("solves the SAS right-triangle case", () => {
    const triangle = solveTriangle(3, 4, 90);
    expect(triangle).not.toBeNull();
    expect(triangle!.sideC).toBeCloseTo(5, 10);
    expect(triangle!.area).toBeCloseTo(6, 10);
    expect(triangle!.angleAdeg + triangle!.angleBdeg).toBeCloseTo(90, 8);
  });

  it("rejects invalid angles", () => {
    expect(solveTriangle(3, 4, 0)).toBeNull();
    expect(solveTriangle(3, 4, 180)).toBeNull();
    expect(solveTriangle(-1, 4, 60)).toBeNull();
  });
});

describe("numericalLimit", () => {
  it("estimates sin(x)/x as x → 0", () => {
    const limit = numericalLimit((x) => Math.sin(x) / x, 0, "both");
    expect(limit).not.toBeNull();
    expect(limit!).toBeCloseTo(1, 2);
  });

  it("returns null when samples are non-finite", () => {
    expect(numericalLimit(() => Number.NaN, 0)).toBeNull();
  });
});

describe("simpsonIntegral", () => {
  it("integrates x² from 0 to 1", () => {
    expect(simpsonIntegral((x) => x * x, 0, 1)).toBeCloseTo(1 / 3, 8);
  });

  it("returns 0 when the bounds are equal", () => {
    expect(simpsonIntegral((x) => x * x, 2, 2)).toBe(0);
  });
});

describe("eulerSolve", () => {
  it("integrates y' = y from 1 toward e", () => {
    const { x, y } = eulerSolve((_x, value) => value, 0, 1, 1, 2000);
    expect(x).toBeCloseTo(1, 10);
    expect(y).toBeCloseTo(Math.E, 2);
  });
});

import { CalculatorConfig } from "@/types";

export const advancedCalculators: CalculatorConfig[] = [
  {
    meta: {
      slug: "equation-solver-calculator",
      title: "Equation Solver – Quadratic, Cubic, Trig, and General Roots",
      shortTitle: "Equation Solver",
      description:
        "Solve equations with step-by-step working. Supports quadratics with discriminant analysis, cubics, trigonometric equations, exponentials, and general solve(f(x)=0, x).",
      category: "mathematics",
      icon: "fx=0",
      keywords: ["equation solver", "quadratic formula", "roots", "solve for x", "polynomial"],
      popular: true,
      new: true,
    },
    formula: "ax² + bx + c = 0  →  x = (−b ± √(b² − 4ac)) / 2a",
    formulaExplanation:
      "The solver detects equation type automatically. Quadratics show discriminant and root steps. General equations use symbolic root finding with clear solution listing.",
    exampleUsage:
      "x² − 5x + 6 = 0 gives x₁ = 3 and x₂ = 2. Cubic and trigonometric equations can also be entered directly.",
    faqs: [
      {
        question: "Can it show the working?",
        answer:
          "Yes. The calculator displays labeled steps such as standard form, discriminant, formula substitution, and final roots.",
      },
    ],
    relatedSlugs: [
      "universal-calculator",
      "derivative-calculator",
      "linear-system-calculator",
      "log-calculator",
    ],
  },
  // ─── CALCULUS ────────────────────────────────────────────
  {
    meta: {
      slug: "derivative-calculator",
      title: "Derivative Calculator – Symbolic and Numeric Differentiation",
      shortTitle: "Derivative",
      description:
        "Differentiate expressions such as polynomials, trigonometric functions, exponentials, and logarithms. Evaluate the derivative at any point.",
      category: "calculus",
      icon: "d/dx",
      keywords: ["derivative", "differentiation", "calculus", "slope", "rate of change"],
      popular: true,
      new: true,
    },
    formula: "f'(x) = d/dx [f(x)]",
    formulaExplanation:
      "The derivative measures the instantaneous rate of change of a function. For a function f(x), the derivative f'(x) gives the slope of the tangent line at each point.",
    exampleUsage:
      "For f(x) = x³ + 2x, the derivative is f'(x) = 3x² + 2. At x = 2, f'(2) = 14.",
    faqs: [
      {
        question: "What expressions are supported?",
        answer:
          "Polynomials, sin(x), cos(x), tan(x), exp(x), ln(x), powers, and combinations of these using standard arithmetic operators.",
      },
    ],
    relatedSlugs: ["integral-calculator", "limit-calculator", "taylor-series-calculator", "universal-calculator"],
  },
  {
    meta: {
      slug: "integral-calculator",
      title: "Definite Integral Calculator – Area Under a Curve",
      shortTitle: "Integral",
      description:
        "Compute definite integrals over an interval. Useful for area, accumulated change, and engineering work/energy calculations.",
      category: "calculus",
      icon: "∫",
      keywords: ["integral", "definite integral", "area under curve", "calculus"],
      popular: true,
      new: true,
    },
    formula: "∫ₐᵇ f(x) dx = F(b) − F(a)",
    formulaExplanation:
      "A definite integral accumulates the value of a function over an interval. When f(x) is nonnegative, the integral represents the area under the curve between x = a and x = b.",
    exampleUsage:
      "∫₀² x² dx = [x³/3]₀² = 8/3 ≈ 2.667.",
    faqs: [
      {
        question: "Does this calculator support improper integrals?",
        answer:
          "It currently focuses on standard definite integrals over finite bounds using symbolic antiderivatives where possible.",
      },
    ],
    relatedSlugs: ["derivative-calculator", "limit-calculator", "differential-equation-calculator"],
  },
  {
    meta: {
      slug: "limit-calculator",
      title: "Limit Calculator – Estimate Limits Numerically",
      shortTitle: "Limit",
      description:
        "Estimate limits as x approaches a point from the left, right, or both sides. Helpful for continuity checks and indeterminate forms.",
      category: "calculus",
      icon: "lim",
      keywords: ["limit", "approach", "continuity", "indeterminate form"],
      new: true,
    },
    formula: "lim(x→a) f(x) = L",
    formulaExplanation:
      "A limit describes the value a function approaches as the input gets arbitrarily close to a point. Limits are foundational for derivatives, integrals, and continuity analysis.",
    exampleUsage:
      "lim(x→0) sin(x)/x ≈ 1 even though the expression is undefined exactly at x = 0.",
    faqs: [
      {
        question: "How is the limit estimated?",
        answer:
          "The calculator samples values increasingly close to the target point and returns the converging estimate.",
      },
    ],
    relatedSlugs: ["derivative-calculator", "taylor-series-calculator", "universal-calculator"],
  },
  {
    meta: {
      slug: "differential-equation-calculator",
      title: "Differential Equation Solver – First-Order ODE Tool",
      shortTitle: "ODE Solver",
      description:
        "Solve first-order ordinary differential equations numerically using Euler's method. Enter dy/dx, initial conditions, and an endpoint.",
      category: "calculus",
      icon: "dy/dx",
      keywords: ["differential equation", "ODE", "euler method", "initial value problem"],
      new: true,
    },
    formula: "yₙ₊₁ = yₙ + h·f(xₙ, yₙ)",
    formulaExplanation:
      "Euler's method approximates the solution to dy/dx = f(x, y) by stepping forward in small increments. It is simple, fast, and useful for engineering approximations.",
    exampleUsage:
      "For dy/dx = x + y with y(0) = 1, solving to x = 2 gives an estimated y(2) that can be refined with more steps.",
    faqs: [
      {
        question: "What kinds of ODEs are supported?",
        answer:
          "First-order ODEs written as dy/dx = f(x, y). Higher-order equations should be converted to a first-order system first.",
      },
    ],
    relatedSlugs: ["integral-calculator", "derivative-calculator", "taylor-series-calculator"],
  },
  {
    meta: {
      slug: "taylor-series-calculator",
      title: "Taylor Series Calculator – Polynomial Approximation",
      shortTitle: "Taylor Series",
      description:
        "Build a Taylor polynomial approximation around a center point and compare it with the exact function value.",
      category: "calculus",
      icon: "Tₙ",
      keywords: ["taylor series", "polynomial approximation", "maclaurin", "error"],
      new: true,
    },
    formula: "Tₙ(x) = Σ f⁽ᵏ⁾(a)/k! · (x − a)ᵏ",
    formulaExplanation:
      "A Taylor series approximates a smooth function near a point using derivatives at that point. Higher order generally improves accuracy near the expansion center.",
    exampleUsage:
      "The 4th-order Taylor polynomial for eˣ about 0 is 1 + x + x²/2 + x³/6 + x⁴/24.",
    faqs: [
      {
        question: "Why use Taylor approximations?",
        answer:
          "They are widely used in control systems, physics linearization, and numerical methods where a complicated function must be approximated locally.",
      },
    ],
    relatedSlugs: ["derivative-calculator", "limit-calculator", "universal-calculator"],
  },

  // ─── GEOMETRY ────────────────────────────────────────────
  {
    meta: {
      slug: "triangle-calculator",
      title: "Triangle Calculator – SAS Side and Angle Solver",
      shortTitle: "Triangle Solver",
      description:
        "Solve a triangle from two sides and the included angle. Returns the missing side, remaining angles, and area.",
      category: "geometry",
      icon: "△",
      keywords: ["triangle", "law of cosines", "SAS", "area"],
      popular: true,
      new: true,
    },
    formula: "c² = a² + b² − 2ab cos(C)",
    formulaExplanation:
      "The law of cosines generalizes the Pythagorean theorem to any triangle. With two sides and the included angle, the third side and remaining angles can be found using trigonometry.",
    exampleUsage:
      "For sides 7 and 9 with included angle 48°, the missing side is about 6.78 units and the area is about 23.3 square units.",
    faqs: [
      {
        question: "Which triangle cases are supported?",
        answer:
          "This version solves the SAS case: two known sides and the angle between them.",
      },
    ],
    relatedSlugs: ["pythagorean-calculator", "circle-calculator", "distance-calculator"],
  },
  {
    meta: {
      slug: "circle-calculator",
      title: "Circle Calculator – Radius, Area, Circumference, Arc Length",
      shortTitle: "Circle",
      description:
        "Calculate radius, diameter, circumference, area, and arc length from a known radius or diameter.",
      category: "geometry",
      icon: "○",
      keywords: ["circle", "radius", "circumference", "arc length", "area"],
      new: true,
    },
    formula: "C = 2πr, A = πr²",
    formulaExplanation:
      "A circle is defined by radius r. Circumference is the distance around the circle, while area measures the enclosed region. Arc length scales with the central angle.",
    exampleUsage:
      "A circle with radius 5 has circumference 31.4159 and area 78.5398 square units.",
    faqs: [
      {
        question: "How is arc length calculated?",
        answer:
          "Arc length equals (θ/360) × circumference, where θ is the central angle in degrees.",
      },
    ],
    relatedSlugs: ["triangle-calculator", "volume-calculator", "pythagorean-calculator"],
  },
  {
    meta: {
      slug: "pythagorean-calculator",
      title: "Pythagorean Theorem Calculator – Find Any Right-Triangle Side",
      shortTitle: "Pythagorean",
      description:
        "Solve for the hypotenuse or either leg of a right triangle using a² + b² = c².",
      category: "geometry",
      icon: "a²+b²",
      keywords: ["pythagorean theorem", "right triangle", "hypotenuse"],
      popular: true,
      new: true,
    },
    formula: "a² + b² = c²",
    formulaExplanation:
      "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides. This is one of the most used relationships in geometry and engineering layout.",
    exampleUsage:
      "A right triangle with legs 3 and 4 has hypotenuse c = √(9 + 16) = 5.",
    faqs: [
      {
        question: "Can this solve for a leg?",
        answer:
          "Yes. If the hypotenuse and one leg are known, the missing leg is √(c² − known²).",
      },
    ],
    relatedSlugs: ["triangle-calculator", "distance-calculator", "circle-calculator"],
  },
  {
    meta: {
      slug: "volume-calculator",
      title: "3D Volume Calculator – Sphere, Cylinder, Cone, Prism",
      shortTitle: "Volume",
      description:
        "Compute volume and surface area for common 3D solids used in mechanical, civil, and manufacturing calculations.",
      category: "geometry",
      icon: "V",
      keywords: ["volume", "surface area", "sphere", "cylinder", "cone", "prism"],
      new: true,
    },
    formula: "V_sphere = 4/3 πr³, V_cylinder = πr²h",
    formulaExplanation:
      "Volume measures the three-dimensional space occupied by a solid. Surface area measures the total outer area. These formulas are essential in tank sizing, casting, and material estimation.",
    exampleUsage:
      "A cylinder with radius 2 m and height 5 m has volume 62.8319 m³.",
    faqs: [
      {
        question: "Which solids are included?",
        answer:
          "Sphere, cylinder, cone, and rectangular prism with corresponding surface area outputs.",
      },
    ],
    relatedSlugs: ["circle-calculator", "triangle-calculator", "energy-calculator"],
  },
  {
    meta: {
      slug: "distance-calculator",
      title: "Distance Calculator – 2D and 3D Point Distance",
      shortTitle: "Distance",
      description:
        "Find the straight-line distance between two points in 2D or 3D coordinate space.",
      category: "geometry",
      icon: "↔",
      keywords: ["distance", "coordinate geometry", "2d", "3d", "hypotenuse"],
      new: true,
    },
    formula: "d = √[(x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²]",
    formulaExplanation:
      "The distance formula comes directly from the Pythagorean theorem extended into two or three dimensions. It is used in CAD, robotics, navigation, and surveying.",
    exampleUsage:
      "The distance between (1, 2) and (4, 6) is √(9 + 16) = 5 units.",
    faqs: [
      {
        question: "Does this work in 3D?",
        answer:
          "Yes. Enter x, y, and z coordinates for both points to compute 3D Euclidean distance.",
      },
    ],
    relatedSlugs: ["pythagorean-calculator", "triangle-calculator", "dot-cross-product-calculator"],
  },

  // ─── LINEAR ALGEBRA ──────────────────────────────────────
  {
    meta: {
      slug: "matrix-determinant-calculator",
      title: "Matrix Determinant Calculator – 2×2 and 3×3",
      shortTitle: "Determinant",
      description:
        "Compute the determinant of a 2×2 or 3×3 matrix. Determinants reveal invertibility and scaling behavior of linear transformations.",
      category: "linear_algebra",
      icon: "det",
      keywords: ["determinant", "matrix", "2x2", "3x3", "linear algebra"],
      popular: true,
      new: true,
    },
    formula: "det([[a,b],[c,d]]) = ad − bc",
    formulaExplanation:
      "The determinant measures how a matrix scales area or volume. A zero determinant means the matrix is singular and not invertible.",
    exampleUsage:
      "det([[4, 7], [2, 6]]) = 4×6 − 7×2 = 10.",
    faqs: [
      {
        question: "What does a zero determinant mean?",
        answer:
          "A zero determinant indicates the matrix is singular and its rows or columns are linearly dependent.",
      },
    ],
    relatedSlugs: ["matrix-inverse-calculator", "linear-system-calculator", "eigenvalue-calculator"],
  },
  {
    meta: {
      slug: "matrix-inverse-calculator",
      title: "Matrix Inverse Calculator – 2×2 and 3×3",
      shortTitle: "Matrix Inverse",
      description:
        "Find the inverse of a square matrix when it exists. Useful for solving systems and transforming coordinates.",
      category: "linear_algebra",
      icon: "A⁻¹",
      keywords: ["matrix inverse", "invertible", "linear algebra"],
      new: true,
    },
    formula: "A⁻¹ = adj(A) / det(A)",
    formulaExplanation:
      "A matrix inverse undoes the linear transformation represented by A. It exists only when the determinant is nonzero.",
    exampleUsage:
      "The inverse of [[4, 7], [2, 6]] is approximately [[0.6, −0.7], [−0.2, 0.4]].",
    faqs: [
      {
        question: "Why does inversion fail sometimes?",
        answer:
          "If det(A) = 0, the matrix is singular and has no inverse.",
      },
    ],
    relatedSlugs: ["matrix-determinant-calculator", "linear-system-calculator", "matrix-multiply-calculator"],
  },
  {
    meta: {
      slug: "matrix-multiply-calculator",
      title: "Matrix Multiplication Calculator – 2×2 Product",
      shortTitle: "Matrix Multiply",
      description:
        "Multiply two 2×2 matrices and view the resulting product matrix instantly.",
      category: "linear_algebra",
      icon: "×",
      keywords: ["matrix multiplication", "matrix product", "linear algebra"],
      new: true,
    },
    formula: "(AB)ᵢⱼ = Σ Aᵢₖ Bₖⱼ",
    formulaExplanation:
      "Matrix multiplication combines linear transformations. The entry in row i and column j is the dot product of row i from A with column j from B.",
    exampleUsage:
      "[[1, 2], [3, 4]] × [[5, 6], [7, 8]] = [[19, 22], [43, 50]].",
    faqs: [
      {
        question: "Is matrix multiplication commutative?",
        answer:
          "No. In general AB ≠ BA, so order matters.",
      },
    ],
    relatedSlugs: ["matrix-inverse-calculator", "linear-system-calculator", "dot-cross-product-calculator"],
  },
  {
    meta: {
      slug: "linear-system-calculator",
      title: "Linear System Solver – Solve Ax = b",
      shortTitle: "Linear System",
      description:
        "Solve 2×2 or 3×3 linear systems using Gaussian elimination. Enter the coefficient matrix and result vector.",
      category: "linear_algebra",
      icon: "Ax=b",
      keywords: ["linear system", "gaussian elimination", "solve equations", "matrix"],
      popular: true,
      new: true,
    },
    formula: "Ax = b",
    formulaExplanation:
      "A linear system asks for the vector x that satisfies a set of linear equations written in matrix form. Gaussian elimination row-reduces the system to find the solution when one exists.",
    exampleUsage:
      "The system 3x + y = 9 and x + 2y = 8 has solution x = 2, y = 3.",
    faqs: [
      {
        question: "What if there is no unique solution?",
        answer:
          "If the matrix is singular or inconsistent, the solver reports that no unique solution exists.",
      },
    ],
    relatedSlugs: ["matrix-inverse-calculator", "matrix-determinant-calculator", "eigenvalue-calculator"],
  },
  {
    meta: {
      slug: "dot-cross-product-calculator",
      title: "Dot and Cross Product Calculator – 3D Vector Math",
      shortTitle: "Dot & Cross",
      description:
        "Compute the dot product, cross product, and angle between two 3D vectors.",
      category: "linear_algebra",
      icon: "·×",
      keywords: ["dot product", "cross product", "vector", "angle between vectors"],
      new: true,
    },
    formula: "a·b = |a||b|cosθ, a×b = |a||b|sinθ n̂",
    formulaExplanation:
      "The dot product measures alignment between vectors, while the cross product produces a perpendicular vector whose magnitude equals the parallelogram area spanned by the inputs.",
    exampleUsage:
      "For a = [2, 3, 1] and b = [4, −1, 2], a·b = 9 and a×b = [7, 0, −14].",
    faqs: [
      {
        question: "When should I use dot vs cross product?",
        answer:
          "Use the dot product for projections, work, and angles. Use the cross product for torque, normals, and area/volume calculations.",
      },
    ],
    relatedSlugs: ["distance-calculator", "matrix-multiply-calculator", "eigenvalue-calculator"],
  },
  {
    meta: {
      slug: "eigenvalue-calculator",
      title: "Eigenvalue Calculator – 2×2 Real Eigenvalues",
      shortTitle: "Eigenvalues",
      description:
        "Compute eigenvalues of a 2×2 matrix. Eigenvalues reveal system stability, vibration modes, and principal directions.",
      category: "linear_algebra",
      icon: "λ",
      keywords: ["eigenvalue", "characteristic polynomial", "matrix", "stability"],
      new: true,
    },
    formula: "det(A − λI) = 0",
    formulaExplanation:
      "Eigenvalues λ satisfy the characteristic equation det(A − λI) = 0. For a 2×2 matrix, this yields a quadratic equation with up to two real roots.",
    exampleUsage:
      "For [[4, 1], [2, 3]], the eigenvalues are λ₁ = 5 and λ₂ = 2.",
    faqs: [
      {
        question: "Why are eigenvalues important in engineering?",
        answer:
          "They appear in structural vibration, control-system stability, principal component analysis, and many state-space models.",
      },
    ],
    relatedSlugs: ["matrix-determinant-calculator", "linear-system-calculator", "matrix-inverse-calculator"],
  },
];
import { CalculatorConfig } from "@/types";
import { advancedCalculators } from "@/data/advancedCalculators";

const baseCalculators: CalculatorConfig[] = [
  // ─── ELECTRICAL ──────────────────────────────────────────
  {
    meta: {
      slug: "ohms-law-calculator",
      title:
        "Ohm's Law Calculator – Find Voltage, Current & Resistance Instantly",
      shortTitle: "Ohm's Law",
      description:
        "Free online Ohm's Law calculator. Compute voltage (V), current (I), or resistance (R) using V=IR. Includes formula explanation, examples, and interactive solver.",
      category: "electrical",
      icon: "Ω",
      keywords: ["ohms law", "voltage", "current", "resistance", "V=IR"],
      popular: true,
    },
    formula: "V = I × R",
    formulaExplanation:
      "Ohm's Law states that the voltage across a conductor is directly proportional to the current flowing through it. The constant of proportionality is the resistance. V is voltage in volts, I is current in amperes, and R is resistance in ohms. This is the most fundamental relationship in electrical engineering and circuit analysis.",
    exampleUsage:
      "If a resistor has a resistance of 100Ω and 0.5A of current flows through it, the voltage drop across the resistor is V = 0.5 × 100 = 50V.",
    faqs: [
      {
        question: "What is Ohm's Law?",
        answer:
          "Ohm's Law is a fundamental principle in electrical engineering that relates voltage (V), current (I), and resistance (R) through the equation V = I × R. It was discovered by Georg Simon Ohm in 1827.",
      },
      {
        question: "When does Ohm's Law not apply?",
        answer:
          "Ohm's Law does not apply to non-linear devices such as diodes, transistors, and thermistors. These components have a non-linear relationship between voltage and current.",
      },
      {
        question: "How do I calculate resistance using voltage and current?",
        answer:
          "Rearrange the formula to R = V / I. For example, if you have 12V across a component with 2A flowing through it, R = 12/2 = 6Ω.",
      },
      {
        question: "What units are used in Ohm's Law?",
        answer:
          "Voltage is measured in volts (V), current in amperes (A), and resistance in ohms (Ω). You can also use milliamps (mA), kilohms (kΩ), etc., as long as units are consistent.",
      },
    ],
    relatedSlugs: [
      "power-calculator",
      "voltage-divider-calculator",
      "voltage-drop-calculator",
      "resistor-color-code-calculator",
      "parallel-resistor-calculator",
    ],
  },
  {
    meta: {
      slug: "voltage-divider-calculator",
      title: "Voltage Divider Calculator – Compute Output Voltage Online",
      shortTitle: "Voltage Divider",
      description:
        "Calculate output voltage of a resistive voltage divider circuit. Enter R1, R2, and input voltage to find Vout instantly. Free online tool with formula and examples.",
      category: "electrical",
      icon: "÷",
      keywords: ["voltage divider", "resistive divider", "Vout", "R1 R2"],
      popular: true,
    },
    formula: "Vout = Vin × (R2 / (R1 + R2))",
    formulaExplanation:
      "A voltage divider consists of two resistors in series. The output voltage is taken across the second resistor (R2). The output is a fraction of the input voltage determined by the ratio of R2 to the total resistance. This is widely used for biasing, signal attenuation, and sensor interfacing.",
    exampleUsage:
      "With Vin = 12V, R1 = 10kΩ, and R2 = 5kΩ, the output voltage is Vout = 12 × (5000 / (10000 + 5000)) = 12 × 0.333 = 4V.",
    faqs: [
      {
        question: "What is a voltage divider?",
        answer:
          "A voltage divider is a simple circuit with two series resistors that produces an output voltage that is a fraction of the input voltage. It is one of the most common circuits in electronics.",
      },
      {
        question: "Can a voltage divider be used as a power supply?",
        answer:
          "Generally no. Voltage dividers are not suitable as power supplies because their output voltage changes significantly with load current. Use a voltage regulator instead.",
      },
      {
        question: "How does load affect a voltage divider?",
        answer:
          "Adding a load in parallel with R2 reduces the effective resistance and lowers the output voltage. For minimal loading effect, the load resistance should be at least 10× larger than R2.",
      },
    ],
    relatedSlugs: [
      "ohms-law-calculator",
      "parallel-resistor-calculator",
      "series-resistor-calculator",
      "power-calculator",
    ],
  },
  {
    meta: {
      slug: "resistor-color-code-calculator",
      title: "Resistor Color Code Calculator – 4, 5 & 6 Band Decoder",
      shortTitle: "Resistor Color Code",
      description:
        "Decode resistor color bands to find resistance value and tolerance. Supports 4-band, 5-band, and 6-band resistors. Interactive visual tool with instant results.",
      category: "electrical",
      icon: "kΩ",
      keywords: [
        "resistor color code",
        "band decoder",
        "resistance value",
        "tolerance",
      ],
    },
    formula: "R = (Band1 × 10 + Band2) × Multiplier ± Tolerance",
    formulaExplanation:
      "For a 4-band resistor, the first two bands represent digits, the third band is the multiplier (power of 10), and the fourth band indicates tolerance. For 5-band resistors, three bands are digits, followed by multiplier and tolerance. The 6th band on 6-band resistors indicates the temperature coefficient.",
    exampleUsage:
      "A resistor with bands Brown-Black-Red-Gold has value: (1×10 + 0) × 100 = 1000Ω = 1kΩ with ±5% tolerance.",
    faqs: [
      {
        question: "How do I read a resistor color code?",
        answer:
          "Hold the resistor with the tolerance band (usually gold or silver) on the right. Read the color bands from left to right. The first bands are digits, followed by the multiplier and tolerance.",
      },
      {
        question: "What does a gold band mean on a resistor?",
        answer:
          "A gold band as the last band indicates ±5% tolerance. As a multiplier band (3rd band on 4-band), gold means ×0.1.",
      },
    ],
    relatedSlugs: [
      "ohms-law-calculator",
      "parallel-resistor-calculator",
      "series-resistor-calculator",
    ],
  },
  {
    meta: {
      slug: "rc-time-constant-calculator",
      title: "RC Time Constant Calculator – Compute τ = RC Online",
      shortTitle: "RC Time Constant",
      description:
        "Calculate the RC time constant (τ) for resistor-capacitor circuits. Find charge/discharge times, cutoff frequency, and transient response parameters.",
      category: "electrical",
      icon: "τ",
      keywords: [
        "RC time constant",
        "tau",
        "capacitor charging",
        "cutoff frequency",
      ],
    },
    formula: "τ = R × C",
    formulaExplanation:
      "The RC time constant τ (tau) is the product of resistance and capacitance. It represents the time required for the voltage across the capacitor to reach approximately 63.2% of its final value during charging, or to drop to 36.8% during discharging. After 5τ, the capacitor is considered fully charged (99.3%).",
    exampleUsage:
      "With R = 10kΩ and C = 100μF, τ = 10,000 × 0.0001 = 1 second. The capacitor reaches 63.2% charge in 1s and 99.3% in 5s.",
    faqs: [
      {
        question: "What is the RC time constant?",
        answer:
          "The RC time constant (τ = RC) is a measure of how quickly a capacitor charges or discharges through a resistor. One time constant is the time to reach 63.2% of the final value.",
      },
      {
        question: "How many time constants to fully charge?",
        answer:
          "A capacitor is considered fully charged after approximately 5 time constants (5τ), reaching 99.3% of the final voltage.",
      },
    ],
    relatedSlugs: [
      "ohms-law-calculator",
      "frequency-calculator",
      "frequency-to-period-converter",
    ],
  },
  {
    meta: {
      slug: "power-calculator",
      title: "Electrical Power Calculator – P = V × I | Watts Calculator",
      shortTitle: "Power Calculator",
      description:
        "Calculate electrical power using P=VI, P=I²R, or P=V²/R. Find watts, voltage, current, or resistance. Free online tool with formula explanations.",
      category: "electrical",
      icon: "W",
      keywords: ["power calculator", "watts", "P=VI", "electrical power"],
      popular: true,
    },
    formula: "P = V × I = I²R = V²/R = τω",
    formulaExplanation:
      "Electrical power is the rate at which energy is transferred. P = V × I is the primary formula, where P is power in watts, V is voltage in volts, and I is current in amperes. Using Ohm's Law, this can also be expressed as P = I²R or P = V²/R. Mechanical power can be computed as torque multiplied by angular velocity.",
    exampleUsage:
      "A device operating at 120V drawing 2A consumes P = 120 × 2 = 240W of power. Using P = I²R with I = 2A and R = 60Ω gives the same result: P = 4 × 60 = 240W.",
    faqs: [
      {
        question: "What is the difference between watts and watt-hours?",
        answer:
          "Watts (W) measure instantaneous power, while watt-hours (Wh) measure energy consumption over time. A 100W device running for 2 hours consumes 200Wh of energy.",
      },
      {
        question: "How do I calculate power dissipated by a resistor?",
        answer:
          "Use P = V²/R if you know voltage and resistance, or P = I²R if you know current and resistance. Both give power in watts.",
      },
    ],
    relatedSlugs: [
      "ohms-law-calculator",
      "energy-calculator",
      "voltage-divider-calculator",
    ],
  },
  {
    meta: {
      slug: "parallel-resistor-calculator",
      title: "Parallel Resistor Calculator – Find Equivalent Resistance",
      shortTitle: "Parallel Resistors",
      description:
        "Calculate the total equivalent resistance of resistors connected in parallel. Supports 2 to 10 resistors. Instant results with step-by-step solution.",
      category: "electrical",
      icon: "‖",
      keywords: [
        "parallel resistors",
        "equivalent resistance",
        "parallel combination",
      ],
    },
    formula: "1/Rtotal = 1/R1 + 1/R2 + ... + 1/Rn",
    formulaExplanation:
      "For resistors in parallel, the reciprocal of the total resistance equals the sum of the reciprocals of each individual resistance. The total resistance is always less than the smallest individual resistor. For two resistors: Rtotal = (R1 × R2) / (R1 + R2).",
    exampleUsage:
      "Two resistors of 100Ω and 200Ω in parallel: Rtotal = (100 × 200) / (100 + 200) = 20000 / 300 = 66.67Ω.",
    faqs: [
      {
        question: "Is parallel resistance always lower than each resistor?",
        answer:
          "Yes. The equivalent resistance of parallel resistors is always less than the smallest individual resistance in the combination.",
      },
      {
        question: "What happens if two equal resistors are in parallel?",
        answer:
          "The total resistance is half the value of one resistor. For example, two 100Ω resistors in parallel give 50Ω.",
      },
    ],
    relatedSlugs: [
      "series-resistor-calculator",
      "ohms-law-calculator",
      "resistor-color-code-calculator",
    ],
  },
  {
    meta: {
      slug: "series-resistor-calculator",
      title: "Series Resistor Calculator – Total Resistance in Series",
      shortTitle: "Series Resistors",
      description:
        "Calculate the total resistance of resistors connected in series. Simply add resistor values. Supports up to 10 resistors with instant results.",
      category: "electrical",
      icon: "—",
      keywords: ["series resistors", "total resistance", "series circuit"],
    },
    formula: "Rtotal = R1 + R2 + ... + Rn",
    formulaExplanation:
      "For resistors in series, the total resistance is simply the sum of all individual resistances. The current through each resistor is the same, while the voltage divides proportionally across each resistor according to its resistance value.",
    exampleUsage:
      "Three resistors of 100Ω, 220Ω, and 470Ω in series: Rtotal = 100 + 220 + 470 = 790Ω.",
    faqs: [
      {
        question: "How does current flow in a series circuit?",
        answer:
          "In a series circuit, the same current flows through every component. The total resistance determines the current via Ohm's Law: I = V/Rtotal.",
      },
    ],
    relatedSlugs: [
      "parallel-resistor-calculator",
      "ohms-law-calculator",
      "voltage-divider-calculator",
      "voltage-drop-calculator",
    ],
  },
  {
    meta: {
      slug: "voltage-drop-calculator",
      title: "Voltage Drop Calculator – Single-Phase & Three-Phase Wire Drop",
      shortTitle: "Voltage Drop",
      description:
        "Calculate DC/AC voltage drop in copper or aluminum conductors. Uses Vd = 2·I·R·L for single-phase and Vd = √3·I·R·L for three-phase, with AWG sizes and resistivity presets.",
      category: "electrical",
      icon: "Vd",
      keywords: [
        "voltage drop",
        "wire resistance",
        "AWG",
        "copper aluminum",
        "single phase",
        "three phase",
      ],
      new: true,
    },
    formula: "Vd = 2·I·R·L  (1φ)    Vd = √3·I·R·L  (3φ)",
    formulaExplanation:
      "R is the conductor resistance per unit length (Ω/m), obtained from resistivity ρ divided by cross-sectional area. L is the one-way run length. The factor 2 accounts for the outgoing and return conductors in a single-phase or DC circuit. Three-phase circuits use √3. Resistivity presets are 1.68×10⁻⁸ Ω·m for copper and 2.65×10⁻⁸ Ω·m for aluminum at 20 °C. Optional source voltage converts the drop into a percentage.",
    exampleUsage:
      "A 12 AWG copper run of 30 m carrying 15 A single-phase: R = ρ/A ≈ 0.00508 Ω/m, so Vd = 2 × 15 × 0.00508 × 30 ≈ 4.57 V. On a 120 V circuit that is about 3.8%.",
    faqs: [
      {
        question: "Why is there a 2 in the single-phase formula?",
        answer:
          "Current travels out on one conductor and back on the other. Both legs have resistance, so the loop drop is twice the one-way I·R·L product.",
      },
      {
        question: "How is R obtained from AWG?",
        answer:
          "The calculator looks up the AWG cross-section, then uses R = ρ / A with the copper or aluminum resistivity preset. You can also enter a custom area in mm².",
      },
      {
        question: "What voltage drop is acceptable?",
        answer:
          "A common design target is no more than 3% on a branch circuit and 5% combined feeder plus branch. Always follow the applicable electrical code.",
      },
    ],
    relatedSlugs: [
      "ohms-law-calculator",
      "power-calculator",
      "series-resistor-calculator",
      "resistor-color-code-calculator",
    ],
  },
  // ─── MATHEMATICS ─────────────────────────────────────────
  {
    meta: {
      slug: "universal-calculator",
      title: "Universal Calculator - Math, Units & Engineering Expressions",
      shortTitle: "Universal",
      description:
        "Free universal calculator for math expressions, units, trigonometry, factorials, powers, roots, and engineering-style calculations using natural typed input.",
      category: "mathematics",
      icon: "∑",
      keywords: [
        "universal calculator",
        "mathjs",
        "units calculator",
        "engineering calculator",
      ],
      new: true,
    },
    formula: "Smart evaluate: simplify → solve → differentiate → integrate",
    formulaExplanation:
      "The universal calculator now runs in smart mode. It auto-detects equations, simplifies expressions before evaluation, routes derivative and integral syntax, and shows step-by-step work for every result.",
    exampleUsage:
      "Try x^2 - 7*x + 12 = 0, derivative(sin(x)*exp(x), x), integrate(x^2, x, 0, 2), simplify((x^2-1)/(x-1)), or 5 m + 30 cm.",
    faqs: [
      {
        question: "What can the universal calculator evaluate?",
        answer:
          "It can evaluate arithmetic, trigonometry, powers, roots, factorials, constants, and supported unit expressions. It is useful when a calculation does not fit one of the specialized tools.",
      },
      {
        question: "Can I use engineering units?",
        answer:
          "Yes. Compatible units such as m and cm can be combined, and the result is returned with units where appropriate.",
      },
    ],
    relatedSlugs: [
      "scientific-calculator",
      "log-calculator",
      "binary-hex-decimal-converter",
      "energy-calculator",
    ],
  },
  {
    meta: {
      slug: "scientific-calculator",
      title: "Free Online Scientific Calculator – Advanced Math Functions",
      shortTitle: "Scientific Calculator",
      description:
        "Full-featured online scientific calculator with trigonometry, logarithms, exponents, factorials, and more. Free, fast, and works on any device.",
      category: "mathematics",
      icon: "fx",
      keywords: [
        "scientific calculator",
        "trig",
        "sin cos tan",
        "logarithm",
        "exponent",
      ],
      popular: true,
    },
    formula: "sin, cos, tan, log, ln, √, xⁿ, n!, π, e",
    formulaExplanation:
      "A scientific calculator supports advanced mathematical operations including trigonometric functions (sin, cos, tan and their inverses), logarithms (log base 10 and natural log), exponents and roots, factorials, and constants like π and e.",
    exampleUsage:
      "Calculate sin(45°): First convert to radians: 45° × π/180 = π/4 ≈ 0.7854 rad. sin(π/4) = √2/2 ≈ 0.7071.",
    faqs: [
      {
        question: "What is the difference between log and ln?",
        answer:
          "log (or log₁₀) is the common logarithm with base 10. ln is the natural logarithm with base e ≈ 2.71828. ln(x) = log(x) / log(e).",
      },
      {
        question: "How do I switch between degrees and radians?",
        answer:
          "Multiply degrees by π/180 to get radians, or multiply radians by 180/π to get degrees. Our calculator supports both modes.",
      },
    ],
    relatedSlugs: [
      "log-calculator",
      "binary-hex-decimal-converter",
      "energy-calculator",
    ],
  },
  {
    meta: {
      slug: "log-calculator",
      title: "Logarithm Calculator – log, ln, log₂ | Any Base",
      shortTitle: "Log Calculator",
      description:
        "Calculate logarithms with any base. Supports log₁₀, natural log (ln), log₂, and custom bases. Includes antilog calculation and formula explanations.",
      category: "mathematics",
      icon: "log",
      keywords: ["logarithm", "log calculator", "natural log", "log base 2"],
    },
    formula: "logₐ(x) = ln(x) / ln(a)",
    formulaExplanation:
      'A logarithm answers the question: "To what power must the base be raised to get this number?" The change of base formula logₐ(x) = ln(x) / ln(a) allows computing logarithms of any base using natural logarithms.',
    exampleUsage:
      "log₁₀(1000) = 3 because 10³ = 1000. ln(e²) = 2 because e² = e². log₂(256) = 8 because 2⁸ = 256.",
    faqs: [
      {
        question: "What is the logarithm of a negative number?",
        answer:
          "The real logarithm of a negative number is undefined. In complex analysis, it can be defined, but for practical engineering calculations, logarithms require positive inputs.",
      },
    ],
    relatedSlugs: [
      "scientific-calculator",
      "db-to-voltage-converter",
      "voltage-to-db-converter",
    ],
  },
  {
    meta: {
      slug: "binary-hex-decimal-converter",
      title: "Binary, Hexadecimal & Decimal Converter – Number Base Tool",
      shortTitle: "Base Converter",
      description:
        "Convert between binary, hexadecimal, decimal, and octal number systems instantly. Supports integers and fractions. Essential tool for digital electronics.",
      category: "mathematics",
      icon: "01",
      keywords: [
        "binary converter",
        "hex converter",
        "decimal to binary",
        "number base",
      ],
      new: true,
    },
    formula: "N₁₀ = dₙ×bⁿ + ... + d₁×b¹ + d₀×b⁰",
    formulaExplanation:
      "Any number in base b can be expressed as a sum of digits multiplied by powers of the base. To convert between bases, repeatedly divide by the target base and collect remainders (for integers) or multiply by the base and collect integer parts (for fractions).",
    exampleUsage:
      "Convert 255 decimal to binary: 11111111. To hex: FF. Convert 0xA3 to decimal: 10×16 + 3 = 163.",
    faqs: [
      {
        question: "Why is hexadecimal used in computing?",
        answer:
          "Hexadecimal (base 16) is a compact way to represent binary data. Each hex digit maps to exactly 4 binary bits, making it much easier to read than long binary strings.",
      },
    ],
    relatedSlugs: ["scientific-calculator", "log-calculator"],
  },
  // ─── PHYSICS ─────────────────────────────────────────────
  {
    meta: {
      slug: "energy-calculator",
      title: "Energy Calculator – Kinetic, Potential & Electrical Energy",
      shortTitle: "Energy Calculator",
      description:
        "Calculate kinetic energy (½mv²), potential energy (mgh), and electrical energy (Pt). Convert between joules, calories, eV, and kWh.",
      category: "physics",
      icon: "E",
      keywords: [
        "energy calculator",
        "kinetic energy",
        "potential energy",
        "joules",
      ],
    },
    formula: "KE = ½mv² | RE = ½Iω² | SE = ½kx² | PE = mgh | E = Pt",
    formulaExplanation:
      "Kinetic energy (KE) depends on mass and velocity. Rotational energy uses moment of inertia and angular velocity. Spring energy depends on stiffness and displacement. Potential energy (PE) depends on mass, gravitational acceleration, and height. Electrical energy (E) is power multiplied by time. All energy is measured in joules (J) in SI units.",
    exampleUsage:
      "A 2kg ball moving at 5 m/s has KE = ½ × 2 × 25 = 25J. At 10m height with g=9.81: PE = 2 × 9.81 × 10 = 196.2J.",
    faqs: [
      {
        question: "What is the relationship between energy and power?",
        answer:
          "Power is the rate of energy transfer. P = E/t, where P is power in watts, E is energy in joules, and t is time in seconds. 1 watt = 1 joule per second.",
      },
    ],
    relatedSlugs: [
      "power-calculator",
      "frequency-calculator",
      "wavelength-calculator",
    ],
  },
  {
    meta: {
      slug: "frequency-calculator",
      title: "Frequency Calculator – Hz, kHz, MHz, GHz Converter",
      shortTitle: "Frequency Calculator",
      description:
        "Calculate frequency from wavelength or period. Convert between Hz, kHz, MHz, and GHz. Includes speed of light and sound calculations.",
      category: "physics",
      icon: "Hz",
      keywords: [
        "frequency calculator",
        "hertz",
        "wavelength to frequency",
        "period",
      ],
    },
    formula: "f = 1/T = v/λ",
    formulaExplanation:
      "Frequency (f) is the number of cycles per second, measured in hertz (Hz). It is the reciprocal of the period (T). For waves, frequency relates to velocity (v) and wavelength (λ) through f = v/λ. For electromagnetic waves in vacuum, v = c ≈ 3×10⁸ m/s.",
    exampleUsage:
      "A wave with period T = 0.02s has frequency f = 1/0.02 = 50 Hz. Light with wavelength 500nm has f = 3×10⁸ / 500×10⁻⁹ = 6×10¹⁴ Hz.",
    faqs: [
      {
        question:
          "What is the difference between frequency and angular frequency?",
        answer:
          "Frequency (f) is in hertz (cycles per second). Angular frequency (ω) is in radians per second. They relate as ω = 2πf.",
      },
    ],
    relatedSlugs: [
      "wavelength-calculator",
      "frequency-to-period-converter",
      "energy-calculator",
    ],
  },
  {
    meta: {
      slug: "wavelength-calculator",
      title: "Wavelength Calculator – Find λ from Frequency & Velocity",
      shortTitle: "Wavelength Calculator",
      description:
        "Calculate the wavelength of electromagnetic or sound waves. Enter frequency and velocity to find wavelength. Supports all frequency units.",
      category: "physics",
      icon: "λ",
      keywords: [
        "wavelength calculator",
        "lambda",
        "electromagnetic wave",
        "wave equation",
      ],
    },
    formula: "λ = v / f",
    formulaExplanation:
      "Wavelength (λ) is the spatial period of a wave — the distance between consecutive peaks. It equals velocity divided by frequency. For electromagnetic waves in vacuum, use c ≈ 3×10⁸ m/s. For sound in air at 20°C, use v ≈ 343 m/s.",
    exampleUsage:
      "An FM radio station at 100 MHz: λ = 3×10⁸ / 100×10⁶ = 3m. A 1kHz sound wave in air: λ = 343 / 1000 = 0.343m ≈ 34.3cm.",
    faqs: [
      {
        question: "Does wavelength change in different media?",
        answer:
          "Yes. When a wave enters a different medium, its speed changes but frequency stays the same, so wavelength changes proportionally: λ = v/f.",
      },
    ],
    relatedSlugs: [
      "frequency-calculator",
      "frequency-to-period-converter",
      "energy-calculator",
    ],
  },
  // ─── CONVERSIONS ─────────────────────────────────────────
  {
    meta: {
      slug: "db-to-voltage-converter",
      title: "dB to Voltage Converter – Decibel to Voltage Ratio Calculator",
      shortTitle: "dB → Voltage",
      description:
        "Convert decibels (dB) to voltage ratio. Calculate voltage gain/attenuation from dB values. Essential for audio, RF, and signal processing engineers.",
      category: "conversions",
      icon: "dB",
      keywords: ["dB to voltage", "decibel converter", "voltage ratio", "gain"],
    },
    formula: "V_ratio = 10^(dB/20)",
    formulaExplanation:
      "Decibels express a ratio logarithmically. For voltage ratios: dB = 20 × log₁₀(V₂/V₁). To convert back: V₂/V₁ = 10^(dB/20). Note: for power ratios, use 10 instead of 20 in the formula.",
    exampleUsage:
      "20dB voltage gain means V_ratio = 10^(20/20) = 10^1 = 10, so the output voltage is 10× the input. -6dB means V_ratio = 10^(-6/20) ≈ 0.501, roughly half.",
    faqs: [
      {
        question: "What is the difference between dB for voltage and power?",
        answer:
          "For voltage: dB = 20×log₁₀(ratio). For power: dB = 10×log₁₀(ratio). This is because power is proportional to voltage squared.",
      },
    ],
    relatedSlugs: [
      "voltage-to-db-converter",
      "decibel-calculator",
      "log-calculator",
      "power-calculator",
    ],
  },
  {
    meta: {
      slug: "voltage-to-db-converter",
      title: "Voltage to dB Converter – Voltage Ratio to Decibels",
      shortTitle: "Voltage → dB",
      description:
        "Convert voltage ratio to decibels (dB). Calculate gain or attenuation in dB from voltage measurements. Used in audio, telecommunications, and RF engineering.",
      category: "conversions",
      icon: "V→dB",
      keywords: [
        "voltage to dB",
        "voltage ratio",
        "decibel",
        "gain calculation",
      ],
    },
    formula: "dB = 20 × log₁₀(V₂/V₁)",
    formulaExplanation:
      "The decibel scale converts multiplicative ratios to an additive logarithmic scale. For voltage ratios, multiply the base-10 logarithm by 20. Positive dB indicates amplification; negative dB indicates attenuation.",
    exampleUsage:
      "An amplifier with input 0.1V and output 5V: dB = 20 × log₁₀(5/0.1) = 20 × log₁₀(50) = 20 × 1.699 = 33.98dB.",
    faqs: [
      {
        question: "What is 0 dB?",
        answer:
          "0 dB means the ratio is 1:1 — no gain or loss. The output equals the input. It is the reference point on the dB scale.",
      },
    ],
    relatedSlugs: [
      "db-to-voltage-converter",
      "decibel-calculator",
      "log-calculator",
      "power-calculator",
    ],
  },
  {
    meta: {
      slug: "frequency-to-period-converter",
      title: "Frequency to Period Converter – Hz to Seconds Calculator",
      shortTitle: "Freq ↔ Period",
      description:
        "Convert between frequency and period instantly. Enter Hz, kHz, MHz, or GHz to find the corresponding period in seconds, milliseconds, microseconds, or nanoseconds.",
      category: "conversions",
      icon: "T↔f",
      keywords: ["frequency to period", "period to frequency", "Hz to seconds"],
    },
    formula: "T = 1/f | f = 1/T",
    formulaExplanation:
      "Period (T) and frequency (f) are reciprocals of each other. Period is the time for one complete cycle, measured in seconds. Frequency is the number of cycles per second, measured in hertz. T = 1/f and f = 1/T.",
    exampleUsage:
      "60 Hz AC power has period T = 1/60 = 16.67ms. A 2.4 GHz WiFi signal has period T = 1/(2.4×10⁹) ≈ 0.417 ns.",
    faqs: [
      {
        question: "What is the period of household AC power?",
        answer:
          "In countries using 60 Hz (like the US), the period is 1/60 ≈ 16.67ms. In countries using 50 Hz (like Australia, UK, Europe), it is 1/50 = 20ms.",
      },
    ],
    relatedSlugs: [
      "frequency-calculator",
      "wavelength-calculator",
      "rc-time-constant-calculator",
      "unit-converter-calculator",
    ],
  },
  {
    meta: {
      slug: "unit-converter-calculator",
      title: "Unit Converter – Length, Mass, Temperature, Pressure, Energy, Frequency",
      shortTitle: "Unit Converter",
      description:
        "Convert length, mass, temperature, pressure, energy, and frequency with exact SI factors. Temperature uses the affine Celsius/Fahrenheit/Kelvin relations. Shareable input URLs included.",
      category: "conversions",
      icon: "m↔ft",
      keywords: [
        "unit converter",
        "length conversion",
        "temperature converter",
        "pressure converter",
        "energy converter",
        "frequency converter",
      ],
      new: true,
      popular: true,
    },
    formula: "x_to = x_from × (k_from / k_to)    T_F = (9/5)T_C + 32    T_K = T_C + 273.15",
    formulaExplanation:
      "Linear quantities convert through an exact SI pivot: multiply by the source factor to reach metres, kilograms, pascals, joules, or hertz, then divide by the target factor. Temperature is affine, not a simple scale factor — Fahrenheit, Celsius, and Kelvin share an offset as well as a slope, so the converter always routes through Celsius.",
    exampleUsage:
      "1 inch = 0.0254 m exactly, so 1 in = 25.4 mm. 0 °C = 32 °F = 273.15 K. 1 kWh = 3.6×10⁶ J. 60 rpm = 1 Hz.",
    faqs: [
      {
        question: "Are the conversion factors exact?",
        answer:
          "Yes for the international definitions used here: 1 in = 25.4 mm, 1 lb = 0.45359237 kg, 1 atm = 101325 Pa, 1 cal = 4.184 J, and 1 eV = 1.602176634×10⁻¹⁹ J.",
      },
      {
        question: "Why is temperature handled differently?",
        answer:
          "Celsius, Fahrenheit, and Kelvin are related by T_F = (9/5)T_C + 32 and T_K = T_C + 273.15. A ratio-only conversion would miss the offsets (for example −40 °C = −40 °F).",
      },
      {
        question: "Can I share a conversion?",
        answer:
          "Yes. The selected quantity, units, and value are written to the URL, so copying the address reopens the same conversion.",
      },
    ],
    relatedSlugs: [
      "frequency-to-period-converter",
      "energy-calculator",
      "frequency-calculator",
      "decibel-calculator",
    ],
  },
  {
    meta: {
      slug: "decibel-calculator",
      title: "Decibel Calculator – Power/Voltage Ratios and Combining dB Sources",
      shortTitle: "Decibel",
      description:
        "Convert two powers or voltages to decibels, or add and subtract independent dB sources by summing 10^(dB/10). Shows the linear steps for every result.",
      category: "conversions",
      icon: "dB+",
      keywords: [
        "decibel calculator",
        "dB sum",
        "power ratio",
        "voltage ratio",
        "combine dB sources",
      ],
      new: true,
    },
    formula: "dB = 10 log₁₀(P₂/P₁)    dB = 20 log₁₀(V₂/V₁)    Σ = 10 log₁₀(Σ 10^(dBᵢ/10))",
    formulaExplanation:
      "Decibels express a ratio on a logarithmic scale. Power ratios use a factor of 10; voltage (or current) ratios use 20 because power is proportional to voltage squared. Independent uncorrelated sources must be added as linear powers: convert each level with 10^(dB/10), add or subtract, then convert back with 10 log₁₀.",
    exampleUsage:
      "P₂/P₁ = 2 gives 10 log₁₀(2) ≈ 3.0103 dB. Two independent 0 dB sources combine to 3.0103 dB, not 0 dB. 10 dB minus 3 dB in the linear domain is 10 log₁₀(10 − 2) ≈ 9.0309 dB, not 7 dB.",
    faqs: [
      {
        question: "Why can't I just add decibels?",
        answer:
          "Decibels are logarithms. Adding 3 dB + 3 dB as numbers would give 6 dB (a 4× power ratio), but two equal independent sources only double the power, which is +3.01 dB.",
      },
      {
        question: "When do I use 10 vs 20?",
        answer:
          "Use 10 for power (and intensity). Use 20 for field quantities such as voltage, current, or pressure, because those quantities square when converted to power.",
      },
      {
        question: "What happens if I subtract a larger source from a smaller one?",
        answer:
          "The linear difference becomes zero or negative, which is not a real positive power. The calculator reports that no real dB value exists.",
      },
    ],
    relatedSlugs: [
      "db-to-voltage-converter",
      "voltage-to-db-converter",
      "log-calculator",
      "power-calculator",
    ],
  },
];

export const calculators: CalculatorConfig[] = [
  ...baseCalculators,
  ...advancedCalculators,
];

export function getCalculatorBySlug(
  slug: string,
): CalculatorConfig | undefined {
  return calculators.find((c) => c.meta.slug === slug);
}

export function getCalculatorsByCategory(category: string): CalculatorConfig[] {
  return calculators.filter((c) => c.meta.category === category);
}

export function getRelatedCalculators(slugs: string[]): CalculatorConfig[] {
  return slugs
    .map((s) => calculators.find((c) => c.meta.slug === s))
    .filter(Boolean) as CalculatorConfig[];
}

export function getPopularCalculators(): CalculatorConfig[] {
  return calculators.filter((c) => c.meta.popular);
}

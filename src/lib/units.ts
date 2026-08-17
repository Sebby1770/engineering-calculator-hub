export type UnitCategory =
  | "length"
  | "mass"
  | "temperature"
  | "pressure"
  | "energy"
  | "frequency";

export type UnitDefinition = {
  id: string;
  label: string;
  symbol: string;
  /** Multiply by this to reach the category SI base. Unused for temperature. */
  toSi?: number;
};

export type ConversionStep = {
  label: string;
  value: string;
};

const LENGTH_SI = "m";
const MASS_SI = "kg";
const PRESSURE_SI = "Pa";
const ENERGY_SI = "J";
const FREQUENCY_SI = "Hz";

/** Exact SI / international definitions. */
export const UNIT_CATEGORIES: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: "m", label: "Metre", symbol: "m", toSi: 1 },
    { id: "km", label: "Kilometre", symbol: "km", toSi: 1000 },
    { id: "cm", label: "Centimetre", symbol: "cm", toSi: 0.01 },
    { id: "mm", label: "Millimetre", symbol: "mm", toSi: 0.001 },
    { id: "um", label: "Micrometre", symbol: "µm", toSi: 1e-6 },
    { id: "nm", label: "Nanometre", symbol: "nm", toSi: 1e-9 },
    { id: "in", label: "Inch", symbol: "in", toSi: 0.0254 },
    { id: "ft", label: "Foot", symbol: "ft", toSi: 0.3048 },
    { id: "yd", label: "Yard", symbol: "yd", toSi: 0.9144 },
    { id: "mi", label: "Mile", symbol: "mi", toSi: 1609.344 },
    { id: "nmi", label: "Nautical mile", symbol: "nmi", toSi: 1852 },
  ],
  mass: [
    { id: "kg", label: "Kilogram", symbol: "kg", toSi: 1 },
    { id: "g", label: "Gram", symbol: "g", toSi: 0.001 },
    { id: "mg", label: "Milligram", symbol: "mg", toSi: 1e-6 },
    { id: "ug", label: "Microgram", symbol: "µg", toSi: 1e-9 },
    { id: "t", label: "Tonne", symbol: "t", toSi: 1000 },
    { id: "lb", label: "Pound", symbol: "lb", toSi: 0.45359237 },
    { id: "oz", label: "Ounce", symbol: "oz", toSi: 0.028349523125 },
    { id: "st", label: "Stone", symbol: "st", toSi: 6.35029318 },
  ],
  temperature: [
    { id: "C", label: "Celsius", symbol: "°C" },
    { id: "F", label: "Fahrenheit", symbol: "°F" },
    { id: "K", label: "Kelvin", symbol: "K" },
  ],
  pressure: [
    { id: "Pa", label: "Pascal", symbol: "Pa", toSi: 1 },
    { id: "kPa", label: "Kilopascal", symbol: "kPa", toSi: 1000 },
    { id: "MPa", label: "Megapascal", symbol: "MPa", toSi: 1e6 },
    { id: "bar", label: "Bar", symbol: "bar", toSi: 1e5 },
    { id: "atm", label: "Standard atmosphere", symbol: "atm", toSi: 101325 },
    { id: "psi", label: "Pound-force per square inch", symbol: "psi", toSi: 6894.757293168361 },
    { id: "torr", label: "Torr", symbol: "Torr", toSi: 101325 / 760 },
    { id: "mmHg", label: "Millimetre of mercury", symbol: "mmHg", toSi: 101325 / 760 },
  ],
  energy: [
    { id: "J", label: "Joule", symbol: "J", toSi: 1 },
    { id: "kJ", label: "Kilojoule", symbol: "kJ", toSi: 1000 },
    { id: "MJ", label: "Megajoule", symbol: "MJ", toSi: 1e6 },
    { id: "cal", label: "Thermochemical calorie", symbol: "cal", toSi: 4.184 },
    { id: "kcal", label: "Kilocalorie", symbol: "kcal", toSi: 4184 },
    { id: "Wh", label: "Watt-hour", symbol: "Wh", toSi: 3600 },
    { id: "kWh", label: "Kilowatt-hour", symbol: "kWh", toSi: 3.6e6 },
    { id: "eV", label: "Electronvolt", symbol: "eV", toSi: 1.602176634e-19 },
    { id: "Btu", label: "International Table BTU", symbol: "Btu", toSi: 1055.05585262 },
  ],
  frequency: [
    { id: "Hz", label: "Hertz", symbol: "Hz", toSi: 1 },
    { id: "kHz", label: "Kilohertz", symbol: "kHz", toSi: 1000 },
    { id: "MHz", label: "Megahertz", symbol: "MHz", toSi: 1e6 },
    { id: "GHz", label: "Gigahertz", symbol: "GHz", toSi: 1e9 },
    { id: "THz", label: "Terahertz", symbol: "THz", toSi: 1e12 },
    { id: "rpm", label: "Revolutions per minute", symbol: "rpm", toSi: 1 / 60 },
  ],
};

const SI_LABEL: Record<Exclude<UnitCategory, "temperature">, string> = {
  length: LENGTH_SI,
  mass: MASS_SI,
  pressure: PRESSURE_SI,
  energy: ENERGY_SI,
  frequency: FREQUENCY_SI,
};

export const UNIT_CATEGORY_LIST: { id: UnitCategory; label: string }[] = [
  { id: "length", label: "Length" },
  { id: "mass", label: "Mass" },
  { id: "temperature", label: "Temperature" },
  { id: "pressure", label: "Pressure" },
  { id: "energy", label: "Energy" },
  { id: "frequency", label: "Frequency" },
];

export function isUnitCategory(value: string): value is UnitCategory {
  return value in UNIT_CATEGORIES;
}

export function getUnits(category: UnitCategory): UnitDefinition[] {
  return UNIT_CATEGORIES[category];
}

export function getUnit(category: UnitCategory, id: string): UnitDefinition | undefined {
  return UNIT_CATEGORIES[category].find((unit) => unit.id === id);
}

function requireUnit(category: UnitCategory, id: string): UnitDefinition {
  const unit = getUnit(category, id);
  if (!unit) {
    throw new Error(`Unknown ${category} unit: ${id}`);
  }
  return unit;
}

export function celsiusFrom(value: number, fromId: string): number {
  if (fromId === "C") return value;
  if (fromId === "F") return ((value - 32) * 5) / 9;
  if (fromId === "K") return value - 273.15;
  throw new Error(`Unknown temperature unit: ${fromId}`);
}

export function celsiusTo(celsius: number, toId: string): number {
  if (toId === "C") return celsius;
  if (toId === "F") return (celsius * 9) / 5 + 32;
  if (toId === "K") return celsius + 273.15;
  throw new Error(`Unknown temperature unit: ${toId}`);
}

export function convert(
  value: number,
  fromId: string,
  toId: string,
  category: UnitCategory,
): number {
  if (!Number.isFinite(value)) {
    throw new Error("Value must be a finite number");
  }

  if (category === "temperature") {
    requireUnit(category, fromId);
    requireUnit(category, toId);
    return celsiusTo(celsiusFrom(value, fromId), toId);
  }

  const from = requireUnit(category, fromId);
  const to = requireUnit(category, toId);
  if (from.toSi === undefined || to.toSi === undefined) {
    throw new Error(`Missing conversion factor for ${fromId} or ${toId}`);
  }
  return (value * from.toSi) / to.toSi;
}

export function formatConverted(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e9)) {
    return value.toExponential(10);
  }
  return value.toPrecision(12).replace(/\.?0+$/, (match, offset, full) => {
    if (!full.includes(".")) return match;
    return "";
  });
}

export function convertWithSteps(
  value: number,
  fromId: string,
  toId: string,
  category: UnitCategory,
): { result: number; formatted: string; steps: ConversionStep[] } {
  const from = requireUnit(category, fromId);
  const to = requireUnit(category, toId);
  const result = convert(value, fromId, toId, category);
  const formatted = formatConverted(result);

  if (category === "temperature") {
    const celsius = celsiusFrom(value, fromId);
    return {
      result,
      formatted,
      steps: [
        { label: "Affine temperature scale", value: "Convert via Celsius, then to the target scale" },
        { label: "To Celsius", value: `${value} ${from.symbol} → ${formatConverted(celsius)} °C` },
        { label: "To target", value: `${formatConverted(celsius)} °C → ${formatted} ${to.symbol}` },
      ],
    };
  }

  const si = value * (from.toSi ?? 1);
  return {
    result,
    formatted,
    steps: [
      { label: "Exact factor path", value: `${from.symbol} → ${SI_LABEL[category]} → ${to.symbol}` },
      { label: "To SI", value: `${value} × ${from.toSi} = ${formatConverted(si)} ${SI_LABEL[category]}` },
      {
        label: "From SI",
        value: `${formatConverted(si)} / ${to.toSi} = ${formatted} ${to.symbol}`,
      },
    ],
  };
}

/**
 * Integer / bitwise helpers for the binary workshop.
 * Width is 8, 16, 32, or 64. Values are treated as unsigned bit patterns
 * unless two's-complement signed interpretation is requested.
 */

export const BINARY_WIDTHS = [8, 16, 32, 64] as const;
export type BinaryWidth = (typeof BINARY_WIDTHS)[number];
export type BinaryRadix = 2 | 8 | 10 | 16;
export type BitwiseOp = "and" | "or" | "xor" | "nand" | "nor" | "not" | "shl" | "shr";

export type WorkStep = { label: string; value: string };

const RADIX_NAME: Record<BinaryRadix, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

export function maskForWidth(width: BinaryWidth): bigint {
  if (width === 64) return (1n << 64n) - 1n;
  return (1n << BigInt(width)) - 1n;
}

export function wrapBits(value: bigint, width: BinaryWidth): bigint {
  return value & maskForWidth(width);
}

export function parseInteger(raw: string, radix: BinaryRadix): bigint {
  const text = String(raw ?? "").trim().replace(/[\s_]/g, "");
  if (!text) throw new Error(`Enter a ${RADIX_NAME[radix]} value.`);

  let body = text;
  if (radix === 2 && /^(0b)/i.test(body)) body = body.slice(2);
  if (radix === 8 && /^(0o)/i.test(body)) body = body.slice(2);
  if (radix === 16 && /^(0x)/i.test(body)) body = body.slice(2);

  const signed = radix === 10 && body.startsWith("-");
  if (signed) body = body.slice(1);
  if (!body) throw new Error(`Enter a ${RADIX_NAME[radix]} value.`);

  const pattern =
    radix === 2 ? /^[01]+$/i :
    radix === 8 ? /^[0-7]+$/i :
    radix === 10 ? /^[0-9]+$/ :
    /^[0-9a-f]+$/i;

  if (!pattern.test(body)) {
    throw new Error(`"${raw.trim()}" is not valid ${RADIX_NAME[radix]}.`);
  }

  const magnitude = BigInt(radix === 10 ? body : `${radix === 2 ? "0b" : radix === 8 ? "0o" : "0x"}${body}`);
  return signed ? -magnitude : magnitude;
}

export function formatGroupedBits(value: bigint, width: BinaryWidth): string {
  const bits = wrapBits(value, width).toString(2).padStart(width, "0");
  return bits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatHex(value: bigint, width: BinaryWidth): string {
  const hexWidth = width / 4;
  return wrapBits(value, width).toString(16).toUpperCase().padStart(hexWidth, "0");
}

export function signedFromBits(value: bigint, width: BinaryWidth): bigint {
  const bits = wrapBits(value, width);
  const sign = 1n << BigInt(width - 1);
  return (bits & sign) !== 0n ? bits - (sign << 1n) : bits;
}

export type ConvertedInteger = {
  decimal: string;
  signed: string;
  binary: string;
  grouped: string;
  hex: string;
  octal: string;
  width: BinaryWidth;
  steps: WorkStep[];
};

export function convertInteger(raw: string, radix: BinaryRadix, width: BinaryWidth): ConvertedInteger {
  const parsed = parseInteger(raw, radix);
  const bits = wrapBits(parsed, width);
  const signed = signedFromBits(bits, width);
  const grouped = formatGroupedBits(bits, width);
  const hex = formatHex(bits, width);
  const octal = bits.toString(8);
  const steps: WorkStep[] = [
    { label: "Input", value: `${raw.trim()} (${RADIX_NAME[radix]})` },
    { label: "Bit pattern", value: grouped },
    { label: "Unsigned", value: bits.toString(10) },
    { label: "Signed (two's complement)", value: signed.toString(10) },
    { label: "Hex", value: `0x${hex}` },
  ];
  if (parsed !== bits && parsed !== signed) {
    steps.splice(1, 0, {
      label: "Wrapped to width",
      value: `${parsed.toString(10)} → ${width}-bit pattern ${grouped}`,
    });
  }
  return {
    decimal: bits.toString(10),
    signed: signed.toString(10),
    binary: bits.toString(2).padStart(width, "0"),
    grouped,
    hex,
    octal,
    width,
    steps,
  };
}

export type BitwiseResult = {
  result: bigint;
  grouped: string;
  hex: string;
  decimal: string;
  signed: string;
  steps: WorkStep[];
};

function shiftAmount(b: bigint, width: BinaryWidth): number {
  const cap = BigInt(width);
  if (b < 0n) throw new Error("Shift count must be zero or positive.");
  const n = b > cap ? cap : b;
  return Number(n);
}

export function bitwise(
  aRaw: string,
  bRaw: string,
  op: BitwiseOp,
  width: BinaryWidth,
  radix: BinaryRadix = 10,
): BitwiseResult {
  const a = wrapBits(parseInteger(aRaw, radix), width);
  const unary = op === "not";
  const b = unary ? 0n : wrapBits(parseInteger(bRaw, radix), width);
  const mask = maskForWidth(width);

  let result: bigint;
  switch (op) {
    case "and":
      result = a & b;
      break;
    case "or":
      result = a | b;
      break;
    case "xor":
      result = a ^ b;
      break;
    case "nand":
      result = ~(a & b) & mask;
      break;
    case "nor":
      result = ~(a | b) & mask;
      break;
    case "not":
      result = ~a & mask;
      break;
    case "shl":
      result = wrapBits(a << BigInt(shiftAmount(b, width)), width);
      break;
    case "shr":
      result = a >> BigInt(shiftAmount(b, width));
      break;
    default:
      throw new Error("Unknown bitwise operation.");
  }

  const grouped = formatGroupedBits(result, width);
  const hex = formatHex(result, width);
  const signed = signedFromBits(result, width);
  const opLabel = op.toUpperCase();
  const steps: WorkStep[] = [
    { label: "A", value: formatGroupedBits(a, width) },
  ];
  if (!unary) steps.push({ label: "B", value: formatGroupedBits(b, width) });
  steps.push({ label: opLabel, value: grouped });
  steps.push({ label: "Unsigned", value: result.toString(10) });

  return {
    result,
    grouped,
    hex,
    decimal: result.toString(10),
    signed: signed.toString(10),
    steps,
  };
}

export type TwosResult = {
  bits: string;
  grouped: string;
  hex: string;
  unsigned: string;
  signed: string;
  steps: WorkStep[];
};

export function twosComplement(raw: string, width: BinaryWidth): TwosResult {
  const value = parseInteger(raw, 10);
  const min = -(1n << BigInt(width - 1));
  const max = (1n << BigInt(width - 1)) - 1n;
  if (value < min || value > max) {
    throw new Error(`${width}-bit two's complement holds ${min} … ${max}.`);
  }
  const bits = wrapBits(value, width);
  const grouped = formatGroupedBits(bits, width);
  const magnitude = value < 0n ? -value : value;
  const magBits = wrapBits(magnitude, width);
  const inverted = wrapBits(~magBits, width);
  const steps: WorkStep[] = [
    { label: "Signed input", value: value.toString(10) },
  ];
  if (value < 0n) {
    steps.push({ label: "Magnitude bits", value: formatGroupedBits(magBits, width) });
    steps.push({ label: "Invert", value: formatGroupedBits(inverted, width) });
    steps.push({ label: "Add 1", value: grouped });
  } else {
    steps.push({ label: "Positive pattern", value: grouped });
  }
  return {
    bits: bits.toString(2).padStart(width, "0"),
    grouped,
    hex: formatHex(bits, width),
    unsigned: bits.toString(10),
    signed: value.toString(10),
    steps,
  };
}

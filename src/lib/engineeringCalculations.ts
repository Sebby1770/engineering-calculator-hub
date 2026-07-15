export interface EngineeringOutput {
  label: string;
  value: number | string;
  unit?: string;
  emphasis?: boolean;
}

export interface EngineeringStep {
  label: string;
  value: string;
}

export interface EngineeringResult {
  summary: string;
  outputs: EngineeringOutput[];
  steps: EngineeringStep[];
  warning?: string;
}

export interface VoltageDividerAnalysis {
  unloadedVoltage: number;
  loadedVoltage: number;
  sourceCurrent: number;
  outputResistance: number;
  r1Power: number;
  r2Power: number;
  loadPower: number;
  worstCaseLow: number;
  worstCaseHigh: number;
  loadingErrorPercent: number;
}

function requireFinite(values: Record<string, number>) {
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) throw new Error(`${name} must be a valid number.`);
  }
}

function requirePositive(values: Record<string, number>) {
  requireFinite(values);
  for (const [name, value] of Object.entries(values)) {
    if (value <= 0) throw new Error(`${name} must be greater than zero.`);
  }
}

export function formatEngineering(value: number, digits = 5) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude >= 1e6 || magnitude < 1e-3) return value.toExponential(Math.max(1, digits - 1));
  return Number(value.toPrecision(digits)).toString();
}

const E24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];

export function nextE24Resistance(required: number) {
  if (!Number.isFinite(required) || required <= 0) throw new Error('Required resistance must be positive.');
  const decade = 10 ** (Math.floor(Math.log10(required)) - 1);
  const normalized = required / decade;
  const preferred = E24.find((value) => value >= normalized);
  return preferred ? preferred * decade : 100 * decade;
}

function parallel(a: number, b: number) {
  return (a * b) / (a + b);
}

export function analyzeVoltageDivider(input: {
  inputVoltage: number;
  r1Ohm: number;
  r2Ohm: number;
  loadOhm?: number;
  resistorTolerancePercent?: number;
  supplyTolerancePercent?: number;
}): VoltageDividerAnalysis {
  requirePositive({ inputVoltage: input.inputVoltage, r1Ohm: input.r1Ohm, r2Ohm: input.r2Ohm });
  const loadOhm = input.loadOhm && input.loadOhm > 0 ? input.loadOhm : Number.POSITIVE_INFINITY;
  const resistorTolerance = Math.max(0, input.resistorTolerancePercent ?? 0) / 100;
  const supplyTolerance = Math.max(0, input.supplyTolerancePercent ?? 0) / 100;
  if (resistorTolerance > 0.5) throw new Error('Resistor tolerance must be 50% or less.');
  if (supplyTolerance > 0.5) throw new Error('Supply tolerance must be 50% or less.');

  const unloadedVoltage = input.inputVoltage * (input.r2Ohm / (input.r1Ohm + input.r2Ohm));
  const effectiveR2 = Number.isFinite(loadOhm) ? parallel(input.r2Ohm, loadOhm) : input.r2Ohm;
  const loadedVoltage = input.inputVoltage * (effectiveR2 / (input.r1Ohm + effectiveR2));
  const sourceCurrent = input.inputVoltage / (input.r1Ohm + effectiveR2);
  const outputResistance = parallel(input.r1Ohm, input.r2Ohm);
  const r1Power = sourceCurrent ** 2 * input.r1Ohm;
  const r2Power = loadedVoltage ** 2 / input.r2Ohm;
  const loadPower = Number.isFinite(loadOhm) ? loadedVoltage ** 2 / loadOhm : 0;

  const lowR1 = input.r1Ohm * (1 - resistorTolerance);
  const highR1 = input.r1Ohm * (1 + resistorTolerance);
  const lowR2 = input.r2Ohm * (1 - resistorTolerance);
  const highR2 = input.r2Ohm * (1 + resistorTolerance);
  const lowEffectiveR2 = Number.isFinite(loadOhm) ? parallel(lowR2, loadOhm) : lowR2;
  const highEffectiveR2 = Number.isFinite(loadOhm) ? parallel(highR2, loadOhm) : highR2;
  const worstCaseLow = input.inputVoltage * (1 - supplyTolerance) * (lowEffectiveR2 / (highR1 + lowEffectiveR2));
  const worstCaseHigh = input.inputVoltage * (1 + supplyTolerance) * (highEffectiveR2 / (lowR1 + highEffectiveR2));

  return {
    unloadedVoltage,
    loadedVoltage,
    sourceCurrent,
    outputResistance,
    r1Power,
    r2Power,
    loadPower,
    worstCaseLow,
    worstCaseHigh,
    loadingErrorPercent: unloadedVoltage === 0 ? 0 : ((loadedVoltage - unloadedVoltage) / unloadedVoltage) * 100,
  };
}

function e24Values(min = 10, max = 10_000_000) {
  const values: number[] = [];
  for (let exponent = -1; exponent <= 6; exponent += 1) {
    const scale = 10 ** exponent;
    for (const preferred of E24) {
      const value = preferred * scale;
      if (value >= min && value <= max) values.push(value);
    }
  }
  return values;
}

export function designVoltageDivider(input: {
  inputVoltage: number;
  targetVoltage: number;
  targetCurrentMa: number;
  loadOhm?: number;
  resistorTolerancePercent?: number;
  supplyTolerancePercent?: number;
}) {
  requirePositive({
    inputVoltage: input.inputVoltage,
    targetVoltage: input.targetVoltage,
    targetCurrentMa: input.targetCurrentMa,
  });
  if (input.targetVoltage >= input.inputVoltage) {
    throw new Error('Target voltage must be lower than the input voltage.');
  }
  const targetCurrent = input.targetCurrentMa / 1_000;
  const candidates = e24Values();
  let best: { r1Ohm: number; r2Ohm: number; analysis: VoltageDividerAnalysis; score: number } | null = null;

  for (const r1Ohm of candidates) {
    for (const r2Ohm of candidates) {
      const analysis = analyzeVoltageDivider({
        ...input,
        r1Ohm,
        r2Ohm,
      });
      const voltageError = Math.abs(analysis.loadedVoltage - input.targetVoltage) / input.targetVoltage;
      const currentError = Math.abs(Math.log(Math.max(analysis.sourceCurrent, 1e-12) / targetCurrent));
      const score = voltageError * 100 + currentError * 0.08;
      if (!best || score < best.score) best = { r1Ohm, r2Ohm, analysis, score };
    }
  }
  if (!best) throw new Error('No preferred resistor pair was found.');
  return best;
}

function recommendedPowerRating(dissipation: number) {
  const target = dissipation * 2;
  return [0.125, 0.25, 0.5, 1, 2, 3, 5, 10].find((rating) => rating >= target) ?? target;
}

export function calculateLedResistor(input: {
  supplyVoltage: number;
  forwardVoltage: number;
  ledCount: number;
  targetCurrentMa: number;
}): EngineeringResult {
  const { supplyVoltage, forwardVoltage, targetCurrentMa } = input;
  const ledCount = Math.round(input.ledCount);
  requirePositive({ supplyVoltage, forwardVoltage, ledCount, targetCurrentMa });
  const ledVoltage = forwardVoltage * ledCount;
  const resistorVoltage = supplyVoltage - ledVoltage;
  if (resistorVoltage <= 0) throw new Error('The supply voltage must exceed the total LED forward voltage.');
  const targetCurrent = targetCurrentMa / 1_000;
  const idealResistance = resistorVoltage / targetCurrent;
  const e24Resistance = nextE24Resistance(idealResistance);
  const actualCurrent = resistorVoltage / e24Resistance;
  const dissipation = actualCurrent ** 2 * e24Resistance;
  const rating = recommendedPowerRating(dissipation);
  return {
    summary: `Use ${formatEngineering(e24Resistance)} Ω (E24), rated at least ${formatEngineering(rating)} W; expected LED current is ${formatEngineering(actualCurrent * 1_000)} mA.`,
    outputs: [
      { label: 'Recommended resistor', value: formatEngineering(e24Resistance), unit: 'Ω', emphasis: true },
      { label: 'Expected current', value: formatEngineering(actualCurrent * 1_000), unit: 'mA' },
      { label: 'Resistor dissipation', value: formatEngineering(dissipation), unit: 'W' },
      { label: 'Minimum practical rating', value: formatEngineering(rating), unit: 'W' },
    ],
    steps: [
      { label: 'LED string voltage', value: `${ledCount} × ${forwardVoltage} V = ${formatEngineering(ledVoltage)} V` },
      { label: 'Voltage across resistor', value: `${supplyVoltage} V − ${formatEngineering(ledVoltage)} V = ${formatEngineering(resistorVoltage)} V` },
      { label: 'Ideal resistance', value: `${formatEngineering(resistorVoltage)} V ÷ ${formatEngineering(targetCurrent)} A = ${formatEngineering(idealResistance)} Ω` },
      { label: 'Preferred value check', value: `Next higher E24 value = ${formatEngineering(e24Resistance)} Ω; I = V/R = ${formatEngineering(actualCurrent * 1_000)} mA` },
    ],
    warning: 'Verify the LED forward-voltage range from its datasheet and check worst-case current at the highest supply voltage.',
  };
}

export function calculatePcbTraceDrop(input: {
  lengthMm: number;
  widthMm: number;
  thicknessUm: number;
  currentA: number;
}): EngineeringResult {
  requirePositive(input);
  const lengthM = input.lengthMm / 1_000;
  const widthM = input.widthMm / 1_000;
  const thicknessM = input.thicknessUm / 1_000_000;
  const crossSectionM2 = widthM * thicknessM;
  const resistance = (1.724e-8 * lengthM) / crossSectionM2;
  const voltageDrop = resistance * input.currentA;
  const power = input.currentA ** 2 * resistance;
  const areaMm2 = input.widthMm * (input.thicknessUm / 1_000);
  const currentDensity = input.currentA / areaMm2;
  return {
    summary: `${formatEngineering(resistance)} Ω trace resistance, ${formatEngineering(voltageDrop)} V drop, and ${formatEngineering(power)} W copper loss.`,
    outputs: [
      { label: 'Trace resistance', value: formatEngineering(resistance), unit: 'Ω', emphasis: true },
      { label: 'Voltage drop', value: formatEngineering(voltageDrop), unit: 'V' },
      { label: 'Copper loss', value: formatEngineering(power), unit: 'W' },
      { label: 'Current density', value: formatEngineering(currentDensity), unit: 'A/mm²' },
    ],
    steps: [
      { label: 'Cross-sectional area', value: `${input.widthMm} mm × ${input.thicknessUm / 1_000} mm = ${formatEngineering(areaMm2)} mm²` },
      { label: 'Copper resistance', value: `R = ρL/A = ${formatEngineering(resistance)} Ω (ρ = 1.724×10⁻⁸ Ω·m at 20°C)` },
      { label: 'Electrical drop', value: `V = IR = ${input.currentA} A × ${formatEngineering(resistance)} Ω = ${formatEngineering(voltageDrop)} V` },
      { label: 'Copper heating', value: `P = I²R = ${formatEngineering(power)} W` },
    ],
    warning: 'This is a DC resistance estimate at 20°C, not an IPC thermal/current-capacity calculation. Account for copper temperature, vias, planes, ambient conditions, and fabrication tolerances.',
  };
}

export function calculateSeriesRlc(input: { resistanceOhm: number; inductanceMh: number; capacitanceNf: number }): EngineeringResult {
  requirePositive(input);
  const inductance = input.inductanceMh / 1_000;
  const capacitance = input.capacitanceNf / 1e9;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
  const q = Math.sqrt(inductance / capacitance) / input.resistanceOhm;
  const bandwidth = f0 / q;
  const omega = 2 * Math.PI * f0;
  return {
    summary: `Series resonance occurs at ${formatEngineering(f0)} Hz with Q ≈ ${formatEngineering(q)} and −3 dB bandwidth ≈ ${formatEngineering(bandwidth)} Hz.`,
    outputs: [
      { label: 'Resonant frequency', value: formatEngineering(f0), unit: 'Hz', emphasis: true },
      { label: 'Angular frequency', value: formatEngineering(omega), unit: 'rad/s' },
      { label: 'Quality factor', value: formatEngineering(q) },
      { label: 'Approx. bandwidth', value: formatEngineering(bandwidth), unit: 'Hz' },
    ],
    steps: [
      { label: 'Convert components', value: `L = ${formatEngineering(inductance)} H, C = ${formatEngineering(capacitance)} F` },
      { label: 'Resonant frequency', value: `f₀ = 1/(2π√LC) = ${formatEngineering(f0)} Hz` },
      { label: 'Series quality factor', value: `Q = √(L/C)/R = ${formatEngineering(q)}` },
      { label: 'Bandwidth estimate', value: `BW = f₀/Q = ${formatEngineering(bandwidth)} Hz` },
    ],
  };
}

export function calculateThreePhasePower(input: {
  lineVoltage: number;
  lineCurrent: number;
  powerFactor: number;
  efficiencyPercent: number;
}): EngineeringResult {
  requirePositive({ lineVoltage: input.lineVoltage, lineCurrent: input.lineCurrent });
  requireFinite({ powerFactor: input.powerFactor, efficiencyPercent: input.efficiencyPercent });
  if (input.powerFactor <= 0 || input.powerFactor > 1) throw new Error('Power factor must be greater than 0 and no more than 1.');
  if (input.efficiencyPercent <= 0 || input.efficiencyPercent > 100) throw new Error('Efficiency must be between 0 and 100%.');
  const apparent = Math.sqrt(3) * input.lineVoltage * input.lineCurrent;
  const realInput = apparent * input.powerFactor;
  const reactive = apparent * Math.sqrt(Math.max(0, 1 - input.powerFactor ** 2));
  const output = realInput * (input.efficiencyPercent / 100);
  return {
    summary: `${formatEngineering(realInput / 1_000)} kW real input power and ${formatEngineering(output / 1_000)} kW estimated output at ${input.efficiencyPercent}% efficiency.`,
    outputs: [
      { label: 'Real input power', value: formatEngineering(realInput / 1_000), unit: 'kW', emphasis: true },
      { label: 'Apparent power', value: formatEngineering(apparent / 1_000), unit: 'kVA' },
      { label: 'Reactive power', value: formatEngineering(reactive / 1_000), unit: 'kVAr' },
      { label: 'Estimated output', value: formatEngineering(output / 1_000), unit: 'kW' },
    ],
    steps: [
      { label: 'Apparent power', value: `S = √3 × Vₗ × Iₗ = ${formatEngineering(apparent / 1_000)} kVA` },
      { label: 'Real input power', value: `P = S × PF = ${formatEngineering(realInput / 1_000)} kW` },
      { label: 'Reactive power', value: `Q = S√(1−PF²) = ${formatEngineering(reactive / 1_000)} kVAr` },
      { label: 'Output estimate', value: `Pout = Pin × η = ${formatEngineering(output / 1_000)} kW` },
    ],
    warning: 'Assumes a balanced three-phase system and line-to-line voltage. Use measured phase quantities for unbalanced systems.',
  };
}

export function calculateBatteryRuntime(input: {
  capacityAh: number;
  nominalVoltage: number;
  loadWatts: number;
  efficiencyPercent: number;
  usablePercent: number;
}): EngineeringResult {
  requirePositive({ capacityAh: input.capacityAh, nominalVoltage: input.nominalVoltage, loadWatts: input.loadWatts });
  requireFinite({ efficiencyPercent: input.efficiencyPercent, usablePercent: input.usablePercent });
  if (input.efficiencyPercent <= 0 || input.efficiencyPercent > 100) throw new Error('Efficiency must be between 0 and 100%.');
  if (input.usablePercent <= 0 || input.usablePercent > 100) throw new Error('Usable capacity must be between 0 and 100%.');
  const nameplateWh = input.capacityAh * input.nominalVoltage;
  const efficiency = input.efficiencyPercent / 100;
  const usableWh = nameplateWh * (input.usablePercent / 100) * efficiency;
  const runtimeHours = usableWh / input.loadWatts;
  const loadCurrent = input.loadWatts / (input.nominalVoltage * efficiency);
  return {
    summary: `Estimated runtime is ${formatEngineering(runtimeHours)} hours (${formatEngineering(runtimeHours * 60)} minutes) from ${formatEngineering(usableWh)} usable Wh.`,
    outputs: [
      { label: 'Estimated runtime', value: formatEngineering(runtimeHours), unit: 'h', emphasis: true },
      { label: 'Usable energy', value: formatEngineering(usableWh), unit: 'Wh' },
      { label: 'Nameplate energy', value: formatEngineering(nameplateWh), unit: 'Wh' },
      { label: 'Approx. battery current', value: formatEngineering(loadCurrent), unit: 'A' },
    ],
    steps: [
      { label: 'Nameplate energy', value: `${input.capacityAh} Ah × ${input.nominalVoltage} V = ${formatEngineering(nameplateWh)} Wh` },
      { label: 'Usable energy', value: `${formatEngineering(nameplateWh)} Wh × ${input.usablePercent}% × ${input.efficiencyPercent}% = ${formatEngineering(usableWh)} Wh` },
      { label: 'Runtime', value: `${formatEngineering(usableWh)} Wh ÷ ${input.loadWatts} W = ${formatEngineering(runtimeHours)} h` },
      { label: 'Battery current', value: `${input.loadWatts} W ÷ (${input.nominalVoltage} V × ${input.efficiencyPercent}%) = ${formatEngineering(loadCurrent)} A` },
    ],
    warning: 'Real runtime varies with discharge rate, temperature, battery age, voltage cut-off, converter standby loss, and the manufacturer’s capacity test conditions.',
  };
}

export function calculateAdcResolution(input: { bits: number; referenceVoltage: number; inputVoltage: number }): EngineeringResult {
  requirePositive({ referenceVoltage: input.referenceVoltage });
  requireFinite({ bits: input.bits, inputVoltage: input.inputVoltage });
  const bits = Math.round(input.bits);
  if (bits < 1 || bits > 32) throw new Error('Resolution must be between 1 and 32 bits.');
  if (input.inputVoltage < 0 || input.inputVoltage > input.referenceVoltage) throw new Error('Input voltage must be between 0 V and the reference voltage.');
  const levels = 2 ** bits;
  const lsb = input.referenceVoltage / levels;
  const code = Math.min(levels - 1, Math.max(0, Math.round(input.inputVoltage / lsb)));
  const quantizedVoltage = code * lsb;
  const error = quantizedVoltage - input.inputVoltage;
  const maxCode = levels - 1;
  return {
    summary: `${bits}-bit LSB size is ${formatEngineering(lsb * 1_000)} mV; ${formatEngineering(input.inputVoltage)} V maps to code ${code} (0x${code.toString(16).toUpperCase()}).`,
    outputs: [
      { label: 'LSB size', value: formatEngineering(lsb * 1_000), unit: 'mV', emphasis: true },
      { label: 'Digital code', value: `${code} / ${maxCode}` },
      { label: 'Hex code', value: `0x${code.toString(16).toUpperCase()}` },
      { label: 'Ideal quantization error', value: formatEngineering(error * 1_000), unit: 'mV' },
    ],
    steps: [
      { label: 'Available levels', value: `2^${bits} = ${levels.toLocaleString()} levels` },
      { label: 'LSB size', value: `${input.referenceVoltage} V ÷ ${levels} = ${formatEngineering(lsb)} V` },
      { label: 'Ideal code', value: `round(${input.inputVoltage} V ÷ ${formatEngineering(lsb)} V) = ${code}` },
      { label: 'Quantized voltage', value: `${code} × ${formatEngineering(lsb)} V = ${formatEngineering(quantizedVoltage)} V` },
    ],
    warning: 'This is the ideal transfer function. Include offset, gain, INL/DNL, reference, noise, and input-driver errors from the actual ADC datasheet.',
  };
}

export function calculateRcLowPass(input: { resistanceKohm: number; capacitanceNf: number; signalFrequencyHz: number }): EngineeringResult {
  requirePositive(input);
  const resistance = input.resistanceKohm * 1_000;
  const capacitance = input.capacitanceNf / 1e9;
  const tau = resistance * capacitance;
  const cutoff = 1 / (2 * Math.PI * tau);
  const ratio = input.signalFrequencyHz / cutoff;
  const gain = 1 / Math.sqrt(1 + ratio ** 2);
  const attenuationDb = 20 * Math.log10(gain);
  const phase = -(Math.atan(ratio) * 180) / Math.PI;
  const riseTime = 2.2 * tau;
  return {
    summary: `Cutoff frequency is ${formatEngineering(cutoff)} Hz; at ${formatEngineering(input.signalFrequencyHz)} Hz the ideal gain is ${formatEngineering(gain)} (${formatEngineering(attenuationDb)} dB).`,
    outputs: [
      { label: 'Cutoff frequency', value: formatEngineering(cutoff), unit: 'Hz', emphasis: true },
      { label: 'Gain at test frequency', value: formatEngineering(gain) },
      { label: 'Attenuation', value: formatEngineering(attenuationDb), unit: 'dB' },
      { label: 'Phase shift', value: formatEngineering(phase), unit: '°' },
      { label: '10–90% rise time', value: formatEngineering(riseTime), unit: 's' },
    ],
    steps: [
      { label: 'Time constant', value: `τ = RC = ${formatEngineering(tau)} s` },
      { label: 'Cutoff frequency', value: `f꜀ = 1/(2πτ) = ${formatEngineering(cutoff)} Hz` },
      { label: 'Magnitude response', value: `|H| = 1/√(1+(f/f꜀)²) = ${formatEngineering(gain)}` },
      { label: 'Phase response', value: `φ = −atan(f/f꜀) = ${formatEngineering(phase)}°` },
    ],
    warning: 'Assumes an ideal source, ideal components, and negligible load. Include source resistance, load impedance, tolerances, and parasitics in a real design.',
  };
}

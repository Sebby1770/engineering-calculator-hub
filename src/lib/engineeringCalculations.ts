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

export function calculateRegulatorThermal(input: {
  topologyCode: number;
  inputVoltage: number;
  outputVoltage: number;
  outputCurrentA: number;
  buckEfficiencyPercent: number;
  ambientTemperatureC: number;
  thetaJaCPerW: number;
  maxJunctionTemperatureC: number;
}): EngineeringResult {
  requirePositive({
    inputVoltage: input.inputVoltage,
    outputVoltage: input.outputVoltage,
    outputCurrentA: input.outputCurrentA,
    thetaJaCPerW: input.thetaJaCPerW,
  });
  requireFinite({
    topologyCode: input.topologyCode,
    buckEfficiencyPercent: input.buckEfficiencyPercent,
    ambientTemperatureC: input.ambientTemperatureC,
    maxJunctionTemperatureC: input.maxJunctionTemperatureC,
  });
  if (input.topologyCode !== 0 && input.topologyCode !== 1) {
    throw new Error('Choose LDO or buck as the regulator topology.');
  }
  if (input.outputVoltage >= input.inputVoltage) {
    throw new Error('Input voltage must be greater than output voltage for this LDO/buck model.');
  }
  if (input.maxJunctionTemperatureC <= input.ambientTemperatureC) {
    throw new Error('Maximum junction temperature must exceed ambient temperature.');
  }
  if (input.topologyCode === 1 && (input.buckEfficiencyPercent <= 0 || input.buckEfficiencyPercent >= 100)) {
    throw new Error('Buck efficiency must be greater than 0% and less than 100%.');
  }

  const isLdo = input.topologyCode === 0;
  const topology = isLdo ? 'LDO' : 'Buck';
  const outputPower = input.outputVoltage * input.outputCurrentA;
  const inputPower = isLdo
    ? input.inputVoltage * input.outputCurrentA
    : outputPower / (input.buckEfficiencyPercent / 100);
  const powerLoss = inputPower - outputPower;
  const efficiencyPercent = (outputPower / inputPower) * 100;
  const temperatureRise = powerLoss * input.thetaJaCPerW;
  const estimatedJunction = input.ambientTemperatureC + temperatureRise;
  const thermalMargin = input.maxJunctionTemperatureC - estimatedJunction;
  const requiredThetaJa = (input.maxJunctionTemperatureC - input.ambientTemperatureC) / powerLoss;
  const thermallyWithinLimit = thermalMargin >= 0;

  return {
    summary: `${topology} loss is approximately ${formatEngineering(powerLoss)} W and estimated junction temperature is ${formatEngineering(estimatedJunction)}°C, leaving ${formatEngineering(thermalMargin)}°C thermal margin.`,
    outputs: [
      { label: 'Estimated regulator loss', value: formatEngineering(powerLoss), unit: 'W', emphasis: true },
      { label: 'Estimated efficiency', value: formatEngineering(efficiencyPercent), unit: '%' },
      { label: 'Estimated junction', value: formatEngineering(estimatedJunction), unit: '°C' },
      { label: 'Thermal margin', value: formatEngineering(thermalMargin), unit: '°C' },
      { label: 'Maximum allowable θJA', value: formatEngineering(requiredThetaJa), unit: '°C/W' },
      { label: 'Input power', value: formatEngineering(inputPower), unit: 'W' },
      { label: 'Nominal thermal check', value: thermallyWithinLimit ? 'Pass' : 'Over limit' },
    ],
    steps: [
      { label: 'Output power', value: `Pout = Vout × Iout = ${formatEngineering(outputPower)} W` },
      { label: `${topology} input model`, value: isLdo ? `Pin ≈ Vin × Iout = ${formatEngineering(inputPower)} W` : `Pin = Pout/η = ${formatEngineering(inputPower)} W` },
      { label: 'Regulator loss', value: `Ploss = Pin − Pout = ${formatEngineering(powerLoss)} W` },
      { label: 'Junction estimate', value: `TJ = TA + Ploss × θJA = ${formatEngineering(estimatedJunction)}°C` },
      { label: 'Thermal requirement', value: `θJA ≤ (TJmax − TA)/Ploss = ${formatEngineering(requiredThetaJa)}°C/W` },
    ],
    warning: `${thermallyWithinLimit ? 'The nominal thermal estimate is within the entered limit.' : 'The nominal estimate exceeds the entered junction-temperature limit.'} Check worst-case input voltage, load, quiescent current, dropout, switching losses, copper area, airflow, enclosure temperature, transient response, and the regulator datasheet.`,
  };
}

export function calculateDcWireDrop(input: {
  materialCode: number;
  oneWayLengthM: number;
  conductorAreaMm2: number;
  currentA: number;
  systemVoltage: number;
  conductorTemperatureC: number;
  maxDropPercent: number;
}): EngineeringResult {
  requirePositive({
    oneWayLengthM: input.oneWayLengthM,
    conductorAreaMm2: input.conductorAreaMm2,
    currentA: input.currentA,
    systemVoltage: input.systemVoltage,
  });
  requireFinite({
    materialCode: input.materialCode,
    conductorTemperatureC: input.conductorTemperatureC,
    maxDropPercent: input.maxDropPercent,
  });
  if (input.materialCode !== 0 && input.materialCode !== 1) {
    throw new Error('Choose copper or aluminium as the conductor material.');
  }
  if (input.conductorTemperatureC < -50 || input.conductorTemperatureC > 200) {
    throw new Error('Conductor temperature must be between −50°C and 200°C.');
  }
  if (input.maxDropPercent <= 0 || input.maxDropPercent >= 100) {
    throw new Error('Maximum voltage drop must be greater than 0% and less than 100%.');
  }

  const material = input.materialCode === 0
    ? { name: 'Copper', resistivity20: 1.724e-8, temperatureCoefficient: 0.00393 }
    : { name: 'Aluminium', resistivity20: 2.826e-8, temperatureCoefficient: 0.00403 };
  const temperatureFactor = 1 + material.temperatureCoefficient * (input.conductorTemperatureC - 20);
  const resistivity = material.resistivity20 * temperatureFactor;
  const roundTripLengthM = input.oneWayLengthM * 2;
  const areaM2 = input.conductorAreaMm2 / 1_000_000;
  const resistance = (resistivity * roundTripLengthM) / areaM2;
  const voltageDrop = input.currentA * resistance;
  const dropPercent = (voltageDrop / input.systemVoltage) * 100;
  const deliveredVoltage = input.systemVoltage - voltageDrop;
  const powerLoss = input.currentA ** 2 * resistance;
  const allowedDropV = input.systemVoltage * (input.maxDropPercent / 100);
  const minimumAreaMm2 = ((resistivity * roundTripLengthM * input.currentA) / allowedDropV) * 1_000_000;
  const meetsTarget = voltageDrop <= allowedDropV;

  return {
    summary: `${material.name} ${formatEngineering(input.conductorAreaMm2)} mm² over ${formatEngineering(input.oneWayLengthM)} m one-way drops ${formatEngineering(voltageDrop)} V (${formatEngineering(dropPercent)}%); ${meetsTarget ? 'the entered area meets' : 'the entered area exceeds'} the ${formatEngineering(input.maxDropPercent)}% drop target.`,
    outputs: [
      { label: 'Round-trip resistance', value: formatEngineering(resistance), unit: 'Ω' },
      { label: 'Voltage drop', value: formatEngineering(voltageDrop), unit: 'V', emphasis: true },
      { label: 'Voltage drop percent', value: formatEngineering(dropPercent), unit: '%' },
      { label: 'Delivered voltage', value: formatEngineering(deliveredVoltage), unit: 'V' },
      { label: 'Cable power loss', value: formatEngineering(powerLoss), unit: 'W' },
      { label: 'Minimum area for target', value: formatEngineering(minimumAreaMm2), unit: 'mm²' },
      { label: 'Drop target', value: meetsTarget ? 'Pass' : 'Review' },
    ],
    steps: [
      { label: 'Temperature compensation', value: `ρ${formatEngineering(input.conductorTemperatureC)} = ρ20 × [1 + α(T−20)] = ${formatEngineering(resistivity)} Ω·m` },
      { label: 'Round-trip path', value: `2 × ${formatEngineering(input.oneWayLengthM)} m = ${formatEngineering(roundTripLengthM)} m` },
      { label: 'Loop resistance', value: `R = ρL/A = ${formatEngineering(resistance)} Ω` },
      { label: 'Actual drop', value: `Vdrop = IR = ${formatEngineering(input.currentA)} A × ${formatEngineering(resistance)} Ω = ${formatEngineering(voltageDrop)} V` },
      { label: 'Minimum cross-section', value: `Amin = ρLI/Vallowed = ${formatEngineering(minimumAreaMm2)} mm² for ${formatEngineering(allowedDropV)} V maximum drop` },
    ],
    warning: 'This is a DC resistance and voltage-drop model, not an ampacity, protection, or code-compliance result. Verify insulation temperature, installation method, terminations, fault protection, conductor standards, and any applicable wiring rules separately.',
  };
}

export function calculateOpAmpGain(input: {
  modeCode: number;
  inputPeakVoltage: number;
  referenceVoltage: number;
  inputResistanceKohm: number;
  feedbackResistanceKohm: number;
  supplyLowVoltage: number;
  supplyHighVoltage: number;
  commonModeLowVoltage: number;
  commonModeHighVoltage: number;
  outputSwingLowVoltage: number;
  outputSwingHighVoltage: number;
  gainBandwidthMhz: number;
  signalFrequencyKhz: number;
  slewRateVPerUs: number;
}): EngineeringResult {
  requirePositive({
    inputPeakVoltage: input.inputPeakVoltage,
    inputResistanceKohm: input.inputResistanceKohm,
    feedbackResistanceKohm: input.feedbackResistanceKohm,
    gainBandwidthMhz: input.gainBandwidthMhz,
    signalFrequencyKhz: input.signalFrequencyKhz,
    slewRateVPerUs: input.slewRateVPerUs,
  });
  requireFinite({
    modeCode: input.modeCode,
    referenceVoltage: input.referenceVoltage,
    supplyLowVoltage: input.supplyLowVoltage,
    supplyHighVoltage: input.supplyHighVoltage,
    commonModeLowVoltage: input.commonModeLowVoltage,
    commonModeHighVoltage: input.commonModeHighVoltage,
    outputSwingLowVoltage: input.outputSwingLowVoltage,
    outputSwingHighVoltage: input.outputSwingHighVoltage,
  });
  if (input.modeCode !== 0 && input.modeCode !== 1) {
    throw new Error('Choose non-inverting or inverting op-amp mode.');
  }
  if (input.supplyHighVoltage <= input.supplyLowVoltage) {
    throw new Error('The high supply rail must exceed the low supply rail.');
  }
  if (input.referenceVoltage < input.supplyLowVoltage || input.referenceVoltage > input.supplyHighVoltage) {
    throw new Error('Reference voltage must lie between the supply rails.');
  }
  if (input.commonModeHighVoltage <= input.commonModeLowVoltage
    || input.commonModeLowVoltage < input.supplyLowVoltage
    || input.commonModeHighVoltage > input.supplyHighVoltage) {
    throw new Error('The input common-mode range must be ordered and lie within the supply rails.');
  }
  if (input.outputSwingHighVoltage <= input.outputSwingLowVoltage
    || input.outputSwingLowVoltage < input.supplyLowVoltage
    || input.outputSwingHighVoltage > input.supplyHighVoltage) {
    throw new Error('The output swing range must be ordered and lie within the supply rails.');
  }

  const isNonInverting = input.modeCode === 0;
  const resistanceRatio = input.feedbackResistanceKohm / input.inputResistanceKohm;
  const signalGain = isNonInverting ? 1 + resistanceRatio : -resistanceRatio;
  const noiseGain = 1 + resistanceRatio;
  const outputPeakVoltage = Math.abs(signalGain) * input.inputPeakVoltage;
  const outputLowVoltage = input.referenceVoltage - outputPeakVoltage;
  const outputHighVoltage = input.referenceVoltage + outputPeakVoltage;
  const estimatedBandwidthHz = (input.gainBandwidthMhz * 1_000_000) / noiseGain;
  const signalFrequencyHz = input.signalFrequencyKhz * 1_000;
  const requiredSlewRate = (2 * Math.PI * signalFrequencyHz * outputPeakVoltage) / 1_000_000;
  const commonModeLow = isNonInverting
    ? input.referenceVoltage - input.inputPeakVoltage
    : input.referenceVoltage;
  const commonModeHigh = isNonInverting
    ? input.referenceVoltage + input.inputPeakVoltage
    : input.referenceVoltage;
  const commonModeInRange = commonModeLow >= input.commonModeLowVoltage
    && commonModeHigh <= input.commonModeHighVoltage;
  const outputInRange = outputLowVoltage >= input.outputSwingLowVoltage
    && outputHighVoltage <= input.outputSwingHighVoltage;
  const bandwidthInRange = signalFrequencyHz <= estimatedBandwidthHz;
  const slewInRange = input.slewRateVPerUs >= requiredSlewRate;
  const outputHeadroom = Math.min(
    outputLowVoltage - input.outputSwingLowVoltage,
    input.outputSwingHighVoltage - outputHighVoltage,
  );
  const checks = [
    commonModeInRange ? null : `The estimated input common-mode swing (${formatEngineering(commonModeLow)} to ${formatEngineering(commonModeHigh)} V) is outside the entered range.`,
    outputInRange ? null : `The ideal output swing (${formatEngineering(outputLowVoltage)} to ${formatEngineering(outputHighVoltage)} V) is outside the entered output-swing range.`,
    bandwidthInRange ? null : `Signal frequency exceeds the ${formatEngineering(estimatedBandwidthHz / 1_000)} kHz closed-loop bandwidth estimate.`,
    slewInRange ? null : `Required slew rate (${formatEngineering(requiredSlewRate)} V/µs) exceeds the entered device capability.`,
  ].filter((message): message is string => message !== null);
  const allChecksPass = checks.length === 0;

  return {
    summary: `${isNonInverting ? 'Non-inverting' : 'Inverting'} gain is ${formatEngineering(signalGain)} V/V, giving ${formatEngineering(outputPeakVoltage)} V peak output (${formatEngineering(outputLowVoltage)} to ${formatEngineering(outputHighVoltage)} V); ${allChecksPass ? 'the nominal range, bandwidth, and slew checks pass' : `${checks.length} nominal check${checks.length === 1 ? '' : 's'} need review`}.`,
    outputs: [
      { label: 'Ideal signal gain', value: formatEngineering(signalGain), unit: 'V/V', emphasis: true },
      { label: 'Ideal output peak', value: formatEngineering(outputPeakVoltage), unit: 'V' },
      { label: 'Ideal output range', value: `${formatEngineering(outputLowVoltage)} to ${formatEngineering(outputHighVoltage)}`, unit: 'V' },
      { label: 'Noise gain', value: formatEngineering(noiseGain), unit: 'V/V' },
      { label: 'Estimated bandwidth', value: formatEngineering(estimatedBandwidthHz / 1_000), unit: 'kHz' },
      { label: 'Minimum sine-wave slew rate', value: formatEngineering(requiredSlewRate), unit: 'V/µs' },
      { label: 'Output headroom', value: formatEngineering(outputHeadroom), unit: 'V' },
      { label: 'Nominal checks', value: allChecksPass ? 'Pass' : `${checks.length} warning${checks.length === 1 ? '' : 's'}` },
    ],
    steps: [
      { label: 'Signal gain', value: isNonInverting ? `Av = 1 + Rf/Rg = ${formatEngineering(signalGain)} V/V` : `Av = −Rf/Rin = ${formatEngineering(signalGain)} V/V` },
      { label: 'Ideal output swing', value: `Vout,peak = |Av| × Vin,peak = ${formatEngineering(outputPeakVoltage)} V; range = ${formatEngineering(outputLowVoltage)} to ${formatEngineering(outputHighVoltage)} V` },
      { label: 'Noise gain and bandwidth', value: `NG = 1 + Rf/Rin = ${formatEngineering(noiseGain)}; BW ≈ GBW/NG = ${formatEngineering(estimatedBandwidthHz / 1_000)} kHz` },
      { label: 'Slew-rate requirement', value: `SRmin = 2πfVpeak = ${formatEngineering(requiredSlewRate)} V/µs` },
      { label: 'Range checks', value: `Input common mode: ${commonModeInRange ? 'within range' : 'outside range'}; output swing: ${outputInRange ? 'within range' : 'outside range'}` },
    ],
    warning: `${checks.length > 0 ? checks.join(' ') : 'The entered nominal operating point passes these first-order checks.'} Verify input bias and offset error, noise, stability, capacitive loading, output current, distortion, resistor tolerances, and all datasheet limits across operating conditions. The slew check treats the calculated output excursion as a sine-wave peak.`,
  };
}

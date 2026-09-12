import type { EngineeringResult } from './engineeringCalculations';

export const GAS_CONSTANT_SI = 8.314462618;
export const STANDARD_GRAVITY = 9.80665;
export const ABSOLUTE_ZERO_C = -273.15;

function formatEngineering(value: number, digits = 5) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude >= 1e6 || magnitude < 1e-3) return value.toExponential(Math.max(1, digits - 1));
  return Number(value.toPrecision(digits)).toString();
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

function requireNonNegative(values: Record<string, number>) {
  requireFinite(values);
  for (const [name, value] of Object.entries(values)) {
    if (value < 0) throw new Error(`${name} must be zero or greater.`);
  }
}

function celsiusToKelvin(temperatureC: number, label: string) {
  requireFinite({ [label]: temperatureC });
  const kelvin = temperatureC - ABSOLUTE_ZERO_C;
  if (kelvin <= 0) throw new Error(`${label} must be above absolute zero.`);
  return kelvin;
}

function requirePositiveExcept(values: Record<string, number>, skipKey: string) {
  const required: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key !== skipKey) required[key] = value;
  }
  requirePositive(required);
}

function roundPositiveInteger(value: number, label: string) {
  requireFinite({ [label]: value });
  const rounded = Math.round(value);
  if (rounded < 1) throw new Error(`${label} must be at least 1.`);
  return rounded;
}

function solveCodeIndex(solveCode: number, count: number, label = 'Unknown variable') {
  requireFinite({ [label]: solveCode });
  const index = Math.round(solveCode);
  if (index < 0 || index >= count) throw new Error(`Choose a valid ${label.toLowerCase()}.`);
  return index;
}

export function calculateSimplySupportedBeam(input: {
  loadN: number;
  lengthM: number;
  youngsModulusGpa: number;
  secondMomentM4: number;
  centroidDistanceM: number;
}): EngineeringResult {
  requirePositive(input);
  const { loadN, lengthM, youngsModulusGpa, secondMomentM4, centroidDistanceM } = input;
  const youngsPa = youngsModulusGpa * 1e9;
  const momentMax = (loadN * lengthM) / 4;
  const stressMax = (momentMax * centroidDistanceM) / secondMomentM4;
  const deflectionMax = (loadN * lengthM ** 3) / (48 * youngsPa * secondMomentM4);

  return {
    summary: `Midspan deflection is ${formatEngineering(deflectionMax)} m (${formatEngineering(deflectionMax * 1_000)} mm) with Mmax = ${formatEngineering(momentMax)} N·m.`,
    outputs: [
      { label: 'Midspan deflection', value: formatEngineering(deflectionMax), unit: 'm', emphasis: true },
      { label: 'Midspan deflection (mm)', value: formatEngineering(deflectionMax * 1_000), unit: 'mm' },
      { label: 'Maximum moment', value: formatEngineering(momentMax), unit: 'N·m' },
      { label: 'Maximum bending stress', value: formatEngineering(stressMax / 1e6), unit: 'MPa' },
    ],
    steps: [
      { label: 'Maximum moment', value: `Mmax = PL/4 = ${formatEngineering(loadN)} × ${formatEngineering(lengthM)} / 4 = ${formatEngineering(momentMax)} N·m` },
      { label: 'Bending stress', value: `σmax = Mc/I = ${formatEngineering(momentMax)} × ${formatEngineering(centroidDistanceM)} / ${formatEngineering(secondMomentM4)} = ${formatEngineering(stressMax)} Pa` },
      { label: 'Modulus in pascals', value: `E = ${formatEngineering(youngsModulusGpa)} GPa = ${formatEngineering(youngsPa)} Pa` },
      { label: 'Midspan deflection', value: `δmax = PL³/(48EI) = ${formatEngineering(deflectionMax)} m` },
    ],
    warning: 'Assumes Euler–Bernoulli beam theory: prismatic member, linear elasticity, small deflections, and a single concentrated load at midspan on simple supports. Self-weight, shear deformation, and support settlement are omitted.',
  };
}

export function calculateGearTrain(input: {
  teeth1: number;
  teeth2: number;
  torqueInNm: number;
  rpmIn: number;
  efficiencyPercent: number;
}): EngineeringResult {
  const teeth1 = roundPositiveInteger(input.teeth1, 'Pinion teeth N1');
  const teeth2 = roundPositiveInteger(input.teeth2, 'Gear teeth N2');
  requirePositive({ torqueInNm: input.torqueInNm });
  requireNonNegative({ rpmIn: input.rpmIn });
  requireFinite({ efficiencyPercent: input.efficiencyPercent });
  if (input.efficiencyPercent < 0 || input.efficiencyPercent > 100) {
    throw new Error('Efficiency must be between 0% and 100%.');
  }

  const ratio = teeth2 / teeth1;
  const efficiency = input.efficiencyPercent / 100;
  const torqueOut = input.torqueInNm * ratio * efficiency;
  const omegaIn = (input.rpmIn * 2 * Math.PI) / 60;
  const omegaOut = ratio === 0 ? 0 : omegaIn / ratio;
  const rpmOut = ratio === 0 ? 0 : input.rpmIn / ratio;
  const powerIn = input.torqueInNm * omegaIn;
  const powerOut = torqueOut * omegaOut;

  return {
    summary: `Gear ratio N2/N1 = ${formatEngineering(ratio)}; output torque is ${formatEngineering(torqueOut)} N·m at ${formatEngineering(rpmOut)} rpm.`,
    outputs: [
      { label: 'Ratio', value: formatEngineering(ratio), emphasis: true },
      { label: 'Output torque', value: formatEngineering(torqueOut), unit: 'N·m' },
      { label: 'Output speed', value: formatEngineering(rpmOut), unit: 'rpm' },
      { label: 'Output angular velocity', value: formatEngineering(omegaOut), unit: 'rad/s' },
      { label: 'Input power', value: formatEngineering(powerIn), unit: 'W' },
      { label: 'Output power', value: formatEngineering(powerOut), unit: 'W' },
    ],
    steps: [
      { label: 'Ratio', value: `i = N2/N1 = ${teeth2}/${teeth1} = ${formatEngineering(ratio)}` },
      { label: 'Output torque', value: `Tout = Tin × i × η = ${formatEngineering(input.torqueInNm)} × ${formatEngineering(ratio)} × ${formatEngineering(efficiency)} = ${formatEngineering(torqueOut)} N·m` },
      { label: 'Output speed', value: `ωout = ωin/i , nout = nin/i = ${formatEngineering(rpmOut)} rpm` },
    ],
    warning: 'Models an ideal external spur pair with constant efficiency. Backlash, mesh stiffness, inertia, and idler sign changes are not included. A 2:1 increase in teeth doubles torque only when η = 100%.',
  };
}

export function calculateShaftTorsion(input: {
  torqueNm: number;
  diameterMm: number;
  lengthM: number;
  shearModulusGpa: number;
}): EngineeringResult {
  requirePositive(input);
  const diameterM = input.diameterMm / 1_000;
  const polarJ = (Math.PI * diameterM ** 4) / 32;
  const shearPa = (input.torqueNm * (diameterM / 2)) / polarJ;
  const shearModulusPa = input.shearModulusGpa * 1e9;
  const twistRad = (input.torqueNm * input.lengthM) / (shearModulusPa * polarJ);
  const twistDeg = (twistRad * 180) / Math.PI;

  return {
    summary: `Shear stress is ${formatEngineering(shearPa / 1e6)} MPa and the twist is ${formatEngineering(twistRad)} rad (${formatEngineering(twistDeg)}°).`,
    outputs: [
      { label: 'Shear stress', value: formatEngineering(shearPa / 1e6), unit: 'MPa', emphasis: true },
      { label: 'Polar moment J', value: formatEngineering(polarJ), unit: 'm⁴' },
      { label: 'Angle of twist', value: formatEngineering(twistRad), unit: 'rad' },
      { label: 'Angle of twist (deg)', value: formatEngineering(twistDeg), unit: '°' },
    ],
    steps: [
      { label: 'Diameter', value: `d = ${formatEngineering(input.diameterMm)} mm = ${formatEngineering(diameterM)} m` },
      { label: 'Polar moment', value: `J = πd⁴/32 = ${formatEngineering(polarJ)} m⁴` },
      { label: 'Shear stress', value: `τ = T(d/2)/J = ${formatEngineering(shearPa)} Pa` },
      { label: 'Twist', value: `θ = TL/(GJ) = ${formatEngineering(twistRad)} rad` },
    ],
    warning: 'Valid for a solid circular shaft in the elastic range with uniform torque, Saint-Venant torsion, and no stress concentrations at keyways or shoulders.',
  };
}

export function calculateHelicalSpring(input: {
  loadN: number;
  wireDiameterMm: number;
  meanDiameterMm: number;
  activeCoils: number;
  shearModulusGpa: number;
}): EngineeringResult {
  requirePositive(input);
  if (input.meanDiameterMm <= input.wireDiameterMm) {
    throw new Error('Mean coil diameter D must be larger than the wire diameter d.');
  }
  const dM = input.wireDiameterMm / 1_000;
  const dMm = input.wireDiameterMm;
  const DM = input.meanDiameterMm / 1_000;
  const springIndex = input.meanDiameterMm / input.wireDiameterMm;
  if (springIndex <= 1) throw new Error('Spring index C = D/d must be greater than 1.');
  const wahlK = (4 * springIndex - 1) / (4 * springIndex - 4) + 0.615 / springIndex;
  const shearPa = (wahlK * 8 * input.loadN * DM) / (Math.PI * dM ** 3);
  const shearModulusPa = input.shearModulusGpa * 1e9;
  const rate = (shearModulusPa * dM ** 4) / (8 * DM ** 3 * input.activeCoils);
  const deflection = input.loadN / rate;

  return {
    summary: `Wahl-corrected shear is ${formatEngineering(shearPa / 1e6)} MPa; spring rate is ${formatEngineering(rate)} N/m.`,
    outputs: [
      { label: 'Spring index C', value: formatEngineering(springIndex) },
      { label: 'Wahl factor K', value: formatEngineering(wahlK) },
      { label: 'Shear stress', value: formatEngineering(shearPa / 1e6), unit: 'MPa', emphasis: true },
      { label: 'Spring rate', value: formatEngineering(rate), unit: 'N/m' },
      { label: 'Deflection', value: formatEngineering(deflection), unit: 'm' },
    ],
    steps: [
      { label: 'Spring index', value: `C = D/d = ${formatEngineering(input.meanDiameterMm)}/${formatEngineering(dMm)} = ${formatEngineering(springIndex)}` },
      { label: 'Wahl factor', value: `K = (4C−1)/(4C−4) + 0.615/C = ${formatEngineering(wahlK)}` },
      { label: 'Shear stress', value: `τ = K·8PD/(πd³) = ${formatEngineering(shearPa)} Pa` },
      { label: 'Spring rate', value: `k = Gd⁴/(8D³N) = ${formatEngineering(rate)} N/m` },
    ],
    warning: 'Uses the Wahl factor for a circular-wire helical compression spring under static axial load. Coil-to-coil contact, buckling, fatigue, and end-coil corrections are not included. Typical C is 4–12.',
  };
}

export function calculateManningFlow(input: {
  roughnessN: number;
  widthM: number;
  depthM: number;
  slope: number;
}): EngineeringResult {
  requirePositive(input);
  const area = input.widthM * input.depthM;
  const wettedPerimeter = input.widthM + 2 * input.depthM;
  const hydraulicRadius = area / wettedPerimeter;
  const discharge = (1 / input.roughnessN) * area * hydraulicRadius ** (2 / 3) * Math.sqrt(input.slope);
  const velocity = discharge / area;

  return {
    summary: `Uniform rectangular-channel discharge is ${formatEngineering(discharge)} m³/s at mean velocity ${formatEngineering(velocity)} m/s.`,
    outputs: [
      { label: 'Discharge', value: formatEngineering(discharge), unit: 'm³/s', emphasis: true },
      { label: 'Flow area', value: formatEngineering(area), unit: 'm²' },
      { label: 'Hydraulic radius', value: formatEngineering(hydraulicRadius), unit: 'm' },
      { label: 'Mean velocity', value: formatEngineering(velocity), unit: 'm/s' },
    ],
    steps: [
      { label: 'Area', value: `A = by = ${formatEngineering(input.widthM)} × ${formatEngineering(input.depthM)} = ${formatEngineering(area)} m²` },
      { label: 'Wetted perimeter', value: `P = b + 2y = ${formatEngineering(wettedPerimeter)} m` },
      { label: 'Hydraulic radius', value: `R = A/P = ${formatEngineering(hydraulicRadius)} m` },
      { label: 'Manning SI', value: `Q = (1/n) A R^{2/3} S^{1/2} = ${formatEngineering(discharge)} m³/s` },
    ],
    warning: 'SI Manning form (1/n) for a wide rectangular open channel in uniform flow. n is empirical; this is not a gradually-varied or pressurized-pipe solution.',
  };
}

export function calculateEulerBuckling(input: {
  youngsModulusGpa: number;
  secondMomentM4: number;
  lengthM: number;
  kFactor: number;
  areaM2: number;
}): EngineeringResult {
  requirePositive(input);
  const allowedK = [0.5, 0.7, 1, 2];
  if (!allowedK.some((value) => Math.abs(value - input.kFactor) < 1e-9)) {
    throw new Error('Effective-length factor K must be 0.5, 0.7, 1, or 2.');
  }
  const youngsPa = input.youngsModulusGpa * 1e9;
  const effectiveLength = input.kFactor * input.lengthM;
  const pCritical = (Math.PI ** 2 * youngsPa * input.secondMomentM4) / effectiveLength ** 2;
  const stressCritical = pCritical / input.areaM2;
  const slenderness = effectiveLength / Math.sqrt(input.secondMomentM4 / input.areaM2);

  return {
    summary: `Euler critical load is ${formatEngineering(pCritical)} N (${formatEngineering(pCritical / 1_000)} kN) with σcr = ${formatEngineering(stressCritical / 1e6)} MPa.`,
    outputs: [
      { label: 'Critical load', value: formatEngineering(pCritical), unit: 'N', emphasis: true },
      { label: 'Critical stress', value: formatEngineering(stressCritical / 1e6), unit: 'MPa' },
      { label: 'Effective length', value: formatEngineering(effectiveLength), unit: 'm' },
      { label: 'Slenderness KL/r', value: formatEngineering(slenderness) },
    ],
    steps: [
      { label: 'Effective length', value: `KL = ${formatEngineering(input.kFactor)} × ${formatEngineering(input.lengthM)} = ${formatEngineering(effectiveLength)} m` },
      { label: 'Euler load', value: `Pcr = π²EI/(KL)² = ${formatEngineering(pCritical)} N` },
      { label: 'Critical stress', value: `σcr = Pcr/A = ${formatEngineering(stressCritical)} Pa` },
    ],
    warning: 'Ideal Euler buckling for a straight, prismatic, linearly elastic column with the selected end-fixity. It is unconservative for intermediate columns, residual stress, eccentricity, and geometric imperfections. Check the material proportional limit.',
  };
}

export function calculateRationalRunoff(input: {
  runoffCoefficient: number;
  intensityMmPerHour: number;
  areaHectares: number;
}): EngineeringResult {
  requirePositive({
    intensityMmPerHour: input.intensityMmPerHour,
    areaHectares: input.areaHectares,
  });
  requireFinite({ runoffCoefficient: input.runoffCoefficient });
  if (input.runoffCoefficient <= 0 || input.runoffCoefficient > 1) {
    throw new Error('Runoff coefficient C must be greater than 0 and at most 1.');
  }
  const discharge = (input.runoffCoefficient * input.intensityMmPerHour * input.areaHectares) / 360;

  return {
    summary: `Peak runoff is ${formatEngineering(discharge)} m³/s using the SI rational method Q = CiA/360.`,
    outputs: [
      { label: 'Peak discharge', value: formatEngineering(discharge), unit: 'm³/s', emphasis: true },
      { label: 'Runoff coefficient', value: formatEngineering(input.runoffCoefficient) },
      { label: 'Rainfall intensity', value: formatEngineering(input.intensityMmPerHour), unit: 'mm/h' },
      { label: 'Catchment area', value: formatEngineering(input.areaHectares), unit: 'ha' },
    ],
    steps: [
      { label: 'SI rational formula', value: `Q = C i A / 360 with A in hectares and i in mm/h` },
      { label: 'Substitution', value: `Q = ${formatEngineering(input.runoffCoefficient)} × ${formatEngineering(input.intensityMmPerHour)} × ${formatEngineering(input.areaHectares)} / 360 = ${formatEngineering(discharge)} m³/s` },
    ],
    warning: 'The rational method estimates a peak for small catchments when rainfall duration equals the time of concentration. C and i are assumptions; it is not a hydrograph or flood-routing model.',
  };
}

export function calculateSectionModulus(input: {
  widthM: number;
  heightM: number;
  momentNm: number;
}): EngineeringResult {
  requirePositive(input);
  const inertia = (input.widthM * input.heightM ** 3) / 12;
  const sectionModulus = inertia / (input.heightM / 2);
  const bendingStress = input.momentNm / sectionModulus;

  return {
    summary: `Rectangular section modulus is ${formatEngineering(sectionModulus)} m³, giving σ = ${formatEngineering(bendingStress / 1e6)} MPa.`,
    outputs: [
      { label: 'Second moment I', value: formatEngineering(inertia), unit: 'm⁴' },
      { label: 'Section modulus S', value: formatEngineering(sectionModulus), unit: 'm³', emphasis: true },
      { label: 'Bending stress', value: formatEngineering(bendingStress / 1e6), unit: 'MPa' },
    ],
    steps: [
      { label: 'Second moment', value: `I = bh³/12 = ${formatEngineering(inertia)} m⁴` },
      { label: 'Section modulus', value: `S = I/(h/2) = ${formatEngineering(sectionModulus)} m³` },
      { label: 'Bending stress', value: `σ = M/S = ${formatEngineering(bendingStress)} Pa` },
    ],
    warning: 'Elastic bending of a solid rectangular cross-section about its strong centroidal axis. Holes, fillets, composite action, and plastic modulus are not included.',
  };
}

export function calculateIdealGas(input: {
  solveCode: number;
  pressurePa: number;
  volumeM3: number;
  amountMol: number;
  temperatureK: number;
}): EngineeringResult {
  const unknown = solveCodeIndex(input.solveCode, 4);
  const labels = ['pressurePa', 'volumeM3', 'amountMol', 'temperatureK'] as const;
  requirePositiveExcept({
    pressurePa: input.pressurePa,
    volumeM3: input.volumeM3,
    amountMol: input.amountMol,
    temperatureK: input.temperatureK,
  }, labels[unknown]);

  let pressurePa = input.pressurePa;
  let volumeM3 = input.volumeM3;
  let amountMol = input.amountMol;
  let temperatureK = input.temperatureK;
  const R = GAS_CONSTANT_SI;

  if (unknown === 0) pressurePa = (amountMol * R * temperatureK) / volumeM3;
  if (unknown === 1) volumeM3 = (amountMol * R * temperatureK) / pressurePa;
  if (unknown === 2) amountMol = (pressurePa * volumeM3) / (R * temperatureK);
  if (unknown === 3) temperatureK = (pressurePa * volumeM3) / (amountMol * R);

  const names = ['Pressure P', 'Volume V', 'Amount n', 'Temperature T'];
  const solvedLabel = names[unknown];
  const solvedValue = [pressurePa, volumeM3, amountMol, temperatureK][unknown];
  const solvedUnit = ['Pa', 'm³', 'mol', 'K'][unknown];

  return {
    summary: `Ideal-gas solution: ${solvedLabel} = ${formatEngineering(solvedValue)} ${solvedUnit} using R = ${GAS_CONSTANT_SI} J/mol·K.`,
    outputs: [
      { label: solvedLabel, value: formatEngineering(solvedValue), unit: solvedUnit, emphasis: true },
      { label: 'Pressure', value: formatEngineering(pressurePa), unit: 'Pa' },
      { label: 'Volume', value: formatEngineering(volumeM3), unit: 'm³' },
      { label: 'Amount', value: formatEngineering(amountMol), unit: 'mol' },
      { label: 'Temperature', value: formatEngineering(temperatureK), unit: 'K' },
    ],
    steps: [
      { label: 'Equation of state', value: `PV = nRT with R = ${GAS_CONSTANT_SI} J/mol·K` },
      { label: 'Unknown', value: `Solving for ${solvedLabel}` },
      { label: 'Result', value: `${solvedLabel} = ${formatEngineering(solvedValue)} ${solvedUnit}` },
    ],
    warning: 'Ideal-gas law for a pure substance far from saturation and critical conditions. Real-gas compressibility, mixtures, and non-equilibrium states are omitted.',
  };
}

export function calculateBernoulli(input: {
  pressure1Pa: number;
  pressure2Pa: number;
  elevation1M: number;
  elevation2M: number;
  velocity1Ms: number;
  densityKgM3: number;
}): EngineeringResult {
  requirePositive({
    densityKgM3: input.densityKgM3,
  });
  requireNonNegative({
    pressure1Pa: input.pressure1Pa,
    pressure2Pa: input.pressure2Pa,
    velocity1Ms: input.velocity1Ms,
  });
  requireFinite({
    elevation1M: input.elevation1M,
    elevation2M: input.elevation2M,
  });

  const g = STANDARD_GRAVITY;
  const head1 = input.pressure1Pa / input.densityKgM3 + input.velocity1Ms ** 2 / 2 + g * input.elevation1M;
  const remainder = head1 - input.pressure2Pa / input.densityKgM3 - g * input.elevation2M;
  const v2Squared = 2 * remainder;
  if (v2Squared < 0) {
    throw new Error('Downstream velocity would be imaginary — the mechanical energy at station 2 exceeds station 1 with no losses allowed.');
  }
  const velocity2 = Math.sqrt(v2Squared);

  return {
    summary: `Incompressible Bernoulli velocity at station 2 is ${formatEngineering(velocity2)} m/s (g = ${STANDARD_GRAVITY} m/s²).`,
    outputs: [
      { label: 'Velocity v2', value: formatEngineering(velocity2), unit: 'm/s', emphasis: true },
      { label: 'Specific energy at 1', value: formatEngineering(head1), unit: 'J/kg' },
      { label: 'Velocity head 1', value: formatEngineering(input.velocity1Ms ** 2 / 2), unit: 'J/kg' },
    ],
    steps: [
      { label: 'Bernoulli (no loss)', value: `P/ρ + v²/2 + gz = constant, g = ${STANDARD_GRAVITY} m/s²` },
      { label: 'Station 1', value: `P1/ρ + v1²/2 + g z1 = ${formatEngineering(head1)} J/kg` },
      { label: 'Solve v2', value: `v2 = √[2(E1 − P2/ρ − g z2)] = ${formatEngineering(velocity2)} m/s` },
    ],
    warning: 'Steady, incompressible, inviscid flow along a streamline with no shaft work and no head loss. Real pipes need friction (Darcy–Weisbach) and minor losses.',
  };
}

export function calculateDarcyWeisbach(input: {
  frictionFactor: number;
  lengthM: number;
  diameterM: number;
  velocityMs: number;
  densityKgM3: number;
}): EngineeringResult {
  requirePositive(input);
  const g = STANDARD_GRAVITY;
  const headLoss = input.frictionFactor * (input.lengthM / input.diameterM) * (input.velocityMs ** 2 / (2 * g));
  const pressureDrop = input.densityKgM3 * g * headLoss;

  return {
    summary: `Friction head loss is ${formatEngineering(headLoss)} m, equivalent to ΔP = ${formatEngineering(pressureDrop)} Pa.`,
    outputs: [
      { label: 'Head loss hf', value: formatEngineering(headLoss), unit: 'm', emphasis: true },
      { label: 'Pressure drop', value: formatEngineering(pressureDrop), unit: 'Pa' },
      { label: 'Pressure drop (kPa)', value: formatEngineering(pressureDrop / 1_000), unit: 'kPa' },
    ],
    steps: [
      { label: 'Darcy–Weisbach', value: `hf = f (L/D) v²/(2g)` },
      { label: 'Head loss', value: `hf = ${formatEngineering(input.frictionFactor)} × (${formatEngineering(input.lengthM)}/${formatEngineering(input.diameterM)}) × ${formatEngineering(input.velocityMs)}² / (2×${STANDARD_GRAVITY}) = ${formatEngineering(headLoss)} m` },
      { label: 'Pressure drop', value: `ΔP = ρ g hf = ${formatEngineering(pressureDrop)} Pa` },
    ],
    warning: 'Uses an entered Darcy friction factor as a constant. f actually depends on Reynolds number and relative roughness (Moody chart / Colebrook). Minor losses and elevation change are omitted.',
  };
}

export function calculateCarnotEfficiency(input: {
  hotTemperatureC: number;
  coldTemperatureC: number;
}): EngineeringResult {
  const hotK = celsiusToKelvin(input.hotTemperatureC, 'Hot temperature Th');
  const coldK = celsiusToKelvin(input.coldTemperatureC, 'Cold temperature Tc');
  if (coldK >= hotK) throw new Error('Cold temperature must be lower than hot temperature.');
  const eta = 1 - coldK / hotK;
  const etaPercent = eta * 100;

  return {
    summary: `Carnot efficiency between ${formatEngineering(input.hotTemperatureC)} °C and ${formatEngineering(input.coldTemperatureC)} °C is ${formatEngineering(etaPercent)}%.`,
    outputs: [
      { label: 'Carnot efficiency', value: formatEngineering(etaPercent), unit: '%', emphasis: true },
      { label: 'Efficiency ratio', value: formatEngineering(eta) },
      { label: 'Th', value: formatEngineering(hotK), unit: 'K' },
      { label: 'Tc', value: formatEngineering(coldK), unit: 'K' },
    ],
    steps: [
      { label: 'Kelvin conversion', value: `Th = ${formatEngineering(hotK)} K, Tc = ${formatEngineering(coldK)} K (offset 273.15)` },
      { label: 'Carnot limit', value: `η = 1 − Tc/Th = 1 − ${formatEngineering(coldK)}/${formatEngineering(hotK)} = ${formatEngineering(eta)}` },
      { label: 'Percent', value: `η = ${formatEngineering(etaPercent)}%` },
    ],
    warning: 'This is the theoretical upper bound for a reversible heat engine between two thermal reservoirs. Real cycles (Rankine, Otto, Brayton) are lower because of irreversibilities.',
  };
}

export function calculateLmtdHeatExchanger(input: {
  deltaT1K: number;
  deltaT2K: number;
  overallU: number;
  areaM2: number;
}): EngineeringResult {
  requirePositive(input);
  const { deltaT1K, deltaT2K, overallU, areaM2 } = input;
  let lmtd: number;
  let method: string;
  if (Math.abs(deltaT1K - deltaT2K) < 1e-12 * Math.max(deltaT1K, deltaT2K)) {
    lmtd = deltaT1K;
    method = 'ΔT1 = ΔT2, so LMTD reduces to that common difference';
  } else {
    lmtd = (deltaT1K - deltaT2K) / Math.log(deltaT1K / deltaT2K);
    method = 'LMTD = (ΔT1 − ΔT2) / ln(ΔT1/ΔT2)';
  }
  const heatRate = overallU * areaM2 * lmtd;

  return {
    summary: `Counterflow LMTD is ${formatEngineering(lmtd)} K, giving Q = ${formatEngineering(heatRate)} W.`,
    outputs: [
      { label: 'LMTD', value: formatEngineering(lmtd), unit: 'K', emphasis: true },
      { label: 'Heat transfer rate', value: formatEngineering(heatRate), unit: 'W' },
      { label: 'Heat transfer rate (kW)', value: formatEngineering(heatRate / 1_000), unit: 'kW' },
    ],
    steps: [
      { label: 'End differences', value: `ΔT1 = ${formatEngineering(deltaT1K)} K, ΔT2 = ${formatEngineering(deltaT2K)} K` },
      { label: 'LMTD', value: `${method} = ${formatEngineering(lmtd)} K` },
      { label: 'Rate', value: `Q = U A LMTD = ${formatEngineering(overallU)} × ${formatEngineering(areaM2)} × ${formatEngineering(lmtd)} = ${formatEngineering(heatRate)} W` },
    ],
    warning: 'Counterflow LMTD with constant U and steady stream temperatures. Cross-flow and shell-and-tube layouts need an F correction factor. Do not use when a temperature cross would make ΔT ≤ 0.',
  };
}

export function calculateReynoldsNumber(input: {
  densityKgM3: number;
  velocityMs: number;
  diameterM: number;
  dynamicViscosityPaS: number;
}): EngineeringResult {
  requirePositive(input);
  const reynolds = (input.densityKgM3 * input.velocityMs * input.diameterM) / input.dynamicViscosityPaS;
  let regime = 'transitional';
  if (reynolds < 2300) regime = 'laminar';
  else if (reynolds > 4000) regime = 'turbulent';

  return {
    summary: `Re = ${formatEngineering(reynolds)} (${regime} for internal pipe flow using 2300 / 4000 thresholds).`,
    outputs: [
      { label: 'Reynolds number', value: formatEngineering(reynolds), emphasis: true },
      { label: 'Flow regime', value: regime },
      { label: 'Kinematic viscosity', value: formatEngineering(input.dynamicViscosityPaS / input.densityKgM3), unit: 'm²/s' },
    ],
    steps: [
      { label: 'Definition', value: `Re = ρvD/μ` },
      { label: 'Substitution', value: `Re = ${formatEngineering(input.densityKgM3)} × ${formatEngineering(input.velocityMs)} × ${formatEngineering(input.diameterM)} / ${formatEngineering(input.dynamicViscosityPaS)} = ${formatEngineering(reynolds)}` },
      { label: 'Regime', value: `laminar if Re < 2300, transitional 2300–4000, turbulent if Re > 4000` },
    ],
    warning: 'Pipe-flow thresholds (2300 / 4000) are conventional, not universal. External flow, rough walls, and entrance effects use different critical Reynolds numbers.',
  };
}

export function calculateSolutionDilution(input: {
  solveCode: number;
  concentration1: number;
  volume1: number;
  concentration2: number;
  volume2: number;
}): EngineeringResult {
  const unknown = solveCodeIndex(input.solveCode, 4);
  const keys = ['concentration1', 'volume1', 'concentration2', 'volume2'] as const;
  requirePositiveExcept({
    concentration1: input.concentration1,
    volume1: input.volume1,
    concentration2: input.concentration2,
    volume2: input.volume2,
  }, keys[unknown]);

  let c1 = input.concentration1;
  let v1 = input.volume1;
  let c2 = input.concentration2;
  let v2 = input.volume2;
  if (unknown === 0) c1 = (c2 * v2) / v1;
  if (unknown === 1) v1 = (c2 * v2) / c1;
  if (unknown === 2) c2 = (c1 * v1) / v2;
  if (unknown === 3) v2 = (c1 * v1) / c2;

  const names = ['C1', 'V1', 'C2', 'V2'];
  const solvedLabel = names[unknown];
  const solvedValue = [c1, v1, c2, v2][unknown];

  return {
    summary: `Conservation of solute gives ${solvedLabel} = ${formatEngineering(solvedValue)} from C1V1 = C2V2.`,
    outputs: [
      { label: solvedLabel, value: formatEngineering(solvedValue), emphasis: true },
      { label: 'C1', value: formatEngineering(c1) },
      { label: 'V1', value: formatEngineering(v1) },
      { label: 'C2', value: formatEngineering(c2) },
      { label: 'V2', value: formatEngineering(v2) },
    ],
    steps: [
      { label: 'Balance', value: `C1 V1 = C2 V2` },
      { label: 'Unknown', value: `Solving for ${solvedLabel}` },
      { label: 'Result', value: `${solvedLabel} = ${formatEngineering(solvedValue)}` },
    ],
    warning: 'Assumes complete mixing, conserved solute, and consistent concentration/volume units. Volume of mixing, activity coefficients, and precipitation are ignored.',
  };
}

export function calculateThermalExpansion(input: {
  alphaPerK: number;
  lengthM: number;
  deltaTK: number;
}): EngineeringResult {
  requirePositive({ alphaPerK: input.alphaPerK, lengthM: input.lengthM });
  requireFinite({ deltaTK: input.deltaTK });
  const deltaL = input.alphaPerK * input.lengthM * input.deltaTK;
  const finalLength = input.lengthM + deltaL;
  const strain = input.deltaTK === 0 ? 0 : deltaL / input.lengthM;

  return {
    summary: `Linear expansion ΔL = ${formatEngineering(deltaL)} m, giving a final length of ${formatEngineering(finalLength)} m.`,
    outputs: [
      { label: 'Length change', value: formatEngineering(deltaL), unit: 'm', emphasis: true },
      { label: 'Final length', value: formatEngineering(finalLength), unit: 'm' },
      { label: 'Thermal strain', value: formatEngineering(strain) },
    ],
    steps: [
      { label: 'Linear law', value: `ΔL = α L ΔT` },
      { label: 'Substitution', value: `ΔL = ${formatEngineering(input.alphaPerK)} × ${formatEngineering(input.lengthM)} × ${formatEngineering(input.deltaTK)} = ${formatEngineering(deltaL)} m` },
    ],
    warning: 'Unconstrained linear expansion with a constant α. Constrained members develop thermal stress; anisotropy and large temperature ranges need a more complete model.',
  };
}

export function calculateStressStrain(input: {
  forceN: number;
  areaM2: number;
  elongationM: number;
  lengthM: number;
  yieldStressPa: number;
}): EngineeringResult {
  requirePositive(input);
  const stress = input.forceN / input.areaM2;
  const strain = input.elongationM / input.lengthM;
  const modulus = strain === 0 ? Number.NaN : stress / strain;
  const safetyFactor = stress === 0 ? Number.POSITIVE_INFINITY : input.yieldStressPa / stress;

  return {
    summary: `σ = ${formatEngineering(stress / 1e6)} MPa, ε = ${formatEngineering(strain)}, E = ${formatEngineering(modulus / 1e9)} GPa, SF = ${formatEngineering(safetyFactor)}.`,
    outputs: [
      { label: 'Stress', value: formatEngineering(stress / 1e6), unit: 'MPa', emphasis: true },
      { label: 'Strain', value: formatEngineering(strain) },
      { label: 'Elastic modulus', value: Number.isFinite(modulus) ? formatEngineering(modulus / 1e9) : '—', unit: 'GPa' },
      { label: 'Safety factor', value: Number.isFinite(safetyFactor) ? formatEngineering(safetyFactor) : '—' },
    ],
    steps: [
      { label: 'Axial stress', value: `σ = F/A = ${formatEngineering(input.forceN)} / ${formatEngineering(input.areaM2)} = ${formatEngineering(stress)} Pa` },
      { label: 'Engineering strain', value: `ε = δ/L = ${formatEngineering(input.elongationM)} / ${formatEngineering(input.lengthM)} = ${formatEngineering(strain)}` },
      { label: 'Modulus (elastic)', value: `E = σ/ε = ${Number.isFinite(modulus) ? `${formatEngineering(modulus)} Pa` : 'undefined'}` },
      { label: 'Yield safety factor', value: `SF = σy/σ = ${Number.isFinite(safetyFactor) ? formatEngineering(safetyFactor) : 'undefined'}` },
    ],
    warning: 'Engineering stress and strain for a prismatic bar. E = σ/ε is meaningful only in the linear-elastic range. Safety factor uses the entered yield stress against the computed axial stress only.',
  };
}

export function calculatePumpPower(input: {
  densityKgM3: number;
  flowM3s: number;
  headM: number;
  efficiencyPercent: number;
}): EngineeringResult {
  requirePositive(input);
  if (input.efficiencyPercent > 100) throw new Error('efficiencyPercent must be 100% or less.');
  const hydraulicW = input.densityKgM3 * STANDARD_GRAVITY * input.flowM3s * input.headM;
  const shaftW = hydraulicW / (input.efficiencyPercent / 100);
  return {
    summary: `Hydraulic power is ${formatEngineering(hydraulicW / 1000)} kW; shaft power at ${formatEngineering(input.efficiencyPercent)}% efficiency is ${formatEngineering(shaftW / 1000)} kW.`,
    outputs: [
      { label: 'Hydraulic power', value: formatEngineering(hydraulicW / 1000), unit: 'kW', emphasis: true },
      { label: 'Shaft power', value: formatEngineering(shaftW / 1000), unit: 'kW' },
      { label: 'Mass flow', value: formatEngineering(input.densityKgM3 * input.flowM3s), unit: 'kg/s' },
    ],
    steps: [
      { label: 'Hydraulic power', value: `P = ρ g Q H = ${formatEngineering(input.densityKgM3)} × ${formatEngineering(STANDARD_GRAVITY)} × ${formatEngineering(input.flowM3s)} × ${formatEngineering(input.headM)} = ${formatEngineering(hydraulicW)} W` },
      { label: 'Shaft power', value: `Pshaft = P / η = ${formatEngineering(hydraulicW)} / ${formatEngineering(input.efficiencyPercent / 100)} = ${formatEngineering(shaftW)} W` },
    ],
    warning: 'Incompressible fluid, constant density, and a single efficiency covering hydraulic plus mechanical losses. NPSH, viscosity, and motor service factor are not modelled.',
  };
}

export function calculatePrincipalStress2d(input: {
  sigmaXPa: number;
  sigmaYPa: number;
  tauXyPa: number;
}): EngineeringResult {
  requireFinite(input);
  const avg = (input.sigmaXPa + input.sigmaYPa) / 2;
  const radius = Math.hypot((input.sigmaXPa - input.sigmaYPa) / 2, input.tauXyPa);
  const sigma1 = avg + radius;
  const sigma2 = avg - radius;
  const thetaPDeg = (Math.atan2(2 * input.tauXyPa, input.sigmaXPa - input.sigmaYPa) * 180) / (2 * Math.PI);
  const tauMax = radius;
  return {
    summary: `Principal stresses are ${formatEngineering(sigma1 / 1e6)} MPa and ${formatEngineering(sigma2 / 1e6)} MPa; max in-plane shear is ${formatEngineering(tauMax / 1e6)} MPa.`,
    outputs: [
      { label: 'σ1', value: formatEngineering(sigma1 / 1e6), unit: 'MPa', emphasis: true },
      { label: 'σ2', value: formatEngineering(sigma2 / 1e6), unit: 'MPa' },
      { label: 'τmax (in-plane)', value: formatEngineering(tauMax / 1e6), unit: 'MPa' },
      { label: 'θp', value: formatEngineering(thetaPDeg), unit: '°' },
    ],
    steps: [
      { label: 'Centre', value: `(σx + σy)/2 = ${formatEngineering(avg)} Pa` },
      { label: 'Mohr radius', value: `R = √(((σx − σy)/2)² + τxy²) = ${formatEngineering(radius)} Pa` },
      { label: 'Principals', value: `σ1,2 = centre ± R` },
      { label: 'Principal angle', value: `θp = ½ atan2(2τxy, σx − σy) = ${formatEngineering(thetaPDeg)}°` },
    ],
    warning: 'Plane stress Mohr’s circle. Out-of-plane principal stress is 0 for true plane stress and is not ranked here. Sign convention is mechanics-positive tension and the entered τxy.',
  };
}

export function calculateConvectionHeat(input: {
  hWm2k: number;
  areaM2: number;
  deltaTK: number;
}): EngineeringResult {
  requirePositive({ hWm2k: input.hWm2k, areaM2: input.areaM2 });
  requireFinite({ deltaTK: input.deltaTK });
  const q = input.hWm2k * input.areaM2 * input.deltaTK;
  return {
    summary: `Convective heat transfer is ${formatEngineering(q)} W (${formatEngineering(q / 1000)} kW) from Q = h A ΔT.`,
    outputs: [
      { label: 'Heat transfer rate', value: formatEngineering(q), unit: 'W', emphasis: true },
      { label: 'Heat flux', value: formatEngineering(q / input.areaM2), unit: 'W/m²' },
    ],
    steps: [
      { label: 'Newton’s law', value: `Q = h A ΔT` },
      { label: 'Substitution', value: `Q = ${formatEngineering(input.hWm2k)} × ${formatEngineering(input.areaM2)} × ${formatEngineering(input.deltaTK)} = ${formatEngineering(q)} W` },
    ],
    warning: 'Lumped surface convection with a constant h. Radiation, transients, and spatially varying film coefficients are omitted.',
  };
}

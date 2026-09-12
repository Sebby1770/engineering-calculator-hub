import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCarnotEfficiency,
  calculateEulerBuckling,
  calculateGearTrain,
  calculateManningFlow,
  calculateReynoldsNumber,
  calculateSimplySupportedBeam,
  calculateSolutionDilution,
  calculatePumpPower,
  calculatePrincipalStress2d,
  calculateConvectionHeat,
} from '../src/lib/disciplineCalculations.ts';

function closeTo(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

function outputNumber(result, label) {
  const row = result.outputs.find((item) => item.label === label);
  assert.ok(row, `missing output "${label}"`);
  const value = Number(row.value);
  assert.equal(Number.isFinite(value), true, `"${label}" is not numeric: ${row.value}`);
  return value;
}

test('simply supported beam matches midspan moment and 8.333 mm deflection', () => {
  const result = calculateSimplySupportedBeam({
    loadN: 10_000,
    lengthM: 4,
    youngsModulusGpa: 200,
    secondMomentM4: 8e-6,
    centroidDistanceM: 0.05,
  });
  closeTo(outputNumber(result, 'Maximum moment'), 10_000, 1e-6);
  closeTo(outputNumber(result, 'Midspan deflection'), 0.008333, 1e-6);
  closeTo(outputNumber(result, 'Midspan deflection (mm)'), 8.333, 0.001);
});

test('Euler pinned-pinned critical load matches π²EI/L²', () => {
  const result = calculateEulerBuckling({
    youngsModulusGpa: 200,
    secondMomentM4: 8e-6,
    lengthM: 2,
    kFactor: 1,
    areaM2: 0.002,
  });
  closeTo(outputNumber(result, 'Critical load'), 3.9478e6, 200);
});

test('Carnot efficiency for 100 °C / 0 °C is about 26.80%', () => {
  const result = calculateCarnotEfficiency({
    hotTemperatureC: 100,
    coldTemperatureC: 0,
  });
  closeTo(outputNumber(result, 'Carnot efficiency'), 26.80, 0.02);
  assert.throws(
    () => calculateCarnotEfficiency({ hotTemperatureC: 20, coldTemperatureC: 80 }),
    /lower than hot/,
  );
});

test('Reynolds number is 1e5 for water in a 50 mm pipe at 2 m/s', () => {
  const result = calculateReynoldsNumber({
    densityKgM3: 1_000,
    velocityMs: 2,
    diameterM: 0.05,
    dynamicViscosityPaS: 0.001,
  });
  closeTo(outputNumber(result, 'Reynolds number'), 1e5, 1e-6);
  assert.equal(result.outputs.find((item) => item.label === 'Flow regime')?.value, 'turbulent');
});

test('Manning rectangular channel returns a finite positive discharge', () => {
  const result = calculateManningFlow({
    roughnessN: 0.013,
    widthM: 2,
    depthM: 1,
    slope: 0.001,
  });
  const discharge = outputNumber(result, 'Discharge');
  assert.ok(Number.isFinite(discharge) && discharge > 0, `Q was ${discharge}`);
});

test('solution dilution conserves C1V1 = C2V2', () => {
  const result = calculateSolutionDilution({
    solveCode: 3,
    concentration1: 2,
    volume1: 0.5,
    concentration2: 0.5,
    volume2: 0,
  });
  closeTo(outputNumber(result, 'V2'), 2, 1e-9);
});

test('2:1 gear train doubles torque at 100% efficiency', () => {
  const result = calculateGearTrain({
    teeth1: 20,
    teeth2: 40,
    torqueInNm: 50,
    rpmIn: 1_000,
    efficiencyPercent: 100,
  });
  closeTo(outputNumber(result, 'Ratio'), 2, 1e-12);
  closeTo(outputNumber(result, 'Output torque'), 100, 1e-9);
  closeTo(outputNumber(result, 'Output speed'), 500, 1e-9);
});

test('pump hydraulic power is ρgQH and shaft power divides by efficiency', () => {
  const result = calculatePumpPower({
    densityKgM3: 1000,
    flowM3s: 0.05,
    headM: 20,
    efficiencyPercent: 80,
  });
  const hydraulicKw = outputNumber(result, 'Hydraulic power');
  const shaftKw = outputNumber(result, 'Shaft power');
  closeTo(hydraulicKw, 9.80665, 0.001);
  closeTo(shaftKw, 12.258, 0.01);
  assert.ok(shaftKw > hydraulicKw);
});

test('2D principal stresses match Mohr’s circle for 80/20/30 MPa', () => {
  const result = calculatePrincipalStress2d({
    sigmaXPa: 80e6,
    sigmaYPa: 20e6,
    tauXyPa: 30e6,
  });
  closeTo(outputNumber(result, 'σ1'), 92.426, 0.01);
  closeTo(outputNumber(result, 'σ2'), 7.574, 0.01);
  closeTo(outputNumber(result, 'θp'), 22.5, 1e-6);
});

test('convection Q = h A ΔT', () => {
  const result = calculateConvectionHeat({ hWm2k: 25, areaM2: 2, deltaTK: 40 });
  closeTo(outputNumber(result, 'Heat transfer rate'), 2000, 1e-9);
});

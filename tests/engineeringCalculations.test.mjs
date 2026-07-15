import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeVoltageDivider,
  calculateAdcResolution,
  calculateBatteryRuntime,
  calculateLedResistor,
  calculatePcbTraceDrop,
  calculateRcLowPass,
  calculateSeriesRlc,
  calculateThreePhasePower,
  designVoltageDivider,
} from '../src/lib/engineeringCalculations.ts';
import {
  addCalculation,
  createWorkspaceDocument,
  escapeCsv,
  isWorkspaceDocument,
  projectToCsv,
} from '../src/lib/workspace.ts';
import { isAllowedOriginForHosts } from '../src/lib/originPolicy.ts';
import { readTextWithLimit } from '../src/lib/requestBody.ts';

function closeTo(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

test('LED designer chooses a non-overdriving E24 value', () => {
  const result = calculateLedResistor({
    supplyVoltage: 12,
    forwardVoltage: 2,
    ledCount: 3,
    targetCurrentMa: 20,
  });
  assert.equal(result.outputs[0].value, '300');
  assert.equal(result.outputs[1].value, '20');
});

test('PCB trace calculation matches copper resistivity equation', () => {
  const result = calculatePcbTraceDrop({ lengthMm: 100, widthMm: 1, thicknessUm: 35, currentA: 2 });
  closeTo(Number(result.outputs[0].value), 0.049257, 0.000001);
  closeTo(Number(result.outputs[1].value), 0.098514, 0.000001);
});

test('series RLC resonance returns expected f0 and Q', () => {
  const result = calculateSeriesRlc({ resistanceOhm: 10, inductanceMh: 10, capacitanceNf: 100 });
  closeTo(Number(result.outputs[0].value), 5032.9, 0.1);
  closeTo(Number(result.outputs[2].value), 31.623, 0.001);
});

test('balanced three-phase power uses line quantities', () => {
  const result = calculateThreePhasePower({ lineVoltage: 400, lineCurrent: 20, powerFactor: 0.85, efficiencyPercent: 92 });
  closeTo(Number(result.outputs[0].value), 11.778, 0.01);
  closeTo(Number(result.outputs[1].value), 13.856, 0.01);
});

test('battery runtime applies usable-capacity and efficiency factors', () => {
  const result = calculateBatteryRuntime({ capacityAh: 100, nominalVoltage: 12.8, loadWatts: 100, efficiencyPercent: 90, usablePercent: 80 });
  closeTo(Number(result.outputs[0].value), 9.216, 0.001);
  closeTo(Number(result.outputs[1].value), 921.6, 0.1);
  closeTo(Number(result.outputs[3].value), 8.6806, 0.001);
});

test('ideal ADC mapping returns midscale for half reference', () => {
  const result = calculateAdcResolution({ bits: 12, referenceVoltage: 3.3, inputVoltage: 1.65 });
  assert.equal(result.outputs[1].value, '2048 / 4095');
  assert.equal(result.outputs[2].value, '0x800');
});

test('RC low-pass cutoff follows 1 over 2 pi RC', () => {
  const result = calculateRcLowPass({ resistanceKohm: 10, capacitanceNf: 100, signalFrequencyHz: 1000 });
  closeTo(Number(result.outputs[0].value), 159.15, 0.01);
});

test('voltage-divider analysis includes load and tolerance limits', () => {
  const analysis = analyzeVoltageDivider({
    inputVoltage: 12,
    r1Ohm: 27_000,
    r2Ohm: 10_000,
    loadOhm: 100_000,
    resistorTolerancePercent: 1,
    supplyTolerancePercent: 5,
  });
  assert.ok(analysis.loadedVoltage < analysis.unloadedVoltage);
  assert.ok(analysis.worstCaseLow < analysis.loadedVoltage);
  assert.ok(analysis.worstCaseHigh > analysis.loadedVoltage);
});

test('E24 divider designer reaches the requested loaded voltage', () => {
  const design = designVoltageDivider({
    inputVoltage: 12,
    targetVoltage: 3.3,
    targetCurrentMa: 1,
    loadOhm: 100_000,
    resistorTolerancePercent: 1,
    supplyTolerancePercent: 5,
  });
  assert.ok(Math.abs(design.analysis.loadedVoltage - 3.3) / 3.3 < 0.025);
});

test('workspace documents validate and export saved calculations', () => {
  const initial = createWorkspaceDocument();
  const updated = addCalculation(initial, {
    calculatorSlug: 'ohms-law-calculator',
    calculatorTitle: "Ohm's Law",
    formula: 'V = I × R',
    result: 'V = 12 V',
  });
  assert.equal(isWorkspaceDocument(updated), true);
  assert.equal(updated.projects[0].entries.length, 1);
  assert.match(projectToCsv(updated.projects[0]), /Ohm's Law/);
  assert.equal(escapeCsv('=HYPERLINK("https://example.com")'), '"\'=HYPERLINK(""https://example.com"")"');
});

test('origin guard accepts only the canonical or exact deployment host', () => {
  const requestUrl = 'https://engineering-calculator-preview.vercel.app/api/feedback';
  const canonicalUrl = 'https://engineeringcalculatorhub.com';
  assert.equal(
    isAllowedOriginForHosts('https://engineering-calculator-preview.vercel.app', requestUrl, canonicalUrl),
    true,
  );
  assert.equal(isAllowedOriginForHosts(canonicalUrl, requestUrl, canonicalUrl), true);
  assert.equal(
    isAllowedOriginForHosts('https://attacker.vercel.app', requestUrl, canonicalUrl),
    false,
  );
  assert.equal(
    isAllowedOriginForHosts('http://engineeringcalculatorhub.com', requestUrl, canonicalUrl),
    false,
  );
  assert.equal(
    isAllowedOriginForHosts('http://localhost:3000', 'http://localhost:3000/api/feedback', canonicalUrl),
    true,
  );
  assert.equal(
    isAllowedOriginForHosts('http://localhost:3001', 'http://localhost:3000/api/feedback', canonicalUrl),
    false,
  );
});

test('request body reader rejects an oversized streamed body', async () => {
  const accepted = await readTextWithLimit(
    new Request('https://example.com/api', { method: 'POST', body: '1234' }),
    4,
  );
  assert.deepEqual(accepted, { ok: true, text: '1234' });

  const rejected = await readTextWithLimit(
    new Request('https://example.com/api', { method: 'POST', body: '12345' }),
    4,
  );
  assert.deepEqual(rejected, { ok: false, reason: 'too_large' });
});

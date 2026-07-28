import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeVoltageDivider,
  calculateAdcResolution,
  calculateBatteryRuntime,
  calculateDcWireDrop,
  calculateLedResistor,
  calculateOpAmpGain,
  calculatePcbTraceDrop,
  calculateRcLowPass,
  calculateRegulatorThermal,
  calculateSeriesRlc,
  calculateThreePhasePower,
  designVoltageDivider,
} from '../src/lib/engineeringCalculations.ts';
import {
  addCalculation,
  addProject,
  createReopenUrl,
  createWorkspaceDocument,
  duplicateProject,
  escapeCsv,
  isWorkspaceDocument,
  mergeWorkspaceDocuments,
  mergeWorkspaceDocumentsWithResult,
  projectToCsv,
  tryAddCalculation,
  workspaceTemplates,
} from '../src/lib/workspace.ts';
import { isAllowedOriginForHosts } from '../src/lib/originPolicy.ts';
import { rateLimit } from '../src/lib/rateLimit.ts';
import { readTextWithLimit } from '../src/lib/requestBody.ts';
import { numericalLimit, solveTriangle } from '../src/lib/mathUtils.ts';
import { solveQuadraticEquation } from '../src/lib/quadratic.ts';
import {
  chooseCanonicalSubscription,
  getStripeObjectId,
  isNonTerminalProSubscription,
  isSubscriptionLifecycleEvent,
  matchesProPriceContract,
  toSubscriptionProfileSnapshot,
} from '../src/lib/stripeEntitlements.ts';

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

test('DC wire designer uses round-trip copper resistance and solves minimum area', () => {
  const result = calculateDcWireDrop({
    materialCode: 0,
    oneWayLengthM: 10,
    conductorAreaMm2: 2.5,
    currentA: 10,
    systemVoltage: 12,
    conductorTemperatureC: 20,
    maxDropPercent: 3,
  });
  closeTo(Number(result.outputs[0].value), 0.13792, 0.000001);
  closeTo(Number(result.outputs[1].value), 1.3792, 0.0001);
  closeTo(Number(result.outputs[2].value), 11.493, 0.001);
  closeTo(Number(result.outputs[5].value), 9.5778, 0.0001);
  assert.equal(result.outputs[6].value, 'Review');
});

test('DC wire designer compensates material and conductor temperature', () => {
  const base = {
    oneWayLengthM: 20,
    conductorAreaMm2: 6,
    currentA: 15,
    systemVoltage: 48,
    maxDropPercent: 3,
  };
  const copper20 = calculateDcWireDrop({ ...base, materialCode: 0, conductorTemperatureC: 20 });
  const copper80 = calculateDcWireDrop({ ...base, materialCode: 0, conductorTemperatureC: 80 });
  const aluminium20 = calculateDcWireDrop({ ...base, materialCode: 1, conductorTemperatureC: 20 });
  assert.ok(Number(copper80.outputs[0].value) > Number(copper20.outputs[0].value));
  assert.ok(Number(aluminium20.outputs[0].value) > Number(copper20.outputs[0].value));
  assert.throws(() => calculateDcWireDrop({ ...base, materialCode: 2, conductorTemperatureC: 20 }), /copper or aluminium/);
  assert.throws(() => calculateDcWireDrop({ ...base, materialCode: 0, conductorTemperatureC: 201 }), /between/);
  assert.throws(() => calculateDcWireDrop({ ...base, materialCode: 0, conductorTemperatureC: 20, maxDropPercent: 100 }), /less than 100/);
});

test('LDO thermal designer reports dissipation and a negative thermal margin', () => {
  const result = calculateRegulatorThermal({
    topologyCode: 0,
    inputVoltage: 12,
    outputVoltage: 5,
    outputCurrentA: 0.5,
    buckEfficiencyPercent: 90,
    ambientTemperatureC: 25,
    thetaJaCPerW: 30,
    maxJunctionTemperatureC: 125,
  });
  closeTo(Number(result.outputs[0].value), 3.5);
  closeTo(Number(result.outputs[1].value), 41.667, 0.001);
  closeTo(Number(result.outputs[2].value), 130);
  closeTo(Number(result.outputs[3].value), -5);
  closeTo(Number(result.outputs[4].value), 28.571, 0.001);
  assert.equal(result.outputs[6].value, 'Over limit');
});

test('buck thermal designer uses entered conversion efficiency', () => {
  const result = calculateRegulatorThermal({
    topologyCode: 1,
    inputVoltage: 12,
    outputVoltage: 5,
    outputCurrentA: 2,
    buckEfficiencyPercent: 90,
    ambientTemperatureC: 40,
    thetaJaCPerW: 20,
    maxJunctionTemperatureC: 125,
  });
  closeTo(Number(result.outputs[0].value), 1.1111, 0.0001);
  closeTo(Number(result.outputs[1].value), 90);
  closeTo(Number(result.outputs[2].value), 62.222, 0.001);
  closeTo(Number(result.outputs[4].value), 76.5, 0.001);
  assert.equal(result.outputs[6].value, 'Pass');
  assert.throws(() => calculateRegulatorThermal({
    topologyCode: 1, inputVoltage: 5, outputVoltage: 5, outputCurrentA: 1,
    buckEfficiencyPercent: 90, ambientTemperatureC: 25, thetaJaCPerW: 20, maxJunctionTemperatureC: 125,
  }), /greater than output/);
  assert.throws(() => calculateRegulatorThermal({
    topologyCode: 1, inputVoltage: 12, outputVoltage: 5, outputCurrentA: 1,
    buckEfficiencyPercent: 100, ambientTemperatureC: 25, thetaJaCPerW: 20, maxJunctionTemperatureC: 125,
  }), /less than 100/);
});

test('non-inverting op-amp checker computes gain, bandwidth, and slew requirement', () => {
  const result = calculateOpAmpGain({
    modeCode: 0,
    inputPeakVoltage: 0.4,
    referenceVoltage: 2.5,
    inputResistanceKohm: 10,
    feedbackResistanceKohm: 40,
    supplyLowVoltage: 0,
    supplyHighVoltage: 5,
    commonModeLowVoltage: 0.1,
    commonModeHighVoltage: 4.9,
    outputSwingLowVoltage: 0.1,
    outputSwingHighVoltage: 4.8,
    gainBandwidthMhz: 10,
    signalFrequencyKhz: 100,
    slewRateVPerUs: 2,
  });
  closeTo(Number(result.outputs[0].value), 5);
  closeTo(Number(result.outputs[1].value), 2);
  assert.equal(result.outputs[2].value, '0.5 to 4.5');
  closeTo(Number(result.outputs[3].value), 5);
  closeTo(Number(result.outputs[4].value), 2000);
  closeTo(Number(result.outputs[5].value), 1.2566, 0.0001);
  assert.equal(result.outputs[7].value, 'Pass');
});

test('inverting op-amp checker uses noise gain for bandwidth', () => {
  const result = calculateOpAmpGain({
    modeCode: 1,
    inputPeakVoltage: 1,
    referenceVoltage: 0,
    inputResistanceKohm: 10,
    feedbackResistanceKohm: 20,
    supplyLowVoltage: -5,
    supplyHighVoltage: 5,
    commonModeLowVoltage: -1,
    commonModeHighVoltage: 1,
    outputSwingLowVoltage: -4,
    outputSwingHighVoltage: 4,
    gainBandwidthMhz: 3,
    signalFrequencyKhz: 10,
    slewRateVPerUs: 1,
  });
  closeTo(Number(result.outputs[0].value), -2);
  closeTo(Number(result.outputs[1].value), 2);
  assert.equal(result.outputs[2].value, '-2 to 2');
  closeTo(Number(result.outputs[3].value), 3);
  closeTo(Number(result.outputs[4].value), 1000);
  assert.equal(result.outputs[7].value, 'Pass');
});

test('op-amp checker surfaces range, bandwidth, and slew warnings', () => {
  const result = calculateOpAmpGain({
    modeCode: 0,
    inputPeakVoltage: 1,
    referenceVoltage: 2.5,
    inputResistanceKohm: 10,
    feedbackResistanceKohm: 10,
    supplyLowVoltage: 0,
    supplyHighVoltage: 5,
    commonModeLowVoltage: 2,
    commonModeHighVoltage: 3,
    outputSwingLowVoltage: 2,
    outputSwingHighVoltage: 3,
    gainBandwidthMhz: 0.1,
    signalFrequencyKhz: 100,
    slewRateVPerUs: 0.1,
  });
  assert.equal(result.outputs[7].value, '4 warnings');
  assert.match(result.warning, /common-mode swing/);
  assert.match(result.warning, /output-swing range/);
  assert.match(result.warning, /bandwidth/);
  assert.match(result.warning, /slew rate/);
  assert.throws(() => calculateOpAmpGain({
    modeCode: 2, inputPeakVoltage: 1, referenceVoltage: 0, inputResistanceKohm: 10, feedbackResistanceKohm: 10,
    supplyLowVoltage: 0, supplyHighVoltage: 5, commonModeLowVoltage: 0, commonModeHighVoltage: 4,
    outputSwingLowVoltage: 0.1, outputSwingHighVoltage: 4.9, gainBandwidthMhz: 1, signalFrequencyKhz: 1, slewRateVPerUs: 1,
  }), /mode/);
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

test('two-sided limits require finite, agreeing one-sided estimates', () => {
  closeTo(numericalLimit((x) => Math.sin(x) / x, 0, 'both'), 1, 1e-9);
  assert.equal(numericalLimit((x) => 1 / x, 0, 'both'), null);
  assert.equal(numericalLimit((x) => (x < 0 ? -1 : 1), 0, 'both'), null);
});

test('SAS triangle solver preserves an obtuse angle opposite the longest side', () => {
  const solved = solveTriangle(10, 6, 30);
  assert.ok(solved);
  closeTo(solved.sideC, 5.66365178536493, 1e-12);
  closeTo(solved.angleAdeg, 118.0152462800302, 1e-10);
  closeTo(solved.angleBdeg, 31.984753719969802, 1e-10);
});

test('quadratic solver rejects higher-order and non-polynomial expressions', () => {
  const solved = solveQuadraticEquation('x^2 - 5*x + 6 = 0');
  assert.ok(solved);
  assert.deepEqual(solved.roots.map((root) => root.real).sort((a, b) => a - b), [2, 3]);
  assert.equal(solveQuadraticEquation('x^3 - 6*x^2 + 11*x - 6 = 0'), null);
  assert.equal(solveQuadraticEquation('sin(x) - 0.5 = 0'), null);
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

test('workspace preserves reproducible evidence and builds a safe reopen URL', () => {
  const initial = createWorkspaceDocument();
  const updated = addCalculation(initial, {
    calculatorSlug: 'dc-wire-voltage-drop-designer',
    calculatorTitle: 'Wire Voltage Drop',
    formula: 'Vdrop = IρL/A',
    result: 'Drop = 1.38 V',
    calculatorVersion: '2026-07-28',
    inputs: [
      { id: 'materialCode', label: 'Material', value: 'Copper', reopenValue: '0' },
      { id: 'oneWayLengthM', label: 'One-way length', value: '10', unit: 'm' },
    ],
    outputs: [{ label: 'Voltage drop', value: '1.38', unit: 'V' }],
    steps: [{ label: 'Round-trip resistance', value: 'R = 2ρL/A' }],
    warning: 'Check installation ampacity separately.',
  });
  const entry = updated.projects[0].entries[0];

  assert.equal(isWorkspaceDocument(updated), true);
  assert.equal(entry.inputs[0].value, 'Copper');
  assert.equal(
    createReopenUrl(entry),
    '/dc-wire-voltage-drop-designer?materialCode=0&oneWayLengthM=10',
  );
  const csv = projectToCsv(updated.projects[0]);
  assert.match(csv, /Material: Copper/);
  assert.match(csv, /Round-trip resistance/);
  assert.match(csv, /installation ampacity/);

  const unsafeRoute = structuredClone(updated);
  unsafeRoute.projects[0].entries[0].calculatorSlug = '//example.com';
  assert.equal(isWorkspaceDocument(unsafeRoute), false);
  const unsafeQueryKey = structuredClone(updated);
  unsafeQueryKey.projects[0].entries[0].inputs[0].id = 'material&redirect';
  assert.equal(isWorkspaceDocument(unsafeQueryKey), false);
});

test('workspace templates, project duplication, and backup import avoid identifier collisions', () => {
  const initial = createWorkspaceDocument();
  const templated = addProject(initial, undefined, workspaceTemplates[0]);
  const templateProject = templated.projects.find((project) => project.id === templated.activeProjectId);
  assert.equal(templateProject.workflow.length, workspaceTemplates[0].workflow.length);

  const withEntry = addCalculation(templated, {
    calculatorSlug: 'adc-resolution-calculator',
    calculatorTitle: 'ADC Resolution',
    formula: 'LSB = Vref/2^n',
    result: '0.806 mV',
  });
  const sourceProject = withEntry.projects.find((project) => project.id === withEntry.activeProjectId);
  const duplicated = duplicateProject(withEntry, withEntry.activeProjectId);
  assert.equal(duplicated.projects.length, 3);
  assert.notEqual(duplicated.projects[2].id, withEntry.activeProjectId);
  assert.notEqual(duplicated.projects[2].entries[0].id, sourceProject.entries[0].id);

  const forgedReviewedBackup = structuredClone(withEntry);
  const forgedReviewedProject = forgedReviewedBackup.projects.find(
    (project) => project.id === forgedReviewedBackup.activeProjectId,
  );
  forgedReviewedProject.status = 'reviewed';
  forgedReviewedProject.reviewedBy = 'Untrusted importer';
  forgedReviewedProject.reviewedAt = '2026-07-28T00:00:00.000Z';
  forgedReviewedProject.entries[0].reviewStatus = 'reviewed';
  forgedReviewedProject.entries[0].reviewedBy = 'Untrusted importer';
  forgedReviewedProject.entries[0].reviewedAt = '2026-07-28T00:00:00.000Z';

  const merged = mergeWorkspaceDocuments(duplicated, forgedReviewedBackup);
  assert.equal(isWorkspaceDocument(merged), true);
  assert.equal(merged.projects.length, duplicated.projects.length + forgedReviewedBackup.projects.length);
  assert.equal(new Set(merged.projects.map((project) => project.id)).size, merged.projects.length);
  assert.match(merged.projects.at(-1).name, /imported/);
  assert.equal(merged.projects.at(-1).status, 'draft');
  assert.equal(merged.projects.at(-1).reviewedBy, undefined);
  assert.equal(merged.projects.at(-1).entries[0].reviewStatus, 'draft');
});

test('in-memory rate limiter keeps a hard cap on attacker-controlled keys', () => {
  for (let index = 0; index <= 10_000; index += 1) {
    rateLimit(`capacity-test-${index}`, 2, 60_000);
  }
  const evictedOldest = rateLimit('capacity-test-0', 2, 60_000);
  assert.equal(evictedOldest.remaining, 1);
});

test('workspace mutations explicitly report project and calculation capacity limits', () => {
  const current = createWorkspaceDocument();
  const fullProject = {
    ...current.projects[0],
    entries: Array.from({ length: 1_000 }, (_, index) => ({
      id: `calculation_${index}`,
      calculatorSlug: 'ohms-law-calculator',
      calculatorTitle: "Ohm's Law",
      result: 'V = 12 V',
      formula: 'V = I × R',
      note: '',
      createdAt: '2026-07-28T00:00:00.000Z',
    })),
  };
  const fullDocument = { ...current, projects: [fullProject] };
  const saveOutcome = tryAddCalculation(fullDocument, {
    calculatorSlug: 'power-calculator',
    calculatorTitle: 'Power Calculator',
    result: 'P = 12 W',
    formula: 'P = V × I',
  });
  assert.deepEqual(saveOutcome, {
    ok: false,
    document: fullDocument,
    reason: 'project-capacity-reached',
  });

  const oneProjectBackup = createWorkspaceDocument();
  const nearlyFull = {
    ...current,
    projects: Array.from({ length: 99 }, (_, index) => ({
      ...current.projects[0],
      id: `project_${index}`,
      name: `Project ${index}`,
    })),
  };
  const largeBackup = {
    ...oneProjectBackup,
    projects: Array.from({ length: 3 }, (_, index) => ({
      ...oneProjectBackup.projects[0],
      id: `import_${index}`,
      name: `Import ${index}`,
    })),
  };
  const mergeOutcome = mergeWorkspaceDocumentsWithResult(nearlyFull, largeBackup);
  assert.equal(mergeOutcome.importedCount, 1);
  assert.equal(mergeOutcome.skippedCount, 2);
  assert.equal(mergeOutcome.document.projects.length, 100);
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

test('Stripe subscription snapshots use current cancellation and expected-price state', () => {
  const snapshot = toSubscriptionProfileSnapshot(
    {
      id: 'sub_current',
      customer: 'cus_current',
      status: 'active',
      metadata: { supabase_user_id: '54b3e3ce-20fd-4c66-8f17-5c67e02fb147' },
      cancel_at_period_end: true,
      canceled_at: 1_800_000_000,
      items: {
        data: [
          { price: { id: 'price_legacy' }, current_period_end: 1_700_000_000 },
          { price: { id: 'price_pro' }, current_period_end: 1_900_000_000 },
        ],
      },
    },
    'price_pro',
  );

  assert.equal(snapshot.userId, '54b3e3ce-20fd-4c66-8f17-5c67e02fb147');
  assert.equal(snapshot.customerId, 'cus_current');
  assert.equal(snapshot.priceId, 'price_pro');
  assert.equal(snapshot.currentPeriodEnd, new Date(1_900_000_000 * 1000).toISOString());
  assert.equal(snapshot.cancelAtPeriodEnd, true);
  assert.equal(snapshot.canceledAt, new Date(1_800_000_000 * 1000).toISOString());
});

test('Stripe event helpers reject malformed ownership metadata and classify durable events', () => {
  const snapshot = toSubscriptionProfileSnapshot(
    {
      id: 'sub_current',
      customer: { id: 'cus_current' },
      status: 'canceled',
      metadata: { supabase_user_id: 'not-a-uuid' },
      cancel_at_period_end: false,
      canceled_at: null,
      items: { data: [{ price: { id: 'price_pro' }, current_period_end: 1_900_000_000 }] },
    },
    'price_pro',
  );

  assert.equal(snapshot.userId, null);
  assert.equal(isSubscriptionLifecycleEvent('customer.subscription.updated'), true);
  assert.equal(isSubscriptionLifecycleEvent('customer.subscription.deleted'), true);
  assert.equal(isSubscriptionLifecycleEvent('invoice.paid'), false);
  assert.equal(getStripeObjectId({ data: { object: { id: 'sub_current' } } }), 'sub_current');
  assert.equal(getStripeObjectId({ data: { object: {} } }), null);
});

test('Stripe canonical selection ignores an older canceled delivery when Pro is currently active', () => {
  const canceled = {
    id: 'sub_old',
    created: 100,
    customer: 'cus_current',
    status: 'canceled',
    metadata: { supabase_user_id: '54b3e3ce-20fd-4c66-8f17-5c67e02fb147' },
    cancel_at_period_end: false,
    canceled_at: 200,
    items: { data: [{ price: { id: 'price_pro' }, current_period_end: 200 }] },
  };
  const active = {
    id: 'sub_current',
    created: 300,
    customer: 'cus_current',
    status: 'active',
    metadata: { supabase_user_id: '54b3e3ce-20fd-4c66-8f17-5c67e02fb147' },
    cancel_at_period_end: false,
    canceled_at: null,
    items: { data: [{ price: { id: 'price_pro' }, current_period_end: 400 }] },
  };

  const selected = chooseCanonicalSubscription(
    [canceled, active],
    canceled,
    'sub_old',
    'price_pro',
  );
  assert.equal(selected.id, 'sub_current');
});

test('Stripe price contract and duplicate-subscription guard fail closed', () => {
  const price = {
    active: true,
    type: 'recurring',
    billing_scheme: 'per_unit',
    unit_amount: 900,
    currency: 'usd',
    recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' },
  };
  assert.equal(matchesProPriceContract(price), true);
  assert.equal(matchesProPriceContract({ ...price, unit_amount: 1_900 }), false);
  assert.equal(
    matchesProPriceContract({
      ...price,
      recurring: { ...price.recurring, usage_type: 'metered' },
    }),
    false,
  );

  const subscription = {
    id: 'sub_live',
    customer: 'cus_live',
    status: 'past_due',
    created: 10,
    metadata: {},
    cancel_at_period_end: false,
    canceled_at: null,
    items: { data: [{ price: { id: 'price_pro' }, current_period_end: 1_900_000_000 }] },
  };
  assert.equal(isNonTerminalProSubscription(subscription, 'price_pro'), true);
  assert.equal(
    isNonTerminalProSubscription({ ...subscription, status: 'canceled' }, 'price_pro'),
    false,
  );
  assert.throws(
    () => chooseCanonicalSubscription(
      [
        { ...subscription, id: 'sub_one', status: 'active', created: 1 },
        { ...subscription, id: 'sub_two', status: 'trialing', created: 2 },
      ],
      subscription,
      null,
      'price_pro',
    ),
    /Multiple active Pro subscriptions/,
  );
});

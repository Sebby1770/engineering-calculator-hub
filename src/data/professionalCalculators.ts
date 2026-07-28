import type { CalculatorConfig } from '@/types';
import type { EngineeringResult } from '@/lib/engineeringCalculations';
import {
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
} from '@/lib/engineeringCalculations';

export interface EngineeringToolField {
  id: string;
  label: string;
  unit?: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  options?: { value: number; label: string }[];
}

export interface EngineeringToolDefinition {
  slug: string;
  fields: EngineeringToolField[];
  calculate: (values: Record<string, number>) => EngineeringResult;
}

const professionalCalculatorConfigsBase: CalculatorConfig[] = [
  {
    meta: {
      slug: 'led-resistor-designer',
      title: 'LED Resistor Designer – E24 Value, Current and Power Rating',
      shortTitle: 'LED Resistor Designer',
      description: 'Choose a practical E24 current-limiting resistor for one or more series LEDs, then verify actual current and resistor power dissipation.',
      category: 'electrical',
      icon: 'LED',
      keywords: ['LED resistor calculator', 'current limiting resistor', 'E24 resistor', 'LED power'],
      popular: true,
      new: true,
    },
    formula: 'R = (Vs − n·Vf) / ILED,  PR = ILED²R',
    formulaExplanation: 'The resistor drops the supply voltage left after the series LED forward voltages. Selecting the next higher E24 value keeps nominal current at or below the target, while a power-rating margin helps account for supply and component variation.',
    exampleUsage: 'For a 12 V supply, three 2.0 V LEDs, and 20 mA target current, the ideal resistance is 300 Ω. The next suitable E24 value is 300 Ω and it dissipates about 0.12 W.',
    faqs: [
      { question: 'Why choose the next higher E24 resistor?', answer: 'For a current-limiting resistor, rounding upward reduces current rather than increasing it. You should still check the LED forward-voltage and supply tolerances.' },
      { question: 'Can I put LEDs in parallel?', answer: 'Parallel LEDs generally need individual current-limiting paths because forward-voltage differences can make current sharing uneven.' },
    ],
    relatedSlugs: ['ohms-law-calculator', 'power-calculator', 'series-resistor-calculator', 'voltage-divider-calculator'],
  },
  {
    meta: {
      slug: 'pcb-trace-voltage-drop-calculator',
      title: 'PCB Trace Voltage Drop Calculator – Copper Resistance and Loss',
      shortTitle: 'PCB Trace Drop',
      description: 'Estimate DC copper resistance, voltage drop, power loss, and current density from PCB trace geometry at 20°C.',
      category: 'electrical',
      icon: 'PCB',
      keywords: ['PCB trace resistance', 'voltage drop', 'copper loss', 'trace current density'],
      popular: true,
      new: true,
    },
    formula: 'R = ρL/(w·t),  Vdrop = IR,  Ploss = I²R',
    formulaExplanation: 'A rectangular copper trace has resistance set by copper resistivity, length, width, and finished copper thickness. This tool estimates DC loss only; temperature rise and current capacity require a thermal model and fabrication assumptions.',
    exampleUsage: 'A 100 mm long, 1 mm wide, 35 µm thick trace carrying 2 A has about 49 mΩ resistance, 98 mV drop, and 0.20 W copper loss at 20°C.',
    faqs: [
      { question: 'Is this an IPC current-capacity calculator?', answer: 'No. It calculates electrical resistance and loss. Current capacity depends on board construction, ambient conditions, copper temperature, adjacent copper, and the chosen design standard.' },
      { question: 'Why will a real trace measure higher resistance?', answer: 'Copper resistivity rises with temperature, and finished width/thickness can differ from nominal fabrication values. Vias and neck-downs add resistance too.' },
    ],
    relatedSlugs: ['ohms-law-calculator', 'power-calculator', 'voltage-divider-calculator', 'parallel-resistor-calculator'],
  },
  {
    meta: {
      slug: 'series-rlc-resonance-calculator',
      title: 'Series RLC Resonance Calculator – Frequency, Q and Bandwidth',
      shortTitle: 'Series RLC Resonance',
      description: 'Calculate ideal series-resonant frequency, angular frequency, quality factor, and approximate −3 dB bandwidth.',
      category: 'signals',
      icon: 'RLC',
      keywords: ['RLC resonance', 'resonant frequency', 'quality factor', 'bandwidth'],
      popular: true,
      new: true,
    },
    formula: 'f₀ = 1/(2π√LC),  Q = √(L/C)/R,  BW = f₀/Q',
    formulaExplanation: 'At series resonance the ideal inductive and capacitive reactances cancel. Resistance limits the quality factor and sets the approximate bandwidth around resonance.',
    exampleUsage: 'With R = 10 Ω, L = 10 mH, and C = 100 nF, resonance is about 5.03 kHz, Q is about 31.6, and bandwidth is about 159 Hz.',
    faqs: [
      { question: 'Does this include coil and capacitor losses?', answer: 'Enter the total effective series resistance, including source, winding, ESR, and intentional resistance, for a more realistic Q estimate.' },
      { question: 'What happens at resonance?', answer: 'In an ideal series RLC circuit, inductive and capacitive reactance cancel, leaving the impedance at its minimum resistive value.' },
    ],
    relatedSlugs: ['frequency-calculator', 'rc-time-constant-calculator', 'rc-low-pass-filter-designer', 'frequency-to-period-converter'],
  },
  {
    meta: {
      slug: 'three-phase-power-calculator',
      title: 'Three-Phase Power Calculator – kW, kVA, kVAr and Efficiency',
      shortTitle: 'Three-Phase Power',
      description: 'Calculate balanced three-phase real, apparent, and reactive power from line voltage, line current, power factor, and efficiency.',
      category: 'electrical',
      icon: '3φ',
      keywords: ['three phase power', 'kW kVA kVAr', 'power factor', 'motor power'],
      new: true,
    },
    formula: 'S = √3·VL·IL,  P = S·PF,  Q = S√(1−PF²)',
    formulaExplanation: 'For a balanced three-phase system, apparent power comes from line-to-line voltage and line current. Power factor splits apparent power into real and reactive components; efficiency estimates useful output from real input.',
    exampleUsage: 'At 400 V, 20 A, and 0.85 power factor, a balanced load draws about 13.86 kVA and 11.78 kW. At 92% efficiency, estimated output is about 10.84 kW.',
    faqs: [
      { question: 'Should I enter phase or line voltage?', answer: 'Enter line-to-line voltage and line current. The √3 relationship used here assumes a balanced three-phase system.' },
      { question: 'Is power factor the same as efficiency?', answer: 'No. Power factor describes the relationship between real and apparent electrical power. Efficiency compares useful output power with real input power.' },
    ],
    relatedSlugs: ['power-calculator', 'energy-calculator', 'ohms-law-calculator', 'frequency-calculator'],
  },
  {
    meta: {
      slug: 'battery-runtime-calculator',
      title: 'Battery Runtime Calculator – Usable Wh, Load Current and Hours',
      shortTitle: 'Battery Runtime',
      description: 'Estimate battery runtime from amp-hours, nominal voltage, load power, conversion efficiency, and usable depth of discharge.',
      category: 'electrical',
      icon: 'BAT',
      keywords: ['battery runtime', 'amp hour to watt hour', 'battery life', 'usable energy'],
      popular: true,
      new: true,
    },
    formula: 'truntime = (Ah·V·usable%·η) / Pload',
    formulaExplanation: 'Amp-hours become nameplate watt-hours when multiplied by nominal voltage. Applying usable-capacity and conversion-efficiency factors produces an energy budget that can be divided by the load power.',
    exampleUsage: 'A 100 Ah, 12.8 V battery with 80% usable capacity and 90% conversion efficiency provides about 922 Wh, or roughly 9.2 hours at a 100 W load.',
    faqs: [
      { question: 'Why is real runtime often lower?', answer: 'Temperature, battery age, discharge rate, converter standby loss, voltage cut-off, wiring loss, and capacity-test conditions all affect usable energy.' },
      { question: 'Can I use this for batteries in series or parallel?', answer: 'Yes. Use total pack voltage and total pack amp-hour capacity. Series raises voltage; parallel raises amp-hour capacity.' },
    ],
    relatedSlugs: ['energy-calculator', 'power-calculator', 'ohms-law-calculator', 'three-phase-power-calculator'],
  },
  {
    meta: {
      slug: 'adc-resolution-calculator',
      title: 'ADC Resolution Calculator – LSB Size, Digital Code and Error',
      shortTitle: 'ADC Resolution',
      description: 'Convert ADC bit depth and reference voltage into ideal LSB size, digital code, quantized voltage, and quantization error.',
      category: 'signals',
      icon: 'ADC',
      keywords: ['ADC resolution', 'LSB voltage', 'quantization', 'digital code'],
      popular: true,
      new: true,
    },
    formula: 'LSB = Vref/2ⁿ,  code = round(Vin/LSB)',
    formulaExplanation: 'An ideal n-bit ADC divides its reference span into 2ⁿ levels. This tool uses a simple ideal rounding model; real converters add offset, gain, linearity, reference, noise, and driver errors.',
    exampleUsage: 'For a 12-bit ADC with 3.3 V reference, one LSB is about 0.806 mV. An input of 1.65 V maps to ideal mid-scale code 2048.',
    faqs: [
      { question: 'Why is the maximum code 2ⁿ − 1?', answer: 'There are 2ⁿ distinct codes starting at zero, so the highest integer code is one less than the number of levels.' },
      { question: 'Is LSB size the same as accuracy?', answer: 'No. Resolution is only the ideal code step. Accuracy also depends on reference tolerance, offset, gain, INL/DNL, noise, and the analog signal path.' },
    ],
    relatedSlugs: ['binary-hex-decimal-converter', 'voltage-divider-calculator', 'db-to-voltage-converter', 'rc-low-pass-filter-designer'],
  },
  {
    meta: {
      slug: 'rc-low-pass-filter-designer',
      title: 'RC Low-Pass Filter Designer – Cutoff, Gain, Phase and Rise Time',
      shortTitle: 'RC Low-Pass Designer',
      description: 'Design and inspect a first-order RC low-pass filter, including cutoff frequency, test-frequency attenuation, phase shift, and rise time.',
      category: 'signals',
      icon: 'LPF',
      keywords: ['RC low pass filter', 'cutoff frequency', 'attenuation', 'phase shift'],
      popular: true,
      new: true,
    },
    formula: 'fc = 1/(2πRC),  |H| = 1/√(1+(f/fc)²)',
    formulaExplanation: 'A first-order RC low-pass filter passes low frequencies and rolls off above its cutoff. The ideal magnitude is −3.01 dB and phase is −45° at cutoff.',
    exampleUsage: 'R = 10 kΩ and C = 100 nF gives a cutoff near 159 Hz. At 1 kHz, ideal gain is about 0.157, or −16.1 dB.',
    faqs: [
      { question: 'Why does the load matter?', answer: 'A finite load appears in parallel with the capacitor or downstream network and changes the effective resistance and transfer function.' },
      { question: 'What is the roll-off rate?', answer: 'An ideal first-order low-pass filter approaches −20 dB per decade (−6 dB per octave) above cutoff.' },
    ],
    relatedSlugs: ['rc-time-constant-calculator', 'series-rlc-resonance-calculator', 'frequency-calculator', 'adc-resolution-calculator'],
  },
  {
    meta: {
      slug: 'dc-wire-voltage-drop-designer',
      title: 'DC Wire Voltage Drop Designer – Temperature and Minimum Cable Area',
      shortTitle: 'DC Wire Voltage Drop',
      description: 'Estimate copper or aluminium round-trip DC cable resistance, voltage drop, delivered voltage, loss, and minimum cross-section for a chosen drop limit.',
      category: 'electrical',
      icon: 'WIRE',
      keywords: ['DC cable voltage drop', 'wire resistance', 'minimum cable size', 'copper aluminium cable'],
      popular: true,
      new: true,
    },
    formula: 'Rloop = ρT·(2L)/A,  Vdrop = IRloop,  Amin = ρT·(2L)I/Vallowed',
    formulaExplanation: 'DC conductor resistance uses the full outgoing-and-return path. Copper or aluminium resistivity is adjusted from 20°C using its temperature coefficient, then the entered cable area is checked against the area required by the selected voltage-drop target.',
    exampleUsage: 'A 10 m one-way copper run carrying 10 A through 2.5 mm² at 20°C has about 0.138 Ω loop resistance and 1.38 V drop. On a 12 V system, a 3% target requires about 9.58 mm² before choosing a practical cable size.',
    faqs: [
      { question: 'Why is the cable length doubled?', answer: 'A DC circuit normally includes an outgoing and return conductor. Enter the physical one-way distance; the calculator models twice that length.' },
      { question: 'Does the minimum area prove the cable is safe or code compliant?', answer: 'No. It addresses DC voltage drop only. Ampacity, insulation, grouping, installation method, fault protection, terminations, and local wiring rules require separate checks.' },
    ],
    relatedSlugs: ['ohms-law-calculator', 'power-calculator', 'pcb-trace-voltage-drop-calculator', 'battery-runtime-calculator', 'regulator-thermal-designer'],
  },
  {
    meta: {
      slug: 'regulator-thermal-designer',
      title: 'Regulator Thermal Designer – LDO and Buck Loss, Junction Temperature and θJA',
      shortTitle: 'Regulator Thermal Designer',
      description: 'Estimate LDO or buck-regulator power loss, efficiency, junction temperature, thermal margin, and the maximum allowable junction-to-ambient thermal resistance.',
      category: 'electrical',
      icon: 'TJ',
      keywords: ['LDO thermal calculator', 'buck converter loss', 'junction temperature', 'theta JA'],
      popular: true,
      new: true,
    },
    formula: 'Ploss = Pin − Pout,  TJ = TA + Ploss·θJA,  θJA,max = (TJ,max − TA)/Ploss',
    formulaExplanation: 'The LDO model approximates input current as load current, while the buck model derives input power from the entered conversion efficiency. Dissipation and junction-to-ambient thermal resistance then estimate nominal junction temperature and available thermal margin.',
    exampleUsage: 'An LDO converting 12 V to 5 V at 0.5 A dissipates about 3.5 W. At 25°C ambient and 30°C/W, its estimated junction temperature is 130°C, which exceeds a 125°C limit by 5°C.',
    faqs: [
      { question: 'Why is the buck efficiency an input?', answer: 'Switching loss depends on the actual controller, MOSFETs, inductor, frequency, layout, and operating point. Use a conservative datasheet or measured efficiency for the intended conditions.' },
      { question: 'Is θJA a fixed package property?', answer: 'Not by itself. Published θJA depends strongly on the test board, copper area, airflow, enclosure, and mounting. Model the actual PCB and verify thermally.' },
    ],
    relatedSlugs: ['power-calculator', 'battery-runtime-calculator', 'pcb-trace-voltage-drop-calculator', 'dc-wire-voltage-drop-designer', 'ohms-law-calculator'],
  },
  {
    meta: {
      slug: 'op-amp-gain-checker',
      title: 'Op-Amp Gain Checker – Output Range, GBW and Slew-Rate Limits',
      shortTitle: 'Op-Amp Gain Checker',
      description: 'Check inverting or non-inverting gain, referenced sine-wave output range, noise gain, closed-loop bandwidth, slew requirement, input common-mode range, and output swing.',
      category: 'signals',
      icon: 'OP',
      keywords: ['op amp gain calculator', 'gain bandwidth', 'slew rate calculator', 'input common mode output swing'],
      popular: true,
      new: true,
    },
    formula: 'Av,NI = 1 + Rf/Rg,  Av,I = −Rf/Rin,  BW ≈ GBW/noise gain,  SRmin = 2πfVpeak',
    formulaExplanation: 'The resistor ratio determines ideal signal gain. The noise gain estimates closed-loop bandwidth from gain-bandwidth product, while the entered signal frequency and output excursion set a minimum sine-wave slew rate. Nominal input common-mode and output-swing checks use limits copied from the chosen op-amp datasheet.',
    exampleUsage: 'A non-inverting stage with Rg = 10 kΩ and Rf = 40 kΩ has gain 5 V/V. A 0.4 V peak signal centred at 2.5 V produces 2 V peak output (0.5–4.5 V); 10 MHz GBW gives about 2 MHz bandwidth, while 100 kHz requires about 1.26 V/µs slew rate.',
    faqs: [
      { question: 'Why is bandwidth based on noise gain?', answer: 'For a voltage-feedback op amp, loop gain and approximate closed-loop bandwidth are governed by noise gain. In an inverting stage, noise gain is 1 + Rf/Rin even though signal gain is −Rf/Rin.' },
      { question: 'Does passing these checks guarantee stability?', answer: 'No. Capacitive loading, feedback capacitance, source impedance, layout, phase margin, output current, and device-specific behavior still require datasheet analysis or simulation.' },
    ],
    relatedSlugs: ['rc-low-pass-filter-designer', 'adc-resolution-calculator', 'voltage-divider-calculator', 'db-to-voltage-converter', 'series-rlc-resonance-calculator'],
  },
];

export const professionalCalculatorConfigs: CalculatorConfig[] =
  professionalCalculatorConfigsBase.map((config) => ({
    ...config,
    quality: {
      label: 'Automated reference cases',
      summary:
        'The deterministic formula path is covered by reproducible reference inputs and expected outputs in the project test suite.',
      lastReviewed: '28 July 2026',
    },
  }));

export const engineeringToolDefinitions: EngineeringToolDefinition[] = [
  {
    slug: 'led-resistor-designer',
    fields: [
      { id: 'supplyVoltage', label: 'Supply voltage', unit: 'V', defaultValue: 12, min: 0.01, step: 0.1 },
      { id: 'forwardVoltage', label: 'LED forward voltage', unit: 'V', defaultValue: 2, min: 0.01, step: 0.01 },
      { id: 'ledCount', label: 'LEDs in series', defaultValue: 3, min: 1, max: 100, step: 1 },
      { id: 'targetCurrentMa', label: 'Target current', unit: 'mA', defaultValue: 20, min: 0.01, step: 0.1 },
    ],
    calculate: (values) => calculateLedResistor({
      supplyVoltage: values.supplyVoltage,
      forwardVoltage: values.forwardVoltage,
      ledCount: values.ledCount,
      targetCurrentMa: values.targetCurrentMa,
    }),
  },
  {
    slug: 'pcb-trace-voltage-drop-calculator',
    fields: [
      { id: 'lengthMm', label: 'Trace length', unit: 'mm', defaultValue: 100, min: 0.01, step: 1 },
      { id: 'widthMm', label: 'Finished width', unit: 'mm', defaultValue: 1, min: 0.001, step: 0.05 },
      { id: 'thicknessUm', label: 'Copper thickness', unit: 'µm', defaultValue: 35, min: 0.1, step: 1, help: '35 µm is approximately 1 oz/ft² base copper before process variation.' },
      { id: 'currentA', label: 'DC current', unit: 'A', defaultValue: 2, min: 0.001, step: 0.1 },
    ],
    calculate: (values) => calculatePcbTraceDrop({
      lengthMm: values.lengthMm,
      widthMm: values.widthMm,
      thicknessUm: values.thicknessUm,
      currentA: values.currentA,
    }),
  },
  {
    slug: 'series-rlc-resonance-calculator',
    fields: [
      { id: 'resistanceOhm', label: 'Total series resistance', unit: 'Ω', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'inductanceMh', label: 'Inductance', unit: 'mH', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'capacitanceNf', label: 'Capacitance', unit: 'nF', defaultValue: 100, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateSeriesRlc({
      resistanceOhm: values.resistanceOhm,
      inductanceMh: values.inductanceMh,
      capacitanceNf: values.capacitanceNf,
    }),
  },
  {
    slug: 'three-phase-power-calculator',
    fields: [
      { id: 'lineVoltage', label: 'Line-to-line voltage', unit: 'V', defaultValue: 400, min: 0.01, step: 1 },
      { id: 'lineCurrent', label: 'Line current', unit: 'A', defaultValue: 20, min: 0.001, step: 0.1 },
      { id: 'powerFactor', label: 'Power factor', defaultValue: 0.85, min: 0.001, max: 1, step: 0.01 },
      { id: 'efficiencyPercent', label: 'Efficiency', unit: '%', defaultValue: 92, min: 0.01, max: 100, step: 0.1 },
    ],
    calculate: (values) => calculateThreePhasePower({
      lineVoltage: values.lineVoltage,
      lineCurrent: values.lineCurrent,
      powerFactor: values.powerFactor,
      efficiencyPercent: values.efficiencyPercent,
    }),
  },
  {
    slug: 'battery-runtime-calculator',
    fields: [
      { id: 'capacityAh', label: 'Battery capacity', unit: 'Ah', defaultValue: 100, min: 0.001, step: 1 },
      { id: 'nominalVoltage', label: 'Nominal voltage', unit: 'V', defaultValue: 12.8, min: 0.001, step: 0.1 },
      { id: 'loadWatts', label: 'Average load', unit: 'W', defaultValue: 100, min: 0.001, step: 1 },
      { id: 'efficiencyPercent', label: 'Conversion efficiency', unit: '%', defaultValue: 90, min: 0.01, max: 100, step: 1 },
      { id: 'usablePercent', label: 'Usable capacity', unit: '%', defaultValue: 80, min: 0.01, max: 100, step: 1 },
    ],
    calculate: (values) => calculateBatteryRuntime({
      capacityAh: values.capacityAh,
      nominalVoltage: values.nominalVoltage,
      loadWatts: values.loadWatts,
      efficiencyPercent: values.efficiencyPercent,
      usablePercent: values.usablePercent,
    }),
  },
  {
    slug: 'adc-resolution-calculator',
    fields: [
      { id: 'bits', label: 'ADC resolution', unit: 'bits', defaultValue: 12, min: 1, max: 32, step: 1 },
      { id: 'referenceVoltage', label: 'Reference voltage', unit: 'V', defaultValue: 3.3, min: 0.001, step: 0.1 },
      { id: 'inputVoltage', label: 'Input voltage', unit: 'V', defaultValue: 1.65, min: 0, step: 0.01 },
    ],
    calculate: (values) => calculateAdcResolution({
      bits: values.bits,
      referenceVoltage: values.referenceVoltage,
      inputVoltage: values.inputVoltage,
    }),
  },
  {
    slug: 'rc-low-pass-filter-designer',
    fields: [
      { id: 'resistanceKohm', label: 'Resistance', unit: 'kΩ', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'capacitanceNf', label: 'Capacitance', unit: 'nF', defaultValue: 100, min: 0.0001, step: 1 },
      { id: 'signalFrequencyHz', label: 'Test frequency', unit: 'Hz', defaultValue: 1_000, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateRcLowPass({
      resistanceKohm: values.resistanceKohm,
      capacitanceNf: values.capacitanceNf,
      signalFrequencyHz: values.signalFrequencyHz,
    }),
  },
  {
    slug: 'dc-wire-voltage-drop-designer',
    fields: [
      {
        id: 'materialCode',
        label: 'Conductor material',
        defaultValue: 0,
        options: [
          { value: 0, label: 'Copper' },
          { value: 1, label: 'Aluminium' },
        ],
      },
      { id: 'oneWayLengthM', label: 'One-way cable length', unit: 'm', defaultValue: 10, min: 0.001, step: 0.1 },
      { id: 'conductorAreaMm2', label: 'Conductor cross-section', unit: 'mm²', defaultValue: 2.5, min: 0.001, step: 0.1 },
      { id: 'currentA', label: 'DC load current', unit: 'A', defaultValue: 10, min: 0.001, step: 0.1 },
      { id: 'systemVoltage', label: 'Source voltage', unit: 'V', defaultValue: 12, min: 0.001, step: 0.1 },
      { id: 'conductorTemperatureC', label: 'Conductor temperature', unit: '°C', defaultValue: 20, min: -50, max: 200, step: 1, help: 'Use expected conductor temperature, not necessarily room temperature.' },
      { id: 'maxDropPercent', label: 'Maximum permitted drop', unit: '%', defaultValue: 3, min: 0.01, max: 99.99, step: 0.1 },
    ],
    calculate: (values) => calculateDcWireDrop({
      materialCode: values.materialCode,
      oneWayLengthM: values.oneWayLengthM,
      conductorAreaMm2: values.conductorAreaMm2,
      currentA: values.currentA,
      systemVoltage: values.systemVoltage,
      conductorTemperatureC: values.conductorTemperatureC,
      maxDropPercent: values.maxDropPercent,
    }),
  },
  {
    slug: 'regulator-thermal-designer',
    fields: [
      {
        id: 'topologyCode',
        label: 'Regulator topology',
        defaultValue: 0,
        options: [
          { value: 0, label: 'LDO / linear regulator' },
          { value: 1, label: 'Buck converter' },
        ],
      },
      { id: 'inputVoltage', label: 'Input voltage', unit: 'V', defaultValue: 12, min: 0.001, step: 0.1 },
      { id: 'outputVoltage', label: 'Output voltage', unit: 'V', defaultValue: 5, min: 0.001, step: 0.1 },
      { id: 'outputCurrentA', label: 'Output current', unit: 'A', defaultValue: 0.5, min: 0.001, step: 0.1 },
      { id: 'buckEfficiencyPercent', label: 'Buck efficiency', unit: '%', defaultValue: 90, min: 0.01, max: 99.99, step: 0.1, help: 'Used for buck mode; LDO efficiency comes from Vout/Vin.' },
      { id: 'ambientTemperatureC', label: 'Local ambient temperature', unit: '°C', defaultValue: 25, step: 1 },
      { id: 'thetaJaCPerW', label: 'Effective junction-to-ambient θJA', unit: '°C/W', defaultValue: 30, min: 0.001, step: 1 },
      { id: 'maxJunctionTemperatureC', label: 'Maximum junction temperature', unit: '°C', defaultValue: 125, step: 1 },
    ],
    calculate: (values) => calculateRegulatorThermal({
      topologyCode: values.topologyCode,
      inputVoltage: values.inputVoltage,
      outputVoltage: values.outputVoltage,
      outputCurrentA: values.outputCurrentA,
      buckEfficiencyPercent: values.buckEfficiencyPercent,
      ambientTemperatureC: values.ambientTemperatureC,
      thetaJaCPerW: values.thetaJaCPerW,
      maxJunctionTemperatureC: values.maxJunctionTemperatureC,
    }),
  },
  {
    slug: 'op-amp-gain-checker',
    fields: [
      {
        id: 'modeCode',
        label: 'Amplifier mode',
        defaultValue: 0,
        options: [
          { value: 0, label: 'Non-inverting' },
          { value: 1, label: 'Inverting' },
        ],
      },
      { id: 'inputPeakVoltage', label: 'Input sine-wave peak', unit: 'V', defaultValue: 0.4, min: 0.0001, step: 0.1 },
      { id: 'referenceVoltage', label: 'Signal reference / bias', unit: 'V', defaultValue: 2.5, step: 0.1, help: 'The sine wave is modelled as centred on this voltage.' },
      { id: 'inputResistanceKohm', label: 'Rg or Rin', unit: 'kΩ', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'feedbackResistanceKohm', label: 'Feedback resistance Rf', unit: 'kΩ', defaultValue: 40, min: 0.0001, step: 0.1 },
      { id: 'supplyLowVoltage', label: 'Low supply rail', unit: 'V', defaultValue: 0, step: 0.1 },
      { id: 'supplyHighVoltage', label: 'High supply rail', unit: 'V', defaultValue: 5, step: 0.1 },
      { id: 'commonModeLowVoltage', label: 'Input common-mode low', unit: 'V', defaultValue: 0.1, step: 0.1 },
      { id: 'commonModeHighVoltage', label: 'Input common-mode high', unit: 'V', defaultValue: 4.9, step: 0.1 },
      { id: 'outputSwingLowVoltage', label: 'Output swing low', unit: 'V', defaultValue: 0.1, step: 0.1 },
      { id: 'outputSwingHighVoltage', label: 'Output swing high', unit: 'V', defaultValue: 4.8, step: 0.1 },
      { id: 'gainBandwidthMhz', label: 'Gain-bandwidth product', unit: 'MHz', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'signalFrequencyKhz', label: 'Signal frequency', unit: 'kHz', defaultValue: 100, min: 0.0001, step: 1 },
      { id: 'slewRateVPerUs', label: 'Available slew rate', unit: 'V/µs', defaultValue: 2, min: 0.0001, step: 0.1 },
    ],
    calculate: (values) => calculateOpAmpGain({
      modeCode: values.modeCode,
      inputPeakVoltage: values.inputPeakVoltage,
      referenceVoltage: values.referenceVoltage,
      inputResistanceKohm: values.inputResistanceKohm,
      feedbackResistanceKohm: values.feedbackResistanceKohm,
      supplyLowVoltage: values.supplyLowVoltage,
      supplyHighVoltage: values.supplyHighVoltage,
      commonModeLowVoltage: values.commonModeLowVoltage,
      commonModeHighVoltage: values.commonModeHighVoltage,
      outputSwingLowVoltage: values.outputSwingLowVoltage,
      outputSwingHighVoltage: values.outputSwingHighVoltage,
      gainBandwidthMhz: values.gainBandwidthMhz,
      signalFrequencyKhz: values.signalFrequencyKhz,
      slewRateVPerUs: values.slewRateVPerUs,
    }),
  },
];

export function getEngineeringToolBySlug(slug: string) {
  return engineeringToolDefinitions.find((tool) => tool.slug === slug);
}

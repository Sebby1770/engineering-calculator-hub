import type { CalculatorConfig } from '@/types';
import type { EngineeringToolDefinition } from '@/data/professionalCalculators';
import {
  calculateBernoulli,
  calculateCarnotEfficiency,
  calculateDarcyWeisbach,
  calculateEulerBuckling,
  calculateGearTrain,
  calculateHelicalSpring,
  calculateIdealGas,
  calculateLmtdHeatExchanger,
  calculateManningFlow,
  calculateRationalRunoff,
  calculateReynoldsNumber,
  calculateSectionModulus,
  calculateShaftTorsion,
  calculateSimplySupportedBeam,
  calculateSolutionDilution,
  calculateStressStrain,
  calculateThermalExpansion,
  calculatePumpPower,
  calculatePrincipalStress2d,
  calculateConvectionHeat,
} from '@/lib/disciplineCalculations';

const QUALITY = {
  label: 'Automated reference cases',
  summary:
    'The deterministic formula path is covered by reproducible reference inputs and expected outputs in the project test suite.',
  lastReviewed: '12 September 2026',
};

const disciplineCalculatorConfigsBase: CalculatorConfig[] = [
  {
    meta: {
      slug: 'simply-supported-beam-calculator',
      title: 'Simply Supported Beam Calculator – Midspan Point Load, Moment and Deflection',
      shortTitle: 'Simply Supported Beam',
      description:
        'Calculate maximum moment, bending stress, and midspan deflection for a simply supported beam with a concentrated load at centre, using Euler–Bernoulli SI formulas.',
      category: 'mechanical',
      icon: 'δ',
      keywords: ['simply supported beam', 'midspan deflection', 'bending moment', 'PL/4', 'beam stress'],
      popular: true,
      new: true,
    },
    formula: 'Mmax = PL/4,  σmax = Mc/I,  δmax = PL³/(48EI)',
    formulaExplanation:
      'A concentrated load at midspan on simple supports produces a triangular moment diagram that peaks at PL/4. Elastic bending stress follows Mc/I, and the Euler–Bernoulli midspan deflection is PL³/(48EI). Enter E in GPa; the tool converts to pascals internally.',
    exampleUsage:
      'P = 10 kN on a 4 m span with E = 200 GPa, I = 8×10⁻⁶ m⁴, and c = 0.05 m gives Mmax = 10 000 N·m and δmax = 8.333 mm.',
    faqs: [
      { question: 'Does this include the beam’s self-weight?', answer: 'No. Superimpose a uniform-load case (wL²/8 moment, 5wL⁴/384EI deflection) if self-weight matters.' },
      { question: 'Why is E entered in GPa?', answer: 'Steel is typically 200 GPa and aluminium about 70 GPa. The calculator multiplies by 10⁹ before evaluating δ = PL³/(48EI) in SI units.' },
      { question: 'When is Euler–Bernoulli invalid?', answer: 'Deep beams, large deflections, or short spans need shear deformation (Timoshenko) or a geometric-nonlinear analysis.' },
    ],
    relatedSlugs: ['section-modulus-calculator', 'euler-buckling-calculator', 'stress-strain-calculator', 'shaft-torsion-calculator'],
  },
  {
    meta: {
      slug: 'gear-train-calculator',
      title: 'Gear Train Calculator – Ratio, Output Torque and Speed',
      shortTitle: 'Gear Train',
      description:
        'Find gear ratio, output torque, and output speed for a two-gear pair from tooth counts, input torque, input rpm, and mesh efficiency.',
      category: 'mechanical',
      icon: 'G',
      keywords: ['gear ratio', 'gear train', 'output torque', 'mesh efficiency', 'N2/N1'],
      new: true,
    },
    formula: 'i = N2/N1,  Tout = Tin·i·η,  ωout = ωin/i',
    formulaExplanation:
      'For an external pair the ratio of teeth is the magnitude of the speed reduction. Torque scales with that ratio and with mesh efficiency; angular velocity is reduced by the same ratio. A 2:1 pair doubles torque only when η = 100%.',
    exampleUsage:
      'N1 = 20, N2 = 40, Tin = 50 N·m, 1 000 rpm, and 100% efficiency give i = 2, Tout = 100 N·m, and 500 rpm out.',
    faqs: [
      { question: 'Is the output rotation reversed?', answer: 'An external pair reverses rotation; an internal pair does not. This tool reports magnitudes only.' },
      { question: 'How should I enter efficiency?', answer: 'Use a decimal percent for the complete mesh (often 95–99% per spur stage). Idlers add contact losses without changing the overall ratio of the terminal gears.' },
      { question: 'Can I model a compound train?', answer: 'Multiply stage ratios (and efficiencies) yourself, or chain this calculator once per pair.' },
    ],
    relatedSlugs: ['shaft-torsion-calculator', 'helical-spring-calculator', 'stress-strain-calculator', 'power-calculator'],
  },
  {
    meta: {
      slug: 'shaft-torsion-calculator',
      title: 'Shaft Torsion Calculator – Polar Moment, Shear Stress and Twist',
      shortTitle: 'Shaft Torsion',
      description:
        'Compute polar moment, elastic shear stress, and angle of twist for a solid circular shaft from torque, diameter, length, and shear modulus.',
      category: 'mechanical',
      icon: 'τ',
      keywords: ['shaft torsion', 'polar moment', 'shear stress', 'angle of twist', 'GJ'],
      new: true,
    },
    formula: 'J = πd⁴/32,  τ = T(d/2)/J,  θ = TL/(GJ)',
    formulaExplanation:
      'Saint-Venant torsion of a solid circular bar gives a polar moment πd⁴/32. Maximum shear is at the outer radius, and the elastic twist is TL/GJ. Diameter is entered in millimetres; G is in GPa.',
    exampleUsage:
      'A 30 mm steel shaft (G ≈ 80 GPa) 0.8 m long carrying 120 N·m has J = π(0.03)⁴/32, τ = T r / J, and θ = TL/(GJ).',
    faqs: [
      { question: 'Does this cover hollow shafts?', answer: 'No. For a tube use J = π(Do⁴ − Di⁴)/32 and the same τ and θ formulas with the outer radius.' },
      { question: 'What G should I use?', answer: 'Typical steels are about 80 GPa, aluminium 26 GPa. Always confirm the material datasheet.' },
    ],
    relatedSlugs: ['helical-spring-calculator', 'simply-supported-beam-calculator', 'stress-strain-calculator', 'gear-train-calculator'],
  },
  {
    meta: {
      slug: 'helical-spring-calculator',
      title: 'Helical Spring Calculator – Wahl Factor, Shear and Spring Rate',
      shortTitle: 'Helical Spring',
      description:
        'Evaluate spring index, Wahl factor, corrected shear stress, and axial rate for a circular-wire helical compression spring.',
      category: 'mechanical',
      icon: 'k',
      keywords: ['helical spring', 'Wahl factor', 'spring rate', 'coil stress', 'spring index'],
      new: true,
    },
    formula: 'C = D/d,  K = (4C−1)/(4C−4)+0.615/C,  τ = K·8PD/(πd³),  k = Gd⁴/(8D³N)',
    formulaExplanation:
      'The Wahl factor corrects direct shear and curvature for a round-wire coil. Stress uses mean diameter D and wire diameter d; the linear rate assumes a constant G and N active coils. Enter d and D in millimetres.',
    exampleUsage:
      'For d = 3 mm, D = 18 mm, N = 8, G = 80 GPa, and P = 100 N the tool reports C = 6, the Wahl K, τ, and k = Gd⁴/(8D³N).',
    faqs: [
      { question: 'What is a reasonable spring index?', answer: 'Designers often keep C between 4 and 12. Very small C inflates the Wahl factor; very large C is prone to buckling and tangling.' },
      { question: 'Are end coils included in N?', answer: 'Enter active coils only. Closed and ground ends typically remove about two coils from the total count.' },
    ],
    relatedSlugs: ['shaft-torsion-calculator', 'stress-strain-calculator', 'thermal-expansion-calculator', 'gear-train-calculator'],
  },
  {
    meta: {
      slug: 'manning-flow-calculator',
      title: 'Manning Flow Calculator – Rectangular Open Channel Discharge',
      shortTitle: 'Manning Flow',
      description:
        'Compute uniform-flow discharge, area, hydraulic radius, and mean velocity for a rectangular open channel using the SI Manning formula.',
      category: 'civil',
      icon: 'Q',
      keywords: ['Manning equation', 'open channel flow', 'rectangular channel', 'hydraulic radius', 'uniform flow'],
      popular: true,
      new: true,
    },
    formula: 'Q = (1/n) A R^{2/3} S^{1/2},  A = by,  P = b+2y,  R = A/P',
    formulaExplanation:
      'Manning’s equation in SI uses 1/n rather than 1.49/n. For a rectangle the area is width times depth and the wetted perimeter is b + 2y. Slope S is the friction slope (m/m) in uniform flow.',
    exampleUsage:
      'n = 0.013, b = 2 m, y = 1 m, and S = 0.001 yield A = 2 m², R = 0.5 m, and a finite positive Q ≈ 3.06 m³/s.',
    faqs: [
      { question: 'What n should I use?', answer: 'Finished concrete is often 0.012–0.015, earth channels 0.02–0.03, and vegetated channels higher. n is empirical and site-specific.' },
      { question: 'Is this valid for pipes?', answer: 'Only for free-surface flow. Pressurized pipes should use Darcy–Weisbach or Hazen–Williams, not Manning’s open-channel form.' },
      { question: 'Does S include kinetic head?', answer: 'In uniform flow the friction slope equals the bed slope. Gradually varied flow needs a GVF solver.' },
    ],
    relatedSlugs: ['rational-runoff-calculator', 'darcy-weisbach-calculator', 'bernoulli-calculator', 'reynolds-number-calculator'],
  },
  {
    meta: {
      slug: 'euler-buckling-calculator',
      title: 'Euler Buckling Calculator – Critical Load and Stress',
      shortTitle: 'Euler Buckling',
      description:
        'Calculate the ideal Euler critical load and stress for a prismatic column with pinned, fixed, or free end conditions.',
      category: 'civil',
      icon: 'Pcr',
      keywords: ['Euler buckling', 'critical load', 'column buckling', 'effective length factor', 'KL/r'],
      new: true,
    },
    formula: 'Pcr = π²EI/(KL)²,  σcr = Pcr/A',
    formulaExplanation:
      'Euler’s formula is the elastic bifurcation load of a perfectly straight column. Effective length KL uses K = 0.5 (fixed–fixed), 0.7 (fixed–pinned), 1 (pinned–pinned), or 2 (fixed–free). E is entered in GPa.',
    exampleUsage:
      'E = 200 GPa, I = 8×10⁻⁶ m⁴, L = 2 m, and K = 1 give Pcr ≈ 3.9478×10⁶ N.',
    faqs: [
      { question: 'Which K should I pick?', answer: 'Use recommended design K values, not only theoretical ones. Real “fixed” ends are rarely fully rigid, so K is often increased for conservatism.' },
      { question: 'When is Euler unsafe?', answer: 'If σcr exceeds the proportional limit, the column is intermediate or stocky and needs a tangent-modulus or empirical (AISC/Eurocode) curve.' },
    ],
    relatedSlugs: ['simply-supported-beam-calculator', 'section-modulus-calculator', 'stress-strain-calculator', 'shaft-torsion-calculator'],
  },
  {
    meta: {
      slug: 'rational-runoff-calculator',
      title: 'Rational Runoff Calculator – Peak Discharge Q = CiA/360',
      shortTitle: 'Rational Runoff',
      description:
        'Estimate peak storm runoff for a small catchment using the SI rational method with C, rainfall intensity in mm/h, and area in hectares.',
      category: 'civil',
      icon: 'i',
      keywords: ['rational method', 'peak runoff', 'stormwater', 'CiA', 'catchment discharge'],
      new: true,
    },
    formula: 'Q = C i A / 360',
    formulaExplanation:
      'With intensity i in millimetres per hour and area A in hectares, dividing CiA by 360 yields peak discharge in cubic metres per second. C is a dimensionless runoff coefficient between 0 and 1.',
    exampleUsage:
      'C = 0.6, i = 50 mm/h, and A = 2.4 ha give Q = 0.6 × 50 × 2.4 / 360 = 0.2 m³/s.',
    faqs: [
      { question: 'How large a basin is this for?', answer: 'Typically a few hectares to perhaps 50 ha, when rainfall duration can equal the time of concentration. Larger basins need unit hydrographs or hydrologic models.' },
      { question: 'Where does the 360 come from?', answer: 'It converts mm/h × hectares into m³/s: 1 mm/h over 1 ha is 0.002778 m³/s, and 1/0.002778 ≈ 360.' },
    ],
    relatedSlugs: ['manning-flow-calculator', 'bernoulli-calculator', 'darcy-weisbach-calculator', 'reynolds-number-calculator'],
  },
  {
    meta: {
      slug: 'section-modulus-calculator',
      title: 'Section Modulus Calculator – Rectangle I, S and Bending Stress',
      shortTitle: 'Section Modulus',
      description:
        'Compute second moment, elastic section modulus, and bending stress for a solid rectangular cross-section.',
      category: 'civil',
      icon: 'S',
      keywords: ['section modulus', 'second moment of area', 'rectangular beam', 'bending stress', 'bh³/12'],
      new: true,
    },
    formula: 'I = bh³/12,  S = I/(h/2),  σ = M/S',
    formulaExplanation:
      'For a rectangle bent about its strong centroidal axis, I = bh³/12 and the extreme-fibre distance is h/2, so S = bh²/6. Elastic bending stress is M/S.',
    exampleUsage:
      'A 0.1 m × 0.2 m rectangle with M = 8 kN·m has I = 6.667×10⁻⁵ m⁴, S = 6.667×10⁻⁴ m³, and σ = 12 MPa.',
    faqs: [
      { question: 'Is this the plastic modulus?', answer: 'No. The plastic modulus of a rectangle is bh²/4, 1.5 times the elastic S. This tool reports the elastic value only.' },
      { question: 'Which way is h measured?', answer: 'h is the dimension parallel to the load (the depth). b is the width about which the section is bent.' },
    ],
    relatedSlugs: ['simply-supported-beam-calculator', 'euler-buckling-calculator', 'stress-strain-calculator', 'thermal-expansion-calculator'],
  },
  {
    meta: {
      slug: 'ideal-gas-calculator',
      title: 'Ideal Gas Calculator – Solve PV = nRT for P, V, n or T',
      shortTitle: 'Ideal Gas',
      description:
        'Solve the ideal-gas law for pressure, volume, amount, or temperature using R = 8.314462618 J/mol·K.',
      category: 'thermofluids',
      icon: 'PV',
      keywords: ['ideal gas law', 'PV=nRT', 'gas constant', 'molar volume', 'absolute temperature'],
      new: true,
    },
    formula: 'PV = nRT,  R = 8.314462618 J/mol·K',
    formulaExplanation:
      'The ideal-gas equation of state relates absolute pressure, volume, molar amount, and absolute temperature. Choose the unknown; the other three must be positive SI values. Temperature is in kelvin.',
    exampleUsage:
      'n = 1 mol, T = 298.15 K, and V = 0.02479 m³ give P ≈ 100 kPa. Leave the unknown field unused — the solve selector chooses which variable is computed.',
    faqs: [
      { question: 'Why kelvin, not Celsius?', answer: 'The equation of state is linear in absolute temperature. 0 °C is 273.15 K; a Celsius zero would make P or V collapse incorrectly.' },
      { question: 'When does the ideal-gas law fail?', answer: 'Near saturation, at high reduced pressure, or for strong intermolecular forces. Use a compressibility factor or a real-gas EOS there.' },
      { question: 'Can I use bar or litres?', answer: 'Convert to Pa and m³ first (1 bar = 10⁵ Pa, 1 L = 0.001 m³), or scale n and T consistently after conversion.' },
    ],
    relatedSlugs: ['carnot-efficiency-calculator', 'bernoulli-calculator', 'thermal-expansion-calculator', 'lmtd-heat-exchanger-calculator'],
  },
  {
    meta: {
      slug: 'bernoulli-calculator',
      title: 'Bernoulli Calculator – Downstream Velocity from Energy Balance',
      shortTitle: 'Bernoulli',
      description:
        'Solve the incompressible, frictionless Bernoulli equation for velocity at station 2 from pressures, elevations, upstream speed, and density.',
      category: 'thermofluids',
      icon: 'v',
      keywords: ['Bernoulli equation', 'incompressible flow', 'head balance', 'velocity from pressure', 'streamline energy'],
      new: true,
    },
    formula: 'P/ρ + v²/2 + gz = constant,  g = 9.80665 m/s²',
    formulaExplanation:
      'Along a streamline with no losses and no shaft work, mechanical energy per unit mass is conserved. The tool rearranges for v2 and rejects cases where the remaining specific energy is negative.',
    exampleUsage:
      'Water (ρ = 1000 kg/m³) from P1 = 200 kPa, z1 = 2 m, v1 = 1 m/s to P2 = 100 kPa at z2 = 0 m gives v2 ≈ 15.5 m/s.',
    faqs: [
      { question: 'Where are friction losses?', answer: 'This form is inviscid. Add Darcy–Weisbach hf (and minor losses) on the downstream side for real pipes.' },
      { question: 'Is g exactly 9.81?', answer: 'The calculator uses the standard gravity 9.80665 m/s². Local g varies slightly with latitude and altitude.' },
    ],
    relatedSlugs: ['darcy-weisbach-calculator', 'reynolds-number-calculator', 'manning-flow-calculator', 'ideal-gas-calculator'],
  },
  {
    meta: {
      slug: 'darcy-weisbach-calculator',
      title: 'Darcy–Weisbach Calculator – Friction Head Loss and Pressure Drop',
      shortTitle: 'Darcy–Weisbach',
      description:
        'Calculate pipe friction head loss and equivalent pressure drop from friction factor, length, diameter, velocity, and density.',
      category: 'thermofluids',
      icon: 'hf',
      keywords: ['Darcy Weisbach', 'head loss', 'friction factor', 'pipe pressure drop', 'major loss'],
      new: true,
    },
    formula: 'hf = f (L/D) v²/(2g),  ΔP = ρ g hf',
    formulaExplanation:
      'Darcy–Weisbach relates frictional head loss to a dimensionless friction factor, the geometric ratio L/D, and velocity head. Multiplying by ρg converts head into a pressure drop. g is 9.80665 m/s².',
    exampleUsage:
      'f = 0.02, L = 50 m, D = 0.05 m, v = 2 m/s, and ρ = 1000 kg/m³ give hf = f(L/D)v²/(2g) and ΔP = ρghf.',
    faqs: [
      { question: 'How do I get f?', answer: 'Laminar flow has f = 64/Re. Turbulent flow needs a Moody/Colebrook estimate from Re and ε/D. This tool treats f as a known input.' },
      { question: 'Are fittings included?', answer: 'No. Add ΣK v²/(2g) for bends, valves, and inlets as a separate minor-loss term.' },
    ],
    relatedSlugs: ['bernoulli-calculator', 'reynolds-number-calculator', 'manning-flow-calculator', 'rational-runoff-calculator'],
  },
  {
    meta: {
      slug: 'carnot-efficiency-calculator',
      title: 'Carnot Efficiency Calculator – Heat-Engine Limit from Two Temperatures',
      shortTitle: 'Carnot Efficiency',
      description:
        'Compute the Carnot heat-engine efficiency η = 1 − Tc/Th from hot and cold reservoir temperatures entered in Celsius.',
      category: 'thermofluids',
      icon: 'η',
      keywords: ['Carnot efficiency', 'heat engine', 'thermal efficiency limit', 'Kelvin temperatures', 'reversible cycle'],
      popular: true,
      new: true,
    },
    formula: 'η = 1 − Tc/Th  (Th, Tc in kelvin)',
    formulaExplanation:
      'A reversible engine between two thermal reservoirs cannot exceed 1 − Tc/Th. Inputs are converted with T(K) = t(°C) + 273.15. The tool rejects non-positive kelvin values and any case with Tc ≥ Th.',
    exampleUsage:
      'A hot reservoir at 100 °C and a cold reservoir at 0 °C give η = 1 − 273.15/373.15 ≈ 26.81% (reported to working precision as 26.80%).',
    faqs: [
      { question: 'Why not enter kelvin directly?', answer: 'Most plant data are in Celsius. The conversion is shown in the calculation trail so you can audit the kelvin values.' },
      { question: 'Is this the Rankine efficiency?', answer: 'No. Rankine, Otto, and Brayton efficiencies are lower. Carnot is only the reversible ceiling between the two temperatures you enter.' },
      { question: 'What if Tc equals Th?', answer: 'Then no work can be produced and the calculator rejects the inputs rather than reporting 0% from a degenerate ratio.' },
    ],
    relatedSlugs: ['lmtd-heat-exchanger-calculator', 'ideal-gas-calculator', 'thermal-expansion-calculator', 'energy-calculator'],
  },
  {
    meta: {
      slug: 'lmtd-heat-exchanger-calculator',
      title: 'LMTD Heat Exchanger Calculator – Counterflow Mean Temperature Difference',
      shortTitle: 'LMTD Heat Exchanger',
      description:
        'Calculate counterflow LMTD from the two end temperature differences, then the heat-transfer rate Q = U A LMTD.',
      category: 'thermofluids',
      icon: 'ΔT',
      keywords: ['LMTD', 'heat exchanger', 'counterflow', 'overall heat transfer', 'log mean temperature'],
      new: true,
    },
    formula: 'LMTD = (ΔT1 − ΔT2)/ln(ΔT1/ΔT2),  Q = U A LMTD',
    formulaExplanation:
      'For counterflow, ΔT1 and ΔT2 are the temperature differences at each end of the exchanger. When they are equal, LMTD reduces to that common ΔT. Heat duty follows Q = UA·LMTD with U in W/m²·K.',
    exampleUsage:
      'ΔT1 = 40 K, ΔT2 = 10 K, U = 500 W/m²·K, and A = 2 m² give LMTD = 30/ln(4) ≈ 21.64 K and Q ≈ 21.6 kW.',
    faqs: [
      { question: 'How do I form ΔT1 and ΔT2?', answer: 'Counterflow: ΔT1 = Th,in − Tc,out and ΔT2 = Th,out − Tc,in. Both must be positive for a physically valid LMTD.' },
      { question: 'What about shell-and-tube or cross-flow?', answer: 'Multiply LMTD by an F correction from the configuration charts. F < 1 and drops quickly near a temperature cross.' },
    ],
    relatedSlugs: ['carnot-efficiency-calculator', 'thermal-expansion-calculator', 'ideal-gas-calculator', 'energy-calculator'],
  },
  {
    meta: {
      slug: 'reynolds-number-calculator',
      title: 'Reynolds Number Calculator – Laminar, Transitional or Turbulent Regime',
      shortTitle: 'Reynolds Number',
      description:
        'Compute Re = ρvD/μ for internal flow and classify the regime using conventional 2300 / 4000 pipe-flow thresholds.',
      category: 'materials',
      icon: 'Re',
      keywords: ['Reynolds number', 'laminar turbulent', 'dynamic viscosity', 'pipe flow regime', 'ρvD/μ'],
      popular: true,
      new: true,
    },
    formula: 'Re = ρ v D / μ',
    formulaExplanation:
      'Reynolds number compares inertial to viscous forces. For circular pipes this tool flags laminar below 2300, transitional between 2300 and 4000, and turbulent above 4000. μ is dynamic viscosity in Pa·s.',
    exampleUsage:
      'Water at ρ = 1000 kg/m³, v = 2 m/s, D = 0.05 m, and μ = 0.001 Pa·s gives Re = 1×10⁵ (turbulent).',
    faqs: [
      { question: 'Is 2300 a law of nature?', answer: 'No. It is a conventional pipe-flow threshold. Smooth pipes can remain laminar somewhat higher; disturbances can trip earlier.' },
      { question: 'What viscosity should I use?', answer: 'Dynamic viscosity μ, not kinematic ν. For water near 20 °C, μ ≈ 0.001 Pa·s. Air at 15 °C is about 1.8×10⁻⁵ Pa·s.' },
      { question: 'Does D have to be a diameter?', answer: 'For non-circular ducts use the hydraulic diameter 4A/P in place of D.' },
    ],
    relatedSlugs: ['darcy-weisbach-calculator', 'bernoulli-calculator', 'manning-flow-calculator', 'solution-dilution-calculator'],
  },
  {
    meta: {
      slug: 'solution-dilution-calculator',
      title: 'Solution Dilution Calculator – Solve C1V1 = C2V2',
      shortTitle: 'Solution Dilution',
      description:
        'Solve the dilution identity C1V1 = C2V2 for any one of the four variables using consistent concentration and volume units.',
      category: 'materials',
      icon: 'C',
      keywords: ['dilution calculator', 'C1V1=C2V2', 'solution concentration', 'aliquot', 'stock dilution'],
      new: true,
    },
    formula: 'C1 V1 = C2 V2',
    formulaExplanation:
      'If solute is conserved, the product of concentration and volume is invariant. Choose which variable is unknown; the other three must be positive. Units cancel as long as C and V are internally consistent.',
    exampleUsage:
      'A 2 mol/L stock with V1 = 0.25 L diluted to 0.5 mol/L requires V2 = 1 L. Solving for V1 instead would return the aliquot volume.',
    faqs: [
      { question: 'Do I have to use litres and mol/L?', answer: 'Any consistent pair works: mL with mmol/L, or mass percent with the same volume unit on both sides.' },
      { question: 'What about mixing volumes that do not add?', answer: 'C1V1 = C2V2 ignores excess volumes of mixing. For concentrated acids or alcohols, measure the final volume rather than assuming additivity.' },
    ],
    relatedSlugs: ['ideal-gas-calculator', 'reynolds-number-calculator', 'thermal-expansion-calculator', 'stress-strain-calculator'],
  },
  {
    meta: {
      slug: 'thermal-expansion-calculator',
      title: 'Thermal Expansion Calculator – Linear ΔL = α L ΔT',
      shortTitle: 'Thermal Expansion',
      description:
        'Calculate unconstrained linear expansion, final length, and thermal strain from the coefficient α, original length, and temperature change.',
      category: 'materials',
      icon: 'α',
      keywords: ['thermal expansion', 'linear expansion', 'alpha L delta T', 'thermal strain', 'coefficient of expansion'],
      new: true,
    },
    formula: 'ΔL = α L ΔT',
    formulaExplanation:
      'For a prismatic bar free to expand, length change is proportional to original length and temperature change. α is in 1/K (identical to 1/°C for a temperature interval). ΔT may be negative for cooling.',
    exampleUsage:
      'Steel with α = 12×10⁻⁶ /K, L = 10 m, and ΔT = 50 K expands by 6 mm.',
    faqs: [
      { question: 'What if the bar is constrained?', answer: 'A fully constrained bar develops thermal stress E α ΔT instead of free expansion. Combine this tool with the stress–strain calculator.' },
      { question: 'Is α constant?', answer: 'Only over a limited range. Over hundreds of degrees, use an integrated mean α from material data.' },
    ],
    relatedSlugs: ['stress-strain-calculator', 'lmtd-heat-exchanger-calculator', 'carnot-efficiency-calculator', 'simply-supported-beam-calculator'],
  },
  {
    meta: {
      slug: 'stress-strain-calculator',
      title: 'Stress–Strain Calculator – σ, ε, Elastic Modulus and Safety Factor',
      shortTitle: 'Stress and Strain',
      description:
        'Compute axial engineering stress and strain, implied elastic modulus, and yield-based safety factor from force, area, elongation, length, and yield stress.',
      category: 'materials',
      icon: 'σ',
      keywords: ['stress strain', 'Young modulus', 'safety factor', 'axial stress', 'engineering strain'],
      new: true,
    },
    formula: 'σ = F/A,  ε = δ/L,  E = σ/ε,  SF = σy/σ',
    formulaExplanation:
      'Engineering stress is load over original area; engineering strain is elongation over original length. Their ratio is Young’s modulus only while the material remains linear-elastic. Safety factor compares yield stress to the computed axial stress.',
    exampleUsage:
      'F = 10 kN on A = 0.001 m² with δ = 0.5 mm over L = 1 m and σy = 250 MPa gives σ = 10 MPa, ε = 5×10⁻⁴, E = 20 GPa, and SF = 25.',
    faqs: [
      { question: 'Is this true stress?', answer: 'No. True stress uses instantaneous area. Engineering values are appropriate for small-strain elastic checks.' },
      { question: 'Why might E look wrong?', answer: 'If the specimen has yielded, E = σ/ε is no longer the elastic modulus. Use a coupon test in the linear range.' },
      { question: 'Which safety factor definition is this?', answer: 'SF = σy/σ against the entered yield stress for uniaxial tension/compression only — not buckling, fatigue, or von Mises yield.' },
    ],
    relatedSlugs: ['simply-supported-beam-calculator', 'section-modulus-calculator', 'shaft-torsion-calculator', 'thermal-expansion-calculator'],
  },
  {
    meta: {
      slug: 'pump-power-calculator',
      title: 'Pump Power Calculator – Hydraulic and Shaft Power from Flow and Head',
      shortTitle: 'Pump Power',
      description:
        'Calculate incompressible pump hydraulic power P = ρgQH and shaft power from density, volumetric flow, head, and overall efficiency.',
      category: 'mechanical',
      icon: 'P',
      keywords: ['pump power', 'hydraulic power', 'shaft power', 'rho g Q H', 'pump efficiency'],
      popular: true,
      new: true,
    },
    formula: 'P = ρ g Q H,  Pshaft = P / η',
    formulaExplanation:
      'For an incompressible fluid the useful hydraulic power is density × gravity × volumetric flow × head. Dividing by a single overall efficiency estimates the shaft power the driver must supply.',
    exampleUsage:
      'Water (ρ = 1000 kg/m³) at Q = 0.05 m³/s and H = 20 m has P = 9.807 kW. At 80% efficiency the shaft power is 12.258 kW.',
    faqs: [
      { question: 'Is this brake horsepower?', answer: 'Shaft power is the mechanical input at the pump shaft. Motor input is larger once motor efficiency is included.' },
      { question: 'What head should I enter?', answer: 'Use total dynamic head (static lift plus friction and velocity heads), not only geometric elevation.' },
    ],
    relatedSlugs: ['bernoulli-calculator', 'darcy-weisbach-calculator', 'reynolds-number-calculator', 'manning-flow-calculator'],
  },
  {
    meta: {
      slug: 'principal-stress-calculator',
      title: 'Principal Stress Calculator – 2D Mohr’s Circle, σ1 σ2 and θp',
      shortTitle: 'Principal Stress',
      description:
        'Find in-plane principal stresses, maximum shear, and the principal angle from σx, σy, and τxy using Mohr’s circle.',
      category: 'mechanical',
      icon: 'σ',
      keywords: ['principal stress', 'Mohrs circle', 'maximum shear', 'plane stress', 'sigma 1 sigma 2'],
      popular: true,
      new: true,
    },
    formula: 'σ1,2 = (σx+σy)/2 ± √(((σx−σy)/2)² + τxy²)',
    formulaExplanation:
      'The centre of Mohr’s circle is the average normal stress. The radius is the hypotenuse of half the normal-stress difference and the shear. Principal stresses sit at centre ± radius; θp is half of atan2(2τxy, σx−σy).',
    exampleUsage:
      'σx = 80 MPa, σy = 20 MPa, τxy = 30 MPa gives σ1 = 92.426 MPa, σ2 = 7.574 MPa, and θp = 22.5°.',
    faqs: [
      { question: 'Is this 3D?', answer: 'No. It is the in-plane pair. For plane stress the third principal is 0 and may be algebraically between σ1 and σ2.' },
      { question: 'What is the sign of τxy?', answer: 'Use the mechanics convention of the face you drew. Reversing τxy flips the principal angle by 90° in Mohr space (45° in the body).' },
    ],
    relatedSlugs: ['stress-strain-calculator', 'simply-supported-beam-calculator', 'shaft-torsion-calculator', 'section-modulus-calculator'],
  },
  {
    meta: {
      slug: 'convection-heat-transfer-calculator',
      title: 'Convection Heat Transfer Calculator – Newton’s Law Q = hAΔT',
      shortTitle: 'Convection Heat Transfer',
      description:
        'Estimate convective heat transfer rate and heat flux from a film coefficient, surface area, and temperature difference.',
      category: 'thermofluids',
      icon: 'h',
      keywords: ['convection', 'Newtons law of cooling', 'film coefficient', 'heat flux', 'h A delta T'],
      new: true,
    },
    formula: 'Q = h A ΔT',
    formulaExplanation:
      'Newton’s law of cooling treats convection as proportional to area and the temperature difference between the surface and the free stream, with h carrying fluid motion, geometry, and properties.',
    exampleUsage:
      'h = 25 W/m²·K over 2 m² with ΔT = 40 K gives Q = 2000 W and a heat flux of 1000 W/m².',
    faqs: [
      { question: 'Natural or forced?', answer: 'Enter an h from a correlation or measurement for the regime you have. This tool does not pick Nu, Re, or Gr itself.' },
      { question: 'Does this include radiation?', answer: 'No. Add εσA(Ts⁴ − Tsur⁴) separately if the surface sees a different radiant temperature.' },
    ],
    relatedSlugs: ['lmtd-heat-exchanger-calculator', 'carnot-efficiency-calculator', 'thermal-expansion-calculator', 'ideal-gas-calculator'],
  },
];

export const disciplineCalculatorConfigs: CalculatorConfig[] = disciplineCalculatorConfigsBase.map((config) => ({
  ...config,
  quality: QUALITY,
}));

export const disciplineEngineeringTools: EngineeringToolDefinition[] = [
  {
    slug: 'simply-supported-beam-calculator',
    fields: [
      { id: 'loadN', label: 'Midspan point load P', unit: 'N', defaultValue: 10_000, min: 0.0001, step: 10 },
      { id: 'lengthM', label: 'Span L', unit: 'm', defaultValue: 4, min: 0.0001, step: 0.1 },
      { id: 'youngsModulusGpa', label: 'Young’s modulus E', unit: 'GPa', defaultValue: 200, min: 0.0001, step: 1, help: 'Structural steel is typically 200 GPa.' },
      { id: 'secondMomentM4', label: 'Second moment I', unit: 'm⁴', defaultValue: 8e-6, min: 1e-18, step: 1e-6 },
      { id: 'centroidDistanceM', label: 'Extreme fibre distance c', unit: 'm', defaultValue: 0.05, min: 0.0001, step: 0.001 },
    ],
    calculate: (values) => calculateSimplySupportedBeam({
      loadN: values.loadN,
      lengthM: values.lengthM,
      youngsModulusGpa: values.youngsModulusGpa,
      secondMomentM4: values.secondMomentM4,
      centroidDistanceM: values.centroidDistanceM,
    }),
  },
  {
    slug: 'gear-train-calculator',
    fields: [
      { id: 'teeth1', label: 'Pinion teeth N1', defaultValue: 20, min: 1, step: 1 },
      { id: 'teeth2', label: 'Gear teeth N2', defaultValue: 40, min: 1, step: 1 },
      { id: 'torqueInNm', label: 'Input torque Tin', unit: 'N·m', defaultValue: 50, min: 0.0001, step: 1 },
      { id: 'rpmIn', label: 'Input speed', unit: 'rpm', defaultValue: 1_000, min: 0, step: 10 },
      { id: 'efficiencyPercent', label: 'Mesh efficiency η', unit: '%', defaultValue: 100, min: 0, max: 100, step: 0.1 },
    ],
    calculate: (values) => calculateGearTrain({
      teeth1: values.teeth1,
      teeth2: values.teeth2,
      torqueInNm: values.torqueInNm,
      rpmIn: values.rpmIn,
      efficiencyPercent: values.efficiencyPercent,
    }),
  },
  {
    slug: 'shaft-torsion-calculator',
    fields: [
      { id: 'torqueNm', label: 'Torque T', unit: 'N·m', defaultValue: 120, min: 0.0001, step: 1 },
      { id: 'diameterMm', label: 'Diameter d', unit: 'mm', defaultValue: 30, min: 0.001, step: 0.1 },
      { id: 'lengthM', label: 'Length L', unit: 'm', defaultValue: 0.8, min: 0.0001, step: 0.01 },
      { id: 'shearModulusGpa', label: 'Shear modulus G', unit: 'GPa', defaultValue: 80, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateShaftTorsion({
      torqueNm: values.torqueNm,
      diameterMm: values.diameterMm,
      lengthM: values.lengthM,
      shearModulusGpa: values.shearModulusGpa,
    }),
  },
  {
    slug: 'helical-spring-calculator',
    fields: [
      { id: 'loadN', label: 'Axial load P', unit: 'N', defaultValue: 100, min: 0.0001, step: 1 },
      { id: 'wireDiameterMm', label: 'Wire diameter d', unit: 'mm', defaultValue: 3, min: 0.001, step: 0.1 },
      { id: 'meanDiameterMm', label: 'Mean coil diameter D', unit: 'mm', defaultValue: 18, min: 0.001, step: 0.1 },
      { id: 'activeCoils', label: 'Active coils N', defaultValue: 8, min: 0.25, step: 0.5 },
      { id: 'shearModulusGpa', label: 'Shear modulus G', unit: 'GPa', defaultValue: 80, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateHelicalSpring({
      loadN: values.loadN,
      wireDiameterMm: values.wireDiameterMm,
      meanDiameterMm: values.meanDiameterMm,
      activeCoils: values.activeCoils,
      shearModulusGpa: values.shearModulusGpa,
    }),
  },
  {
    slug: 'manning-flow-calculator',
    fields: [
      { id: 'roughnessN', label: 'Manning n', defaultValue: 0.013, min: 0.0001, step: 0.001, help: 'Finished concrete is often 0.012–0.015.' },
      { id: 'widthM', label: 'Channel width b', unit: 'm', defaultValue: 2, min: 0.0001, step: 0.1 },
      { id: 'depthM', label: 'Flow depth y', unit: 'm', defaultValue: 1, min: 0.0001, step: 0.05 },
      { id: 'slope', label: 'Friction slope S', defaultValue: 0.001, min: 1e-10, step: 0.0001, help: 'Uniform-flow bed slope, m/m.' },
    ],
    calculate: (values) => calculateManningFlow({
      roughnessN: values.roughnessN,
      widthM: values.widthM,
      depthM: values.depthM,
      slope: values.slope,
    }),
  },
  {
    slug: 'euler-buckling-calculator',
    fields: [
      { id: 'youngsModulusGpa', label: 'Young’s modulus E', unit: 'GPa', defaultValue: 200, min: 0.0001, step: 1 },
      { id: 'secondMomentM4', label: 'Second moment I', unit: 'm⁴', defaultValue: 8e-6, min: 1e-18, step: 1e-6 },
      { id: 'lengthM', label: 'Unsupported length L', unit: 'm', defaultValue: 2, min: 0.0001, step: 0.1 },
      {
        id: 'kFactor',
        label: 'End condition K',
        defaultValue: 1,
        options: [
          { value: 0.5, label: 'Fixed–fixed (K = 0.5)' },
          { value: 0.7, label: 'Fixed–pinned (K = 0.7)' },
          { value: 1, label: 'Pinned–pinned (K = 1)' },
          { value: 2, label: 'Fixed–free (K = 2)' },
        ],
      },
      { id: 'areaM2', label: 'Cross-section area A', unit: 'm²', defaultValue: 0.002, min: 1e-12, step: 0.0001 },
    ],
    calculate: (values) => calculateEulerBuckling({
      youngsModulusGpa: values.youngsModulusGpa,
      secondMomentM4: values.secondMomentM4,
      lengthM: values.lengthM,
      kFactor: values.kFactor,
      areaM2: values.areaM2,
    }),
  },
  {
    slug: 'rational-runoff-calculator',
    fields: [
      { id: 'runoffCoefficient', label: 'Runoff coefficient C', defaultValue: 0.6, min: 0.0001, max: 1, step: 0.05 },
      { id: 'intensityMmPerHour', label: 'Rainfall intensity i', unit: 'mm/h', defaultValue: 50, min: 0.0001, step: 1 },
      { id: 'areaHectares', label: 'Catchment area A', unit: 'ha', defaultValue: 2.4, min: 0.0001, step: 0.1 },
    ],
    calculate: (values) => calculateRationalRunoff({
      runoffCoefficient: values.runoffCoefficient,
      intensityMmPerHour: values.intensityMmPerHour,
      areaHectares: values.areaHectares,
    }),
  },
  {
    slug: 'section-modulus-calculator',
    fields: [
      { id: 'widthM', label: 'Width b', unit: 'm', defaultValue: 0.1, min: 0.0001, step: 0.01 },
      { id: 'heightM', label: 'Depth h', unit: 'm', defaultValue: 0.2, min: 0.0001, step: 0.01 },
      { id: 'momentNm', label: 'Bending moment M', unit: 'N·m', defaultValue: 8_000, min: 0.0001, step: 10 },
    ],
    calculate: (values) => calculateSectionModulus({
      widthM: values.widthM,
      heightM: values.heightM,
      momentNm: values.momentNm,
    }),
  },
  {
    slug: 'ideal-gas-calculator',
    fields: [
      {
        id: 'solveCode',
        label: 'Solve for',
        defaultValue: 0,
        options: [
          { value: 0, label: 'Pressure P' },
          { value: 1, label: 'Volume V' },
          { value: 2, label: 'Amount n' },
          { value: 3, label: 'Temperature T' },
        ],
      },
      { id: 'pressurePa', label: 'Pressure P', unit: 'Pa', defaultValue: 101_325, min: 0, step: 100, help: 'Ignored when solving for P.' },
      { id: 'volumeM3', label: 'Volume V', unit: 'm³', defaultValue: 0.02479, min: 0, step: 0.0001, help: 'Ignored when solving for V.' },
      { id: 'amountMol', label: 'Amount n', unit: 'mol', defaultValue: 1, min: 0, step: 0.01, help: 'Ignored when solving for n.' },
      { id: 'temperatureK', label: 'Temperature T', unit: 'K', defaultValue: 298.15, min: 0, step: 0.1, help: 'Ignored when solving for T. Use kelvin.' },
    ],
    calculate: (values) => calculateIdealGas({
      solveCode: values.solveCode,
      pressurePa: values.pressurePa,
      volumeM3: values.volumeM3,
      amountMol: values.amountMol,
      temperatureK: values.temperatureK,
    }),
  },
  {
    slug: 'bernoulli-calculator',
    fields: [
      { id: 'pressure1Pa', label: 'Pressure P1', unit: 'Pa', defaultValue: 200_000, min: 0, step: 100 },
      { id: 'pressure2Pa', label: 'Pressure P2', unit: 'Pa', defaultValue: 100_000, min: 0, step: 100 },
      { id: 'elevation1M', label: 'Elevation z1', unit: 'm', defaultValue: 2, step: 0.1 },
      { id: 'elevation2M', label: 'Elevation z2', unit: 'm', defaultValue: 0, step: 0.1 },
      { id: 'velocity1Ms', label: 'Velocity v1', unit: 'm/s', defaultValue: 1, min: 0, step: 0.1 },
      { id: 'densityKgM3', label: 'Density ρ', unit: 'kg/m³', defaultValue: 1_000, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateBernoulli({
      pressure1Pa: values.pressure1Pa,
      pressure2Pa: values.pressure2Pa,
      elevation1M: values.elevation1M,
      elevation2M: values.elevation2M,
      velocity1Ms: values.velocity1Ms,
      densityKgM3: values.densityKgM3,
    }),
  },
  {
    slug: 'darcy-weisbach-calculator',
    fields: [
      { id: 'frictionFactor', label: 'Friction factor f', defaultValue: 0.02, min: 0.0001, step: 0.001 },
      { id: 'lengthM', label: 'Pipe length L', unit: 'm', defaultValue: 50, min: 0.0001, step: 0.1 },
      { id: 'diameterM', label: 'Diameter D', unit: 'm', defaultValue: 0.05, min: 0.0001, step: 0.001 },
      { id: 'velocityMs', label: 'Mean velocity v', unit: 'm/s', defaultValue: 2, min: 0.0001, step: 0.1 },
      { id: 'densityKgM3', label: 'Density ρ', unit: 'kg/m³', defaultValue: 1_000, min: 0.0001, step: 1 },
    ],
    calculate: (values) => calculateDarcyWeisbach({
      frictionFactor: values.frictionFactor,
      lengthM: values.lengthM,
      diameterM: values.diameterM,
      velocityMs: values.velocityMs,
      densityKgM3: values.densityKgM3,
    }),
  },
  {
    slug: 'carnot-efficiency-calculator',
    fields: [
      { id: 'hotTemperatureC', label: 'Hot reservoir Th', unit: '°C', defaultValue: 100, step: 1 },
      { id: 'coldTemperatureC', label: 'Cold reservoir Tc', unit: '°C', defaultValue: 0, step: 1 },
    ],
    calculate: (values) => calculateCarnotEfficiency({
      hotTemperatureC: values.hotTemperatureC,
      coldTemperatureC: values.coldTemperatureC,
    }),
  },
  {
    slug: 'lmtd-heat-exchanger-calculator',
    fields: [
      { id: 'deltaT1K', label: 'End difference ΔT1', unit: 'K', defaultValue: 40, min: 0.0001, step: 0.1, help: 'Counterflow: Th,in − Tc,out.' },
      { id: 'deltaT2K', label: 'End difference ΔT2', unit: 'K', defaultValue: 10, min: 0.0001, step: 0.1, help: 'Counterflow: Th,out − Tc,in.' },
      { id: 'overallU', label: 'Overall coefficient U', unit: 'W/m²·K', defaultValue: 500, min: 0.0001, step: 1 },
      { id: 'areaM2', label: 'Transfer area A', unit: 'm²', defaultValue: 2, min: 0.0001, step: 0.1 },
    ],
    calculate: (values) => calculateLmtdHeatExchanger({
      deltaT1K: values.deltaT1K,
      deltaT2K: values.deltaT2K,
      overallU: values.overallU,
      areaM2: values.areaM2,
    }),
  },
  {
    slug: 'reynolds-number-calculator',
    fields: [
      { id: 'densityKgM3', label: 'Density ρ', unit: 'kg/m³', defaultValue: 1_000, min: 0.0001, step: 1 },
      { id: 'velocityMs', label: 'Velocity v', unit: 'm/s', defaultValue: 2, min: 0.0001, step: 0.1 },
      { id: 'diameterM', label: 'Characteristic length D', unit: 'm', defaultValue: 0.05, min: 0.0001, step: 0.001 },
      { id: 'dynamicViscosityPaS', label: 'Dynamic viscosity μ', unit: 'Pa·s', defaultValue: 0.001, min: 1e-12, step: 0.0001 },
    ],
    calculate: (values) => calculateReynoldsNumber({
      densityKgM3: values.densityKgM3,
      velocityMs: values.velocityMs,
      diameterM: values.diameterM,
      dynamicViscosityPaS: values.dynamicViscosityPaS,
    }),
  },
  {
    slug: 'solution-dilution-calculator',
    fields: [
      {
        id: 'solveCode',
        label: 'Solve for',
        defaultValue: 3,
        options: [
          { value: 0, label: 'Stock concentration C1' },
          { value: 1, label: 'Stock volume V1' },
          { value: 2, label: 'Final concentration C2' },
          { value: 3, label: 'Final volume V2' },
        ],
      },
      { id: 'concentration1', label: 'C1', defaultValue: 2, min: 0, step: 0.01, help: 'Ignored when solving for C1. Use consistent units with C2.' },
      { id: 'volume1', label: 'V1', defaultValue: 0.25, min: 0, step: 0.01, help: 'Ignored when solving for V1.' },
      { id: 'concentration2', label: 'C2', defaultValue: 0.5, min: 0, step: 0.01, help: 'Ignored when solving for C2.' },
      { id: 'volume2', label: 'V2', defaultValue: 1, min: 0, step: 0.01, help: 'Ignored when solving for V2.' },
    ],
    calculate: (values) => calculateSolutionDilution({
      solveCode: values.solveCode,
      concentration1: values.concentration1,
      volume1: values.volume1,
      concentration2: values.concentration2,
      volume2: values.volume2,
    }),
  },
  {
    slug: 'thermal-expansion-calculator',
    fields: [
      { id: 'alphaPerK', label: 'Expansion coefficient α', unit: '1/K', defaultValue: 0.000012, min: 1e-12, step: 0.000001 },
      { id: 'lengthM', label: 'Original length L', unit: 'm', defaultValue: 10, min: 0.0001, step: 0.1 },
      { id: 'deltaTK', label: 'Temperature change ΔT', unit: 'K', defaultValue: 50, step: 1 },
    ],
    calculate: (values) => calculateThermalExpansion({
      alphaPerK: values.alphaPerK,
      lengthM: values.lengthM,
      deltaTK: values.deltaTK,
    }),
  },
  {
    slug: 'stress-strain-calculator',
    fields: [
      { id: 'forceN', label: 'Axial force F', unit: 'N', defaultValue: 10_000, min: 0.0001, step: 10 },
      { id: 'areaM2', label: 'Original area A', unit: 'm²', defaultValue: 0.001, min: 1e-12, step: 0.0001 },
      { id: 'elongationM', label: 'Elongation δ', unit: 'm', defaultValue: 0.0005, min: 0.0001, step: 0.0001 },
      { id: 'lengthM', label: 'Original length L', unit: 'm', defaultValue: 1, min: 0.0001, step: 0.01 },
      { id: 'yieldStressPa', label: 'Yield stress σy', unit: 'Pa', defaultValue: 250_000_000, min: 0.0001, step: 1_000_000 },
    ],
    calculate: (values) => calculateStressStrain({
      forceN: values.forceN,
      areaM2: values.areaM2,
      elongationM: values.elongationM,
      lengthM: values.lengthM,
      yieldStressPa: values.yieldStressPa,
    }),
  },
  {
    slug: 'pump-power-calculator',
    fields: [
      { id: 'densityKgM3', label: 'Density ρ', unit: 'kg/m³', defaultValue: 1000, min: 0.0001, step: 1 },
      { id: 'flowM3s', label: 'Volumetric flow Q', unit: 'm³/s', defaultValue: 0.05, min: 0.0001, step: 0.001 },
      { id: 'headM', label: 'Total head H', unit: 'm', defaultValue: 20, min: 0.0001, step: 0.1 },
      { id: 'efficiencyPercent', label: 'Overall efficiency', unit: '%', defaultValue: 80, min: 0.01, max: 100, step: 1 },
    ],
    calculate: (values) => calculatePumpPower({
      densityKgM3: values.densityKgM3,
      flowM3s: values.flowM3s,
      headM: values.headM,
      efficiencyPercent: values.efficiencyPercent,
    }),
  },
  {
    slug: 'principal-stress-calculator',
    fields: [
      { id: 'sigmaXPa', label: 'σx', unit: 'Pa', defaultValue: 80_000_000, step: 1_000_000 },
      { id: 'sigmaYPa', label: 'σy', unit: 'Pa', defaultValue: 20_000_000, step: 1_000_000 },
      { id: 'tauXyPa', label: 'τxy', unit: 'Pa', defaultValue: 30_000_000, step: 1_000_000 },
    ],
    calculate: (values) => calculatePrincipalStress2d({
      sigmaXPa: values.sigmaXPa,
      sigmaYPa: values.sigmaYPa,
      tauXyPa: values.tauXyPa,
    }),
  },
  {
    slug: 'convection-heat-transfer-calculator',
    fields: [
      { id: 'hWm2k', label: 'Film coefficient h', unit: 'W/m²·K', defaultValue: 25, min: 0.0001, step: 0.1 },
      { id: 'areaM2', label: 'Surface area A', unit: 'm²', defaultValue: 2, min: 0.0001, step: 0.01 },
      { id: 'deltaTK', label: 'Temperature difference ΔT', unit: 'K', defaultValue: 40, step: 0.1 },
    ],
    calculate: (values) => calculateConvectionHeat({
      hWm2k: values.hWm2k,
      areaM2: values.areaM2,
      deltaTK: values.deltaTK,
    }),
  },
];

export function getDisciplineToolBySlug(slug: string) {
  return disciplineEngineeringTools.find((tool) => tool.slug === slug);
}

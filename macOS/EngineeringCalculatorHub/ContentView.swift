import Foundation
import SwiftUI

struct ContentView: View {
    @State private var selectedCalculator: CalculatorKind? = .ohmsLaw

    private var groupedCalculators: [(String, [CalculatorKind])] {
        let grouped = Dictionary(grouping: CalculatorKind.allCases, by: \.category)
        return grouped
            .map { ($0.key, $0.value.sorted { $0.sortOrder < $1.sortOrder }) }
            .sorted { categoryOrder($0.0) < categoryOrder($1.0) }
    }

    var body: some View {
        NavigationSplitView {
            List(selection: $selectedCalculator) {
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Image("calculator-hero")
                            .resizable()
                            .scaledToFill()
                            .frame(height: 132)
                            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                            .overlay(alignment: .bottomLeading) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Engineering Calculator Hub")
                                        .font(.headline)
                                    Text("Native Mac workspace")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(10)
                                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .padding(8)
                            }

                        Text("17 calculators")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                ForEach(groupedCalculators, id: \.0) { category, calculators in
                    Section(category) {
                        ForEach(calculators) { calculator in
                            Label(calculator.title, systemImage: calculator.symbol)
                                .tag(calculator)
                        }
                    }
                }
            }
            .navigationTitle("Calculators")
        } detail: {
            if let calculator = selectedCalculator {
                CalculatorDetailView(calculator: calculator)
            } else {
                ContentUnavailableView("Choose a Calculator", systemImage: "function")
            }
        }
        .frame(minWidth: 1040, minHeight: 720)
    }

    private func categoryOrder(_ category: String) -> Int {
        switch category {
        case "Electrical": 0
        case "Mathematics": 1
        case "Physics": 2
        case "Conversions": 3
        default: 10
        }
    }
}

enum CalculatorKind: String, CaseIterable, Identifiable, Hashable {
    case ohmsLaw
    case power
    case voltageDivider
    case resistorColorCode
    case rcTimeConstant
    case seriesResistors
    case parallelResistors
    case universal
    case scientific
    case logarithm
    case baseConverter
    case energy
    case frequency
    case wavelength
    case dbToVoltage
    case voltageToDb
    case frequencyPeriod

    var id: String { rawValue }

    var title: String {
        switch self {
        case .ohmsLaw: "Ohm's Law"
        case .power: "Power"
        case .voltageDivider: "Voltage Divider"
        case .resistorColorCode: "Resistor Color Code"
        case .rcTimeConstant: "RC Time Constant"
        case .seriesResistors: "Series Resistors"
        case .parallelResistors: "Parallel Resistors"
        case .universal: "Universal"
        case .scientific: "Scientific"
        case .logarithm: "Logarithms"
        case .baseConverter: "Base Converter"
        case .energy: "Energy"
        case .frequency: "Frequency"
        case .wavelength: "Wavelength"
        case .dbToVoltage: "dB to Voltage"
        case .voltageToDb: "Voltage to dB"
        case .frequencyPeriod: "Frequency and Period"
        }
    }

    var subtitle: String {
        switch self {
        case .ohmsLaw: "Solve voltage, current, or resistance."
        case .power: "Electrical power from common circuit pairs."
        case .voltageDivider: "Two-resistor divider output voltage."
        case .resistorColorCode: "Decode 4-band resistor values."
        case .rcTimeConstant: "Time constants and RC cutoff frequency."
        case .seriesResistors: "Total resistance in a series network."
        case .parallelResistors: "Equivalent resistance in a parallel network."
        case .universal: "Typed math, units, constants, powers, and roots."
        case .scientific: "Core scientific operations and trig."
        case .logarithm: "Common, natural, binary, and custom-base logs."
        case .baseConverter: "Decimal, binary, hexadecimal, and octal."
        case .energy: "Kinetic, potential, and electrical energy."
        case .frequency: "Frequency from period or wavelength."
        case .wavelength: "Wave speed, frequency, and wavelength."
        case .dbToVoltage: "Convert decibels to voltage ratio and value."
        case .voltageToDb: "Convert voltage ratios to decibels."
        case .frequencyPeriod: "Convert frequency and period."
        }
    }

    var category: String {
        switch self {
        case .ohmsLaw, .power, .voltageDivider, .resistorColorCode, .rcTimeConstant, .seriesResistors, .parallelResistors:
            "Electrical"
        case .universal, .scientific, .logarithm, .baseConverter:
            "Mathematics"
        case .energy, .frequency, .wavelength:
            "Physics"
        case .dbToVoltage, .voltageToDb, .frequencyPeriod:
            "Conversions"
        }
    }

    var symbol: String {
        switch self {
        case .ohmsLaw: "bolt"
        case .power: "powerplug"
        case .voltageDivider: "slider.horizontal.3"
        case .resistorColorCode: "paintpalette"
        case .rcTimeConstant: "timer"
        case .seriesResistors: "point.3.connected.trianglepath.dotted"
        case .parallelResistors: "point.topleft.down.curvedto.point.bottomright.up"
        case .universal: "sum"
        case .scientific: "function"
        case .logarithm: "textformat.123"
        case .baseConverter: "number"
        case .energy: "flame"
        case .frequency: "waveform.path.ecg"
        case .wavelength: "waveform.path"
        case .dbToVoltage: "speaker.wave.2"
        case .voltageToDb: "waveform.badge.magnifyingglass"
        case .frequencyPeriod: "repeat"
        }
    }

    var sortOrder: Int {
        switch self {
        case .ohmsLaw: 0
        case .power: 1
        case .voltageDivider: 2
        case .resistorColorCode: 3
        case .rcTimeConstant: 4
        case .seriesResistors: 5
        case .parallelResistors: 6
        case .universal: 20
        case .scientific: 21
        case .logarithm: 22
        case .baseConverter: 23
        case .energy: 40
        case .frequency: 41
        case .wavelength: 42
        case .dbToVoltage: 60
        case .voltageToDb: 61
        case .frequencyPeriod: 62
        }
    }
}

struct CalculatorDetailView: View {
    let calculator: CalculatorKind

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HeaderView(calculator: calculator)

                switch calculator {
                case .ohmsLaw:
                    OhmsLawView()
                case .power:
                    PowerView()
                case .voltageDivider:
                    VoltageDividerView()
                case .resistorColorCode:
                    ResistorColorCodeView()
                case .rcTimeConstant:
                    RCTimeConstantView()
                case .seriesResistors:
                    ResistorNetworkView(kind: .series)
                case .parallelResistors:
                    ResistorNetworkView(kind: .parallel)
                case .universal:
                    UniversalCalculatorView()
                case .scientific:
                    ScientificCalculatorView()
                case .logarithm:
                    LogarithmView()
                case .baseConverter:
                    BaseConverterView()
                case .energy:
                    EnergyView()
                case .frequency:
                    FrequencyView()
                case .wavelength:
                    WavelengthView()
                case .dbToVoltage:
                    DBToVoltageView()
                case .voltageToDb:
                    VoltageToDBView()
                case .frequencyPeriod:
                    FrequencyPeriodView()
                }
            }
            .padding(32)
            .frame(maxWidth: 900, alignment: .leading)
        }
        .background(Color(nsColor: .windowBackgroundColor))
        .navigationTitle(calculator.title)
    }
}

struct HeaderView: View {
    let calculator: CalculatorKind

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: calculator.symbol)
                .font(.system(size: 28, weight: .semibold))
                .frame(width: 54, height: 54)
                .background(.quaternary, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                .foregroundStyle(.tint)

            VStack(alignment: .leading, spacing: 6) {
                Text(calculator.title)
                    .font(.largeTitle.bold())
                Text(calculator.subtitle)
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

struct CalculatorPanel<Controls: View, Results: View>: View {
    let controls: Controls
    let results: Results

    init(@ViewBuilder controls: () -> Controls, @ViewBuilder results: () -> Results) {
        self.controls = controls()
        self.results = results()
    }

    var body: some View {
        HStack(alignment: .top, spacing: 24) {
            VStack(alignment: .leading, spacing: 16) {
                controls
            }
            .frame(maxWidth: 420, alignment: .leading)

            VStack(alignment: .leading, spacing: 14) {
                results
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
    }
}

struct NumberInput: View {
    let title: String
    let unit: String
    @Binding var value: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
            HStack {
                TextField(title, value: $value, format: .number.precision(.fractionLength(0...8)))
                    .textFieldStyle(.roundedBorder)
                Text(unit)
                    .font(.callout.monospaced())
                    .foregroundStyle(.secondary)
                    .frame(width: 70, alignment: .leading)
            }
        }
    }
}

struct ResultCard: View {
    let title: String
    let value: String
    var detail: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(.title2, design: .rounded, weight: .bold))
                .textSelection(.enabled)
            if let detail {
                Text(detail)
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct OhmsLawView: View {
    @State private var solveFor: OhmsTarget = .voltage
    @State private var voltage = 12.0
    @State private var current = 2.0
    @State private var resistance = 6.0

    private var result: (label: String, value: Double, unit: String, formula: String)? {
        switch solveFor {
        case .voltage:
            (solveFor.resultLabel, current * resistance, "V", "V = I x R")
        case .current:
            resistance == 0 ? nil : (solveFor.resultLabel, voltage / resistance, "A", "I = V / R")
        case .resistance:
            current == 0 ? nil : (solveFor.resultLabel, voltage / current, "Ohm", "R = V / I")
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Solve for", selection: $solveFor) {
                ForEach(OhmsTarget.allCases) { target in
                    Text(target.title).tag(target)
                }
            }
            .pickerStyle(.segmented)

            if solveFor != .voltage {
                NumberInput(title: "Voltage", unit: "V", value: $voltage)
            }
            if solveFor != .current {
                NumberInput(title: "Current", unit: "A", value: $current)
            }
            if solveFor != .resistance {
                NumberInput(title: "Resistance", unit: "Ohm", value: $resistance)
            }
        } results: {
            if let result {
                ResultCard(title: result.label, value: "\(format(result.value)) \(result.unit)", detail: result.formula)
            } else {
                ResultCard(title: solveFor.resultLabel, value: "Undefined", detail: "Check that the divisor is not zero.")
            }
        }
    }
}

enum OhmsTarget: String, CaseIterable, Identifiable {
    case voltage
    case current
    case resistance

    var id: String { rawValue }
    var title: String { rawValue.capitalized }
    var resultLabel: String { "\(title) Result" }
}

struct PowerView: View {
    @State private var mode: PowerEquation = .voltageCurrent
    @State private var voltage = 12.0
    @State private var current = 2.0
    @State private var resistance = 6.0

    private var power: Double? {
        switch mode {
        case .voltageCurrent:
            voltage * current
        case .currentResistance:
            pow(current, 2) * resistance
        case .voltageResistance:
            resistance == 0 ? nil : pow(voltage, 2) / resistance
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Equation", selection: $mode) {
                ForEach(PowerEquation.allCases) { equation in
                    Text(equation.title).tag(equation)
                }
            }
            .pickerStyle(.segmented)

            if mode.usesVoltage {
                NumberInput(title: "Voltage", unit: "V", value: $voltage)
            }
            if mode.usesCurrent {
                NumberInput(title: "Current", unit: "A", value: $current)
            }
            if mode.usesResistance {
                NumberInput(title: "Resistance", unit: "Ohm", value: $resistance)
            }
        } results: {
            ResultCard(
                title: "Power",
                value: power.map { "\(format($0)) W" } ?? "Undefined",
                detail: mode.formula
            )
        }
    }
}

enum PowerEquation: String, CaseIterable, Identifiable {
    case voltageCurrent
    case currentResistance
    case voltageResistance

    var id: String { rawValue }

    var title: String {
        switch self {
        case .voltageCurrent: "V x I"
        case .currentResistance: "I^2 x R"
        case .voltageResistance: "V^2 / R"
        }
    }

    var formula: String {
        switch self {
        case .voltageCurrent: "P = V x I"
        case .currentResistance: "P = I^2 x R"
        case .voltageResistance: "P = V^2 / R"
        }
    }

    var usesVoltage: Bool { self != .currentResistance }
    var usesCurrent: Bool { self != .voltageResistance }
    var usesResistance: Bool { self != .voltageCurrent }
}

struct VoltageDividerView: View {
    @State private var inputVoltage = 5.0
    @State private var resistorOne = 1000.0
    @State private var resistorTwo = 2000.0

    private var outputVoltage: Double? {
        let total = resistorOne + resistorTwo
        return total == 0 ? nil : inputVoltage * resistorTwo / total
    }

    var body: some View {
        CalculatorPanel {
            NumberInput(title: "Input Voltage", unit: "V", value: $inputVoltage)
            NumberInput(title: "R1", unit: "Ohm", value: $resistorOne)
            NumberInput(title: "R2", unit: "Ohm", value: $resistorTwo)
        } results: {
            ResultCard(
                title: "Output Voltage",
                value: outputVoltage.map { "\(format($0)) V" } ?? "Undefined",
                detail: "Vout = Vin x R2 / (R1 + R2)"
            )
            ResultCard(title: "Divider Ratio", value: outputVoltage.map { format($0 / inputVoltage) } ?? "Undefined")
        }
    }
}

struct ResistorColorCodeView: View {
    @State private var firstBand = 1
    @State private var secondBand = 0
    @State private var multiplierBand = 2
    @State private var toleranceBand = 0

    private var resistance: Double {
        let significantDigits = Double(ResistorBands.digitBands[firstBand].value * 10 + ResistorBands.digitBands[secondBand].value)
        return significantDigits * ResistorBands.multiplierBands[multiplierBand].multiplier
    }

    var body: some View {
        CalculatorPanel {
            BandPicker(title: "Band 1", bands: ResistorBands.digitBands, selection: $firstBand)
            BandPicker(title: "Band 2", bands: ResistorBands.digitBands, selection: $secondBand)
            BandPicker(title: "Multiplier", bands: ResistorBands.multiplierBands, selection: $multiplierBand)
            BandPicker(title: "Tolerance", bands: ResistorBands.toleranceBands, selection: $toleranceBand)
        } results: {
            HStack(spacing: 10) {
                ColorBandSwatch(band: ResistorBands.digitBands[firstBand])
                ColorBandSwatch(band: ResistorBands.digitBands[secondBand])
                ColorBandSwatch(band: ResistorBands.multiplierBands[multiplierBand])
                ColorBandSwatch(band: ResistorBands.toleranceBands[toleranceBand])
            }
            .padding(.bottom, 8)

            ResultCard(title: "Resistance", value: formatResistance(resistance))
            ResultCard(title: "Tolerance", value: ResistorBands.toleranceBands[toleranceBand].label)
        }
    }
}

struct BandPicker: View {
    let title: String
    let bands: [ResistorBand]
    @Binding var selection: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
            Picker(title, selection: $selection) {
                ForEach(bands.indices, id: \.self) { index in
                    Text(bands[index].name).tag(index)
                }
            }
            .pickerStyle(.menu)
        }
    }
}

struct ColorBandSwatch: View {
    let band: ResistorBand

    var body: some View {
        RoundedRectangle(cornerRadius: 6, style: .continuous)
            .fill(band.color)
            .frame(width: 40, height: 86)
            .overlay {
                RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .stroke(.secondary.opacity(0.3), lineWidth: 1)
            }
            .help(band.name)
    }
}

struct ResistorBand {
    let name: String
    let value: Int
    let multiplier: Double
    let label: String
    let color: Color
}

enum ResistorBands {
    static let digitBands: [ResistorBand] = [
        ResistorBand(name: "Black", value: 0, multiplier: 1, label: "0", color: .black),
        ResistorBand(name: "Brown", value: 1, multiplier: 10, label: "1", color: .brown),
        ResistorBand(name: "Red", value: 2, multiplier: 100, label: "2", color: .red),
        ResistorBand(name: "Orange", value: 3, multiplier: 1_000, label: "3", color: .orange),
        ResistorBand(name: "Yellow", value: 4, multiplier: 10_000, label: "4", color: .yellow),
        ResistorBand(name: "Green", value: 5, multiplier: 100_000, label: "5", color: .green),
        ResistorBand(name: "Blue", value: 6, multiplier: 1_000_000, label: "6", color: .blue),
        ResistorBand(name: "Violet", value: 7, multiplier: 10_000_000, label: "7", color: .purple),
        ResistorBand(name: "Grey", value: 8, multiplier: 100_000_000, label: "8", color: .gray),
        ResistorBand(name: "White", value: 9, multiplier: 1_000_000_000, label: "9", color: .white)
    ]

    static let multiplierBands: [ResistorBand] = digitBands + [
        ResistorBand(name: "Gold", value: 0, multiplier: 0.1, label: "x 0.1", color: .yellow.opacity(0.72)),
        ResistorBand(name: "Silver", value: 0, multiplier: 0.01, label: "x 0.01", color: .gray.opacity(0.55))
    ]

    static let toleranceBands: [ResistorBand] = [
        ResistorBand(name: "Brown", value: 0, multiplier: 1, label: "+/- 1%", color: .brown),
        ResistorBand(name: "Red", value: 0, multiplier: 1, label: "+/- 2%", color: .red),
        ResistorBand(name: "Gold", value: 0, multiplier: 1, label: "+/- 5%", color: .yellow.opacity(0.72)),
        ResistorBand(name: "Silver", value: 0, multiplier: 1, label: "+/- 10%", color: .gray.opacity(0.55))
    ]
}

struct RCTimeConstantView: View {
    @State private var resistance = 1000.0
    @State private var capacitanceMicrofarads = 100.0

    private var capacitanceFarads: Double { capacitanceMicrofarads / 1_000_000 }
    private var tau: Double { resistance * capacitanceFarads }
    private var cutoff: Double? {
        tau == 0 ? nil : 1 / (2 * Double.pi * tau)
    }

    var body: some View {
        CalculatorPanel {
            NumberInput(title: "Resistance", unit: "Ohm", value: $resistance)
            NumberInput(title: "Capacitance", unit: "uF", value: $capacitanceMicrofarads)
        } results: {
            ResultCard(title: "Time Constant", value: formatTime(tau), detail: "tau = R x C")
            ResultCard(title: "3 Time Constants", value: formatTime(tau * 3), detail: "About 95% charged or discharged")
            ResultCard(title: "5 Time Constants", value: formatTime(tau * 5), detail: "About 99.3% charged or discharged")
            ResultCard(title: "Cutoff Frequency", value: cutoff.map { formatFrequency($0) } ?? "Undefined", detail: "fc = 1 / (2 x pi x R x C)")
        }
    }
}

struct ResistorNetworkView: View {
    let kind: NetworkKind
    @State private var resistors: [Double] = [100, 220, 470]

    private var total: Double? {
        switch kind {
        case .series:
            return resistors.reduce(0, +)
        case .parallel:
            let reciprocal = resistors.reduce(0.0) { partial, resistor in
                resistor == 0 ? partial : partial + 1 / resistor
            }
            return reciprocal == 0 ? nil : 1 / reciprocal
        }
    }

    var body: some View {
        CalculatorPanel {
            ForEach(resistors.indices, id: \.self) { index in
                HStack(alignment: .bottom, spacing: 10) {
                    NumberInput(title: "R\(index + 1)", unit: "Ohm", value: $resistors[index])
                    Button {
                        resistors.remove(at: index)
                    } label: {
                        Image(systemName: "minus.circle")
                    }
                    .buttonStyle(.borderless)
                    .disabled(resistors.count <= 2)
                    .help("Remove resistor")
                }
            }

            Button {
                resistors.append(100)
            } label: {
                Label("Add Resistor", systemImage: "plus.circle")
            }
            .disabled(resistors.count >= 10)
        } results: {
            ResultCard(title: "Equivalent Resistance", value: total.map { formatResistance($0) } ?? "Undefined", detail: kind.formula)
            ResultCard(title: "Resistors", value: "\(resistors.count)", detail: "Enter between 2 and 10 resistor values.")
        }
    }
}

enum NetworkKind {
    case series
    case parallel

    var formula: String {
        switch self {
        case .series: "Rtotal = R1 + R2 + ..."
        case .parallel: "1 / Rtotal = 1 / R1 + 1 / R2 + ..."
        }
    }
}

struct UniversalCalculatorView: View {
    @State private var expression = "2 + 3 * sin(45 deg)"

    private let examples = [
        "2 + 3 * sin(45 deg)",
        "5 m + 30 cm",
        "sqrt(144)",
        "2^10",
        "10!"
    ]

    private var evaluation: UniversalEvaluation {
        UniversalExpressionEvaluator(expression: expression).evaluate()
    }

    var body: some View {
        CalculatorPanel {
            VStack(alignment: .leading, spacing: 6) {
                Text("Expression")
                    .font(.headline)
                TextField("Type an expression", text: $expression, axis: .vertical)
                    .font(.system(.title3, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(3...5)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Examples")
                    .font(.headline)
                FlowLayout(spacing: 8) {
                    ForEach(examples, id: \.self) { example in
                        Button(example) {
                            expression = example
                        }
                    }
                }
            }
        } results: {
            if let value = evaluation.value {
                ResultCard(
                    title: "Result",
                    value: format(value),
                    detail: "Supports arithmetic, parentheses, powers, factorials, constants, trig, roots, logs, and simple unit factors."
                )
            } else {
                ResultCard(title: "Result", value: "Cannot evaluate", detail: evaluation.message)
            }
        }
    }
}

struct FlowLayout<Content: View>: View {
    let spacing: CGFloat
    let content: Content

    init(spacing: CGFloat, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.content = content()
    }

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 120), spacing: spacing)], alignment: .leading, spacing: spacing) {
            content
        }
    }
}

struct UniversalEvaluation {
    let value: Double?
    let message: String?
}

struct UniversalExpressionEvaluator {
    let expression: String

    func evaluate() -> UniversalEvaluation {
        do {
            let tokens = try ExpressionTokenizer(expression: expression).tokenize()
            var parser = ExpressionParser(tokens: tokens)
            let value = try parser.parse()
            return UniversalEvaluation(value: value, message: nil)
        } catch let error as ExpressionError {
            return UniversalEvaluation(value: nil, message: error.errorDescription)
        } catch {
            return UniversalEvaluation(value: nil, message: error.localizedDescription)
        }
    }
}

enum ExpressionToken {
    case number(Double)
    case identifier(String)
    case plus
    case minus
    case star
    case slash
    case caret
    case leftParen
    case rightParen
    case bang
    case end
}

enum ExpressionError: Error, LocalizedError {
    case message(String)

    var errorDescription: String? {
        switch self {
        case .message(let message): message
        }
    }
}

struct ExpressionTokenizer {
    let expression: String

    func tokenize() throws -> [ExpressionToken] {
        var tokens: [ExpressionToken] = []
        let characters = Array(expression)
        var index = characters.startIndex

        while index < characters.endIndex {
            let character = characters[index]

            if character.isWhitespace {
                characters.formIndex(after: &index)
                continue
            }

            if character.isNumber || character == "." {
                let start = index
                var hasExponent = false
                characters.formIndex(after: &index)

                while index < characters.endIndex {
                    let next = characters[index]
                    if next.isNumber || next == "." {
                        characters.formIndex(after: &index)
                    } else if (next == "e" || next == "E"), !hasExponent {
                        hasExponent = true
                        characters.formIndex(after: &index)
                        if index < characters.endIndex, (characters[index] == "+" || characters[index] == "-") {
                            characters.formIndex(after: &index)
                        }
                    } else {
                        break
                    }
                }

                let text = String(characters[start..<index])
                guard let value = Double(text) else {
                    throw ExpressionError.message("Invalid number: \(text)")
                }
                tokens.append(.number(value))
                continue
            }

            if character.isLetter {
                let start = index
                characters.formIndex(after: &index)
                while index < characters.endIndex, characters[index].isLetter || characters[index].isNumber {
                    characters.formIndex(after: &index)
                }
                tokens.append(.identifier(String(characters[start..<index]).lowercased()))
                continue
            }

            switch character {
            case "+":
                tokens.append(.plus)
            case "-":
                tokens.append(.minus)
            case "*", "x":
                tokens.append(.star)
            case "/":
                tokens.append(.slash)
            case "^":
                tokens.append(.caret)
            case "(":
                tokens.append(.leftParen)
            case ")":
                tokens.append(.rightParen)
            case "!":
                tokens.append(.bang)
            default:
                throw ExpressionError.message("Unsupported character: \(character)")
            }
            characters.formIndex(after: &index)
        }

        tokens.append(.end)
        return tokens
    }
}

struct ExpressionParser {
    var tokens: [ExpressionToken]
    var index = 0

    private var current: ExpressionToken { tokens[index] }

    mutating func parse() throws -> Double {
        let value = try parseExpression()
        guard case .end = current else {
            throw ExpressionError.message("Unexpected input after the expression.")
        }
        guard value.isFinite else {
            throw ExpressionError.message("The result is not finite.")
        }
        return value
    }

    private mutating func parseExpression() throws -> Double {
        try parseAdditive()
    }

    private mutating func parseAdditive() throws -> Double {
        var value = try parseMultiplicative()

        while true {
            switch current {
            case .plus:
                advance()
                value += try parseMultiplicative()
            case .minus:
                advance()
                value -= try parseMultiplicative()
            default:
                return value
            }
        }
    }

    private mutating func parseMultiplicative() throws -> Double {
        var value = try parsePower()

        while true {
            switch current {
            case .star:
                advance()
                value *= try parsePower()
            case .slash:
                advance()
                let divisor = try parsePower()
                guard divisor != 0 else {
                    throw ExpressionError.message("Division by zero.")
                }
                value /= divisor
            default:
                return value
            }
        }
    }

    private mutating func parsePower() throws -> Double {
        let base = try parseUnary()

        if case .caret = current {
            advance()
            return pow(base, try parsePower())
        }

        return base
    }

    private mutating func parseUnary() throws -> Double {
        switch current {
        case .plus:
            advance()
            return try parseUnary()
        case .minus:
            advance()
            return -(try parseUnary())
        default:
            return try parsePostfix()
        }
    }

    private mutating func parsePostfix() throws -> Double {
        var value = try parsePrimary()

        while case .bang = current {
            advance()
            value = try factorial(value)
        }

        return value
    }

    private mutating func parsePrimary() throws -> Double {
        switch current {
        case .number(let value):
            advance()
            return try applyTrailingUnit(to: value)
        case .identifier(let name):
            advance()
            if case .leftParen = current {
                advance()
                let argument = try parseExpression()
                try consumeRightParen()
                return try applyFunction(name, to: argument)
            }
            if let constant = constants[name] {
                return constant
            }
            if let unit = unitFactors[name] {
                return unit
            }
            throw ExpressionError.message("Unknown identifier: \(name)")
        case .leftParen:
            advance()
            let value = try parseExpression()
            try consumeRightParen()
            return value
        default:
            throw ExpressionError.message("Expected a number, identifier, or parenthesized expression.")
        }
    }

    private mutating func applyTrailingUnit(to value: Double) throws -> Double {
        guard case .identifier(let name) = current, let unit = unitFactors[name] else {
            return value
        }
        advance()
        return value * unit
    }

    private mutating func consumeRightParen() throws {
        guard case .rightParen = current else {
            throw ExpressionError.message("Missing closing parenthesis.")
        }
        advance()
    }

    private func applyFunction(_ name: String, to argument: Double) throws -> Double {
        switch name {
        case "sin": sin(argument)
        case "cos": cos(argument)
        case "tan": tan(argument)
        case "asin": asin(argument)
        case "acos": acos(argument)
        case "atan": atan(argument)
        case "sqrt":
            argument < 0 ? Double.nan : sqrt(argument)
        case "log", "log10":
            argument <= 0 ? Double.nan : log10(argument)
        case "ln":
            argument <= 0 ? Double.nan : log(argument)
        case "abs":
            abs(argument)
        case "floor":
            floor(argument)
        case "ceil":
            ceil(argument)
        default:
            throw ExpressionError.message("Unknown function: \(name)")
        }
    }

    private func factorial(_ value: Double) throws -> Double {
        guard value >= 0, value.rounded() == value, value <= 170 else {
            throw ExpressionError.message("Factorial needs a whole number from 0 to 170.")
        }
        let number = Int(value)
        guard number > 1 else { return 1 }
        return (2...number).reduce(1.0) { $0 * Double($1) }
    }

    private mutating func advance() {
        index += 1
    }

    private var constants: [String: Double] {
        [
            "pi": Double.pi,
            "e": M_E
        ]
    }

    private var unitFactors: [String: Double] {
        [
            "m": 1,
            "cm": 0.01,
            "mm": 0.001,
            "km": 1_000,
            "in": 0.0254,
            "ft": 0.3048,
            "s": 1,
            "ms": 0.001,
            "us": 0.000001,
            "ns": 0.000000001,
            "min": 60,
            "hr": 3_600,
            "deg": Double.pi / 180,
            "rad": 1,
            "g": 0.001,
            "kg": 1,
            "v": 1,
            "a": 1,
            "ohm": 1
        ]
    }
}

struct ScientificCalculatorView: View {
    @State private var displayText = "0"
    @State private var storedValue: Double?
    @State private var pendingOperation: BasicOperation?
    @State private var angleMode: AngleMode = .degrees

    private let rows = [
        ["7", "8", "9", "/"],
        ["4", "5", "6", "x"],
        ["1", "2", "3", "-"],
        ["0", ".", "=", "+"]
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Picker("Angle", selection: $angleMode) {
                    ForEach(AngleMode.allCases) { mode in
                        Text(mode.title).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .frame(width: 180)

                Spacer()

                Button("AC") {
                    clear()
                }
                .keyboardShortcut(.delete, modifiers: [])
            }

            TextField("Display", text: $displayText)
                .font(.system(.largeTitle, design: .monospaced, weight: .semibold))
                .multilineTextAlignment(.trailing)
                .textFieldStyle(.roundedBorder)
                .frame(maxWidth: 520)

            LazyVGrid(columns: Array(repeating: GridItem(.fixed(72), spacing: 10), count: 4), spacing: 10) {
                ForEach(["sin", "cos", "tan", "sqrt"], id: \.self) { key in
                    ScientificButton(title: key) { applyFunction(key) }
                }
                ForEach(["log", "ln", "x^2", "1/x"], id: \.self) { key in
                    ScientificButton(title: key) { applyFunction(key) }
                }
                ForEach(["pi", "e", "+/-", "^"], id: \.self) { key in
                    ScientificButton(title: key) { handleKey(key) }
                }
                ForEach(rows.flatMap { $0 }, id: \.self) { key in
                    ScientificButton(title: key, prominent: key == "=") { handleKey(key) }
                }
            }
        }
        .padding(20)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private func handleKey(_ key: String) {
        switch key {
        case "0"..."9":
            appendDigit(key)
        case ".":
            if !displayText.contains(".") {
                displayText += "."
            }
        case "+", "-", "x", "/", "^":
            commit(operation: BasicOperation(symbol: key))
        case "=":
            evaluate()
        case "pi":
            displayText = format(Double.pi)
        case "e":
            displayText = format(M_E)
        case "+/-":
            if displayText.hasPrefix("-") {
                displayText.removeFirst()
            } else if displayText != "0" {
                displayText = "-" + displayText
            }
        default:
            break
        }
    }

    private func appendDigit(_ digit: String) {
        if displayText == "0" || displayText == "Error" {
            displayText = digit
        } else {
            displayText += digit
        }
    }

    private func commit(operation: BasicOperation) {
        guard let value = Double(displayText) else { return }
        if storedValue != nil, pendingOperation != nil {
            evaluate()
        }
        storedValue = value
        pendingOperation = operation
        displayText = "0"
    }

    private func evaluate() {
        guard let storedValue, let pendingOperation, let currentValue = Double(displayText) else { return }
        let nextValue: Double?
        switch pendingOperation {
        case .add:
            nextValue = storedValue + currentValue
        case .subtract:
            nextValue = storedValue - currentValue
        case .multiply:
            nextValue = storedValue * currentValue
        case .divide:
            nextValue = currentValue == 0 ? nil : storedValue / currentValue
        case .power:
            nextValue = pow(storedValue, currentValue)
        }
        displayText = nextValue.map(format) ?? "Error"
        self.storedValue = nil
        self.pendingOperation = nil
    }

    private func applyFunction(_ key: String) {
        guard let value = Double(displayText) else { return }
        let radians = angleMode == .degrees ? value * Double.pi / 180 : value
        let nextValue: Double?

        switch key {
        case "sin":
            nextValue = sin(radians)
        case "cos":
            nextValue = cos(radians)
        case "tan":
            nextValue = tan(radians)
        case "sqrt":
            nextValue = value < 0 ? nil : sqrt(value)
        case "log":
            nextValue = value <= 0 ? nil : log10(value)
        case "ln":
            nextValue = value <= 0 ? nil : log(value)
        case "x^2":
            nextValue = pow(value, 2)
        case "1/x":
            nextValue = value == 0 ? nil : 1 / value
        default:
            nextValue = nil
        }

        displayText = nextValue.map(format) ?? "Error"
    }

    private func clear() {
        displayText = "0"
        storedValue = nil
        pendingOperation = nil
    }
}

struct ScientificButton: View {
    let title: String
    var prominent = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(.body, design: .rounded, weight: .semibold))
                .frame(width: 72, height: 42)
        }
        .buttonStyle(.borderedProminent)
        .tint(prominent ? .accentColor : .secondary.opacity(0.18))
        .foregroundStyle(prominent ? .white : .primary)
    }
}

enum AngleMode: String, CaseIterable, Identifiable {
    case degrees
    case radians

    var id: String { rawValue }
    var title: String { rawValue.capitalized }
}

enum BasicOperation {
    case add
    case subtract
    case multiply
    case divide
    case power

    init(symbol: String) {
        switch symbol {
        case "-": self = .subtract
        case "x": self = .multiply
        case "/": self = .divide
        case "^": self = .power
        default: self = .add
        }
    }
}

struct LogarithmView: View {
    @State private var mode: LogMode = .common
    @State private var value = 100.0
    @State private var base = 10.0

    private var result: Double? {
        guard value > 0 else { return nil }
        switch mode {
        case .common:
            return log10(value)
        case .natural:
            return log(value)
        case .binary:
            return log2(value)
        case .custom:
            return base > 0 && base != 1 ? log(value) / log(base) : nil
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Mode", selection: $mode) {
                ForEach(LogMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            NumberInput(title: "Value", unit: "", value: $value)
            if mode == .custom {
                NumberInput(title: "Base", unit: "", value: $base)
            }
        } results: {
            ResultCard(title: mode.title, value: result.map(format) ?? "Undefined", detail: mode.formula(base: base))
        }
    }
}

enum LogMode: String, CaseIterable, Identifiable {
    case common
    case natural
    case binary
    case custom

    var id: String { rawValue }

    var title: String {
        switch self {
        case .common: "log10"
        case .natural: "ln"
        case .binary: "log2"
        case .custom: "Custom"
        }
    }

    func formula(base: Double) -> String {
        switch self {
        case .common: "log10(x)"
        case .natural: "ln(x)"
        case .binary: "log2(x)"
        case .custom: "log base \(format(base))(x)"
        }
    }
}

struct BaseConverterView: View {
    @State private var source: NumberBase = .decimal
    @State private var input = "255"

    private var decimalValue: Int? {
        Int(input.trimmingCharacters(in: .whitespacesAndNewlines), radix: source.radix)
    }

    var body: some View {
        CalculatorPanel {
            Picker("Source Base", selection: $source) {
                ForEach(NumberBase.allCases) { base in
                    Text(base.title).tag(base)
                }
            }
            .pickerStyle(.segmented)

            VStack(alignment: .leading, spacing: 6) {
                Text("Input")
                    .font(.headline)
                TextField(source.placeholder, text: $input)
                    .font(.system(.title3, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
            }
        } results: {
            if let decimalValue {
                ResultCard(title: "Decimal", value: String(decimalValue))
                ResultCard(title: "Binary", value: String(decimalValue, radix: 2))
                ResultCard(title: "Hexadecimal", value: String(decimalValue, radix: 16).uppercased())
                ResultCard(title: "Octal", value: String(decimalValue, radix: 8))
            } else {
                ResultCard(title: "Conversion", value: "Invalid input", detail: "Use digits allowed by the selected source base.")
            }
        }
    }
}

enum NumberBase: String, CaseIterable, Identifiable {
    case decimal
    case binary
    case hexadecimal
    case octal

    var id: String { rawValue }

    var title: String {
        switch self {
        case .decimal: "Dec"
        case .binary: "Bin"
        case .hexadecimal: "Hex"
        case .octal: "Oct"
        }
    }

    var radix: Int {
        switch self {
        case .decimal: 10
        case .binary: 2
        case .hexadecimal: 16
        case .octal: 8
        }
    }

    var placeholder: String {
        switch self {
        case .decimal: "255"
        case .binary: "11111111"
        case .hexadecimal: "FF"
        case .octal: "377"
        }
    }
}

struct EnergyView: View {
    @State private var mode: EnergyMode = .kinetic
    @State private var mass = 10.0
    @State private var velocity = 12.0
    @State private var height = 5.0
    @State private var charge = 2.0
    @State private var voltage = 12.0

    private var result: Double {
        switch mode {
        case .kinetic:
            0.5 * mass * pow(velocity, 2)
        case .potential:
            mass * 9.80665 * height
        case .electrical:
            charge * voltage
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Energy Type", selection: $mode) {
                ForEach(EnergyMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            switch mode {
            case .kinetic:
                NumberInput(title: "Mass", unit: "kg", value: $mass)
                NumberInput(title: "Velocity", unit: "m/s", value: $velocity)
            case .potential:
                NumberInput(title: "Mass", unit: "kg", value: $mass)
                NumberInput(title: "Height", unit: "m", value: $height)
            case .electrical:
                NumberInput(title: "Charge", unit: "C", value: $charge)
                NumberInput(title: "Voltage", unit: "V", value: $voltage)
            }
        } results: {
            ResultCard(title: "Energy", value: "\(format(result)) J", detail: mode.formula)
        }
    }
}

enum EnergyMode: String, CaseIterable, Identifiable {
    case kinetic
    case potential
    case electrical

    var id: String { rawValue }
    var title: String { rawValue.capitalized }

    var formula: String {
        switch self {
        case .kinetic: "E = 1/2 x m x v^2"
        case .potential: "E = m x g x h"
        case .electrical: "E = Q x V"
        }
    }
}

struct FrequencyView: View {
    @State private var mode: FrequencyMode = .fromPeriod
    @State private var period = 0.001
    @State private var waveSpeed = 343.0
    @State private var wavelength = 0.686

    private var result: Double? {
        switch mode {
        case .fromPeriod:
            period == 0 ? nil : 1 / period
        case .fromWavelength:
            wavelength == 0 ? nil : waveSpeed / wavelength
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Mode", selection: $mode) {
                ForEach(FrequencyMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            switch mode {
            case .fromPeriod:
                NumberInput(title: "Period", unit: "s", value: $period)
            case .fromWavelength:
                NumberInput(title: "Wave Speed", unit: "m/s", value: $waveSpeed)
                NumberInput(title: "Wavelength", unit: "m", value: $wavelength)
            }
        } results: {
            ResultCard(title: "Frequency", value: result.map(formatFrequency) ?? "Undefined", detail: mode.formula)
        }
    }
}

enum FrequencyMode: String, CaseIterable, Identifiable {
    case fromPeriod
    case fromWavelength

    var id: String { rawValue }

    var title: String {
        switch self {
        case .fromPeriod: "From Period"
        case .fromWavelength: "From Wavelength"
        }
    }

    var formula: String {
        switch self {
        case .fromPeriod: "f = 1 / T"
        case .fromWavelength: "f = v / lambda"
        }
    }
}

struct WavelengthView: View {
    @State private var waveSpeed = 299_792_458.0
    @State private var frequency = 100_000_000.0

    private var wavelength: Double? {
        frequency == 0 ? nil : waveSpeed / frequency
    }

    var body: some View {
        CalculatorPanel {
            NumberInput(title: "Wave Speed", unit: "m/s", value: $waveSpeed)
            NumberInput(title: "Frequency", unit: "Hz", value: $frequency)
        } results: {
            ResultCard(
                title: "Wavelength",
                value: wavelength.map(formatDistance) ?? "Undefined",
                detail: "lambda = v / f"
            )
        }
    }
}

struct DBToVoltageView: View {
    @State private var decibels = 6.0
    @State private var referenceVoltage = 1.0

    private var ratio: Double { pow(10, decibels / 20) }
    private var voltage: Double { referenceVoltage * ratio }

    var body: some View {
        CalculatorPanel {
            NumberInput(title: "Decibels", unit: "dB", value: $decibels)
            NumberInput(title: "Reference Voltage", unit: "V", value: $referenceVoltage)
        } results: {
            ResultCard(title: "Voltage Ratio", value: "\(format(ratio))x", detail: "ratio = 10^(dB / 20)")
            ResultCard(title: "Voltage", value: "\(format(voltage)) V")
        }
    }
}

struct VoltageToDBView: View {
    @State private var voltage = 2.0
    @State private var referenceVoltage = 1.0

    private var decibels: Double? {
        guard voltage > 0, referenceVoltage > 0 else { return nil }
        return 20 * log10(voltage / referenceVoltage)
    }

    var body: some View {
        CalculatorPanel {
            NumberInput(title: "Voltage", unit: "V", value: $voltage)
            NumberInput(title: "Reference Voltage", unit: "V", value: $referenceVoltage)
        } results: {
            ResultCard(title: "Decibels", value: decibels.map { "\(format($0)) dB" } ?? "Undefined", detail: "dB = 20 x log10(V / Vref)")
        }
    }
}

struct FrequencyPeriodView: View {
    @State private var mode: FrequencyPeriodMode = .frequencyToPeriod
    @State private var frequency = 1_000.0
    @State private var period = 0.001

    private var result: Double? {
        switch mode {
        case .frequencyToPeriod:
            frequency == 0 ? nil : 1 / frequency
        case .periodToFrequency:
            period == 0 ? nil : 1 / period
        }
    }

    var body: some View {
        CalculatorPanel {
            Picker("Mode", selection: $mode) {
                ForEach(FrequencyPeriodMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            switch mode {
            case .frequencyToPeriod:
                NumberInput(title: "Frequency", unit: "Hz", value: $frequency)
            case .periodToFrequency:
                NumberInput(title: "Period", unit: "s", value: $period)
            }
        } results: {
            switch mode {
            case .frequencyToPeriod:
                ResultCard(title: "Period", value: result.map(formatTime) ?? "Undefined", detail: "T = 1 / f")
            case .periodToFrequency:
                ResultCard(title: "Frequency", value: result.map(formatFrequency) ?? "Undefined", detail: "f = 1 / T")
            }
        }
    }
}

enum FrequencyPeriodMode: String, CaseIterable, Identifiable {
    case frequencyToPeriod
    case periodToFrequency

    var id: String { rawValue }

    var title: String {
        switch self {
        case .frequencyToPeriod: "Frequency -> Period"
        case .periodToFrequency: "Period -> Frequency"
        }
    }
}

func format(_ value: Double) -> String {
    guard value.isFinite else { return "Undefined" }
    let absValue = abs(value)
    if absValue != 0, absValue < 0.000001 || absValue >= 1_000_000_000 {
        return String(format: "%.6e", value)
    }
    return value.formatted(.number.precision(.fractionLength(0...6)))
}

func formatResistance(_ value: Double) -> String {
    guard value.isFinite else { return "Undefined" }
    switch abs(value) {
    case 1_000_000...:
        return "\(format(value / 1_000_000)) MOhm"
    case 1_000...:
        return "\(format(value / 1_000)) kOhm"
    default:
        return "\(format(value)) Ohm"
    }
}

func formatTime(_ seconds: Double) -> String {
    guard seconds.isFinite else { return "Undefined" }
    switch abs(seconds) {
    case 1...:
        return "\(format(seconds)) s"
    case 0.001...:
        return "\(format(seconds * 1_000)) ms"
    case 0.000001...:
        return "\(format(seconds * 1_000_000)) us"
    default:
        return "\(format(seconds * 1_000_000_000)) ns"
    }
}

func formatFrequency(_ hertz: Double) -> String {
    guard hertz.isFinite else { return "Undefined" }
    switch abs(hertz) {
    case 1_000_000_000...:
        return "\(format(hertz / 1_000_000_000)) GHz"
    case 1_000_000...:
        return "\(format(hertz / 1_000_000)) MHz"
    case 1_000...:
        return "\(format(hertz / 1_000)) kHz"
    default:
        return "\(format(hertz)) Hz"
    }
}

func formatDistance(_ meters: Double) -> String {
    guard meters.isFinite else { return "Undefined" }
    switch abs(meters) {
    case 1_000...:
        return "\(format(meters / 1_000)) km"
    case 1...:
        return "\(format(meters)) m"
    case 0.01...:
        return "\(format(meters * 100)) cm"
    case 0.001...:
        return "\(format(meters * 1_000)) mm"
    default:
        return "\(format(meters * 1_000_000)) um"
    }
}

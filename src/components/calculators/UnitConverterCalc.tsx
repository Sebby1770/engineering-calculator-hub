"use client";

import { useMemo, useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import { useCalcQuery } from "@/lib/useCalcQuery";
import {
  UNIT_CATEGORY_LIST,
  convertWithSteps,
  getUnits,
  isUnitCategory,
  type ConversionStep,
  type UnitCategory,
} from "@/lib/units";

const DEFAULTS = {
  category: "length",
  from: "m",
  to: "ft",
  value: "",
};

export default function UnitConverterCalc({ onResult }: { onResult: (r: string) => void }) {
  const [fields, setFields] = useCalcQuery(DEFAULTS);
  const [steps, setSteps] = useState<ConversionStep[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const category: UnitCategory = isUnitCategory(fields.category) ? fields.category : "length";
  const units = useMemo(() => getUnits(category), [category]);
  const unitOptions = units.map((unit) => ({
    value: unit.id,
    label: `${unit.label} (${unit.symbol})`,
  }));

  const from = units.some((unit) => unit.id === fields.from) ? fields.from : units[0].id;
  const to = units.some((unit) => unit.id === fields.to) ? fields.to : units[Math.min(1, units.length - 1)].id;

  const applyCategory = (nextCategory: string) => {
    if (!isUnitCategory(nextCategory)) return;
    const nextUnits = getUnits(nextCategory);
    setFields({
      category: nextCategory,
      from: nextUnits[0].id,
      to: nextUnits[Math.min(1, nextUnits.length - 1)].id,
    });
    setResult(null);
    setSteps([]);
  };

  const calculate = () => {
    const numeric = parseFloat(fields.value);
    if (!Number.isFinite(numeric)) {
      const message = "Please enter a valid value to convert.";
      setResult(message);
      setSteps([]);
      onResult(message);
      return;
    }

    try {
      const conversion = convertWithSteps(numeric, from, to, category);
      const fromUnit = units.find((unit) => unit.id === from);
      const toUnit = units.find((unit) => unit.id === to);
      const text = `${fields.value} ${fromUnit?.symbol ?? from} = ${conversion.formatted} ${toUnit?.symbol ?? to}`;
      setResult(text);
      setSteps(conversion.steps);
      onResult(text);
    } catch {
      const message = "Unable to convert those units.";
      setResult(message);
      setSteps([]);
      onResult(message);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CalcSelect
          label="Quantity"
          value={category}
          onChange={applyCategory}
          options={UNIT_CATEGORY_LIST.map((item) => ({ value: item.id, label: item.label }))}
        />
        <CalcInput
          label="Value"
          value={fields.value}
          onChange={(value) => setFields({ value })}
        />
        <CalcSelect
          label="From"
          value={from}
          onChange={(value) => setFields({ from: value })}
          options={unitOptions}
        />
        <CalcSelect
          label="To"
          value={to}
          onChange={(value) => setFields({ to: value })}
          options={unitOptions}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={calculate}
          className="w-full rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
        >
          Convert
        </button>
        <button
          type="button"
          onClick={() => setFields({ from: to, to: from })}
          className="w-full rounded-lg border border-surface-300 px-5 py-3 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800 sm:w-auto"
        >
          Swap units
        </button>
      </div>
      {result && (
        <>
          <CalcResult value={result} />
          <WorkSteps steps={steps} />
        </>
      )}
    </div>
  );
}

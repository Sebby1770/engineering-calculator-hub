import { CategoryInfo } from "@/types";

// NOTE: visual category icons are the SVG line icons in
// `src/components/ui/CategoryIcon.tsx`. The `icon` strings here are plain-text
// fallbacks only (kept for data completeness; not rendered in the UI).
export const categories: CategoryInfo[] = [
  {
    id: "mechanical",
    name: "Mechanical Engineering",
    description: "Beams, gears, shafts, springs, and machine-element formulas",
    icon: "M",
    color: "from-orange-500 to-amber-700",
  },
  {
    id: "civil",
    name: "Civil & Structural",
    description: "Open-channel flow, buckling, runoff, and section properties",
    icon: "C",
    color: "from-stone-500 to-zinc-700",
  },
  {
    id: "thermofluids",
    name: "Thermofluids",
    description: "Ideal gas, Bernoulli, pipe friction, Carnot, and heat exchangers",
    icon: "T",
    color: "from-cyan-500 to-sky-700",
  },
  {
    id: "materials",
    name: "Materials & Chemical",
    description: "Reynolds number, dilution, thermal expansion, and stress–strain",
    icon: "χ",
    color: "from-teal-500 to-emerald-700",
  },
  {
    id: "electrical",
    name: "Electrical Engineering",
    description: "Circuit analysis, resistors, power, and voltage calculations",
    icon: "E",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Scientific calculations, number systems, and logarithms",
    icon: "M",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "calculus",
    name: "Calculus",
    description: "Derivatives, integrals, limits, and differential equations",
    icon: "∫",
    color: "from-cyan-500 to-sky-600",
  },
  {
    id: "geometry",
    name: "Geometry",
    description: "Triangles, circles, volumes, distances, and spatial formulas",
    icon: "△",
    color: "from-lime-500 to-green-600",
  },
  {
    id: "linear_algebra",
    name: "Linear Algebra",
    description: "Matrices, determinants, inverses, eigenvalues, and vector math",
    icon: "A",
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Energy, frequency, wavelength, and wave calculations",
    icon: "P",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "conversions",
    name: "Conversions",
    description: "Unit conversions between dB, voltage, frequency, and period",
    icon: "C",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "signals",
    name: "Signals & Systems",
    description: "Signal processing, Fourier transforms, and filter design",
    icon: "S",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "digital",
    name: "Digital & Networking",
    description: "Binary, Boolean algebra, and IPv4 subnetting",
    icon: "D",
    color: "from-sky-500 to-cyan-600",
  },
];

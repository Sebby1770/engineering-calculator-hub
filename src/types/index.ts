export type Category =
  | "electrical"
  | "mathematics"
  | "calculus"
  | "geometry"
  | "linear_algebra"
  | "physics"
  | "conversions"
  | "signals";

export interface CalculatorMeta {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: Category;
  icon: string;
  keywords: string[];
  popular?: boolean;
  new?: boolean;
  /** Mark a calculator as part of the paid Pro tier (gated behind a subscription). */
  pro?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CalculatorConfig {
  meta: CalculatorMeta;
  formula: string;
  formulaExplanation: string;
  exampleUsage: string;
  faqs: FAQ[];
  relatedSlugs: string[];
  quality?: {
    label: string;
    summary: string;
    lastReviewed: string;
  };
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

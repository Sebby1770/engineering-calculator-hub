import { CalculatorConfig } from "@/types";

export const digitalCalculators: CalculatorConfig[] = [
  {
    meta: {
      slug: "binary-calculator",
      title: "Binary Calculator – Bitwise Ops, Two’s Complement & Base Convert",
      shortTitle: "Binary",
      description:
        "Convert between binary, hex, decimal, and octal with grouped bits, run AND/OR/XOR/NOT/shifts at 8–64 bits, and encode signed values as two’s complement.",
      category: "digital",
      icon: "01",
      keywords: [
        "binary calculator",
        "bitwise and or xor",
        "two's complement",
        "hex converter",
        "bit shift",
      ],
      popular: true,
      new: true,
    },
    formula: "A ∧ B,  A ∨ B,  A ⊕ B,  ¬A,  A ≪ n   (width-masked)",
    formulaExplanation:
      "Each operation is performed on a fixed-width unsigned bit pattern (8, 16, 32, or 64 bits). NOT and NAND/NOR mask the result back to that width. Two’s complement interprets the same pattern as a signed integer: the high bit is the sign, and negative values are stored as the bitwise inverse of the magnitude plus one.",
    exampleUsage:
      "8-bit AND of 12 and 10 is 8 (0000 1100 ∧ 0000 1010 = 0000 1000). Two’s complement of −1 in 8 bits is 1111 1111.",
    faqs: [
      {
        question: "How is this different from the base converter?",
        answer:
          "The base converter is a quick radix swap. This tool adds bit width, nibble grouping, bitwise operators, shifts, and two’s-complement signed encoding used in digital design and C integers.",
      },
      {
        question: "What happens if a value does not fit the width?",
        answer:
          "Convert and bitwise modes wrap to the selected width (modulo 2^n). Two’s complement mode rejects values outside the signed range so the pattern stays well-defined.",
      },
    ],
    relatedSlugs: [
      "binary-hex-decimal-converter",
      "boolean-algebra-calculator",
      "ip-subnet-calculator",
    ],
    quality: {
      label: "Automated reference cases",
      summary: "Base conversion, bitwise masking, and two’s-complement encodings are covered by unit tests.",
      lastReviewed: "20 August 2026",
    },
  },
  {
    meta: {
      slug: "boolean-algebra-calculator",
      title: "Boolean Algebra Calculator – Truth Table & SOP Simplification",
      shortTitle: "Boolean Algebra",
      description:
        "Build a truth table and simplify Boolean expressions to minimal sum-of-products with Quine–McCluskey. Supports AND/OR/NOT/XOR/NAND/NOR and juxtaposition (AB).",
      category: "digital",
      icon: "F",
      keywords: [
        "boolean algebra",
        "truth table",
        "quine mccluskey",
        "sum of products",
        "logic simplification",
        "karnaugh",
      ],
      popular: true,
      new: true,
    },
    formula: "F = Σ m(i)  →  minimal SOP",
    formulaExplanation:
      "The expression is evaluated for every assignment of up to six variables. 1-output rows become minterms. Quine–McCluskey combines minterms that differ by a single bit into prime implicants, then a covering step selects a compact sum-of-products. Canonical SOP/POS are listed alongside the reduced form.",
    exampleUsage:
      "A + A'B simplifies to A + B. AB + A'B simplifies to B. A XOR A is 0; A + A' is 1.",
    faqs: [
      {
        question: "What syntax is accepted?",
        answer:
          "Variables A–F. AND is juxtaposition or AND, ·, *, &. OR is +, |, OR. NOT is prefix !, ~, NOT or postfix '. XOR, NAND, and NOR are infix. Parentheses group as usual.",
      },
      {
        question: "Why is there a six-variable limit?",
        answer:
          "A truth table for n variables has 2^n rows. Six variables is 64 rows — enough for typical gate-level homework without generating huge tables in the browser.",
      },
    ],
    relatedSlugs: ["binary-calculator", "ip-subnet-calculator", "equation-solver-calculator"],
    quality: {
      label: "Automated reference cases",
      summary: "Parser, truth tables, and classic identities (A + A'B = A + B) are unit-tested.",
      lastReviewed: "20 August 2026",
    },
  },
  {
    meta: {
      slug: "ip-subnet-calculator",
      title: "IP Subnet Calculator – CIDR, Host Range, Equal Splits & VLSM",
      shortTitle: "IP Subnetting",
      description:
        "IPv4 CIDR calculator: network, broadcast, mask, wildcard, host range, class, and RFC 1918 kind. Split a block into equal prefixes or carve VLSM from a host list.",
      category: "digital",
      icon: "/24",
      keywords: [
        "ip subnet calculator",
        "cidr",
        "vlsm",
        "subnet mask",
        "wildcard mask",
        "ccna",
      ],
      popular: true,
      new: true,
    },
    formula: "network = IP ∧ mask    broadcast = network ∨ ¬mask",
    formulaExplanation:
      "A prefix length /n is a 32-bit mask with n leading ones. The network address is the IP with host bits cleared; the broadcast is the network with host bits set. Usable hosts are the interior addresses except on /31 (RFC 3021 point-to-point, two usable) and /32 (single host). VLSM allocates largest host requirements first, aligned to each subnet size.",
    exampleUsage:
      "192.168.1.10/24 → network 192.168.1.0, broadcast 192.168.1.255, hosts 192.168.1.1–254 (254 usable). Splitting that /24 into /26 yields .0, .64, .128, and .192.",
    faqs: [
      {
        question: "Does this support IPv6?",
        answer:
          "This tool is IPv4-only so CIDR, masks, and VLSM match CCNA-style problems exactly. IPv6 uses a different prefix model without broadcast addresses.",
      },
      {
        question: "How are /31 and /32 handled?",
        answer:
          "/31 follows RFC 3021: both addresses are usable on a point-to-point link. /32 is a host route — network, broadcast, and the host are the same address.",
      },
    ],
    relatedSlugs: ["binary-calculator", "boolean-algebra-calculator", "binary-hex-decimal-converter"],
    quality: {
      label: "Automated reference cases",
      summary: "Classful lookup, /24–/32 edges, equal splits, and a VLSM carve are covered by tests.",
      lastReviewed: "20 August 2026",
    },
  },
];

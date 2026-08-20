/**
 * Boolean algebra: parse, truth table, and Quine–McCluskey simplification.
 * Supports up to 6 variables. AND is juxtaposition or · * & ∧ AND.
 * OR is + | ∨ OR. NOT is ! ~ ¬ NOT or postfix '. XOR / NAND / NOR are infix.
 */

export type WorkStep = { label: string; value: string };

type TokenType =
  | "var"
  | "const"
  | "and"
  | "or"
  | "xor"
  | "nand"
  | "nor"
  | "not"
  | "lparen"
  | "rparen"
  | "postnot";

type Token = { type: TokenType; value?: string };

type Node =
  | { kind: "var"; name: string }
  | { kind: "const"; value: boolean }
  | { kind: "not"; child: Node }
  | { kind: "and" | "or" | "xor" | "nand" | "nor"; left: Node; right: Node };

const WORD_OPS: Record<string, TokenType> = {
  AND: "and",
  OR: "or",
  XOR: "xor",
  NAND: "nand",
  NOR: "nor",
  NOT: "not",
};

export function tokenizeBoolean(source: string): Token[] {
  const input = String(source ?? "").trim();
  if (!input) throw new Error("Enter a Boolean expression.");
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i += 1;
      continue;
    }
    if (ch === "'") {
      tokens.push({ type: "postnot" });
      i += 1;
      continue;
    }
    if (ch === "0" || ch === "1") {
      tokens.push({ type: "const", value: ch });
      i += 1;
      continue;
    }
    if ("+|&∨".includes(ch) || input.startsWith("||", i)) {
      tokens.push({ type: "or" });
      i += ch === "|" && input[i + 1] === "|" ? 2 : 1;
      continue;
    }
    if ("*&·∧".includes(ch) || input.startsWith("&&", i)) {
      tokens.push({ type: "and" });
      i += ch === "&" && input[i + 1] === "&" ? 2 : 1;
      continue;
    }
    if (ch === "^" || ch === "⊕") {
      tokens.push({ type: "xor" });
      i += 1;
      continue;
    }
    if ("!~¬".includes(ch)) {
      tokens.push({ type: "not" });
      i += 1;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i + 1;
      while (j < input.length && /[A-Za-z]/.test(input[j])) j += 1;
      const word = input.slice(i, j).toUpperCase();
      if (WORD_OPS[word]) {
        tokens.push({ type: WORD_OPS[word] });
        i = j;
        continue;
      }
      // Juxtaposition: AB means A AND B. Reserved words above stay intact.
      for (const letter of word) {
        tokens.push({ type: "var", value: letter });
      }
      i = j;
      continue;
    }
    throw new Error(`Unexpected character "${ch}".`);
  }

  if (tokens.length === 0) throw new Error("Enter a Boolean expression.");
  return tokens;
}

function parse(tokens: Token[]): { ast: Node; vars: string[] } {
  let pos = 0;
  const vars = new Set<string>();

  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const at = (type: TokenType) => peek()?.type === type;

  function applyPostfix(node: Node): Node {
    while (at("postnot")) {
      take();
      node = { kind: "not", child: node };
    }
    return node;
  }

  function parseFactor(): Node {
    const tok = peek();
    if (!tok) throw new Error("Expression ended unexpectedly.");
    if (tok.type === "var" && tok.value) {
      take();
      vars.add(tok.value);
      return applyPostfix({ kind: "var", name: tok.value });
    }
    if (tok.type === "const") {
      take();
      return applyPostfix({ kind: "const", value: tok.value === "1" });
    }
    if (tok.type === "lparen") {
      take();
      const inner = parseOr();
      if (!at("rparen")) throw new Error("Missing closing parenthesis.");
      take();
      return applyPostfix(inner);
    }
    throw new Error("Expected a variable, constant, or parenthesis.");
  }

  function parseNot(): Node {
    if (at("not")) {
      take();
      return { kind: "not", child: parseNot() };
    }
    return parseFactor();
  }

  function isAndStart(tok?: Token): boolean {
    if (!tok) return false;
    return tok.type === "var" || tok.type === "const" || tok.type === "lparen" || tok.type === "not";
  }

  function parseAnd(): Node {
    let node = parseNot();
    while (true) {
      if (at("nand")) {
        take();
        node = { kind: "nand", left: node, right: parseNot() };
        continue;
      }
      if (at("and")) {
        take();
        node = { kind: "and", left: node, right: parseNot() };
        continue;
      }
      if (isAndStart(peek())) {
        node = { kind: "and", left: node, right: parseNot() };
        continue;
      }
      break;
    }
    return node;
  }

  function parseXor(): Node {
    let node = parseAnd();
    while (at("xor")) {
      take();
      node = { kind: "xor", left: node, right: parseAnd() };
    }
    return node;
  }

  function parseOr(): Node {
    let node = parseXor();
    while (at("or") || at("nor")) {
      const op = take().type;
      node = { kind: op === "nor" ? "nor" : "or", left: node, right: parseXor() };
    }
    return node;
  }

  const ast = parseOr();
  if (pos !== tokens.length) throw new Error("Unexpected extra tokens after the expression.");
  const names = [...vars].sort();
  if (names.length > 6) throw new Error("Simplification supports at most 6 variables (A–F).");
  return { ast, vars: names };
}

function evalNode(node: Node, env: Record<string, boolean>): boolean {
  switch (node.kind) {
    case "var":
      return env[node.name];
    case "const":
      return node.value;
    case "not":
      return !evalNode(node.child, env);
    case "and":
      return evalNode(node.left, env) && evalNode(node.right, env);
    case "or":
      return evalNode(node.left, env) || evalNode(node.right, env);
    case "xor":
      return evalNode(node.left, env) !== evalNode(node.right, env);
    case "nand":
      return !(evalNode(node.left, env) && evalNode(node.right, env));
    case "nor":
      return !(evalNode(node.left, env) || evalNode(node.right, env));
  }
}

export type TruthRow = {
  index: number;
  bits: boolean[];
  value: boolean;
};

export type TruthTable = {
  vars: string[];
  rows: TruthRow[];
  minterms: number[];
  maxterms: number[];
};

export function truthTable(expression: string): TruthTable {
  const { ast, vars } = parse(tokenizeBoolean(expression));
  if (vars.length === 0) {
    const value = evalNode(ast, {});
    return {
      vars: [],
      rows: [{ index: 0, bits: [], value }],
      minterms: value ? [0] : [],
      maxterms: value ? [] : [0],
    };
  }
  const n = 1 << vars.length;
  const rows: TruthRow[] = [];
  const minterms: number[] = [];
  const maxterms: number[] = [];
  for (let i = 0; i < n; i += 1) {
    const env: Record<string, boolean> = {};
    const bits: boolean[] = [];
    for (let b = 0; b < vars.length; b += 1) {
      const bit = ((i >> (vars.length - 1 - b)) & 1) === 1;
      bits.push(bit);
      env[vars[b]] = bit;
    }
    const value = evalNode(ast, env);
    rows.push({ index: i, bits, value });
    if (value) minterms.push(i);
    else maxterms.push(i);
  }
  return { vars, rows, minterms, maxterms };
}

function bitCount(n: number): number {
  let c = 0;
  while (n) {
    n &= n - 1;
    c += 1;
  }
  return c;
}

function termToLiteral(mask: number, dash: number, vars: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < vars.length; i += 1) {
    const bit = 1 << (vars.length - 1 - i);
    if (dash & bit) continue;
    parts.push(mask & bit ? vars[i] : `${vars[i]}'`);
  }
  return parts.length ? parts.join("") : "1";
}

function quineMcCluskey(minterms: number[], varCount: number): { primes: { mask: number; dash: number }[]; steps: WorkStep[] } {
  const steps: WorkStep[] = [];
  if (minterms.length === 0) return { primes: [], steps };
  const full = 1 << varCount;
  if (minterms.length === full) {
    steps.push({ label: "Tautology", value: "Every minterm is 1" });
    return { primes: [{ mask: 0, dash: full - 1 }], steps };
  }

  type Imp = { mask: number; dash: number; terms: number[]; used: boolean };
  let current: Imp[] = minterms.map((m) => ({ mask: m, dash: 0, terms: [m], used: false }));
  const primes: Imp[] = [];
  let stage = 0;

  while (current.length) {
    const next: Imp[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < current.length; i += 1) {
      for (let j = i + 1; j < current.length; j += 1) {
        const a = current[i];
        const b = current[j];
        if (a.dash !== b.dash) continue;
        const diff = a.mask ^ b.mask;
        if (bitCount(diff) !== 1) continue;
        a.used = true;
        b.used = true;
        const combined: Imp = {
          mask: a.mask & b.mask,
          dash: a.dash | diff,
          terms: [...new Set([...a.terms, ...b.terms])].sort((x, y) => x - y),
          used: false,
        };
        const key = `${combined.mask}/${combined.dash}`;
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(combined);
      }
    }
    for (const imp of current) {
      if (!imp.used) primes.push(imp);
    }
    if (next.length) {
      stage += 1;
      steps.push({
        label: `Combine pass ${stage}`,
        value: next.map((imp) => `m(${imp.terms.join(",")})`).join("  "),
      });
    }
    current = next;
  }

  return { primes: primes.map(({ mask, dash }) => ({ mask, dash })), steps };
}

function covers(prime: { mask: number; dash: number }, minterm: number): boolean {
  return (minterm & ~prime.dash) === (prime.mask & ~prime.dash);
}

function coverPrimes(
  primes: { mask: number; dash: number }[],
  minterms: number[],
): { mask: number; dash: number }[] {
  const remaining = new Set(minterms);
  const chosen: { mask: number; dash: number }[] = [];
  const unused = primes.slice();

  while (remaining.size) {
    let essential: { mask: number; dash: number } | null = null;
    for (const m of remaining) {
      const hits = unused.filter((p) => covers(p, m));
      if (hits.length === 1) {
        essential = hits[0];
        break;
      }
    }
    const pick =
      essential ??
      unused.reduce<{ mask: number; dash: number; score: number } | null>((best, p) => {
        let score = 0;
        for (const m of remaining) if (covers(p, m)) score += 1;
        if (!best || score > best.score) return { ...p, score };
        return best;
      }, null);

    if (!pick || ("score" in pick && pick.score === 0)) break;
    const { mask, dash } = pick;
    chosen.push({ mask, dash });
    for (const m of [...remaining]) {
      if (covers({ mask, dash }, m)) remaining.delete(m);
    }
    const idx = unused.findIndex((p) => p.mask === mask && p.dash === dash);
    if (idx >= 0) unused.splice(idx, 1);
  }

  return chosen;
}

export type BooleanSimplifyResult = {
  vars: string[];
  minterms: number[];
  maxterms: number[];
  sop: string;
  canonicalSop: string;
  canonicalPos: string;
  steps: WorkStep[];
};

function canonicalTerm(index: number, vars: string[], asMinterm: boolean): string {
  return vars
    .map((name, i) => {
      const bit = ((index >> (vars.length - 1 - i)) & 1) === 1;
      const on = asMinterm ? bit : !bit;
      return on ? name : `${name}'`;
    })
    .join(asMinterm ? "" : " + ");
}

export function simplifyBoolean(expression: string): BooleanSimplifyResult {
  const table = truthTable(expression);
  const { vars, minterms, maxterms } = table;
  const steps: WorkStep[] = [
    { label: "Expression", value: expression.trim() },
    { label: "Variables", value: vars.length ? vars.join(", ") : "(none)" },
    { label: "Minterms", value: minterms.length ? minterms.map((m) => `m${m}`).join(", ") : "none" },
  ];

  if (vars.length === 0) {
    const sop = minterms.length ? "1" : "0";
    return {
      vars,
      minterms,
      maxterms,
      sop,
      canonicalSop: sop,
      canonicalPos: sop === "1" ? "1" : "0",
      steps,
    };
  }

  const { primes, steps: qmSteps } = quineMcCluskey(minterms, vars.length);
  steps.push(...qmSteps);
  const covered = coverPrimes(primes, minterms).slice().sort((a, b) =>
    termToLiteral(a.mask, a.dash, vars).localeCompare(termToLiteral(b.mask, b.dash, vars)),
  );
  const sop = minterms.length === 0
    ? "0"
    : minterms.length === (1 << vars.length)
      ? "1"
      : covered.map((p) => termToLiteral(p.mask, p.dash, vars)).join(" + ") || "0";

  const canonicalSop = minterms.length === 0
    ? "0"
    : minterms.length === (1 << vars.length)
      ? "1"
      : minterms.map((m) => canonicalTerm(m, vars, true)).join(" + ");

  const canonicalPos = maxterms.length === 0
    ? "1"
    : maxterms.length === (1 << vars.length)
      ? "0"
      : maxterms.map((m) => `(${canonicalTerm(m, vars, false)})`).join("");

  steps.push({ label: "Prime implicants", value: primes.map((p) => termToLiteral(p.mask, p.dash, vars)).join(" + ") || "∅" });
  steps.push({ label: "Minimal SOP", value: sop });

  return { vars, minterms, maxterms, sop, canonicalSop, canonicalPos, steps };
}

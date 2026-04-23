// ============================================================
// CYK ALGORITHM — Cocke–Younger–Kasami
// Requires grammar in Chomsky Normal Form (CNF)
// ============================================================

export interface CFGRule {
  lhs: string;    // non-terminal
  rhs: string[];  // 1 terminal OR 2 non-terminals
}

export interface CYKStep {
  stepIndex: number;
  description: string;
  table: string[][][];  // table[i][j] = list of non-terminals
  filledCell?: { i: number; j: number };
  accepted?: boolean;
}

export function convertToCNF(rules: CFGRule[]): CFGRule[] {
  // Simple CNF conversion (for demo purposes)
  // Real impl would handle: UNIT rules, ε rules, long rules
  return rules.filter(r => r.rhs.length === 1 || r.rhs.length === 2);
}

export function* cykAlgorithm(
  rules: CFGRule[],
  input: string,
  startSymbol: string = 'S'
): Generator<CYKStep> {
  const n = input.length;
  const symbols = input.split('');

  // table[i][j] = set of non-terminals that derive substring s[i..i+j]
  const table: Set<string>[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => new Set<string>())
  );

  const toDisplay = (): string[][][] =>
    table.map(row => row.map(cell => [...cell]));

  // Fill diagonal (length-1 substrings)
  for (let i = 0; i < n; i++) {
    for (const rule of rules) {
      if (rule.rhs.length === 1 && rule.rhs[0] === symbols[i]) {
        table[i][i].add(rule.lhs);
      }
    }
    yield {
      stepIndex: i,
      description: `Cell [${i}][${i}]: '${symbols[i]}' → {${[...table[i][i]].join(', ')}}`,
      table: toDisplay(),
      filledCell: { i, j: i },
    };
  }

  // Fill rest of table (by substring length)
  let stepIdx = n;
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      for (let k = i; k < j; k++) {
        for (const rule of rules) {
          if (rule.rhs.length === 2) {
            const [B, C] = rule.rhs;
            if (table[i][k].has(B) && table[k + 1][j].has(C)) {
              table[i][j].add(rule.lhs);
            }
          }
        }
      }
      yield {
        stepIndex: stepIdx++,
        description: `Cell [${i}][${j}] (substring "${symbols.slice(i, j+1).join('')}"): {${[...table[i][j]].join(', ') || '∅'}}`,
        table: toDisplay(),
        filledCell: { i, j },
      };
    }
  }

  const accepted = table[0][n - 1].has(startSymbol);
  yield {
    stepIndex: stepIdx,
    description: accepted
      ? `✅ String "${input}" is IN the language (${startSymbol} ∈ table[0][${n-1}])`
      : `❌ String "${input}" is NOT in the language`,
    table: toDisplay(),
    accepted,
  };
}

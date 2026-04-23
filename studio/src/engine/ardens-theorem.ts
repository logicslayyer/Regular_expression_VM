// ============================================================
// ARDEN'S THEOREM SOLVER
// Derives regular expression from DFA transition equations
// ============================================================

import { DFA } from './subset-construction';

export interface ArdenStep {
  stepIndex: number;
  description: string;
  equations: { state: string; equation: string }[];
  substituting?: string;
  result?: string;
}

export function* ardensTheoremSteps(dfa: DFA): Generator<ArdenStep> {
  const steps: ArdenStep[] = [];
  const states = dfa.states.map(s => s.id);

  // Build initial equations: X_i = union of (a * X_j) for each transition
  // Plus ε if start or accepting
  const equations = new Map<string, string[]>();
  for (const s of states) equations.set(s, []);

  // Add ε for start state (it can "be reached" trivially)
  if (dfa.acceptingStates.includes(dfa.startState)) {
    equations.get(dfa.startState)!.push('ε');
  }

  // Add transitions in reverse: each transition q--a-->p means p has term (a·X_q) ? 
  // Actually Arden's: X_q = Σ_sym (sym · X_{δ(q,sym)}) ∪ (ε if accepting)
  for (const s of states) {
    const terms: string[] = [];
    for (const t of dfa.transitions) {
      if (t.from === s) {
        terms.push(`${t.symbol}·X${t.to}`);
      }
    }
    if (dfa.acceptingStates.includes(s)) terms.push('ε');
    equations.set(s, terms);
  }

  const eqDisplay = () =>
    states.map(s => ({ state: s, equation: `X${s} = ${equations.get(s)!.join(' ∪ ') || '∅'}` }));

  yield {
    stepIndex: 0,
    description: 'Initial system of equations from DFA transitions',
    equations: eqDisplay(),
  };

  // Apply Arden's Lemma: X = AX ∪ B  ⟹  X = A*B
  // Eliminate variables by substitution (simplified for demo)
  const results = new Map<string, string>();

  for (const s of states) {
    const terms = equations.get(s)!;
    // Check for self-loop: term containing X_s itself
    const selfTerms = terms.filter(t => t.includes(`X${s}`));
    const otherTerms = terms.filter(t => !t.includes(`X${s}`));

    let equation = '';
    if (selfTerms.length > 0) {
      // Extract coefficient A (the symbols before X_s)
      const A = selfTerms.map(t => t.replace(`·X${s}`, '')).join('|');
      const B = otherTerms.join(' ∪ ') || 'ε';
      equation = `(${A})*·(${B})`;
      yield {
        stepIndex: steps.length + 1,
        description: `X${s} = (${A})*·(${B})  [Arden's Lemma: X = A*B where A = ${A}, B = ${B}]`,
        equations: eqDisplay(),
        substituting: s,
        result: equation,
      };
    } else {
      equation = otherTerms.join(' ∪ ') || 'ε';
    }
    results.set(s, equation);
  }

  // Final result is the equation for the start state
  const finalRE = results.get(dfa.startState) || 'ε';
  yield {
    stepIndex: steps.length + 2,
    description: `Final Regular Expression (from start state): ${finalRE}`,
    equations: states.map(s => ({ state: s, equation: results.get(s) || 'ε' })),
    result: finalRE,
  };
}

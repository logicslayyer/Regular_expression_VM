// ============================================================
// DFA MINIMIZATION — Table-Filling Algorithm (Myhill-Nerode)
// ============================================================

import { DFA, DFAState, DFATransition } from './subset-construction';

export interface MinimizationStep {
  stepIndex: number;
  description: string;
  markedPairs: [string, string][];
  currentPair?: [string, string];
  reason?: string;
  minimizedDFA?: DFA;
}

export function minimizeDFA(dfa: DFA): { minimizedDFA: DFA; steps: MinimizationStep[] } {
  const steps: MinimizationStep[] = [];
  const states = dfa.states;
  const n = states.length;

  // Build table of pairs
  const marked = new Map<string, boolean>();
  const pairKey = (a: string, b: string) => [a, b].sort().join('::');

  // Step 1: Mark (accepting, non-accepting) pairs
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = states[i], b = states[j];
      const key = pairKey(a.id, b.id);
      if (a.isAccepting !== b.isAccepting) {
        marked.set(key, true);
        steps.push({
          stepIndex: steps.length,
          description: `Mark (${a.id}, ${b.id}) — one is accepting, one is not`,
          markedPairs: [...marked.entries()].filter(e=>e[1]).map(e => e[0].split('::') as [string,string]),
          currentPair: [a.id, b.id],
          reason: 'Accepting/non-accepting distinction',
        });
      } else {
        marked.set(key, false);
      }
    }
  }

  // Step 2: Iteratively mark distinguishable pairs
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = states[i], b = states[j];
        const key = pairKey(a.id, b.id);
        if (marked.get(key)) continue;

        for (const sym of dfa.alphabet) {
          const ta = dfa.transitions.find(t => t.from === a.id && t.symbol === sym)?.to;
          const tb = dfa.transitions.find(t => t.from === b.id && t.symbol === sym)?.to;
          if (!ta || !tb) continue;
          if (ta === tb) continue;
          const targetKey = pairKey(ta, tb);
          if (marked.get(targetKey)) {
            marked.set(key, true);
            changed = true;
            steps.push({
              stepIndex: steps.length,
              description: `Mark (${a.id}, ${b.id}) — δ(·,${sym}) leads to marked pair (${ta},${tb})`,
              markedPairs: [...marked.entries()].filter(e=>e[1]).map(e => e[0].split('::') as [string,string]),
              currentPair: [a.id, b.id],
              reason: `Distinguished by symbol '${sym}'`,
            });
            break;
          }
        }
      }
    }
  }

  // Step 3: Merge equivalent states
  const unmarkedPairs: [string, string][] = [];
  for (const [key, isMarked] of marked.entries()) {
    if (!isMarked) {
      const [a, b] = key.split('::') as [string, string];
      unmarkedPairs.push([a, b]);
    }
  }

  // Union-Find to group equivalent states
  const parent = new Map<string, string>();
  states.forEach(s => parent.set(s.id, s.id));

  function find(x: string): string {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  }
  function union(a: string, b: string) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const [a, b] of unmarkedPairs) union(a, b);

  // Build minimized DFA
  const groupMap = new Map<string, string[]>();
  for (const s of states) {
    const rep = find(s.id);
    if (!groupMap.has(rep)) groupMap.set(rep, []);
    groupMap.get(rep)!.push(s.id);
  }

  const minStates: DFAState[] = [];
  const minTransitions: DFATransition[] = [];
  let minStateIdx = 0;
  const groupIdMap = new Map<string, string>();

  for (const [rep, group] of groupMap.entries()) {
    const repState = states.find(s => s.id === rep)!;
    const minId = `q${minStateIdx++}`;
    groupIdMap.set(rep, minId);
    minStates.push({
      id: minId,
      label: `{${group.join(',')}}`,
      nfaStates: group,
      isStart: group.includes(dfa.startState),
      isAccepting: group.some(id => dfa.acceptingStates.includes(id)),
    });
  }

  // Build transitions
  const seen = new Set<string>();
  for (const t of dfa.transitions) {
    const fromRep = find(t.from);
    const toRep = find(t.to);
    const fromId = groupIdMap.get(fromRep)!;
    const toId = groupIdMap.get(toRep)!;
    const key = `${fromId}-${t.symbol}-${toId}`;
    if (!seen.has(key)) {
      seen.add(key);
      minTransitions.push({ from: fromId, to: toId, symbol: t.symbol });
    }
  }

  const minimizedDFA: DFA = {
    states: minStates,
    alphabet: dfa.alphabet,
    transitions: minTransitions,
    startState: groupIdMap.get(find(dfa.startState))!,
    acceptingStates: minStates.filter(s => s.isAccepting).map(s => s.id),
  };

  steps.push({
    stepIndex: steps.length,
    description: `Minimization complete — ${dfa.states.length} states → ${minStates.length} states`,
    markedPairs: [...marked.entries()].filter(e=>e[1]).map(e => e[0].split('::') as [string,string]),
    minimizedDFA,
  });

  return { minimizedDFA, steps };
}

export function* minimizationSteps(dfa: DFA): Generator<MinimizationStep> {
  const { steps } = minimizeDFA(dfa);
  for (const step of steps) yield step;
}

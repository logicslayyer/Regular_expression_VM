// ============================================================
// SUBSET CONSTRUCTION — NFA → DFA
// ============================================================

import { NFA, NFATransition } from './thompson';

export interface DFAState {
  id: string;
  label: string;         // e.g., "{q0, q2}"
  nfaStates: string[];   // which NFA states it combines
  isStart: boolean;
  isAccepting: boolean;
}

export interface DFATransition {
  from: string;
  to: string;
  symbol: string;
}

export interface DFA {
  states: DFAState[];
  alphabet: string[];
  transitions: DFATransition[];
  startState: string;
  acceptingStates: string[];
}

export interface SubsetStep {
  stepIndex: number;
  description: string;
  currentSubset: string[];
  newSubset?: string[];
  symbol?: string;
  dfa: DFA;
}

// Compute ε-closure via BFS
export function epsilonClosure(states: string[], transitions: NFATransition[]): string[] {
  const closure = new Set(states);
  const queue = [...states];
  while (queue.length > 0) {
    const state = queue.shift()!;
    for (const t of transitions) {
      if (t.from === state && t.symbol === 'ε' && !closure.has(t.to)) {
        closure.add(t.to);
        queue.push(t.to);
      }
    }
  }
  return [...closure].sort();
}

// Compute move(states, symbol)
export function move(states: string[], symbol: string, transitions: NFATransition[]): string[] {
  const result = new Set<string>();
  for (const state of states) {
    for (const t of transitions) {
      if (t.from === state && t.symbol === symbol) result.add(t.to);
    }
  }
  return [...result].sort();
}

function subsetKey(states: string[]): string {
  return '{' + [...states].sort().join(',') + '}';
}

let dfaStateCounter = 0;
function newDFAState(): string { return `q${dfaStateCounter++}`; }

export function buildDFA(nfa: NFA): DFA {
  dfaStateCounter = 0;
  const dfaStates: DFAState[] = [];
  const dfaTransitions: DFATransition[] = [];
  const subsetMap = new Map<string, string>(); // key → DFA state id
  const queue: string[][] = [];

  const startClosure = epsilonClosure([nfa.startState], nfa.transitions);
  const startKey = subsetKey(startClosure);
  const startId = newDFAState();
  subsetMap.set(startKey, startId);
  queue.push(startClosure);

  dfaStates.push({
    id: startId,
    label: startKey,
    nfaStates: startClosure,
    isStart: true,
    isAccepting: startClosure.some(s => nfa.acceptingStates.includes(s)),
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = subsetKey(current);
    const currentId = subsetMap.get(currentKey)!;

    for (const symbol of nfa.alphabet) {
      const moved = move(current, symbol, nfa.transitions);
      const closure = epsilonClosure(moved, nfa.transitions);
      if (closure.length === 0) {
        const deadKey = '{}';
        if (!subsetMap.has(deadKey)) {
          const deadId = newDFAState();
          subsetMap.set(deadKey, deadId);
          queue.push([]);
          dfaStates.push({
            id: deadId,
            label: 'Ø',
            nfaStates: [],
            isStart: false,
            isAccepting: false,
          });
        }
        dfaTransitions.push({
          from: currentId,
          to: subsetMap.get(deadKey)!,
          symbol,
        });
        continue;
      }

      const toKey = subsetKey(closure);
      if (!subsetMap.has(toKey)) {
        const newId = newDFAState();
        subsetMap.set(toKey, newId);
        queue.push(closure);
        dfaStates.push({
          id: newId,
          label: toKey,
          nfaStates: closure,
          isStart: false,
          isAccepting: closure.some(s => nfa.acceptingStates.includes(s)),
        });
      }

      dfaTransitions.push({
        from: currentId,
        to: subsetMap.get(toKey)!,
        symbol,
      });
    }
  }

  return {
    states: dfaStates,
    alphabet: nfa.alphabet,
    transitions: dfaTransitions,
    startState: startId,
    acceptingStates: dfaStates.filter(s => s.isAccepting).map(s => s.id),
  };
}

export function* subsetConstructionSteps(nfa: NFA): Generator<SubsetStep> {
  dfaStateCounter = 0;
  const yield_states: DFAState[] = [];
  const yield_transitions: DFATransition[] = [];
  const subsetMap = new Map<string, string>();
  const queue: string[][] = [];
  let stepIndex = 0;

  const startClosure = epsilonClosure([nfa.startState], nfa.transitions);
  const startKey = subsetKey(startClosure);
  const startId = newDFAState();
  subsetMap.set(startKey, startId);
  queue.push(startClosure);
  yield_states.push({
    id: startId, label: startKey, nfaStates: startClosure,
    isStart: true, isAccepting: startClosure.some(s => nfa.acceptingStates.includes(s)),
  });

  yield {
    stepIndex: stepIndex++,
    description: `Start: ε-closure({${nfa.startState}}) = ${startKey}`,
    currentSubset: startClosure,
    dfa: { states: [...yield_states], alphabet: nfa.alphabet, transitions: [...yield_transitions], startState: startId, acceptingStates: yield_states.filter(s=>s.isAccepting).map(s=>s.id) }
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = subsetKey(current);
    const currentId = subsetMap.get(currentKey)!;

    for (const symbol of nfa.alphabet) {
      const moved = move(current, symbol, nfa.transitions);
      const closure = epsilonClosure(moved, nfa.transitions);
      if (closure.length === 0) {
        const deadKey = '{}';
        let isNew = false;
        if (!subsetMap.has(deadKey)) {
          const deadId = newDFAState();
          subsetMap.set(deadKey, deadId);
          queue.push([]);
          isNew = true;
          yield_states.push({
            id: deadId, label: 'Ø', nfaStates: [],
            isStart: false, isAccepting: false,
          });
        }
        yield_transitions.push({ from: currentId, to: subsetMap.get(deadKey)!, symbol });

        yield {
          stepIndex: stepIndex++,
          description: `δ(${currentKey}, ${symbol}) = Ø${isNew ? ' [NEW DEAD STATE]' : ''}`,
          currentSubset: current,
          newSubset: [],
          symbol,
          dfa: { states: [...yield_states], alphabet: nfa.alphabet, transitions: [...yield_transitions], startState: startId, acceptingStates: yield_states.filter(s=>s.isAccepting).map(s=>s.id) }
        };
        continue;
      }

      const toKey = subsetKey(closure);
      let isNew = false;
      if (!subsetMap.has(toKey)) {
        const newId = newDFAState();
        subsetMap.set(toKey, newId);
        queue.push(closure);
        isNew = true;
        yield_states.push({
          id: newId, label: toKey, nfaStates: closure,
          isStart: false, isAccepting: closure.some(s => nfa.acceptingStates.includes(s)),
        });
      }

      yield_transitions.push({ from: currentId, to: subsetMap.get(toKey)!, symbol });

      yield {
        stepIndex: stepIndex++,
        description: `δ(${currentKey}, ${symbol}) = ε-closure(${toKey})${isNew ? ' [NEW STATE]' : ''}`,
        currentSubset: current,
        newSubset: closure,
        symbol,
        dfa: { states: [...yield_states], alphabet: nfa.alphabet, transitions: [...yield_transitions], startState: startId, acceptingStates: yield_states.filter(s=>s.isAccepting).map(s=>s.id) }
      };
    }
  }
}

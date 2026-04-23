// ============================================================
// THOMPSON'S CONSTRUCTION — ε-NFA from Parse Tree
// ============================================================

import { ParseNode, regexParser } from './regex-parser';

let stateCounter = 0;
export function resetStateCounter() { stateCounter = 0; }
function newState() { return `q${stateCounter++}`; }

export interface NFAState {
  id: string;
  isStart: boolean;
  isAccepting: boolean;
}

export interface NFATransition {
  from: string;
  to: string;
  symbol: string; // 'ε' for epsilon
}

export interface NFA {
  states: NFAState[];
  alphabet: string[];
  transitions: NFATransition[];
  startState: string;
  acceptingStates: string[];
}

interface Fragment {
  start: string;
  end: string;
  states: NFAState[];
  transitions: NFATransition[];
}

function buildFragment(node: ParseNode): Fragment {
  switch (node.type) {
    case 'EPSILON': {
      const s = newState(), e = newState();
      return {
        start: s, end: e,
        states: [
          { id: s, isStart: false, isAccepting: false },
          { id: e, isStart: false, isAccepting: false },
        ],
        transitions: [{ from: s, to: e, symbol: 'ε' }]
      };
    }

    case 'LITERAL': {
      const s = newState(), e = newState();
      return {
        start: s, end: e,
        states: [
          { id: s, isStart: false, isAccepting: false },
          { id: e, isStart: false, isAccepting: false },
        ],
        transitions: [{ from: s, to: e, symbol: node.value! }]
      };
    }

    case 'UNION': {
      const left = buildFragment(node.left!);
      const right = buildFragment(node.right!);
      const s = newState(), e = newState();
      return {
        start: s, end: e,
        states: [
          { id: s, isStart: false, isAccepting: false },
          { id: e, isStart: false, isAccepting: false },
          ...left.states, ...right.states
        ],
        transitions: [
          { from: s, to: left.start, symbol: 'ε' },
          { from: s, to: right.start, symbol: 'ε' },
          { from: left.end, to: e, symbol: 'ε' },
          { from: right.end, to: e, symbol: 'ε' },
          ...left.transitions, ...right.transitions
        ]
      };
    }

    case 'CONCAT': {
      const left = buildFragment(node.left!);
      const right = buildFragment(node.right!);
      return {
        start: left.start, end: right.end,
        states: [...left.states, ...right.states],
        transitions: [
          ...left.transitions,
          ...right.transitions,
          { from: left.end, to: right.start, symbol: 'ε' }
        ]
      };
    }

    case 'STAR': {
      const inner = buildFragment(node.child!);
      const s = newState(), e = newState();
      return {
        start: s, end: e,
        states: [
          { id: s, isStart: false, isAccepting: false },
          { id: e, isStart: false, isAccepting: false },
          ...inner.states
        ],
        transitions: [
          { from: s, to: inner.start, symbol: 'ε' },
          { from: s, to: e, symbol: 'ε' },
          { from: inner.end, to: inner.start, symbol: 'ε' },
          { from: inner.end, to: e, symbol: 'ε' },
          ...inner.transitions
        ]
      };
    }

    case 'PLUS': {
      // a+ = aa*
      const inner = buildFragment(node.child!);
      const inner2 = buildFragment({ type: 'STAR', child: node.child });
      return {
        start: inner.start, end: inner2.end,
        states: [...inner.states, ...inner2.states],
        transitions: [
          ...inner.transitions,
          ...inner2.transitions,
          { from: inner.end, to: inner2.start, symbol: 'ε' }
        ]
      };
    }

    case 'QUESTION': {
      const inner = buildFragment(node.child!);
      const s = newState(), e = newState();
      return {
        start: s, end: e,
        states: [
          { id: s, isStart: false, isAccepting: false },
          { id: e, isStart: false, isAccepting: false },
          ...inner.states
        ],
        transitions: [
          { from: s, to: inner.start, symbol: 'ε' },
          { from: s, to: e, symbol: 'ε' },
          { from: inner.end, to: e, symbol: 'ε' },
          ...inner.transitions
        ]
      };
    }

    default:
      throw new Error(`Unknown node type: ${(node as ParseNode).type}`);
  }
}

export function buildNFA(regex: string): NFA {
  resetStateCounter();
  const tree = regexParser.parse(regex);
  const frag = buildFragment(tree);

  // Mark start and accepting
  const states = frag.states.map(s => ({
    ...s,
    isStart: s.id === frag.start,
    isAccepting: s.id === frag.end,
  }));

  // Collect alphabet (exclude ε)
  const alphabet = [...new Set(
    frag.transitions.map(t => t.symbol).filter(s => s !== 'ε')
  )];

  return {
    states,
    alphabet,
    transitions: frag.transitions,
    startState: frag.start,
    acceptingStates: [frag.end],
  };
}

export interface ThompsonStep {
  stepIndex: number;
  description: string;
  highlightedStates: string[];
  highlightedTransitions: NFATransition[];
  nfa: NFA;
}

export function* thompsonSteps(regex: string): Generator<ThompsonStep> {
  const nfa = buildNFA(regex);
  const steps: ThompsonStep[] = [];

  // Step 1: show all states
  steps.push({
    stepIndex: 0,
    description: `Created ε-NFA with ${nfa.states.length} states using Thompson's Construction`,
    highlightedStates: [nfa.startState],
    highlightedTransitions: [],
    nfa,
  });

  // Step 2: highlight accepting state
  steps.push({
    stepIndex: 1,
    description: `Start state: ${nfa.startState} → Accepting state: ${nfa.acceptingStates[0]}`,
    highlightedStates: [...nfa.acceptingStates],
    highlightedTransitions: [],
    nfa,
  });

  // Step 3+: highlight each transition
  for (let i = 0; i < nfa.transitions.length; i++) {
    const t = nfa.transitions[i];
    steps.push({
      stepIndex: i + 2,
      description: `Transition: ${t.from} --[${t.symbol}]--> ${t.to}`,
      highlightedStates: [t.from, t.to],
      highlightedTransitions: [t],
      nfa,
    });
  }

  for (const step of steps) yield step;
}

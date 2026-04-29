// ============================================================
// PDA SIMULATOR — Pushdown Automaton
// ============================================================

export interface PDAState {
  id: string;
  isStart: boolean;
  isAccepting: boolean;
}

export interface PDATransition {
  from: string;
  to: string;
  input: string;   // input symbol or 'ε'
  pop: string;     // stack symbol to pop or 'ε'
  push: string[];  // stack symbols to push (top first), or []
}

export interface PDA {
  states: PDAState[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  transitions: PDATransition[];
  startState: string;
  startStackSymbol: string;
  acceptingStates: string[];
}

export interface PDAStep {
  stepIndex: number;
  description: string;
  currentState: string;
  stack: string[];
  remainingInput: string[];
  activeTransition?: PDATransition;
  accepted?: boolean;
  rejected?: boolean;
}

export function* pdaSimulate(pda: PDA, input: string): Generator<PDAStep> {
  const symbols = input.split('').filter(c => c.trim());
  let state = pda.startState;
  let stack: string[] = [pda.startStackSymbol];
  let remaining = [...symbols];
  let stepIdx = 0;

  yield {
    stepIndex: stepIdx++,
    description: `Initial: State=${state}, Stack=[${stack.join(',')}], Input=${remaining.join('')}`,
    currentState: state,
    stack: [...stack],
    remainingInput: [...remaining],
  };

  // BFS/DFS with bounded steps (prevent infinite loops)
  let maxSteps = 200;

  while (maxSteps-- > 0) {
    // Try to find a matching transition
    const inputSym = remaining[0] || 'ε';
    const stackTop = stack[stack.length - 1] || 'ε';

    let transition: PDATransition | undefined;

    // Priority: exact match > ε-input match
    transition = pda.transitions.find(t =>
      t.from === state &&
      (t.input === inputSym || t.input === 'ε') &&
      (t.pop === stackTop || t.pop === 'ε')
    );

    if (!transition) {
      const accepted = remaining.length === 0 &&
        (pda.acceptingStates.includes(state) || stack.length === 0);
      yield {
        stepIndex: stepIdx++,
        description: accepted ? '✅ Accepted! (no more transitions, in accepting state)' : '❌ Rejected — no valid transition',
        currentState: state,
        stack: [...stack],
        remainingInput: [...remaining],
        accepted,
        rejected: !accepted,
      };
      return;
    }

    // Apply transition
    if (transition.input !== 'ε') remaining.shift();
    if (transition.pop !== 'ε') stack.pop();
    for (let i = transition.push.length - 1; i >= 0; i--) {
      stack.push(transition.push[i]);
    }
    state = transition.to;

    yield {
      stepIndex: stepIdx++,
      description: `δ(${transition.from}, ${transition.input}, ${transition.pop}) = (${transition.to}, ${transition.push.join('')||'ε'})`,
      currentState: state,
      stack: [...stack],
      remainingInput: [...remaining],
      activeTransition: transition,
    };


  }

  yield {
    stepIndex: stepIdx,
    description: '⚠️ Simulation limit reached (possible infinite loop)',
    currentState: state,
    stack: [...stack],
    remainingInput: [...remaining],
    rejected: true,
  };
}

// Example PDA: accepts a^n b^n
export const examplePDA: PDA = {
  states: [
    { id: 'p0', isStart: true, isAccepting: false },
    { id: 'p1', isStart: false, isAccepting: false },
    { id: 'p2', isStart: false, isAccepting: true },
  ],
  inputAlphabet: ['a', 'b'],
  stackAlphabet: ['Z', 'A'],
  startState: 'p0',
  startStackSymbol: 'Z',
  acceptingStates: ['p2'],
  transitions: [
    { from: 'p0', to: 'p0', input: 'a', pop: 'Z', push: ['A', 'Z'] },
    { from: 'p0', to: 'p0', input: 'a', pop: 'A', push: ['A', 'A'] },
    { from: 'p0', to: 'p1', input: 'b', pop: 'A', push: [] },
    { from: 'p1', to: 'p1', input: 'b', pop: 'A', push: [] },
    { from: 'p1', to: 'p2', input: 'ε', pop: 'Z', push: ['Z'] },
  ],
};

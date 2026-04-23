// ============================================================
// TURING MACHINE INTERPRETER
// ============================================================

export interface TMState {
  id: string;
  isStart: boolean;
  isAccepting: boolean;
  isRejecting?: boolean;
}

export interface TMTransition {
  from: string;
  read: string;
  to: string;
  write: string;
  direction: 'L' | 'R' | 'S';
}

export interface TuringMachine {
  states: TMState[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  transitions: TMTransition[];
  startState: string;
  acceptState: string;
  rejectState: string;
  blankSymbol: string;
}

export interface TMStep {
  stepIndex: number;
  description: string;
  currentState: string;
  tape: string[];
  headPosition: number;
  activeTransition?: TMTransition;
  accepted?: boolean;
  rejected?: boolean;
}

const TAPE_SIZE = 40;

export function* tmSimulate(tm: TuringMachine, input: string): Generator<TMStep> {
  const tape: string[] = Array(TAPE_SIZE).fill(tm.blankSymbol);
  const offset = 5; // start writing at position 5
  input.split('').forEach((ch, i) => { tape[offset + i] = ch; });

  let state = tm.startState;
  let head = offset;
  let stepIdx = 0;

  yield {
    stepIndex: stepIdx++,
    description: `Initial config: State=${state}, Head at position ${head}, Input="${input}"`,
    currentState: state,
    tape: [...tape],
    headPosition: head,
  };

  let maxSteps = 500;

  while (maxSteps-- > 0) {
    if (state === tm.acceptState) {
      yield {
        stepIndex: stepIdx++,
        description: `✅ Machine entered ACCEPT state (${tm.acceptState})`,
        currentState: state,
        tape: [...tape],
        headPosition: head,
        accepted: true,
      };
      return;
    }
    if (state === tm.rejectState) {
      yield {
        stepIndex: stepIdx++,
        description: `❌ Machine entered REJECT state (${tm.rejectState})`,
        currentState: state,
        tape: [...tape],
        headPosition: head,
        rejected: true,
      };
      return;
    }

    const currentSymbol = tape[head] ?? tm.blankSymbol;
    const transition = tm.transitions.find(
      t => t.from === state && t.read === currentSymbol
    );

    if (!transition) {
      yield {
        stepIndex: stepIdx++,
        description: `❌ No transition for (${state}, '${currentSymbol}') — rejected`,
        currentState: state,
        tape: [...tape],
        headPosition: head,
        rejected: true,
      };
      return;
    }

    // Apply transition
    tape[head] = transition.write;
    state = transition.to;
    if (transition.direction === 'R') head = Math.min(head + 1, TAPE_SIZE - 1);
    else if (transition.direction === 'L') head = Math.max(head - 1, 0);

    yield {
      stepIndex: stepIdx++,
      description: `δ(${transition.from}, ${transition.read}) = (${transition.to}, ${transition.write}, ${transition.direction})`,
      currentState: state,
      tape: [...tape],
      headPosition: head,
      activeTransition: transition,
    };
  }

  yield {
    stepIndex: stepIdx,
    description: '⚠️ Step limit reached',
    currentState: state,
    tape: [...tape],
    headPosition: head,
    rejected: true,
  };
}

// Example TM: accepts strings of the form 0^n 1^n
export const exampleTM: TuringMachine = {
  states: [
    { id: 'q0', isStart: true, isAccepting: false },
    { id: 'q1', isStart: false, isAccepting: false },
    { id: 'q2', isStart: false, isAccepting: false },
    { id: 'q3', isStart: false, isAccepting: false },
    { id: 'q_accept', isStart: false, isAccepting: true },
    { id: 'q_reject', isStart: false, isAccepting: false, isRejecting: true },
  ],
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', 'X', 'Y', '_'],
  blankSymbol: '_',
  startState: 'q0',
  acceptState: 'q_accept',
  rejectState: 'q_reject',
  transitions: [
    { from: 'q0', read: '0', to: 'q1', write: 'X', direction: 'R' },
    { from: 'q0', read: 'Y', to: 'q3', write: 'Y', direction: 'R' },
    { from: 'q0', read: '_', to: 'q_accept', write: '_', direction: 'R' },
    { from: 'q1', read: '0', to: 'q1', write: '0', direction: 'R' },
    { from: 'q1', read: '1', to: 'q2', write: 'Y', direction: 'L' },
    { from: 'q1', read: 'Y', to: 'q1', write: 'Y', direction: 'R' },
    { from: 'q2', read: '0', to: 'q2', write: '0', direction: 'L' },
    { from: 'q2', read: 'X', to: 'q0', write: 'X', direction: 'R' },
    { from: 'q2', read: 'Y', to: 'q2', write: 'Y', direction: 'L' },
    { from: 'q3', read: 'Y', to: 'q3', write: 'Y', direction: 'R' },
    { from: 'q3', read: '_', to: 'q_accept', write: '_', direction: 'R' },
  ],
};

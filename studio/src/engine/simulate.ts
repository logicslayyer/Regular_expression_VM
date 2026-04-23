import { NFA } from './thompson';
import { epsilonClosure, move } from './subset-construction';
import { SimulationStep } from '../store/useAutomataStore';

export function simulateAutomaton(automaton: NFA, input: string, isDFA: boolean): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let stepIndex = 0;

  if (isDFA) {
    let currentState = automaton.startState;
    steps.push({
      stepIndex: stepIndex++,
      description: `Start at ${currentState}`,
      activeStates: [currentState],
    });

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const match = automaton.transitions.find(t => t.from === currentState && t.symbol === char);
      
      if (!match) {
        steps.push({
          stepIndex: stepIndex++,
          description: `No transition for '${char}' from ${currentState}. Rejected.`,
          activeStates: [currentState],
        });
        (steps[steps.length - 1] as any).accepted = false;
        return steps;
      }

      steps.push({
        stepIndex: stepIndex++,
        description: `Read '${char}' → ${match.to}`,
        activeStates: [match.to],
        activeTransitionId: `${match.from}-${match.to}`,
      });
      currentState = match.to;
    }

    const accepted = automaton.acceptingStates.includes(currentState);
    steps.push({
      stepIndex: stepIndex++,
      description: accepted ? `Finished in accepting state ${currentState}. Accepted.` : `Finished in non-accepting state. Rejected.`,
      activeStates: [currentState],
    });
    (steps[steps.length - 1] as any).accepted = accepted;
    return steps;
  } else {
    // NFA Simulation
    let currentSubset = epsilonClosure([automaton.startState], automaton.transitions);
    steps.push({
      stepIndex: stepIndex++,
      description: `Start: ε-closure({${automaton.startState}}) = {${currentSubset.join(', ')}}`,
      activeStates: currentSubset,
    });

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const moved = move(currentSubset, char, automaton.transitions);
      const closure = epsilonClosure(moved, automaton.transitions);

      if (closure.length === 0) {
        steps.push({
          stepIndex: stepIndex++,
          description: `No transitions for '${char}' from any active state. Rejected.`,
          activeStates: [],
        });
        (steps[steps.length - 1] as any).accepted = false;
        return steps;
      }

      steps.push({
        stepIndex: stepIndex++,
        description: `Read '${char}' → {${closure.join(', ')}}`,
        activeStates: closure,
      });
      currentSubset = closure;
    }

    const accepted = currentSubset.some(s => automaton.acceptingStates.includes(s));
    steps.push({
      stepIndex: stepIndex++,
      description: accepted ? `Finished. Intersects accepting states. Accepted.` : `Finished. No accepting states active. Rejected.`,
      activeStates: currentSubset,
    });
    (steps[steps.length - 1] as any).accepted = accepted;
    return steps;
  }
}

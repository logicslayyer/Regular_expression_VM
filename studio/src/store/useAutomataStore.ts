// ============================================================
// ZUSTAND GLOBAL STORE — Automata Theory Studio
// ============================================================

import { create } from 'zustand';
import { NFA } from '../engine/thompson';
import { DFA } from '../engine/subset-construction';

export type TabId = 'studio' | 'grammar' | 'pda-tm' | 'complexity' | 'learning';
export type SubTabId = 're-nfa' | 'nfa-dfa' | 'dfa-min' | 'ardens' | 'simulation';
export type AutomatonType = 'DFA' | 'NFA' | 'PDA' | 'TM';
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'accepted' | 'rejected';
export type Speed = 'slow' | 'normal' | 'fast';

export const SPEED_MS: Record<Speed, number> = {
  slow: 800,
  normal: 400,
  fast: 150,
};

export interface SimulationStep {
  stepIndex: number;
  description: string;
  activeStates: string[];
  activeTransitionId?: string;
}

export interface AutomataStore {
  // Current automaton
  nfa: NFA | null;
  dfa: DFA | null;
  minimizedDFA: DFA | null;
  automatonType: AutomatonType;

  // Simulation
  inputString: string;
  currentStep: number;
  totalSteps: number;
  stepHistory: SimulationStep[];
  activeStates: string[];
  activeTransition: string | null;
  simulationStatus: SimulationStatus;
  speed: Speed;

  // PDA/TM state
  pdaStack: string[];
  tmTape: string[];
  tmHeadPosition: number;

  // Trace log
  traceLog: { stepIndex: number; text: string; states: string[] }[];

  // UI
  activeTab: TabId;
  activeSubTab: SubTabId;
  rightPanelOpen: boolean;
  pdaSubTab: 'pda' | 'tm';

  // RE builder
  currentExpression: string;
  alphabet: string[];
  expressionValid: boolean | null;
  expressionError: string | null;

  // CFG
  cfgRules: { lhs: string; rhs: string }[];

  // Actions
  setNFA: (nfa: NFA) => void;
  setDFA: (dfa: DFA) => void;
  setMinimizedDFA: (dfa: DFA) => void;
  setAutomatonType: (t: AutomatonType) => void;
  setInputString: (s: string) => void;
  setCurrentStep: (n: number) => void;
  setTotalSteps: (n: number) => void;
  setStepHistory: (steps: SimulationStep[]) => void;
  setActiveStates: (states: string[]) => void;
  setActiveTransition: (id: string | null) => void;
  setSimulationStatus: (s: SimulationStatus) => void;
  setSpeed: (s: Speed) => void;
  setPdaStack: (stack: string[]) => void;
  setTmTape: (tape: string[]) => void;
  setTmHeadPosition: (pos: number) => void;
  addTraceEntry: (entry: { stepIndex: number; text: string; states: string[] }) => void;
  clearTrace: () => void;
  setActiveTab: (tab: TabId) => void;
  setActiveSubTab: (tab: SubTabId) => void;
  setRightPanelOpen: (open: boolean) => void;
  setPdaSubTab: (tab: 'pda' | 'tm') => void;
  appendToExpression: (char: string) => void;
  backspaceExpression: () => void;
  clearExpression: () => void;
  setExpressionValid: (valid: boolean | null, error?: string) => void;
  setAlphabet: (alpha: string[]) => void;
  addCFGRule: (rule: { lhs: string; rhs: string }) => void;
  removeCFGRule: (index: number) => void;
  reset: () => void;
}

export const useAutomataStore = create<AutomataStore>((set) => ({
  // Initial state
  nfa: null,
  dfa: null,
  minimizedDFA: null,
  automatonType: 'NFA',

  inputString: '',
  currentStep: 0,
  totalSteps: 0,
  stepHistory: [],
  activeStates: [],
  activeTransition: null,
  simulationStatus: 'idle',
  speed: 'normal',

  pdaStack: [],
  tmTape: [],
  tmHeadPosition: 0,
  traceLog: [],

  activeTab: 'studio',
  activeSubTab: 're-nfa',
  rightPanelOpen: true,
  pdaSubTab: 'pda',

  currentExpression: '',
  alphabet: ['a', 'b'],
  expressionValid: null,
  expressionError: null,

  cfgRules: [{ lhs: 'S', rhs: 'AB' }, { lhs: 'A', rhs: 'a' }, { lhs: 'B', rhs: 'b' }],

  // Actions
  setNFA: (nfa) => set({ nfa, automatonType: 'NFA' }),
  setDFA: (dfa) => set({ dfa, automatonType: 'DFA' }),
  setMinimizedDFA: (dfa) => set({ minimizedDFA: dfa }),
  setAutomatonType: (t) => set({ automatonType: t }),
  setInputString: (s) => set({ inputString: s }),
  setCurrentStep: (n) => set({ currentStep: n }),
  setTotalSteps: (n) => set({ totalSteps: n }),
  setStepHistory: (steps) => set({ stepHistory: steps }),
  setActiveStates: (states) => set({ activeStates: states }),
  setActiveTransition: (id) => set({ activeTransition: id }),
  setSimulationStatus: (s) => set({ simulationStatus: s }),
  setSpeed: (s) => set({ speed: s }),
  setPdaStack: (stack) => set({ pdaStack: stack }),
  setTmTape: (tape) => set({ tmTape: tape }),
  setTmHeadPosition: (pos) => set({ tmHeadPosition: pos }),
  addTraceEntry: (entry) => set((state) => ({ traceLog: [...state.traceLog, entry] })),
  clearTrace: () => set({ traceLog: [] }),
  setActiveTab: (tab) => set({ activeTab: tab, simulationStatus: 'idle', currentStep: 0 }),
  setActiveSubTab: (tab) => set({ activeSubTab: tab, simulationStatus: 'idle', currentStep: 0 }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setPdaSubTab: (tab) => set({ pdaSubTab: tab }),
  appendToExpression: (char) => set((state) => ({ currentExpression: state.currentExpression + char, expressionValid: null })),
  backspaceExpression: () => set((state) => ({ currentExpression: state.currentExpression.slice(0, -1), expressionValid: null })),
  clearExpression: () => set({ currentExpression: '', expressionValid: null, expressionError: null }),
  setExpressionValid: (valid, error) => set({ expressionValid: valid, expressionError: error || null }),
  setAlphabet: (alpha) => set({ alphabet: alpha }),
  addCFGRule: (rule) => set((state) => ({ cfgRules: [...state.cfgRules, rule] })),
  removeCFGRule: (index) => set((state) => ({ cfgRules: state.cfgRules.filter((_, i) => i !== index) })),
  reset: () => set({
    inputString: '', currentStep: 0, totalSteps: 0,
    stepHistory: [], activeStates: [], activeTransition: null,
    simulationStatus: 'idle', traceLog: [],
    pdaStack: [], tmTape: [], tmHeadPosition: 0,
  }),
}));

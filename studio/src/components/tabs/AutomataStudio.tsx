import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { buildNFA, thompsonSteps } from '../../engine/thompson';
import { buildDFA, subsetConstructionSteps } from '../../engine/subset-construction';
import { minimizeDFA } from '../../engine/dfa-minimization';
import { ardensTheoremSteps } from '../../engine/ardens-theorem';
import { simulateAutomaton } from '../../engine/simulate';
import { Info } from 'lucide-react';

const SUB_TABS = [
  { id: 're-nfa',     label: 'RE → NFA' },
  { id: 'nfa-dfa',   label: 'NFA → DFA' },
  { id: 'dfa-min',   label: 'DFA Min.' },
  { id: 'ardens',    label: "Arden's" },
  { id: 'simulation',label: 'Simulate' },
] as const;

export const AutomataStudio: React.FC = () => {
  const {
    activeSubTab, setActiveSubTab,
    nfa, dfa, minimizedDFA,
    currentExpression, setNFA, setDFA, setMinimizedDFA,
    setStepHistory, setTotalSteps, setSimulationStatus,
    clearTrace, addTraceEntry, inputString, setCurrentStep,
  } = useAutomataStore();

  const handleSubTab = (id: string) => {
    setActiveSubTab(id as any);
    clearTrace();

    if (id === 'nfa-dfa' && nfa) {
      const steps = [...subsetConstructionSteps(nfa)];
      const last = steps[steps.length - 1];
      if (last?.dfa) setDFA(last.dfa);
      setStepHistory(steps.map(s => ({ stepIndex: s.stepIndex, description: s.description, activeStates: s.currentSubset || [], activeTransitionId: undefined })));
      setTotalSteps(steps.length);
    }

    if (id === 'dfa-min' && dfa) {
      const { minimizedDFA: md, steps } = minimizeDFA(dfa);
      setMinimizedDFA(md);
      setStepHistory(steps.map(s => ({ stepIndex: s.stepIndex, description: s.description, activeStates: [], activeTransitionId: undefined })));
      setTotalSteps(steps.length);
    }

    if (id === 'ardens') {
      const target = minimizedDFA || dfa;
      if (target) {
        const steps = [...ardensTheoremSteps(target)];
        steps.forEach(s => addTraceEntry({ stepIndex: s.stepIndex, text: s.description, states: [] }));
      }
    }
  };

  React.useEffect(() => {
    if (activeSubTab === 'simulation') {
      const target = minimizedDFA || dfa || nfa;
      if (target) {
        const isDFA = !!(minimizedDFA || dfa);
        const steps = simulateAutomaton(target, inputString, isDFA);
        setStepHistory(steps);
        setTotalSteps(steps.length);
        setCurrentStep(0);
        setSimulationStatus('idle');
        clearTrace();
      }
    }
  }, [inputString, activeSubTab, nfa, dfa, minimizedDFA]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tab bar */}
      <div style={{
        height: '40px', display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '4px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0, overflowX: 'auto',
      }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sub-tab ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => handleSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}

        {/* Info badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Info size={12} />
          {activeSubTab === 're-nfa' && 'Thompson\'s Construction'}
          {activeSubTab === 'nfa-dfa' && 'Subset Construction'}
          {activeSubTab === 'dfa-min' && 'Myhill-Nerode Table Filling'}
          {activeSubTab === 'ardens' && 'Arden\'s Lemma'}
          {activeSubTab === 'simulation' && 'String Simulation'}
        </div>
      </div>

      {/* Arden's Theorem text view */}
      {activeSubTab === 'ardens' ? (
        <ArdensView />
      ) : (
        /* Canvas */
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AutomataCanvas />
        </div>
      )}
    </div>
  );
};

const ArdensView: React.FC = () => {
  const { traceLog, dfa, minimizedDFA, ardensResult } = useAutomataStore() as any;
  const target = minimizedDFA || dfa;

  if (!target) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Generate a DFA first to apply Arden's Theorem
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        Arden's Theorem — Equation System
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {traceLog.map((entry: any, i: number) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            color: i === traceLog.length - 1 ? 'var(--accent-cyan)' : 'var(--text-primary)',
            borderColor: i === traceLog.length - 1 ? 'rgba(0,245,212,0.3)' : 'var(--border)',
          }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px', fontSize: '11px' }}>Step {i + 1}</span>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
};

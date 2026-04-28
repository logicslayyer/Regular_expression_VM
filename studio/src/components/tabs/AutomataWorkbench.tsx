import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BlockMath } from 'react-katex';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Gauge,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronFirst,
  ChevronLast,
  Maximize2,
} from 'lucide-react';
import { useAutomataStore, SPEED_MS } from '../../store/useAutomataStore';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { simulateAutomaton } from '../../engine/simulate';
import { minimizeDFA } from '../../engine/dfa-minimization';
import { NFA } from '../../engine/thompson';
import { DFA } from '../../engine/subset-construction';

type FiniteAutomaton = NFA | DFA;

function escapeLatexText(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([{}#$%&_])/g, '\\$1')
    .replace(/\^/g, '\\^{}');
}

function latexState(value: string): string {
  return `\\text{${escapeLatexText(value)}}`;
}

function latexSet(values: string[]): string {
  const items = values.length ? values.map(latexState).join(',\\,') : '\\varnothing';
  return `\\{${items}\\}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].filter(Boolean);
}

function getCurrentAutomaton(activeSubTab: string, nfa: NFA | null, dfa: DFA | null, minimizedDFA: DFA | null): FiniteAutomaton | null {
  if (activeSubTab === 're-nfa') return nfa;
  if (activeSubTab === 'nfa-dfa') return dfa || nfa;
  if (activeSubTab === 'dfa-min') return minimizedDFA || dfa || nfa;
  if (activeSubTab === 'simulation') return minimizedDFA || dfa || nfa;
  return minimizedDFA || dfa || nfa;
}

function isDeterministic(automaton: FiniteAutomaton): boolean {
  if (automaton.transitions.some((t: any) => t.symbol === 'ε' || t.symbol === 'Îµ')) return false;
  const seen = new Set<string>();
  for (const t of automaton.transitions as any[]) {
    const key = `${t.from}::${t.symbol}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

function getAutomatonKind(automaton: FiniteAutomaton | null): 'DFA' | 'NFA' | 'epsilon-NFA' {
  if (!automaton) return 'NFA';
  const hasEpsilon = automaton.transitions.some((t: any) => t.symbol === 'ε' || t.symbol === 'Îµ');
  if (isDeterministic(automaton)) return 'DFA';
  if (hasEpsilon) return 'epsilon-NFA';
  return 'NFA';
}

function formatTransitionKey(from: string, symbol: string): string {
  return `${from}::${symbol}`;
}

function parseTargets(raw: string): string[] {
  return unique(
    raw
      .replace(/[{}\[\]]/g, '')
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter((part) => part && part !== 'ε' && part !== 'Îµ' && part !== '∅' && part !== 'Ø')
  );
}

function buildNextAutomaton<T extends FiniteAutomaton>(automaton: T, rowId: string, symbol: string, targets: string[]): T {
  const nextTransitions = automaton.transitions.filter((t) => !(t.from === rowId && t.symbol === symbol));
  for (const to of targets) nextTransitions.push({ from: rowId, to, symbol });
  return {
    ...automaton,
    alphabet: unique([...automaton.alphabet, symbol]),
    transitions: nextTransitions,
  };
}

function MachineSummary({ automaton }: { automaton: FiniteAutomaton }) {
  const stateIds = automaton.states.map((s) => (s as any).label || s.id);
  const alphabet = unique(automaton.alphabet);
  const accepting = automaton.states.filter((s) => (s as any).isAccepting).map((s) => (s as any).label || s.id);
  const start = (automaton.states.find((s) => (s as any).isStart) as any)?.label || automaton.startState;
  const hasEpsilon = automaton.transitions.some((t: any) => t.symbol === 'ε' || t.symbol === 'Îµ');
  const delta =
    getAutomatonKind(automaton) === 'DFA'
      ? '\\delta : Q \\times \\Sigma \\to Q'
      : hasEpsilon
        ? '\\delta : Q \\times (\\Sigma \\cup \\{\\varepsilon\\}) \\to \\mathcal{P}(Q)'
        : '\\delta : Q \\times \\Sigma \\to \\mathcal{P}(Q)';

  const machineLatex = `\\mathcal{M} = \\left(\\mathcal{Q},\\,\\Sigma,\\,\\delta,\\,q_0,\\,F\\right)`;
  const copyLatex = async () => {
    await navigator.clipboard.writeText(`${machineLatex}\n${delta}`);
  };

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Formal Tuple
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Theorem Panel
          </div>
        </div>
        <button className="btn btn-ghost" onClick={copyLatex} style={{ padding: '6px 10px', fontSize: '12px' }}>
          <Copy size={13} />
          LaTeX
        </button>
        <button className="btn btn-ghost" onClick={() => window.print()} style={{ padding: '6px 10px', fontSize: '12px' }}>
          <Download size={13} />
          PDF
        </button>
      </div>
      <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
        <BlockMath math={machineLatex} />
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">States</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {stateIds.map((state) => (
              <span key={state} className="math-chip">{state}</span>
            ))}
          </div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">Alphabet</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {alphabet.map((symbol) => (
              <span key={symbol} className="math-chip">{symbol === 'Îµ' || symbol === 'ε' ? 'ε' : symbol}</span>
            ))}
            {hasEpsilon && <span className="math-chip">ε</span>}
          </div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">Start State</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            <BlockMath math={`q_0 = ${latexState(start)}`} />
          </div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">Final States</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {accepting.length > 0 ? accepting.map((state) => (
              <span key={state} className="math-chip accepting">{state}</span>
            )) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No accepting states</span>}
          </div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">Transition Signature</div>
          <div style={{ marginTop: '8px', overflowX: 'auto' }}>
            <BlockMath math={delta} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TransitionList({
  automaton,
}: {
  automaton: FiniteAutomaton;
}) {
  const {
    selectedStateId,
    selectedTransitionKey,
    hoveredTransitionKey,
    setSelectedStateId,
    setSelectedTransitionKey,
    setHoveredStateId,
    setHoveredTransitionKey,
  } = useAutomataStore();

  const entries = useMemo(() => {
    const grouped = new Map<string, string[]>();
    for (const t of automaton.transitions as any[]) {
      const key = formatTransitionKey(t.from, t.symbol);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(t.to);
    }

    return [...grouped.entries()]
      .map(([key, targets]) => {
        const [from, symbol] = key.split('::');
        const uniqTargets = unique(targets);
        return { from, symbol, targets: uniqTargets, key };
      })
      .sort((a, b) => a.from.localeCompare(b.from) || a.symbol.localeCompare(b.symbol));
  }, [automaton]);

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="panel-section-title">Transition Function</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Live delta expressions
        </div>
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {entries.map((entry) => {
          const isSelected = selectedTransitionKey === entry.key;
          const isHovered = hoveredTransitionKey === entry.key;
          const latex = `\\delta(${latexState(entry.from)},\\,${latexState(entry.symbol)}) = ${latexSet(entry.targets)}`;
          return (
            <button
              key={entry.key}
              className="transition-entry"
              onClick={() => {
                setSelectedStateId(entry.from);
                setSelectedTransitionKey(entry.key);
              }}
              onMouseEnter={() => {
                setHoveredStateId(entry.from);
                setHoveredTransitionKey(entry.key);
              }}
              onMouseLeave={() => {
                setHoveredStateId(null);
                setHoveredTransitionKey(null);
              }}
              style={{
                textAlign: 'left',
                width: '100%',
                border: `1px solid ${isSelected || isHovered ? 'rgba(0,245,212,0.45)' : 'var(--border)'}`,
                background: isSelected || isHovered ? 'rgba(0,245,212,0.08)' : 'var(--bg-elevated)',
              }}
            >
              <BlockMath math={latex} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TransitionTable({
  automaton,
  onAutomatonChange,
}: {
  automaton: FiniteAutomaton;
  onAutomatonChange: (next: FiniteAutomaton) => void;
}) {
  const {
    selectedStateId,
    selectedTransitionKey,
    hoveredStateId,
    hoveredTransitionKey,
    setSelectedStateId,
    setSelectedTransitionKey,
    setHoveredStateId,
    setHoveredTransitionKey,
  } = useAutomataStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const columns = useMemo(() => {
    const alphabet = unique(automaton.alphabet);
    const hasEpsilon = automaton.transitions.some((t: any) => t.symbol === 'ε' || t.symbol === 'Îµ');
    return hasEpsilon ? ['ε', ...alphabet.filter((s) => s !== 'ε' && s !== 'Îµ')] : alphabet;
  }, [automaton]);

  const rows = automaton.states;

  function cellTargets(rowId: string, symbol: string): string[] {
    return unique(
      (automaton.transitions as any[])
        .filter((t) => t.from === rowId && t.symbol === symbol)
        .map((t) => t.to)
    );
  }

  function commitCell(rowId: string, symbol: string, raw: string) {
    const targets = parseTargets(raw);
    const next = buildNextAutomaton(automaton, rowId, symbol, targets);
    onAutomatonChange(next);
    setEditingKey(null);
  }

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="panel-section-title">Transition Table</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Editable matrix view
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>State</th>
              {columns.map((symbol) => (
                <th key={symbol} style={tableHeaderStyle}>
                  {symbol === 'ε' || symbol === 'Îµ' ? 'ε' : symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((state: any) => {
              const isSelected = selectedStateId === state.id || hoveredStateId === state.id;
              const isDead = state.isDead || state.label === 'Ø' || state.label === '∅';
              return (
                <tr
                  key={state.id}
                  onClick={() => setSelectedStateId(state.id)}
                  style={{
                    cursor: 'pointer',
                    filter: isSelected ? 'drop-shadow(0 0 10px rgba(0,245,212,0.15))' : undefined,
                  }}
                >
                  <td
                    style={{
                      ...tableCellStyle,
                      width: '180px',
                      color: isDead ? 'var(--accent-red)' : isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      borderColor: isDead ? 'rgba(248,113,113,0.35)' : isSelected ? 'rgba(0,245,212,0.35)' : 'var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{state.isStart ? '→' : ' '}</span>
                      <span>{state.isAccepting ? '*' : ' '}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{state.label || state.id}</span>
                    </div>
                  </td>
                  {columns.map((symbol) => {
                    const key = formatTransitionKey(state.id, symbol);
                    const values = cellTargets(state.id, symbol);
                    const valueText = values.length ? `{${values.join(', ')}}` : '∅';
                    const isCellSelected = selectedTransitionKey === key;
                    const isCellHovered = hoveredTransitionKey === key;
                    const isEditing = editingKey === key;
                    return (
                      <td
                        key={symbol}
                        style={{
                          ...tableCellStyle,
                          minWidth: '120px',
                          background: isCellSelected || isCellHovered ? 'rgba(0,245,212,0.10)' : 'var(--bg-elevated)',
                          borderColor: isCellSelected || isCellHovered ? 'rgba(0,245,212,0.45)' : 'var(--border)',
                          color: isCellSelected || isCellHovered ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                        onMouseEnter={() => {
                          setHoveredStateId(state.id);
                          setHoveredTransitionKey(key);
                        }}
                        onMouseLeave={() => {
                          setHoveredStateId(null);
                          setHoveredTransitionKey(null);
                        }}
                        onClick={() => {
                          setSelectedStateId(state.id);
                          setSelectedTransitionKey(key);
                        }}
                        onDoubleClick={() => {
                          setEditingKey(key);
                          setDraft(values.length ? values.join(', ') : '');
                        }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => commitCell(state.id, symbol, draft)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitCell(state.id, symbol, draft);
                              if (e.key === 'Escape') setEditingKey(null);
                            }}
                            style={{
                              width: '100%',
                              border: 'none',
                              outline: 'none',
                              background: 'transparent',
                              color: 'inherit',
                              fontFamily: 'inherit',
                              fontSize: '12px',
                            }}
                          />
                        ) : (
                          <span>{valueText}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimulationCard({ automaton }: { automaton: FiniteAutomaton }) {
  const {
    activeSubTab,
    inputString,
    setInputString,
    currentStep,
    setCurrentStep,
    totalSteps,
    setTotalSteps,
    stepHistory,
    setStepHistory,
    activeStates,
    setActiveStates,
    activeTransition,
    setActiveTransition,
    simulationStatus,
    setSimulationStatus,
    speed,
    setSpeed,
    addTraceEntry,
    clearTrace,
  } = useAutomataStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (activeSubTab !== 'simulation') return;
    if (!automaton) return;
    const steps = simulateAutomaton(automaton as any, inputString, getAutomatonKind(automaton) === 'DFA');
    setStepHistory(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setSimulationStatus('idle');
    clearTrace();
    if (steps[0]) {
      setActiveStates(steps[0].activeStates);
      setActiveTransition(steps[0].activeTransitionId || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, automaton, inputString]);

  useEffect(() => {
    if (['accepted', 'rejected'].includes(simulationStatus)) stopPlayback();
  }, [simulationStatus]);

  const runSimulation = () => {
    if (!automaton) return;
    const steps = simulateAutomaton(automaton as any, inputString, getAutomatonKind(automaton) === 'DFA');
    setStepHistory(steps);
    setTotalSteps(steps.length);
    setCurrentStep(0);
    setSimulationStatus('idle');
    clearTrace();
    if (steps[0]) {
      setActiveStates(steps[0].activeStates);
      setActiveTransition(steps[0].activeTransitionId || null);
      addTraceEntry({ stepIndex: 0, text: steps[0].description, states: steps[0].activeStates });
    }
  };

  const handlePlay = () => {
    if (stepHistory.length === 0) return;
    if (isPlaying) {
      stopPlayback();
      setSimulationStatus('paused');
      return;
    }
    setIsPlaying(true);
    setSimulationStatus('running');
    intervalRef.current = setInterval(() => {
      const state = useAutomataStore.getState();
      const next = state.currentStep + 1;

      if (next >= state.stepHistory.length) {
        stopPlayback();
        const lastStep = state.stepHistory[state.stepHistory.length - 1];
        state.setSimulationStatus((lastStep as any)?.accepted ? 'accepted' : 'rejected');
        return;
      }

      const step = state.stepHistory[next];
      state.setCurrentStep(next);
      state.setActiveStates(step.activeStates);
      state.setActiveTransition(step.activeTransitionId || null);
      state.addTraceEntry({ stepIndex: next, text: step.description, states: step.activeStates });
    }, SPEED_MS[speed]);
  };

  const handleStepForward = () => {
    const next = currentStep + 1;
    if (next >= stepHistory.length) return;
    setCurrentStep(next);
    const step = stepHistory[next];
    setActiveStates(step.activeStates);
    setActiveTransition(step.activeTransitionId || null);
    addTraceEntry({ stepIndex: next, text: step.description, states: step.activeStates });
  };

  const handleStepBack = () => {
    const prev = currentStep - 1;
    if (prev < 0) return;
    setCurrentStep(prev);
    const step = stepHistory[prev];
    setActiveStates(step.activeStates);
    setActiveTransition(step.activeTransitionId || null);
  };

  const handleReset = () => {
    stopPlayback();
    setCurrentStep(0);
    setSimulationStatus('idle');
    setActiveStates([]);
    setActiveTransition(null);
    clearTrace();
  };

  const handleEnd = () => {
    if (stepHistory.length === 0) return;
    const last = stepHistory.length - 1;
    setCurrentStep(last);
    const step = stepHistory[last];
    setActiveStates(step.activeStates);
    setActiveTransition(step.activeTransitionId || null);
  };

  const speedLabels: Record<string, string> = { slow: '0.5x', normal: '1x', fast: '3x' };
  const processedCount = Math.max(0, currentStep);
  const chars = inputString.split('');

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="panel-section-title">Simulation</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Real-time execution
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <input
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="Enter a test string"
          style={{
            flex: '1 1 180px',
            minWidth: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 10px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
        />
        <button className="btn btn-primary" onClick={runSimulation}>
          <Play size={13} />
          Run
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {chars.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Empty string (ε)</span>
        ) : (
          chars.map((ch, i) => (
            <span key={`${ch}-${i}`} className={`char-chip ${i === processedCount ? 'current' : i < processedCount ? 'processed' : ''}`}>
              {ch === ' ' ? '·' : ch}
            </span>
          ))
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
        <div className={`status-badge ${simulationStatus}`}>
          {simulationStatus.toUpperCase()}
        </div>
        <button
          onClick={() => setSpeed(speed === 'slow' ? 'normal' : speed === 'normal' ? 'fast' : 'slow')}
          className="btn btn-ghost"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          <Gauge size={13} />
          {speedLabels[speed]}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
        <button className="playback-btn" onClick={handleReset} title="Reset"><ChevronFirst size={16} /></button>
        <button className="playback-btn" onClick={handleStepBack} title="Step Back"><SkipBack size={16} /></button>
        <button className="playback-btn play-btn" onClick={handlePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="playback-btn" onClick={handleStepForward} title="Step Forward"><SkipForward size={16} /></button>
        <button className="playback-btn" onClick={handleEnd} title="Jump to End"><ChevronLast size={16} /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Step {currentStep + 1} / {Math.max(1, totalSteps)}
        </div>
        <div style={{ width: '100%', height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
        {stepHistory.slice(Math.max(0, currentStep - 2), currentStep + 1).map((step) => (
          <div
            key={step.stepIndex}
            className="trace-entry current"
            style={{ margin: 0, cursor: 'default' }}
          >
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-cyan)', color: '#0d0f14', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>
              {step.stepIndex + 1}
            </span>
            <span>{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimizationCard({ automaton }: { automaton: FiniteAutomaton }) {
  const { activeSubTab, currentStep, stepHistory } = useAutomataStore();
  const dfa = automaton as DFA;
  const result = useMemo(() => {
    if (!dfa || !dfa.states) return null;
    return minimizeDFA(dfa);
  }, [dfa]);

  if (activeSubTab !== 'dfa-min' || !result) return null;

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div className="panel-section-title">Minimization</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Partition refinement
        </div>
      </div>
      <div style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
        {stepHistory[currentStep]?.description || 'Ready to minimize the current DFA.'}
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div>
          <div className="panel-section-title">Original states</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {dfa.states.map((s: any) => (
              <span key={s.id} className="math-chip">{s.label || s.id}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="panel-section-title">Minimized states</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {result.minimizedDFA.states.map((s) => (
              <span key={s.id} className="math-chip accepting">
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="glass" style={{ padding: '10px 12px', borderRadius: '12px' }}>
          <div className="panel-section-title">Reduction</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>
            {dfa.states.length} states → {result.minimizedDFA.states.length} states
          </div>
        </div>
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  background: 'var(--bg-surface)',
  zIndex: 1,
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  background: 'var(--bg-elevated)',
  transition: 'all 0.2s ease',
};

export const AutomataWorkbench: React.FC = () => {
  const { nfa, dfa, minimizedDFA, activeSubTab, selectedStateId, selectedTransitionKey } = useAutomataStore();
  const automaton = getCurrentAutomaton(activeSubTab, nfa, dfa, minimizedDFA);

  const currentAutomaton = automaton || nfa || dfa || minimizedDFA;

  const replaceAutomaton = (next: FiniteAutomaton) => {
    if (activeSubTab === 're-nfa' || (!dfa && !minimizedDFA)) {
      useAutomataStore.getState().setNFA(next as NFA);
      return;
    }
    if (activeSubTab === 'dfa-min' && minimizedDFA) {
      useAutomataStore.getState().setMinimizedDFA(next as DFA);
      return;
    }
    if (dfa) {
      useAutomataStore.getState().setDFA(next as DFA);
      return;
    }
    if (minimizedDFA) {
      useAutomataStore.getState().setMinimizedDFA(next as DFA);
      return;
    }
    if (nfa) useAutomataStore.getState().setNFA(next as NFA);
  };

  if (!currentAutomaton) {
    return <AutomataCanvas />;
  }

  return (
    <div
      className="workbench-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 0.75fr)',
        gap: '12px',
        height: '100%',
        padding: '12px',
        minWidth: 0,
      }}
    >
      <section className="glass" style={{ borderRadius: '18px', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px rgba(0,245,212,0.8)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Selected: {selectedStateId || 'none'} {selectedTransitionKey ? `• ${selectedTransitionKey}` : ''}
          </span>
        </div>
        <AutomataCanvas />
      </section>

      <aside style={{ display: 'grid', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
        <MachineSummary automaton={currentAutomaton} />
        <TransitionList automaton={currentAutomaton} />
        <TransitionTable automaton={currentAutomaton} onAutomatonChange={replaceAutomaton} />
        <SimulationCard automaton={currentAutomaton} />
        <MinimizationCard automaton={currentAutomaton} />
      </aside>
    </div>
  );
};

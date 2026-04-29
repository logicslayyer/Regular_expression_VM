import React, { useRef, useEffect } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { X, ChevronRight, Circle } from 'lucide-react';

const STATUS_DOT_COLOR: Record<string, string> = {
  idle: 'var(--text-muted)',
  running: 'var(--accent-green)',
  paused: 'var(--accent-violet)',
  accepted: 'var(--accent-cyan)',
  rejected: 'var(--accent-red)',
};

export const RightPanel: React.FC = () => {
  const {
    rightPanelOpen, setRightPanelOpen,
    traceLog, currentStep, setCurrentStep,
    activeStates, activeTransition,
    simulationStatus, nfa, dfa,
    activeStates: as,
  } = useAutomataStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [traceLog]);

  if (!rightPanelOpen) {
    return (
      <button
        onClick={() => setRightPanelOpen(true)}
        style={{
          width: '32px', background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', color: 'var(--text-muted)',
        }}
      >
        <ChevronRight size={16} />
      </button>
    );
  }

  const automaton = dfa || nfa;
  const activeState = activeStates[0];
  const stateInfo = automaton?.states.find(s => s.id === activeState);

  return (
    <aside style={{
      width: '100%',
      height: '100%',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Simulation Trace
        </span>
        <button onClick={() => setRightPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={14} />
        </button>
      </div>

      {/* Status */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span className={`status-badge ${simulationStatus}`}>
          <Circle size={6} style={{ fill: STATUS_DOT_COLOR[simulationStatus], color: STATUS_DOT_COLOR[simulationStatus] }} />
          {simulationStatus.toUpperCase()}
        </span>
        {activeStates.length > 1 && (
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)' }}>
            Active: {'{'}{activeStates.join(', ')}{'}'}
          </div>
        )}
      </div>

      {/* Trace Log */}
      <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {traceLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
            Run a simulation to see trace
          </div>
        ) : (
          traceLog.map((entry, i) => (
            <div
              key={i}
              className={`trace-entry ${entry.stepIndex === currentStep ? 'current' : ''}`}
              onClick={() => setCurrentStep(entry.stepIndex)}
            >
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: entry.stepIndex === currentStep ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', flexShrink: 0,
                color: entry.stepIndex === currentStep ? '#0d0f14' : 'var(--text-muted)',
              }}>
                {entry.stepIndex + 1}
              </span>
              <span>{entry.text}</span>
            </div>
          ))
        )}
      </div>

      {/* State Properties */}
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="panel-section-title" style={{ padding: '10px 12px 6px' }}>State Properties</div>
        {stateInfo ? (
          <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{activeState}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Type</span>
              <span style={{ color: 'var(--text-code)' }}>
                {stateInfo.isAccepting ? 'Accepting' : stateInfo.isStart ? 'Start' : 'Intermediate'}
              </span>
            </div>
            {automaton && (
              <>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '3px' }}>Outgoing:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-code)' }}>
                    {automaton.transitions
                      .filter((t: any) => t.from === activeState)
                      .map((t: any) => `${t.symbol}→${t.to}`)
                      .join(', ') || '—'}
                  </div>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '3px' }}>Incoming:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-code)' }}>
                    {automaton.transitions
                      .filter((t: any) => t.to === activeState)
                      .map((t: any) => `${t.symbol}←${t.from}`)
                      .join(', ') || '—'}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding: '8px 12px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            No state selected
          </div>
        )}
      </div>
    </aside>
  );
};

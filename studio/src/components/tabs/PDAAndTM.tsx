import React, { useState } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { StackVisualizer } from '../special/StackVisualizer';
import { TuringTape } from '../special/TuringTape';
import { examplePDA, pdaSimulate } from '../../engine/pda-simulator';
import { exampleTM, tmSimulate } from '../../engine/turing-machine';
import { AutomataCanvas } from '../canvas/AutomataCanvas';

export const PDAAndTM: React.FC = () => {
  const { pdaSubTab, setPdaSubTab, setPdaStack, setTmTape, setTmHeadPosition } = useAutomataStore();
  const [pdaInput, setPdaInput] = useState('aabb');
  const [tmInput, setTmInput] = useState('0011');
  const [pdaSteps, setPdaSteps] = useState<any[]>([]);
  const [tmSteps, setTmSteps] = useState<any[]>([]);
  const [currentPdaStep, setCurrentPdaStep] = useState(0);
  const [currentTmStep, setCurrentTmStep] = useState(0);

  const runPDA = () => {
    const steps = [...pdaSimulate(examplePDA, pdaInput)];
    setPdaSteps(steps);
    setCurrentPdaStep(0);
    if (steps[0]) { setPdaStack(steps[0].stack); }
  };

  const runTM = () => {
    const steps = [...tmSimulate(exampleTM, tmInput)];
    setTmSteps(steps);
    setCurrentTmStep(0);
    if (steps[0]) { setTmTape(steps[0].tape); setTmHeadPosition(steps[0].headPosition); }
  };

  const pdaStep = pdaSteps[currentPdaStep];
  const tmStep = tmSteps[currentTmStep];

  const handlePdaForward = () => {
    const next = Math.min(currentPdaStep + 1, pdaSteps.length - 1);
    setCurrentPdaStep(next);
    if (pdaSteps[next]) setPdaStack(pdaSteps[next].stack);
  };

  const handleTmForward = () => {
    const next = Math.min(currentTmStep + 1, tmSteps.length - 1);
    setCurrentTmStep(next);
    if (tmSteps[next]) { setTmTape(tmSteps[next].tape); setTmHeadPosition(tmSteps[next].headPosition); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tab */}
      <div style={{
        height: '40px', display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '4px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <button className={`sub-tab ${pdaSubTab === 'pda' ? 'active' : ''}`} onClick={() => setPdaSubTab('pda')}>
          Pushdown Automaton
        </button>
        <button className={`sub-tab ${pdaSubTab === 'tm' ? 'active' : ''}`} onClick={() => setPdaSubTab('tm')}>
          Turing Machine
        </button>
      </div>

      {pdaSubTab === 'pda' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: PDA graph (60%) */}
          <div style={{ flex: '0 0 60%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>PDA: a^n b^n</span>
              <input
                value={pdaInput}
                onChange={e => setPdaInput(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', width: '80px' }}
              />
              <button className="btn btn-primary" onClick={runPDA} style={{ fontSize: '11px', padding: '5px 10px' }}>Run</button>
              {pdaSteps.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  <button className="btn btn-ghost" onClick={() => setCurrentPdaStep(s => Math.max(0, s-1))} style={{ fontSize: '11px', padding: '4px 8px' }}>◀</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>{currentPdaStep+1}/{pdaSteps.length}</span>
                  <button className="btn btn-ghost" onClick={handlePdaForward} style={{ fontSize: '11px', padding: '4px 8px' }}>▶</button>
                </div>
              )}
            </div>
            {pdaStep && (
              <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: pdaStep.accepted ? 'var(--accent-green)' : pdaStep.rejected ? 'var(--accent-red)' : 'var(--text-muted)', flexShrink: 0 }}>
                {pdaStep.description}
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AutomataCanvas />
            </div>
          </div>

          {/* Right: Stack (40%) */}
          <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <span className="panel-section-title">Stack State</span>
            </div>
            <StackVisualizer />
            {pdaStep && (
              <div style={{ padding: '12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Remaining Input</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-code)' }}>
                  {pdaStep.remainingInput.join('') || 'ε'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {pdaSubTab === 'tm' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Top: TM graph (50%) */}
          <div style={{ flex: '0 0 50%', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TM: 0^n 1^n</span>
              <input
                value={tmInput}
                onChange={e => setTmInput(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', width: '80px' }}
              />
              <button className="btn btn-primary" onClick={runTM} style={{ fontSize: '11px', padding: '5px 10px' }}>Run</button>
              {tmSteps.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  <button className="btn btn-ghost" onClick={() => { const n = Math.max(0, currentTmStep-1); setCurrentTmStep(n); if(tmSteps[n]){setTmTape(tmSteps[n].tape);setTmHeadPosition(tmSteps[n].headPosition);} }} style={{ fontSize: '11px', padding: '4px 8px' }}>◀</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>{currentTmStep+1}/{tmSteps.length}</span>
                  <button className="btn btn-ghost" onClick={handleTmForward} style={{ fontSize: '11px', padding: '4px 8px' }}>▶</button>
                </div>
              )}
            </div>
            {tmStep && (
              <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: tmStep.accepted ? 'var(--accent-green)' : tmStep.rejected ? 'var(--accent-red)' : 'var(--text-muted)', flexShrink: 0 }}>
                {tmStep.description}
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AutomataCanvas />
            </div>
          </div>

          {/* Bottom: Tape (50%) */}
          <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <span className="panel-section-title">Turing Tape</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TuringTape />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

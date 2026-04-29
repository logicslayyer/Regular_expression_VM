import React, { useState, useEffect, useRef } from 'react';
import { useAutomataStore, SPEED_MS } from '../../store/useAutomataStore';
import {
  SkipBack, SkipForward, Play, Pause, ChevronFirst, ChevronLast, Gauge
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const {
    inputString, setInputString,
    currentStep, setCurrentStep,
    totalSteps, simulationStatus, setSimulationStatus,
    speed, setSpeed, stepHistory, activeStates,
    addTraceEntry, clearTrace, setActiveStates, setActiveTransition,
  } = useAutomataStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chars = inputString.split('');
  const processedCount = Math.max(0, currentStep);

  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (['accepted', 'rejected'].includes(simulationStatus)) stopPlayback();
  }, [simulationStatus]);

  const handlePlay = () => {
    if (useAutomataStore.getState().stepHistory.length === 0) return;
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
        useAutomataStore.getState().setSimulationStatus((lastStep as any).accepted ? 'accepted' : 'rejected');
        return;
      }
      
      const step = state.stepHistory[next];
      state.setCurrentStep(next);
      state.setActiveStates(step.activeStates);
      if (step.activeTransitionId) state.setActiveTransition(step.activeTransitionId);
      state.addTraceEntry({ stepIndex: next, text: step.description, states: step.activeStates });
    }, SPEED_MS[speed]);
  };

  const handleStepForward = () => {
    const next = currentStep + 1;
    if (next >= stepHistory.length) return;
    setCurrentStep(next);
    const step = stepHistory[next];
    setActiveStates(step.activeStates);
    addTraceEntry({ stepIndex: next, text: step.description, states: step.activeStates });
  };

  const handleStepBack = () => {
    const prev = currentStep - 1;
    if (prev < 0) return;
    setCurrentStep(prev);
    const step = stepHistory[prev];
    setActiveStates(step.activeStates);
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
  };

  const speedLabels: Record<string, string> = { slow: '0.5×', normal: '1×', fast: '3×' };
  const speedCycle = () => {
    setSpeed(speed === 'slow' ? 'normal' : speed === 'normal' ? 'fast' : 'slow');
  };

  return (
    <div style={{
      height: '100%',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '16px',
      flexShrink: 0,
    }}>
      {/* Input string display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto', minWidth: '180px', maxWidth: '320px', overflowX: 'auto' }}>
        {simulationStatus === 'idle' ? (
          <input
            placeholder="Enter test string..."
            value={inputString}
            onChange={e => setInputString(e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '6px 10px',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px',
              outline: 'none', width: '160px',
            }}
          />
        ) : chars.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ε (Empty string)</span>
        ) : (
          chars.map((ch, i) => (
            <span key={i} className={`char-chip ${i === processedCount ? 'current' : i < processedCount ? 'processed' : ''}`}>
              {ch === ' ' ? '·' : ch}
            </span>
          ))
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} />

      {/* Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
        <button className="playback-btn" onClick={handleReset} title="Reset">
          <ChevronFirst size={16} />
        </button>
        <button className="playback-btn" onClick={handleStepBack} title="Step Back">
          <SkipBack size={16} />
        </button>
        <button className="playback-btn play-btn" onClick={handlePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="playback-btn" onClick={handleStepForward} title="Step Forward">
          <SkipForward size={16} />
        </button>
        <button className="playback-btn" onClick={handleEnd} title="Jump to End">
          <ChevronLast size={16} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} />

      {/* Step counter + progress */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', minWidth: '80px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          Step {currentStep + 1} / {Math.max(1, totalSteps)}
        </span>
        <div style={{ width: '80px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
          <div style={{
            height: '100%',
            width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Speed control */}
      <button
        onClick={speedCycle}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '6px', padding: '5px 10px',
          color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        title="Change Speed"
      >
        <Gauge size={13} />
        {speedLabels[speed]}
      </button>
    </div>
  );
};

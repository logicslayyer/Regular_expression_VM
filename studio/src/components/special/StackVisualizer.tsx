import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const StackVisualizer: React.FC = () => {
  const { pdaStack } = useAutomataStore();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '16px', overflowY: 'auto', flex: 1,
    }}>
      {pdaStack.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '24px', marginTop: '40px' }}>∅</div>
      ) : (
        <>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Stack (Top ↓)</div>
          {[...pdaStack].reverse().map((sym, i) => (
            <div
              key={`${sym}-${i}`}
              className={`stack-cell ${i === 0 ? 'top' : ''}`}
              style={{ width: '80px', textAlign: 'center' }}
            >
              {sym}
            </div>
          ))}
          <div style={{ marginTop: '4px', width: '80px', height: '6px', borderRadius: '0 0 4px 4px', background: 'rgba(255,255,255,0.06)', borderTop: '2px solid rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>Bottom</div>
        </>
      )}
    </div>
  );
};

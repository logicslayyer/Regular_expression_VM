import React, { useState } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { Plus, Trash2 } from 'lucide-react';

const NON_TERMINALS = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'T', 'X', 'Y', 'Z'];

export const CFGBuilder: React.FC = () => {
  const { cfgRules, addCFGRule, removeCFGRule } = useAutomataStore();
  const [newLHS, setNewLHS] = useState('S');
  const [newRHS, setNewRHS] = useState('');

  const handleAdd = () => {
    if (!newRHS.trim()) return;
    addCFGRule({ lhs: newLHS, rhs: newRHS.trim() });
    setNewRHS('');
  };

  return (
    <div style={{ padding: '12px' }}>
      <div className="panel-section-title">Production Rules</div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', marginTop: '6px' }}>
        {cfgRules.map((rule, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: '6px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <span style={{ color: 'var(--accent-violet)' }}>{rule.lhs}</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
              <span style={{ color: 'var(--text-code)' }}>{rule.rhs}</span>
            </span>
            <button
              onClick={() => removeCFGRule(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add rule */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <select
          value={newLHS}
          onChange={e => setNewLHS(e.target.value)}
          style={{
            width: '52px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: '6px',
            color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)',
            fontSize: '13px', padding: '6px 4px', outline: 'none',
          }}
        >
          {NON_TERMINALS.map(nt => <option key={nt} value={nt}>{nt}</option>)}
        </select>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>→</span>
        <input
          value={newRHS}
          onChange={e => setNewRHS(e.target.value)}
          placeholder="AB | a | ε"
          style={{
            flex: 1, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: '6px',
            padding: '6px 8px', color: 'var(--text-code)',
            fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none',
          }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="btn btn-primary" style={{ padding: '6px 10px' }}>
          <Plus size={14} />
        </button>
      </div>

      {/* CNF hint */}
      <div style={{
        padding: '8px', borderRadius: '6px',
        background: 'rgba(139,92,246,0.07)',
        border: '1px solid rgba(139,92,246,0.2)',
        fontSize: '11px', color: 'var(--text-muted)',
      }}>
        💡 CYK requires CNF: rules must be <span style={{ color: 'var(--accent-violet)' }}>A → BC</span> or <span style={{ color: 'var(--accent-cyan)' }}>A → a</span>
      </div>
    </div>
  );
};

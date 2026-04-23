import React, { useState } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { RegexCalculator } from '../input/RegexCalculator';
import { CFGBuilder } from '../input/CFGBuilder';
import { buildNFA } from '../../engine/thompson';
import { buildDFA } from '../../engine/subset-construction';
import { ChevronDown, ChevronUp, Zap, GitBranch, Minimize2 } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const { activeTab, setNFA, setDFA, currentExpression } = useAutomataStore();
  const [alphaOpen, setAlphaOpen] = useState(false);
  const [alphabetInput, setAlphabetInput] = useState('a, b');

  const handleGenerateNFA = () => {
    if (!currentExpression) return;
    try {
      const nfa = buildNFA(currentExpression);
      setNFA(nfa);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateDFA = () => {
    if (!currentExpression) return;
    try {
      const nfa = buildNFA(currentExpression);
      const dfa = buildDFA(nfa);
      setNFA(nfa);
      setDFA(dfa);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside style={{
      width: '280px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid var(--border)' }}>
        <div className="panel-section-title" style={{ marginBottom: 0 }}>
          {activeTab === 'grammar' ? 'Grammar Builder' : 'Expression Builder'}
        </div>
      </div>

      {/* Input Panel */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'grammar'
          ? <CFGBuilder />
          : <RegexCalculator />
        }
      </div>

      {/* Alphabet Config */}
      {activeTab !== 'grammar' && activeTab !== 'learning' && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setAlphaOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            <span>Alphabet Σ</span>
            {alphaOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {alphaOpen && (
            <div style={{ padding: '0 12px 12px' }}>
              <input
                value={alphabetInput}
                onChange={e => setAlphabetInput(e.target.value)}
                placeholder="a, b, c, 0, 1"
                style={{
                  width: '100%', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  padding: '7px 10px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Generate Buttons */}
      {(activeTab === 'studio' || activeTab === 'complexity') && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={handleGenerateNFA} style={{ width: '100%', justifyContent: 'center' }}>
            <Zap size={13} />
            Generate NFA
          </button>
          <button className="btn" onClick={handleGenerateDFA} style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(139,92,246,0.4)', color: 'var(--accent-violet)' }}>
            <GitBranch size={13} />
            Generate DFA
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}>
            <Minimize2 size={13} />
            Minimize DFA
          </button>
        </div>
      )}
    </aside>
  );
};

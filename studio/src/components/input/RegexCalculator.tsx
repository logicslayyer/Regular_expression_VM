import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { regexParser } from '../../engine/regex-parser';
import { CheckCircle, XCircle, Delete } from 'lucide-react';

const KEYS = [
  { label: 'a', type: 'char' }, { label: 'b', type: 'char' }, { label: 'c', type: 'char' },
  { label: '0', type: 'char' }, { label: '1', type: 'char' },
  { label: '(', type: 'operator' }, { label: ')', type: 'operator' },
  { label: '|', type: 'operator' }, { label: '*', type: 'operator' }, { label: '+', type: 'operator' },
  { label: 'ε', type: 'special' }, { label: 'Σ', type: 'special' },
  { label: '?', type: 'operator' }, { label: '.', type: 'char' }, { label: '⌫', type: 'delete' },
] as const;

// Syntax-highlighted expression display
function HighlightedExpr({ expr }: { expr: string }) {
  if (!expr) return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>type expression...</span>;
  return (
    <>
      {expr.split('').map((ch, i) => {
        let color = 'var(--text-code)';
        if ('|*+?'.includes(ch)) color = 'var(--accent-violet)';
        else if ('()'.includes(ch)) color = 'var(--accent-yellow)';
        else if (ch === 'ε') color = 'var(--accent-green)';
        return <span key={i} style={{ color }}>{ch}</span>;
      })}
    </>
  );
}

export const RegexCalculator: React.FC = () => {
  const {
    currentExpression, appendToExpression, backspaceExpression,
    clearExpression, setExpressionValid, expressionValid, expressionError,
    alphabet,
  } = useAutomataStore();

  const handleKey = (label: string) => {
    if (label === '⌫') { backspaceExpression(); return; }
    if (label === 'Σ') {
      // Insert all alphabet chars joined by |
      appendToExpression(`(${alphabet.join('|')})`);
      return;
    }
    appendToExpression(label);
  };

  const handleValidate = () => {
    const result = regexParser.validate(currentExpression);
    setExpressionValid(result.valid, result.error);
  };

  return (
    <div style={{ padding: '12px' }}>
      {/* Expression Display */}
      <div style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${expressionValid === false ? 'rgba(248,113,113,0.4)' : expressionValid === true ? 'rgba(0,245,212,0.4)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '10px 12px',
        minHeight: '52px',
        marginBottom: '12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '15px',
        letterSpacing: '0.04em',
        wordBreak: 'break-all',
        lineHeight: 1.5,
        transition: 'border-color 0.2s',
      }}>
        <HighlightedExpr expr={currentExpression} />
        <span style={{ animation: 'blink 1s infinite', color: 'var(--accent-cyan)', marginLeft: '1px' }}>|</span>
      </div>

      {/* Validation message */}
      {expressionValid !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          marginBottom: '8px', fontSize: '11px',
          color: expressionValid ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>
          {expressionValid ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {expressionValid ? 'Valid regular expression' : expressionError}
        </div>
      )}

      {/* Key Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '5px',
        marginBottom: '10px',
      }}>
        {KEYS.map(key => (
          <button
            key={key.label}
            className={`calc-key ${key.type === 'operator' ? 'operator' : ''} ${key.type === 'special' ? 'special' : ''} ${key.type === 'delete' ? 'delete-key' : ''}`}
            onClick={() => handleKey(key.label)}
          >
            {key.label === '⌫' ? <Delete size={14} /> : key.label}
          </button>
        ))}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleValidate}
          className="btn"
          style={{ flex: 1, justifyContent: 'center', fontSize: '12px', borderColor: 'rgba(0,245,212,0.3)', color: 'var(--accent-cyan)' }}
        >
          <CheckCircle size={12} />
          Validate
        </button>
        <button
          onClick={clearExpression}
          className="btn btn-ghost"
          style={{ fontSize: '12px', padding: '8px 12px' }}
        >
          Clear
        </button>
      </div>

      {/* Quick examples */}
      <div style={{ marginTop: '12px' }}>
        <div className="panel-section-title">Quick Examples</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          {[
            { label: 'a(a|b)*b', desc: 'Starts a, ends b' },
            { label: '(ab)*', desc: 'Repeated ab' },
            { label: 'a*b+', desc: 'a* then b+' },
            { label: '(a|b|c)+', desc: 'One or more' },
          ].map(ex => (
            <button
              key={ex.label}
              onClick={() => { clearExpression(); ex.label.split('').forEach(ch => appendToExpression(ch)); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,212,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)' }}>{ex.label}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ex.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

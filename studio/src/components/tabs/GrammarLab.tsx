import React, { useState } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { CYKTable } from '../special/CYKTable';
import { cykAlgorithm, CFGRule } from '../../engine/cyk';

const GRAMMAR_TABS = ['CYK Parser', 'CNF Conversion', 'GNF Conversion'] as const;

export const GrammarLab: React.FC = () => {
  const { cfgRules } = useAutomataStore();
  const [activeTab, setActiveTab] = useState<string>('CYK Parser');
  const [testString, setTestString] = useState('ab');
  const [cykSteps, setCykSteps] = useState<any[]>([]);
  const [cykRunning, setCykRunning] = useState(false);
  const [currentCykStep, setCurrentCykStep] = useState(0);

  const handleRunCYK = () => {
    const rules: CFGRule[] = cfgRules.map(r => ({
      lhs: r.lhs,
      rhs: r.rhs.split('').filter(c => c.trim()),
    }));
    const steps = [...cykAlgorithm(rules, testString, 'S')];
    setCykSteps(steps);
    setCurrentCykStep(0);
    setCykRunning(true);
  };

  const stepForward = () => setCurrentCykStep(s => Math.min(s + 1, cykSteps.length - 1));
  const stepBack = () => setCurrentCykStep(s => Math.max(s - 1, 0));

  const currentStep = cykSteps[currentCykStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        height: '40px', display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '4px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        {GRAMMAR_TABS.map(t => (
          <button key={t} className={`sub-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {activeTab === 'CYK Parser' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              CYK Parsing Table
            </h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                value={testString}
                onChange={e => setTestString(e.target.value)}
                placeholder="Enter string to parse"
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '8px 12px',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '14px',
                  outline: 'none', width: '200px',
                }}
              />
              <button className="btn btn-primary" onClick={handleRunCYK}>
                Run CYK
              </button>
              {cykRunning && (
                <>
                  <button className="btn btn-ghost" onClick={stepBack} disabled={currentCykStep === 0}>◀ Back</button>
                  <button className="btn btn-ghost" onClick={stepForward} disabled={currentCykStep === cykSteps.length - 1}>Fwd ▶</button>
                </>
              )}
            </div>

            {cykRunning && currentStep && (
              <>
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
                  background: currentStep.accepted === true ? 'rgba(34,211,165,0.1)' : currentStep.accepted === false ? 'rgba(248,113,113,0.1)' : 'var(--bg-elevated)',
                  border: `1px solid ${currentStep.accepted === true ? 'rgba(34,211,165,0.3)' : currentStep.accepted === false ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)',
                }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Step {currentCykStep + 1}/{cykSteps.length}:</span>
                  {currentStep.description}
                </div>
                <CYKTable
                  table={currentStep.table}
                  input={testString}
                  filledCell={currentStep.filledCell}
                  accepted={currentStep.accepted}
                />
              </>
            )}

            {!cykRunning && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔢</div>
                Configure grammar in the left sidebar, enter a string above, then click Run CYK
              </div>
            )}
          </div>
        )}

        {activeTab === 'CNF Conversion' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Chomsky Normal Form Conversion
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              <p>CNF conversion steps:</p>
              <ol style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Remove ε-productions', 'Remove unit/chain productions', 'Remove useless symbols', 'Convert long rules (A → BCD → A → XC, X → BD)', 'Convert mixed rules (A → aB → A → XB, X → a)'].map((step, i) => (
                  <li key={i} style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'GNF Conversion' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Greibach Normal Form Conversion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              GNF: every production starts with a terminal. <br />
              Steps: Convert to CNF → eliminate left recursion → apply Greibach transformations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

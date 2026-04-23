import React, { useState } from 'react';

const KMP_PATTERNS = [
  { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
  { text: 'AAAAABAAABA', pattern: 'AAAA' },
  { text: 'abcxabcdabcdabcy', pattern: 'abcdabcy' },
];

export const ComplexityApps: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'kmp' | 'np' | 'pumping'>('kmp');
  const [text, setText] = useState(KMP_PATTERNS[0].text);
  const [pattern, setPattern] = useState(KMP_PATTERNS[0].pattern);
  const [matchResult, setMatchResult] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [failureFunction, setFailureFunction] = useState<number[]>([]);

  const computeKMP = () => {
    // Build failure function
    const m = pattern.length;
    const fail: number[] = new Array(m).fill(0);
    let k = 0;
    for (let i = 1; i < m; i++) {
      while (k > 0 && pattern[k] !== pattern[i]) k = fail[k - 1];
      if (pattern[k] === pattern[i]) k++;
      fail[i] = k;
    }
    setFailureFunction(fail);

    // Run KMP
    const matches: number[] = [];
    let q = 0;
    for (let i = 0; i < text.length; i++) {
      while (q > 0 && pattern[q] !== text[i]) q = fail[q - 1];
      if (pattern[q] === text[i]) q++;
      if (q === m) {
        matches.push(i - m + 1);
        q = fail[q - 1];
      }
    }
    setMatchResult(matches);
  };

  const NP_REDUCTIONS = [
    { from: 'SAT', to: '3-SAT', desc: 'Every clause → 3 literals' },
    { from: '3-SAT', to: 'Vertex Cover', desc: 'Variable & clause gadgets' },
    { from: 'Vertex Cover', to: 'Clique', desc: 'Complementary graph' },
    { from: 'Clique', to: 'Independent Set', desc: 'Complement again' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Section selector */}
      <div style={{ height: '40px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '4px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        {[['kmp', 'Pattern Matching (KMP)'], ['np', 'NP Reductions'], ['pumping', 'Pumping Lemma']].map(([id, label]) => (
          <button key={id} className={`sub-tab ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id as any)}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {activeSection === 'kmp' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Knuth-Morris-Pratt Pattern Matching
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Text" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', flex: 1, minWidth: '200px' }} />
              <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="Pattern" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', width: '160px' }} />
              <button className="btn btn-primary" onClick={computeKMP}>Run KMP</button>
            </div>

            {/* Text display with highlights */}
            {matchResult !== null && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <div className="panel-section-title" style={{ marginBottom: '6px' }}>Text with Matches</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', letterSpacing: '0.1em', flexWrap: 'wrap', display: 'flex' }}>
                    {text.split('').map((ch, i) => {
                      const isMatch = matchResult.some(m => i >= m && i < m + pattern.length);
                      return (
                        <span key={i} style={{
                          color: isMatch ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          background: isMatch ? 'rgba(0,245,212,0.12)' : 'transparent',
                          padding: '2px 1px',
                          borderBottom: isMatch ? '2px solid var(--accent-cyan)' : 'none',
                          transition: 'all 0.2s',
                        }}>{ch}</span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div className="panel-section-title" style={{ marginBottom: '6px' }}>Failure Function</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {failureFunction.map((v, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-violet)', padding: '4px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px 4px 0 0', minWidth: '32px' }}>{pattern[i]}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-code)', padding: '4px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 4px 4px' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '8px', background: matchResult.length > 0 ? 'rgba(34,211,165,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${matchResult.length > 0 ? 'rgba(34,211,165,0.3)' : 'rgba(248,113,113,0.3)'}`, fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {matchResult.length > 0
                    ? `✅ Found ${matchResult.length} match(es) at position(s): ${matchResult.join(', ')}`
                    : '❌ No match found'}
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === 'np' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              NP-Completeness Reduction Chain
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
              {NP_REDUCTIONS.map((reduction, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px 20px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.3)', minWidth: '120px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-violet)', fontSize: '15px' }}>
                    {reduction.from}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ fontSize: '20px', color: 'var(--accent-cyan)' }}>≤ₚ</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{reduction.desc}</div>
                  </div>
                  <div style={{ padding: '12px 20px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid rgba(0,245,212,0.3)', minWidth: '120px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '15px' }}>
                    {reduction.to}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '10px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent-violet)' }}>Cook-Levin Theorem:</strong> SAT is NP-complete. Since every NP problem polynomial-time reduces to SAT, and every problem above ≤ₚ the next, all shown problems are NP-complete.
            </div>
          </div>
        )}

        {activeSection === 'pumping' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Pumping Lemma Visualizer
            </h2>
            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 2 }}>
                For any regular language L with pumping length <span style={{ color: 'var(--accent-cyan)' }}>p</span>, for any string <span style={{ color: 'var(--accent-violet)' }}>w ∈ L</span> with |w| ≥ p:
                <br />w = <span style={{ color: 'var(--accent-red)' }}>u</span><span style={{ color: 'var(--accent-cyan)' }}>v</span><span style={{ color: 'var(--accent-green)' }}>z</span>  where:
              </div>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                <li style={{ color: 'var(--text-muted)' }}>|<span style={{ color: 'var(--accent-cyan)' }}>v</span>| ≥ 1 (v is non-empty)</li>
                <li style={{ color: 'var(--text-muted)' }}>|<span style={{ color: 'var(--accent-red)' }}>u</span><span style={{ color: 'var(--accent-cyan)' }}>v</span>| ≤ p (the "pump" part is in first p chars)</li>
                <li style={{ color: 'var(--text-muted)' }}>For all i ≥ 0: <span style={{ color: 'var(--accent-red)' }}>u</span><span style={{ color: 'var(--accent-cyan)' }}>v^i</span><span style={{ color: 'var(--accent-green)' }}>z</span> ∈ L</li>
              </ul>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(34,211,165,0.07)', border: '1px solid rgba(34,211,165,0.2)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--accent-green)' }}>Classic Example:</strong> {'{'}aⁿbⁿ : n ≥ 0{'}'} is NOT regular. Choose w = aᵖbᵖ. Any split uvz with |uv| ≤ p means v only contains a's. Pumping v gives more a's than b's — contradiction!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

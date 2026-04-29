import React, { useRef, useEffect } from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const TuringTape: React.FC = () => {
  const { tmTape, tmHeadPosition } = useAutomataStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  // Scroll to head position
  useEffect(() => {
    if (headRef.current && containerRef.current) {
      headRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [tmHeadPosition]);

  const visibleStart = Math.max(0, tmHeadPosition - 8);
  const visibleEnd = Math.min(tmTape.length - 1, tmHeadPosition + 12);
  const visibleCells = tmTape.slice(visibleStart, visibleEnd + 1);

  const visualIndex = (tmHeadPosition - visibleStart) + (visibleStart > 0 ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', overflow: 'hidden' }}>
      
      <div ref={containerRef} style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Head indicator */}
          <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: `${visualIndex * 48}px`, transition: 'padding-left 0.3s ease' }}>
            <div style={{
              width: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>HEAD</div>
              <div style={{ fontSize: '18px', lineHeight: 1 }}>▼</div>
            </div>
          </div>

          {/* Tape cells */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-base)', width: 'fit-content' }}>
            {/* Left ellipsis */}
            {visibleStart > 0 && (
              <div className="tape-cell" style={{ color: 'var(--text-muted)', borderRight: 'none' }}>...</div>
            )}
            {visibleCells.map((sym, i) => {
              const globalIdx = visibleStart + i;
              const isHead = globalIdx === tmHeadPosition;
              return (
                <div
                  key={globalIdx}
                  ref={isHead ? headRef : undefined}
                  className={`tape-cell ${isHead ? 'head' : ''}`}
                >
                  {sym === '_' ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>_</span>
                  ) : sym}
                </div>
              );
            })}
            {/* Right ellipsis */}
            {visibleEnd < tmTape.length - 1 && (
              <div className="tape-cell" style={{ color: 'var(--text-muted)', borderLeft: 'none' }}>...</div>
            )}
          </div>
        </div>
      </div>

      {/* Position indicator */}
      <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Head Position: {tmHeadPosition} | Reading: <span style={{ color: 'var(--accent-cyan)' }}>'{tmTape[tmHeadPosition] || '_'}'</span>
      </div>
    </div>
  );
};

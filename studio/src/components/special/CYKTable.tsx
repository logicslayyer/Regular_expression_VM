import React from 'react';

interface CYKTableProps {
  table: string[][][];
  input: string;
  filledCell?: { i: number; j: number };
  accepted?: boolean;
}

export const CYKTable: React.FC<CYKTableProps> = ({ table, input, filledCell, accepted }) => {
  const n = input.length;
  if (!table || n === 0) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div className="panel-section-title" style={{ marginBottom: '8px' }}>CYK Parse Table</div>

      {/* Input chars header */}
      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${n}, 64px)`, marginBottom: '4px' }}>
        <div />
        {input.split('').map((ch, j) => (
          <div key={j} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {ch}
          </div>
        ))}
      </div>

      {/* Table rows (i = row/length, j = col/start) */}
      {Array.from({ length: n }, (_, lenMinus1) => {
        const len = n - lenMinus1;
        return (
          <div key={lenMinus1} style={{ display: 'grid', gridTemplateColumns: `80px repeat(${n}, 64px)`, marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', paddingRight: '8px', justifyContent: 'flex-end' }}>
              len={len}
            </div>
            {Array.from({ length: n }, (_, j) => {
              const i = j;
              const tableJ = i + len - 1;
              if (tableJ >= n) {
                return <div key={j} style={{ background: 'transparent', border: '1px solid transparent', height: '48px' }} />;
              }
              const cell = table[i]?.[tableJ] || [];
              const isFilled = filledCell?.i === i && filledCell?.j === tableJ;
              const isSuccess = accepted && i === 0 && tableJ === n - 1;

              return (
                <div
                  key={j}
                  className={`cyk-cell ${cell.length > 0 ? 'filled' : ''} ${isFilled ? 'current-fill' : ''} ${isSuccess ? 'success' : ''}`}
                  style={{ height: '48px', minWidth: '64px' }}
                >
                  {cell.map((nt, k) => (
                    <span key={k} style={{
                      fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color: isSuccess ? 'var(--accent-green)' : 'var(--accent-cyan)',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '1px 4px', borderRadius: '3px',
                    }}>{nt}</span>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface StateNodeData {
  label: string;
  isStart?: boolean;
  isAccepting?: boolean;
  isActive?: boolean;
  isRejected?: boolean;
  isNFAActive?: boolean;
}

export const CustomStateNode = memo(({ data }: NodeProps) => {
  const d = data as StateNodeData;

  const isActive = d.isActive;
  const isAccepting = d.isAccepting;
  const isRejected = d.isRejected;

  let borderColor = 'rgba(0, 245, 212, 0.3)';
  let bgColor = 'var(--bg-elevated)';
  let textColor = 'rgba(0, 245, 212, 0.9)';
  let shadow = 'none';

  if (isActive) {
    borderColor = 'var(--accent-cyan)';
    bgColor = 'rgba(0, 245, 212, 0.12)';
    textColor = 'var(--accent-cyan)';
    shadow = '0 0 24px rgba(0,245,212,0.4), inset 0 0 12px rgba(0,245,212,0.08)';
  } else if (isRejected) {
    borderColor = 'var(--accent-red)';
    bgColor = 'rgba(248,113,113,0.12)';
    textColor = 'var(--accent-red)';
    shadow = '0 0 24px rgba(248,113,113,0.4)';
  } else if (isAccepting) {
    borderColor = 'var(--accent-cyan)';
    bgColor = 'rgba(0, 245, 212, 0.06)';
    textColor = 'var(--accent-cyan)';
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: `2px solid ${borderColor}`,
        background: bgColor,
        boxShadow: shadow,
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
      }}
    >
      {d.isStart && (
        <div style={{
          position: 'absolute',
          left: '-30px', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ width: '20px', height: '2px', background: 'var(--accent-cyan)' }} />
          <div style={{
            width: 0, height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '9px solid var(--accent-cyan)',
          }} />
        </div>
      )}

      {isAccepting && (
        <div style={{
          position: 'absolute', inset: '-7px', borderRadius: '50%',
          border: `2px solid ${isActive ? 'var(--accent-cyan)' : 'rgba(0,245,212,0.4)'}`,
          pointerEvents: 'none', transition: 'all 0.3s',
        }} />
      )}

      {isActive && (
        <div style={{
          position: 'absolute', inset: '-12px', borderRadius: '50%',
          border: '1px solid rgba(0,245,212,0.2)',
          pointerEvents: 'none', animation: 'pulseRing 1.5s ease-out infinite',
        }} />
      )}

      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
        userSelect: 'none', color: textColor, letterSpacing: '0.02em',
      }}>
        {String(d.label)}
      </span>

      {/* Handles on all 4 sides for flexible edge routing */}
      <Handle type="target" position={Position.Left} id="target-left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="source-top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="target-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ opacity: 0 }} />
    </div>
  );
});

CustomStateNode.displayName = 'CustomStateNode';

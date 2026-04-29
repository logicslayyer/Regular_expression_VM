import React, { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

interface StateNodeData extends Record<string, unknown> {
  label: string;
  isStart?: boolean;
  isAccepting?: boolean;
  isActive?: boolean;
  isRejected?: boolean;
  isNFAActive?: boolean;
}

type StateNode = Node<StateNodeData, 'stateNode'>;

export const CustomStateNode = memo(({ data }: NodeProps<StateNode>) => {
  const d = data;

  let nodeClass = 'state-node';
  if (d.isActive) nodeClass += ' active';
  else if (d.isRejected) nodeClass += ' rejected';
  else if (d.isNFAActive) nodeClass += ' nfa-active';

  return (
    <div
      className={nodeClass}
      style={{
        position: 'relative',
        ...(d.isAccepting ? { outline: '2px solid var(--accent-cyan)', outlineOffset: '5px' } : {}),
      }}
    >
      {/* Start arrow */}
      {d.isStart && (
        <div style={{
          position: 'absolute',
          left: '-28px', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: '2px',
        }}>
          <div style={{
            width: '18px', height: '2px',
            background: 'var(--accent-cyan)',
          }} />
          <div style={{
            width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '8px solid var(--accent-cyan)',
          }} />
        </div>
      )}

      {/* Accepting outer ring */}
      {d.isAccepting && (
        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          border: '2px solid rgba(0,245,212,0.5)',
          pointerEvents: 'none',
        }} />
      )}

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, userSelect: 'none' }}>
        {String(d.label)}
      </span>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="top-target" style={{ opacity: 0 }} />
    </div>
  );
});

CustomStateNode.displayName = 'CustomStateNode';

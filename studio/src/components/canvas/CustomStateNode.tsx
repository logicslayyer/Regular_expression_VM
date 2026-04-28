import React, { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useAutomataStore } from '../../store/useAutomataStore';

type StateNodeData = Record<string, unknown> & {
  label: string;
  isStart?: boolean;
  isAccepting?: boolean;
  isActive?: boolean;
  isRejected?: boolean;
  isNFAActive?: boolean;
  isDead?: boolean;
};

type StateNode = Node<StateNodeData, 'stateNode'>;

export const CustomStateNode = memo(({ id, data }: NodeProps<StateNode>) => {
  const { selectedStateId, hoveredStateId, hoveredTransitionKey, selectedTransitionKey, setSelectedStateId, setHoveredStateId, setSelectedTransitionKey } =
    useAutomataStore();

  const d = data;
  const relatedTransition = hoveredTransitionKey?.startsWith(`${id}::`) || selectedTransitionKey?.startsWith(`${id}::`);
  const isSelected = selectedStateId === id;
  const isHovered = hoveredStateId === id;

  let nodeClass = 'state-node';
  if (d.isActive) nodeClass += ' active';
  else if (d.isRejected) nodeClass += ' rejected';
  else if (d.isNFAActive) nodeClass += ' nfa-active';
  if (d.isDead) nodeClass += ' dead';
  if (isSelected) nodeClass += ' selected';
  if (isHovered || relatedTransition) nodeClass += ' hovered';

  return (
    <div
      className={nodeClass}
      onClick={() => setSelectedStateId(id)}
      onMouseEnter={() => setHoveredStateId(id)}
      onMouseLeave={() => setHoveredStateId(null)}
      onDoubleClick={() => setSelectedTransitionKey(null)}
      style={{
        position: 'relative',
        ...(d.isAccepting && !d.isDead ? { outline: '2px solid var(--accent-cyan)', outlineOffset: '5px' } : {}),
      }}
    >
      {d.isStart && (
        <div
          style={{
            position: 'absolute',
            left: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <div style={{ width: '18px', height: '2px', background: 'var(--accent-cyan)' }} />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '8px solid var(--accent-cyan)',
            }}
          />
        </div>
      )}

      {d.isAccepting && !d.isDead && (
        <div
          style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(0,245,212,0.5)',
            pointerEvents: 'none',
          }}
        />
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

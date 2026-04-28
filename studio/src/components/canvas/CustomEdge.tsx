import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

export const CustomEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, label,
}: EdgeProps) => {
  const isSelfLoop = data?.isSelfLoop as boolean || false;
  const isActive = data?.isActive as boolean || false;
  const isBiDir = data?.isBiDirectional as boolean || false;

  let edgePath = '', labelX = 0, labelY = 0;

  if (isSelfLoop) {
    // Self-loop: draw a looping arc above the node
    const loopSize = 40;
    edgePath =
      `M ${sourceX - 14} ${sourceY - 28}` +
      ` C ${sourceX - loopSize - 8} ${sourceY - 28 - loopSize * 1.8},` +
      ` ${sourceX + loopSize + 8} ${sourceY - 28 - loopSize * 1.8},` +
      ` ${sourceX + 14} ${sourceY - 28}`;
    labelX = sourceX;
    labelY = sourceY - 28 - loopSize * 1.5;
  } else {
    // For bidirectional edges, use a significant curvature so both edges are visible
    const curvature = isBiDir ? 0.4 : 0.15;
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      curvature,
    });
  }

  const edgeColor = isActive ? 'var(--accent-cyan)' : 'rgba(0,245,212,0.4)';
  const strokeWidth = isActive ? 2.5 : 1.5;

  return (
    <>
      <defs>
        <marker id={`arrow-${id}-default`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M1,1 L8,5 L1,9" fill="none" stroke="rgba(0,245,212,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </marker>
        <marker id={`arrow-${id}-active`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M1,1 L8,5 L1,9" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" />
        </marker>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth,
          strokeDasharray: isActive ? '6 3' : undefined,
          filter: isActive ? 'drop-shadow(0 0 6px rgba(0,245,212,0.5))' : undefined,
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
        markerEnd={`url(#arrow-${id}-${isActive ? 'active' : 'default'})`}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            background: isActive ? 'rgba(0,245,212,0.15)' : 'rgba(13,15,20,0.92)',
            border: `1px solid ${isActive ? 'rgba(0,245,212,0.5)' : 'rgba(0,245,212,0.15)'}`,
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isActive ? 'var(--accent-cyan)' : 'rgba(0,245,212,0.8)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s',
            letterSpacing: '0.02em',
            boxShadow: isActive ? '0 0 8px rgba(0,245,212,0.2)' : 'none',
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          {String(label ?? '')}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';

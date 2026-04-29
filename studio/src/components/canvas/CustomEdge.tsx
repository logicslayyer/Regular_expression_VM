import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export const CustomEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, label,
}: EdgeProps) => {
  const isSelfLoop = data?.isSelfLoop as boolean || false;
  const isActive = data?.isActive as boolean || false;

  let edgePath = '', labelX = 0, labelY = 0;

  if (isSelfLoop) {
    // Draw a looping arc above the node starting from the top boundary
    edgePath =
      `M ${sourceX - 8} ${sourceY} ` +
      `C ${sourceX - 40} ${sourceY - 60}, ${sourceX + 40} ${sourceY - 60}, ${sourceX + 8} ${sourceY}`;
    labelX = sourceX;
    labelY = sourceY - 45;
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: 12,
    });
  }

  const edgeColor = isActive ? 'var(--accent-cyan)' : 'rgba(100,116,139,0.6)';
  const strokeWidth = isActive ? 2.5 : 1.5;

  return (
    <>
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
        markerEnd={`url(#arrow-${isActive ? 'active' : 'default'})`}
      />

      {/* SVG defs for arrowheads */}
      <defs>
        <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(100,116,139,0.6)" />
        </marker>
        <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--accent-cyan)" />
        </marker>
      </defs>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            background: isActive ? 'rgba(0,245,212,0.15)' : 'rgba(19,22,30,0.85)',
            border: `1px solid ${isActive ? 'rgba(0,245,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s',
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

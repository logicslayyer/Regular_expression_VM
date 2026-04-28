import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useAutomataStore } from '../../store/useAutomataStore';

export const CustomEdge = memo(
  ({ id, source, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, label }: EdgeProps) => {
    const {
      activeTransition,
      hoveredTransitionKey,
      selectedTransitionKey,
      setSelectedTransitionKey,
      setHoveredTransitionKey,
      setSelectedStateId,
      setHoveredStateId,
    } = useAutomataStore();

    const symbols = (data?.symbols as string[] | undefined) || [];
    const selectedSymbol = selectedTransitionKey?.startsWith(`${source}::`) ? selectedTransitionKey.split('::')[1] : null;
    const hoveredSymbol = hoveredTransitionKey?.startsWith(`${source}::`) ? hoveredTransitionKey.split('::')[1] : null;

    const isSelfLoop = Boolean(data?.isSelfLoop);
    const isActive = Boolean(data?.isActive);
    const isSelected = selectedSymbol ? symbols.includes(selectedSymbol) : false;
    const isHovered = hoveredSymbol ? symbols.includes(hoveredSymbol) : false;

    let edgePath = '';
    let labelX = 0;
    let labelY = 0;

    if (isSelfLoop) {
      edgePath =
        `M ${sourceX - 8} ${sourceY} ` +
        `C ${sourceX - 40} ${sourceY - 60}, ${sourceX + 40} ${sourceY - 60}, ${sourceX + 8} ${sourceY}`;
      labelX = sourceX;
      labelY = sourceY - 45;
    } else {
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 12,
      });
    }

    const highlight = isActive || isSelected || isHovered;
    const edgeColor = highlight ? 'var(--accent-cyan)' : 'rgba(100,116,139,0.6)';
    const strokeWidth = highlight ? 2.5 : 1.5;

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth,
            strokeDasharray: isActive ? '6 3' : undefined,
            filter: highlight ? 'drop-shadow(0 0 6px rgba(0,245,212,0.5))' : undefined,
            transition: 'stroke 0.3s, stroke-width 0.3s',
          }}
          markerEnd={`url(#arrow-${highlight ? 'active' : 'default'})`}
        />

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
              background: highlight ? 'rgba(0,245,212,0.15)' : 'var(--overlay-bg)',
              border: `1px solid ${highlight ? 'rgba(0,245,212,0.5)' : 'var(--border)'}`,
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: highlight ? 'var(--accent-cyan)' : 'var(--text-muted)',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            className="nodrag nopan"
            onMouseEnter={() => {
              const symbol = symbols[0] || String(label ?? '').split(',')[0]?.trim() || '';
              if (symbol) setHoveredTransitionKey(`${source}::${symbol}`);
              setHoveredStateId(source);
            }}
            onMouseLeave={() => {
              setHoveredTransitionKey(null);
              setHoveredStateId(null);
            }}
            onClick={() => {
              const symbol = symbols[0] || String(label ?? '').split(',')[0]?.trim() || '';
              if (symbol) setSelectedTransitionKey(`${source}::${symbol}`);
              setSelectedStateId(source);
            }}
          >
            {String(label ?? '')}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }
);

CustomEdge.displayName = 'CustomEdge';

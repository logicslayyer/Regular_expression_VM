import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState, BackgroundVariant,
  type Node, type Edge, type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAutomataStore } from '../../store/useAutomataStore';
import { CustomStateNode } from './CustomStateNode';
import { CustomEdge } from './CustomEdge';
import { NFA } from '../../engine/thompson';
import { DFA } from '../../engine/subset-construction';

const nodeTypes = { stateNode: CustomStateNode };
const edgeTypes = { customEdge: CustomEdge };

type CanvasNodeData = Record<string, unknown> & {
  label: string;
  isStart: boolean;
  isAccepting: boolean;
  isActive?: boolean;
  isRejected?: boolean;
  isNFAActive?: boolean;
};

type CanvasEdgeData = Record<string, unknown> & {
  label: string;
  isSelfLoop: boolean;
  isActive?: boolean;
};

type CanvasNode = Node<CanvasNodeData, 'stateNode'>;
type CanvasEdge = Edge<CanvasEdgeData, 'customEdge'>;

// Arrange nodes in a circle so small automata stay readable.
function layoutNodes(states: { id: string; isStart: boolean; isAccepting: boolean; label?: string }[]) {
  const n = states.length;
  const radius = Math.min(220, Math.max(100, n * 40));
  const cx = 400;
  const cy = 300;

  return states.map((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      id: s.id,
      type: 'stateNode',
      position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
      data: { label: s.label || s.id, isStart: s.isStart, isAccepting: s.isAccepting },
    } as CanvasNode;
  });
}

// Group parallel edges by same from/to pair and combine labels.
function buildEdges(transitions: { from: string; to: string; symbol: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const t of transitions) {
    const key = `${t.from}__${t.to}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t.symbol);
  }

  const edges: CanvasEdge[] = [];
  for (const [key, symbols] of grouped.entries()) {
    const [from, to] = key.split('__');
    edges.push({
      id: `${from}-${to}`,
      source: from,
      target: to,
      sourceHandle: from === to ? 'top-source' : undefined,
      targetHandle: from === to ? 'top-target' : undefined,
      type: 'customEdge',
      label: symbols.join(', '),
      data: { label: symbols.join(', '), isSelfLoop: from === to },
    } as CanvasEdge);
  }
  return edges;
}

export const AutomataCanvas: React.FC = () => {
  const { nfa, dfa, minimizedDFA, activeSubTab, activeStates, activeTransition } = useAutomataStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>([]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Build graph whenever the automaton changes.
  useEffect(() => {
    let automaton: NFA | DFA | null = null;
    if (activeSubTab === 're-nfa') automaton = nfa;
    else automaton = minimizedDFA || dfa || nfa;

    if (!automaton) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes = layoutNodes(automaton.states.map((s) => ({
      id: s.id,
      isStart: s.isStart,
      isAccepting: s.isAccepting,
      label: s.id,
    })));
    const newEdges = buildEdges(automaton.transitions);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [nfa, dfa, minimizedDFA, activeSubTab, setNodes, setEdges]);

  // Update active state highlights.
  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isActive: activeStates.includes(n.id),
      },
    })));
  }, [activeStates, setNodes]);

  // Update active edge highlight.
  useEffect(() => {
    setEdges((eds) => eds.map((e) => ({
      ...e,
      data: {
        label: e.data?.label ?? '',
        isSelfLoop: e.data?.isSelfLoop ?? false,
        isActive: e.id === activeTransition,
      },
    })));
  }, [activeTransition, setEdges]);

  const hasAutomaton = !!(nfa || dfa);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!hasAutomaton && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', padding: '40px',
            background: 'rgba(19,22,30,0.8)', borderRadius: '16px',
            border: '1px solid var(--border)', backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Ready to Build
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px' }}>
              Type a regular expression using the calculator on the left, then click
              <span style={{ color: 'var(--accent-cyan)' }}> Generate NFA</span>
            </div>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg-base)' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
        <Controls style={{ border: '1px solid var(--border)' }} />
        <MiniMap
          nodeColor={(n) => (n.data.isActive ? '#22d3a5' : '#1a1e2a')}
          maskColor="rgba(13,15,20,0.8)"
        />
      </ReactFlow>
    </div>
  );
};

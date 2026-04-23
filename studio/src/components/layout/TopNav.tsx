import React from 'react';
import { useAutomataStore } from '../../store/useAutomataStore';
import { Dna, BookOpen, Cpu, Brain, Layers, HelpCircle, Sun } from 'lucide-react';

const TABS = [
  { id: 'studio',     label: 'Automata Studio',  icon: Layers },
  { id: 'grammar',    label: 'Grammar Lab',       icon: BookOpen },
  { id: 'pda-tm',     label: 'PDA & Turing',      icon: Cpu },
  { id: 'complexity', label: 'Complexity',        icon: Brain },
  { id: 'learning',   label: 'Learning Hub',      icon: Dna },
] as const;

export const TopNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAutomataStore();

  return (
    <nav style={{
      height: '56px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '8px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '24px', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '800',
          color: '#0d0f14', fontFamily: 'var(--font-display)',
        }}>A</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          Automata Studio
        </span>
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>
          <Sun size={14} />
        </button>
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }}>
          <HelpCircle size={14} />
        </button>
      </div>
    </nav>
  );
};

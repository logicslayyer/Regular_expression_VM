import React, { useState, useRef } from 'react';
import { useAutomataStore } from './store/useAutomataStore';
import { TopNav } from './components/layout/TopNav';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightPanel } from './components/layout/RightPanel';
import { BottomBar } from './components/layout/BottomBar';
import { AutomataStudio } from './components/tabs/AutomataStudio';
import { GrammarLab } from './components/tabs/GrammarLab';
import { PDAAndTM } from './components/tabs/PDAAndTM';
import { ComplexityApps } from './components/tabs/ComplexityApps';
import { LearningHub } from './components/tabs/LearningHub';

const TAB_COMPONENTS = {
  studio:     AutomataStudio,
  grammar:    GrammarLab,
  'pda-tm':   PDAAndTM,
  complexity: ComplexityApps,
  learning:   LearningHub,
};

// Tabs that need the sidebar
const TABS_WITH_SIDEBAR = ['studio', 'grammar', 'complexity'];
// Tabs that need the bottom bar
const TABS_WITH_BOTTOM = ['pda-tm', 'complexity'];
// Tabs that need the right panel
const TABS_WITH_RIGHT = ['pda-tm'];

function App() {
  const { activeTab, theme } = useAutomataStore();
  const ActiveTabComponent = TAB_COMPONENTS[activeTab as keyof typeof TAB_COMPONENTS];
  const showSidebar = TABS_WITH_SIDEBAR.includes(activeTab);
  const showBottom  = TABS_WITH_BOTTOM.includes(activeTab);
  const showRight   = TABS_WITH_RIGHT.includes(activeTab);

  React.useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('automata-theme', theme);
  }, [theme]);

  const [bottomHeight, setBottomHeight] = useState(72);
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(300);
  const appContainerRef = useRef<HTMLDivElement>(null);

  const handleBottomDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = appContainerRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newHeight = rect.bottom - moveEvent.clientY;
      setBottomHeight(Math.min(Math.max(newHeight, 60), rect.height * 0.8));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleLeftDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = appContainerRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newWidth = moveEvent.clientX - rect.left;
      setLeftWidth(Math.min(Math.max(newWidth, 200), rect.width * 0.6));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRightDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = appContainerRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newWidth = rect.right - moveEvent.clientX;
      setRightWidth(Math.min(Math.max(newWidth, 200), rect.width * 0.6));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '56px 1fr',
      gridTemplateColumns: '1fr',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Top Navigation */}
      <TopNav />

      {/* Main area */}
      <div ref={appContainerRef} style={{
        display: 'grid',
        gridTemplateColumns: `${showSidebar ? `${leftWidth}px` : '0'} ${showSidebar ? '6px' : '0'} 1fr ${showRight ? '6px' : '0'} ${showRight ? `${rightWidth}px` : '0'}`,
        gridTemplateRows: `1fr ${showBottom ? '6px' : '0'} ${showBottom ? `${bottomHeight}px` : '0'}`,
        overflow: 'hidden',
      }}>
        {/* Left Sidebar */}
        {showSidebar && <div style={{ overflow: 'hidden' }}><LeftSidebar /></div>}
        {!showSidebar && <div />}

        {/* Left Resizer */}
        {showSidebar && (
          <div
            onMouseDown={handleLeftDrag}
            style={{
              cursor: 'col-resize',
              background: 'var(--border)',
              zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--accent-cyan)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--border)'}
          />
        )}
        {!showSidebar && <div />}

        {/* Central Content */}
        <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <ActiveTabComponent />
        </main>

        {/* Right Resizer */}
        {showRight && (
          <div
            onMouseDown={handleRightDrag}
            style={{
              cursor: 'col-resize',
              background: 'var(--border)',
              zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--accent-cyan)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--border)'}
          />
        )}
        {!showRight && <div />}

        {/* Right Panel */}
        {showRight && <div style={{ overflow: 'hidden' }}><RightPanel /></div>}
        {!showRight && <div />}

        {/* Bottom Resizer */}
        {showBottom && (
          <div
            onMouseDown={handleBottomDrag}
            style={{
              gridColumn: '1 / -1',
              gridRow: '2',
              cursor: 'row-resize',
              background: 'var(--border)',
              zIndex: 10,
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--accent-cyan)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--border)'}
          />
        )}

        {/* Bottom Bar spans full width under main content area */}
        {showBottom && (
          <div style={{ gridColumn: '1 / -1', gridRow: '3', overflow: 'hidden' }}>
            <BottomBar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

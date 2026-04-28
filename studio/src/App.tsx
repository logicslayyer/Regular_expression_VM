import React from 'react';
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${showSidebar ? '280px' : '0'} 1fr ${showRight ? 'auto' : '0'}`,
        gridTemplateRows: `1fr ${showBottom ? '72px' : '0'}`,
        overflow: 'hidden',
      }}>
        {/* Left Sidebar */}
        {showSidebar && <LeftSidebar />}
        {!showSidebar && <div />}

        {/* Central Content */}
        <main style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, gridRow: '1', gridColumn: `${showSidebar ? '2' : '1'} / ${showRight ? '3' : '-1'}` }}>
          <ActiveTabComponent />
        </main>

        {/* Right Panel */}
        {showRight && <RightPanel />}
        {!showRight && <div />}

        {/* Bottom Bar spans full width under main content area */}
        {showBottom && (
          <div style={{ gridColumn: `${showSidebar ? '1' : '1'} / -1`, gridRow: '2' }}>
            <BottomBar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

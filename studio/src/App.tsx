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
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

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
const TABS_WITH_BOTTOM = ['studio', 'pda-tm', 'complexity'];
// Tabs that need the right panel
const TABS_WITH_RIGHT = ['studio', 'pda-tm'];

function App() {
  const { activeTab } = useAutomataStore();
  const ActiveTabComponent = TAB_COMPONENTS[activeTab as keyof typeof TAB_COMPONENTS];
  const showSidebar = TABS_WITH_SIDEBAR.includes(activeTab);
  const showBottom  = TABS_WITH_BOTTOM.includes(activeTab);
  const showRight   = TABS_WITH_RIGHT.includes(activeTab);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Top Navigation */}
      <TopNav />

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {showSidebar && (
            <>
              <Panel defaultSize={20} minSize={10} maxSize={40} style={{ display: 'flex' }}>
                <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                  <LeftSidebar />
                </div>
              </Panel>
              <PanelResizeHandle style={{ width: '4px', cursor: 'col-resize', background: 'var(--border)' }} />
            </>
          )}

          {/* Central Content */}
          <Panel minSize={30}>
            {showBottom ? (
              <PanelGroup direction="vertical">
                <Panel minSize={30} style={{ display: 'flex', flexDirection: 'column' }}>
                  <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ActiveTabComponent />
                  </main>
                </Panel>
                <PanelResizeHandle style={{ height: '4px', cursor: 'row-resize', background: 'var(--border)' }} />
                <Panel defaultSize={15} minSize={5} maxSize={50} style={{ display: 'flex' }}>
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <BottomBar />
                  </div>
                </Panel>
              </PanelGroup>
            ) : (
              <main style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <ActiveTabComponent />
              </main>
            )}
          </Panel>

          {/* Right Panel */}
          {showRight && (
            <>
              <PanelResizeHandle style={{ width: '4px', cursor: 'col-resize', background: 'var(--border)' }} />
              <Panel defaultSize={25} minSize={15} maxSize={40} style={{ display: 'flex' }}>
                <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                  <RightPanel />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;

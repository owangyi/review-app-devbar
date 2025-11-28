import DevBar from './components/DevBar/Index';
import FeatureTabs from './components/Features/FeatureTabs';
import { getBackendBaseUrl, getCurrentBackendBranch } from './api';
import './App.css';

function App() {
  // Get current branch info
  const backendUrl = getBackendBaseUrl();
  const backendBranch = getCurrentBackendBranch();
  
  // Get current frontend branch from URL
  const hostname = window.location.hostname;
  const frontendBranch = hostname.split('.')[0];
  
  // Determine if this is a feature branch
  const isFeatureBranch = frontendBranch.startsWith('feature-');

  // Render different content based on branch
  const renderContent = () => {
    if (isFeatureBranch) {
      // Feature branches show the interactive tabs
      return (
        <>
          <header className="App-header">
            <div className="api-config-compact">
              <span className="api-config-item">
                <span className="api-config-label">Frontend Branch:</span>
                <code>{frontendBranch}</code>
              </span>
              <span className="api-config-separator">•</span>
              <span className="api-config-item">
                <span className="api-config-label">Backend Branch:</span>
                <code>{backendBranch}</code>
              </span>
            </div>
          </header>

          <FeatureTabs />
        </>
      );
    } else {
      // Develop/main branches show the original demo page
  return (
      <header className="App-header">
        <h1>Review App DevBar Demo</h1>
        <p>This is a demo page showing the DevBar component at the bottom.</p>
        <div className="demo-content">
          <h2>Environment Switcher</h2>
          <p>
            Use the DevBar at the bottom of the page to switch between different
            frontend and backend environments without rebuilding.
          </p>
          <ul>
            <li><strong>Frontend branches</strong>: URL will change to new branch domain (e.g., main.discovery.wang)</li>
            <li><strong>Backend branches</strong>: API requests go to selected backend domain (e.g., staging.api.discovery.wang)</li>
            <li>Selections are stored in cookies</li>
            <li>Page reloads automatically when switching</li>
          </ul>
          
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <h3>Current Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <strong>Frontend Branch:</strong> <code>{frontendBranch}</code>
                </div>
                <div>
                  <strong>Backend Branch:</strong> <code>{backendBranch}</code>
                </div>
                <div>
                  <strong>Backend API:</strong> <code>{backendUrl}</code>
                </div>
              </div>
            <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                💡 Switch to a feature branch to see interactive demos
            </p>
          </div>
        </div>
      </header>
      );
    }
  };
      
  return (
    <div className="App">
      {renderContent()}
      <DevBar />
    </div>
  );
}

export default App;


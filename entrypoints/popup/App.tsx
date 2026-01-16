import './App.css';
import { useState } from 'react';
import { Bug, GithubLogo, MagnifyingGlass, Eye } from '@phosphor-icons/react';
import { AnimatedLogo } from '@/components/animated-logo';
import githubMark from '@/assets/github-mark.svg';
import { MainToggleButton } from '@/components/main-toggle-button.tsx';
import { useLocalExtStorage } from '@/utils/use-local-ext-storage';

function App() {
  const [isActivated, setIsActivated] = useLocalExtStorage('isActivated', true);
  const [inspectState, setInspectState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const inspectUrl = browser.runtime.getURL('inspect.html');

  const startInspect = async () => {
    setInspectState('sending');
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setInspectState('error');
        return;
      }
      const response = await browser.tabs.sendMessage(tab.id, { type: 'SLAB_START_INSPECT' });
      setInspectState(response?.ok === false ? 'error' : 'sent');
    } catch (error) {
      console.error('Failed to start inspect', error);
      setInspectState('error');
    }
  };

  return (
    <div className="slab-popup">
      <header className="slab-header">
        <AnimatedLogo />
        <a href="https://github.com/lcandy2/Select-like-a-Boss" target="_blank">
          <img src={githubMark} className="slab-github-icon" alt="GitHub Repo" />
        </a>
      </header>
      <div className="slab-body">
        <MainToggleButton isOn={isActivated} setIsOn={setIsActivated} />
        <details className="slab-help">
          <summary className="slab-help-summary">
            <Bug size={16} weight="bold" />
            Having issues?
          </summary>
          <div className="slab-help-body">
            <div className="slab-help-actions">
              <button
                className="slab-btn slab-btn-primary slab-inspect-button"
                type="button"
                onClick={startInspect}
                disabled={inspectState === 'sending'}
              >
                <MagnifyingGlass size={16} weight="bold" />
                {inspectState === 'sending' ? 'Sending…' : 'Start Inspect'}
              </button>
              <a
                className="slab-btn slab-btn-secondary slab-inspect-link"
                href={inspectUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Eye size={16} weight="bold" />
                View Inspect
              </a>
            </div>
            <a
              className="slab-btn slab-btn-ghost slab-github-link"
              href="https://github.com/lcandy2/Select-like-a-Boss/issues"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo size={16} weight="bold" />
              Report on GitHub
            </a>
            <p className="slab-inspect-hint">
              After Inspect, attach the logs when filing a GitHub issue.
            </p>
            {inspectState === 'sent' && (
              <p className="slab-inspect-status slab-inspect-status-ok">Inspect is armed for one attempt.</p>
            )}
            {inspectState === 'error' && (
              <p className="slab-inspect-status slab-inspect-status-error">Inspect failed to start.</p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

export default App;

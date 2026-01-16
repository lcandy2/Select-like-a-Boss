import './App.css';
import { useState } from 'react';
import { AnimatedLogo } from '@/components/animated-logo';
import githubMark from '@/assets/github-mark.svg';
import { MainToggleButton } from '@/components/main-toggle-button.tsx';
import { useLocalExtStorage } from '@/utils/use-local-ext-storage';

function App() {
  const [isActivated, setIsActivated] = useLocalExtStorage('isActivated', true);
  const [inspectState, setInspectState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const startInspect = async () => {
    setInspectState('sending');
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setInspectState('error');
        return;
      }
      const response = await browser.tabs.sendMessage(tab.id, { type: 'SLAB_START_INSPECT' });
      setInspectState(response?.ok ? 'sent' : 'error');
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
      <MainToggleButton isOn={isActivated} setIsOn={setIsActivated} />
      <div className="slab-actions">
        <button
          className="slab-inspect-button"
          type="button"
          onClick={startInspect}
          disabled={inspectState === 'sending'}
        >
          {inspectState === 'sending' ? 'Sending…' : 'Inspect once'}
        </button>
        <p className="slab-inspect-hint">
          Click Inspect, then try selecting a link on the page. Logs are saved to local storage.
        </p>
        {inspectState === 'sent' && (
          <p className="slab-inspect-status slab-inspect-status-ok">Inspect is armed for one attempt.</p>
        )}
        {inspectState === 'error' && (
          <p className="slab-inspect-status slab-inspect-status-error">Inspect failed to start.</p>
        )}
      </div>
    </div>
  );
}

export default App;

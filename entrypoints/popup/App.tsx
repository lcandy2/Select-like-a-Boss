import './App.css';
import { AnimatedLogo } from '@/components/animated-logo';
import githubMark from '@/assets/github-mark.svg';
import {MainToggleButton} from "@/components/main-toggle-button.tsx";
import { useLocalExtStorage } from '@/utils/use-local-ext-storage';

function App() {
  const [isActivated, setIsActivated] = useLocalExtStorage('isActivated', true);

  return (
    <div className="slab-popup">
      <header className="slab-header">
        <AnimatedLogo />
        <a href="https://github.com/lcandy2/Select-like-a-Boss" target="_blank">
          <img src={githubMark} className="slab-github-icon" alt="GitHub Repo" />
        </a>
      </header>
      <MainToggleButton isOn={isActivated} setIsOn={setIsActivated} />
    </div>
  );
}

export default App;

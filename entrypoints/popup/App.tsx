import '@/components/tailwind.css'
import { AnimatedLogo } from '@/components/animated-logo';
import githubMark from '@/assets/github-mark.svg';
import {MainToggleButton} from "@/components/main-toggle-button.tsx";
import { useLocalExtStorage } from '@/utils/use-local-ext-storage';

function App() {
  const [isActivated, setIsActivated] = useLocalExtStorage('isActivated', true);

  return (
    <div className='flex flex-col items-center w-full h-full mb-6'>
      <header className='flex flex-row items-center gap-2 mb-6 mt-8'>
        <AnimatedLogo className=''/>
        <a href="https://github.com/lcandy2/Select-like-a-Boss" target="_blank"><img src={githubMark} className='size-5' alt="GitHub Repo"/></a>
      </header>
      <MainToggleButton isOn={isActivated} setIsOn={setIsActivated} />
    </div>
  );
}

export default App;

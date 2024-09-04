import '@/components/tailwind.css'
import { AnimatedLogo } from '@/components/animated-logo';
import githubMark from '@/assets/github-mark.svg';
import React from "react";
import {LargeToggleButton} from "@/components/large-toggle-button.tsx";

function App() {

  return (
    <div className='flex flex-col items-center w-full h-full'>
      <header className='flex flex-row items-center gap-2 mb-6 mt-8'>
        <AnimatedLogo className=''/>
        <a href="https://github.com/lcandy2/Select-like-a-Boss" target="_blank"><img src={githubMark} className='size-5' alt="GitHub Repo"/></a>
      </header>
      <LargeToggleButton />
    </div>
  );
}

export default App;

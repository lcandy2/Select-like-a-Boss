import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MousePointer, Type } from 'lucide-react';

export const AnimatedLogo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  const selectionControls = useAnimation();
  const cursorControls = useAnimation();
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateSelection = async () => {
      if (!textRef.current) return;

      const textWidth = textRef.current.offsetWidth;
      const twoCharWidth = textWidth * (2.65 / (textRef.current.textContent?.length || 1));

      // Full selection
      await Promise.all([
        selectionControls.start({
          width: textWidth,
          transition: { duration: 0.4, ease: "linear" }
        }),
        cursorControls.start({
          x: textWidth,
          transition: { duration: 0.4, ease: "linear" }
        })
      ]);

      // Pause at the end
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return to first two characters
      await Promise.all([
        selectionControls.start({
          width: twoCharWidth,
          transition: { duration: 0.4, ease: "easeInOut" }
        }),
        cursorControls.start({
          x: twoCharWidth,
          opacity: 0,
          transition: { duration: 0.4, ease: "easeInOut" }
        })
      ]);
    };

    animateSelection();
  }, [selectionControls, cursorControls]);

  const rootClassName = ['slab-animated-logo', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} {...props}>
      <div className="slab-animated-logo-inner">
        <motion.div
          className="slab-animated-logo-cursor"
          animate={cursorControls}
          initial={{ x: 0, opacity: 1 }}
        >
          <MousePointer className="slab-animated-logo-mouse" />
        </motion.div>
        <div ref={textRef} className="slab-animated-logo-text">
          <a href="https://select.citrons.cc" target="_blank">Select like a Boss</a>
          <motion.div
            className="slab-animated-logo-selection"
            initial={{ width: 0 }}
            animate={selectionControls}
          />
          <motion.div
            className="slab-animated-logo-caret"
            animate={cursorControls}
            initial={{ x: 0, opacity: 1 }}
          >
            <Type className="slab-animated-logo-type" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

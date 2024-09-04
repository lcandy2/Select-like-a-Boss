import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MousePointer, Type } from 'lucide-react';
import {twMerge} from "tailwind-merge";

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

  return (
      <div className={twMerge(className, "flex justify-center items-center h-fit")} {...props}>
        <div className="relative">
              <motion.div
                  className="absolute top-0 left-0"
                  animate={cursorControls}
                  initial={{ x: 0, opacity: 1 }}
              >
                <MousePointer className="w-6 h-6 text-gray-600" />
              </motion.div>
          <div ref={textRef} className="text-2xl font-bold text-blue-600 relative underline">
            <a href="https://select.citrons.cc" target='_blank'>Select like a Boss</a>
            <motion.div
                className="absolute bottom-0 left-0 h-full bg-blue-200 opacity-50"
                initial={{ width: 0 }}
                animate={selectionControls}
            />
                <motion.div
                    className="absolute top-0 left-0 h-full w-0.5 bg-black"
                    animate={cursorControls}
                    initial={{ x: 0, opacity: 1 }}
                >
                  <Type className="w-4 h-4 text-black absolute -left-1.5 -top-5" />
                </motion.div>
          </div>
        </div>
      </div>
  );
};

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LargeToggleButtonProps {
  isOn: boolean;
  setIsOn: (isOn: boolean) => void;
}

export const MainToggleButton = ({ isOn, setIsOn }: LargeToggleButtonProps) => {
  const [isReady, setIsReady] = useState(false);
  const toggleSwitch = () => setIsOn(!isOn);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, []);

  return (
    <div className="slab-toggle">
      <motion.div
        className={`slab-toggle-track ${isOn ? 'slab-toggle-track-on' : 'slab-toggle-track-off'}`}
        onClick={toggleSwitch}
        animate={{
          backgroundColor: '#ffffff',
        }}
      >
        <motion.div
          className="slab-toggle-thumb"
          animate={{
            x: isOn ? 64 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30,
            duration: isReady ? 0.5 : 0,
          }}
        />
      </motion.div>
      <div className="slab-toggle-label">{isOn ? 'ON' : 'OFF'}</div>
    </div>
  );
};

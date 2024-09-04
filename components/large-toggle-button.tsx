import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const LargeToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => setIsOn(!isOn);

  return (
      <div className="flex flex-col items-center justify-center">
        <motion.div
            className={`flex items-center w-20 h-10 p-1 rounded-full cursor-pointer ${
                isOn ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={toggleSwitch}
            animate={{
              backgroundColor: isOn ? '#3B82F6' : '#D1D5DB'
            }}
        >
          <motion.div
              className="w-8 h-8 bg-white rounded-full shadow-md"
              animate={{
                x: isOn ? 40 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 30
              }}
          />
        </motion.div>
        <div className="mt-4 text-2xl font-bold">
          {isOn ? 'ON' : 'OFF'}
        </div>
      </div>
  );
};

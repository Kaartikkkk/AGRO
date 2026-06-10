import React from 'react';
import { motion } from 'framer-motion';

const AnimatedTractor = () => {
  return (
    <motion.div
      className="absolute bottom-1/4 z-10"
      initial={{ x: '-20%' }}
      animate={{ 
        x: ['-20%', '120%'],
        y: [0, -5, 0] 
      }}
      transition={{
        x: { duration: 40, repeat: Infinity, ease: "linear" },
        y: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Body */}
        <rect x="30" y="30" width="60" height="30" rx="4" fill="#2E7D32" />
        <rect x="70" y="10" width="20" height="30" rx="2" fill="#4CAF50" />
        {/* Wheels */}
        <circle cx="45" cy="65" r="15" fill="#333" stroke="#222" strokeWidth="2" />
        <circle cx="45" cy="65" r="6" fill="#666" />
        <circle cx="95" cy="65" r="10" fill="#333" stroke="#222" strokeWidth="2" />
        <circle cx="95" cy="65" r="4" fill="#666" />
        {/* Smoke Stack */}
        <rect x="75" y="0" width="4" height="15" fill="#555" />
        <motion.circle 
          cx="77" cy="-5" r="3" fill="#888" opacity="0.6"
          animate={{ y: [-10, -50], opacity: [0.6, 0], scale: [1, 2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedTractor;

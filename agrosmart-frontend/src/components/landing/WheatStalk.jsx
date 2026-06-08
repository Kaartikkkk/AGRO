import React from 'react';
import { motion } from 'framer-motion';

const WheatStalk = ({ delay = 0, x = 0, y = 0, scale = 1 }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: `${y}%`,
        scale: scale,
        originY: 'bottom',
      }}
      animate={{
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 60V10" stroke="#FBC02D" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="12" cy="10" rx="4" ry="8" fill="#FBC02D" />
        <ellipse cx="8" cy="18" rx="3" ry="6" fill="#FBC02D" transform="rotate(-30 8 18)" />
        <ellipse cx="16" cy="22" rx="3" ry="6" fill="#FBC02D" transform="rotate(30 16 22)" />
        <ellipse cx="10" cy="30" rx="3" ry="6" fill="#FBC02D" transform="rotate(-30 10 30)" />
        <ellipse cx="14" cy="34" rx="3" ry="6" fill="#FBC02D" transform="rotate(30 14 34)" />
      </svg>
    </motion.div>
  );
};

export default WheatStalk;

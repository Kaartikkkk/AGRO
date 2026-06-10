import React from 'react';
import { motion } from 'framer-motion';
import { Map, CloudSun, BrainCircuit, BarChart3 } from 'lucide-react';

const AuthRightPanel = () => {
  const features = [
    { icon: Map, label: 'Land & Crop Management' },
    { icon: CloudSun, label: 'Weather Forecasts' },
    { icon: BrainCircuit, label: 'AI Disease Detection' },
    { icon: BarChart3, label: 'Mandi Price Tracker' }
  ];

  // Initials-based placeholders for bottom social proof (no photo assets)
  const placeholders = [
    { initial: 'K', bg: 'bg-emerald-600' },
    { initial: 'A', bg: 'bg-teal-600' },
    { initial: 'R', bg: 'bg-green-600' },
    { initial: 'S', bg: 'bg-emerald-700' },
    { initial: 'M', bg: 'bg-teal-700' }
  ];

  return (
    <div className="hidden md:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16 xl:p-24 bg-[#1a3c2e] min-h-screen text-white select-none">
      
      {/* 1. Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3c2e] via-[#1e4d35] to-[#14532d] z-0 pointer-events-none" />

      {/* 4. Interactive Floating Decorative Blobs */}
      <motion.div 
        animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-12 w-64 h-64 bg-fresh-green/10 rounded-full blur-3xl z-0 pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/3 -right-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl z-0 pointer-events-none"
      />

      {/* Header Spacer */}
      <div className="z-10" />

      {/* Middle Content */}
      <div className="z-10 max-w-lg my-auto space-y-12">
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm"
          >
            Smart Farming <br />
            <span className="text-[#22c55e] inline-block mt-1">Starts Here</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="text-white/80 text-base lg:text-lg leading-relaxed font-medium"
          >
            Manage your land, track crops, detect diseases, and get AI-powered insights — all in one place.
          </motion.p>
        </div>

        {/* Feature Highlight Pills */}
        <div className="space-y-3.5">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1, ease: 'easeOut' }}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3 rounded-full hover:bg-white/15 transition-all duration-300 w-fit group cursor-default"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-300 text-[#22c55e]">
                <item.icon size={18} />
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/95">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Section (Social Proof) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="z-10 flex flex-col gap-3 pt-6 border-t border-white/10"
      >
        <p className="text-xs text-white/60 font-semibold tracking-wider uppercase">Trusted by 10,000+ Farmers Across India</p>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5 overflow-hidden">
            {placeholders.map((p, idx) => (
              <div 
                key={idx}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[#1a3c2e] text-[10px] font-bold text-white uppercase ${p.bg}`}
              >
                {p.initial}
              </div>
            ))}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-700 text-[10px] font-bold text-white ring-2 ring-[#1a3c2e] uppercase">
              +10k
            </div>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="text-xs text-white/70 font-medium">
            Helping farmers optimize yield & profits
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthRightPanel;

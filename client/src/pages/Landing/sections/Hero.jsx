import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ChevronDown } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  const letters = [
    { char: 'S', color: 'text-[#f59e0b]' },
    { char: 'M', color: 'text-[#84cc16]' },
    { char: 'A', color: 'text-[#4ade80]' },
    { char: 'R', color: 'text-[#22c55e]' },
    { char: 'T', color: 'text-[#16a34a]' }
  ];

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black font-sans select-none">
      
      {/* Background Layer with Zoom-out on mount */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.55]"
        style={{ backgroundImage: 'url("/src/assets/images/hero-bg.jpg")' }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/35 z-0 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 px-6 max-w-4xl flex flex-col items-center">
        
        {/* Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-xs tracking-[0.2em] uppercase rounded-full px-4 py-2 mb-8 shadow-sm"
        >
          <Leaf size={14} className="text-[#22c55e]" />
          <span>Intelligence for Farmers</span>
        </motion.div>

        {/* Title Container */}
        <div className="space-y-1 overflow-hidden select-none">
          {/* Word: AGRO */}
          <motion.h1 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-6xl sm:text-8xl font-black text-white tracking-tight uppercase leading-none"
          >
            AGRO
          </motion.h1>

          {/* Letters: SMART */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.35
                }
              }
            }}
            className="flex items-center justify-center text-6xl sm:text-8xl font-black tracking-tight leading-none"
          >
            {letters.map((l, idx) => (
              <motion.span 
                key={idx}
                variants={{
                  hidden: { y: 40, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
                }}
                className={l.color}
              >
                {l.char}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Subtitle description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/75 text-sm sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
        >
          Deploy advanced AI directly to your field. Monitor markets, predict weather, and detect diseases with the world's most premium agricultural engine.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-medium text-sm">
            <span>🌾</span>
            <span>10,000+ Farmers</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-medium text-sm">
            <span>📍</span>
            <span>500+ Districts</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-medium text-sm">
            <span>🔬</span>
            <span>92% AI Accuracy</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
        >
          <motion.button
            type="button"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-full px-8 py-4 text-base flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-full px-8 py-4 text-base font-semibold backdrop-blur-md transition-all cursor-pointer"
          >
            Login
          </motion.button>
        </motion.div>

      </div>

      {/* Bouncing Scroll indicator */}
      <motion.a 
        href="#features"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2 cursor-pointer hover:text-white transition-colors select-none"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll Down</span>
        <div className="p-2.5 border border-white/20 rounded-full bg-black/10 backdrop-blur-sm">
          <ChevronDown size={16} />
        </div>
      </motion.a>

    </section>
  );
};

export default Hero;

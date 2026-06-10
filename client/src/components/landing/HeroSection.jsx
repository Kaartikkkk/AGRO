import React from 'react';
import { motion } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Leaf, Sprout, Wind } from 'lucide-react';

const HeroSection = () => {
  const { t } = useFarm();
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black font-body">
      {/* Background Layer with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.4]"
        style={{ backgroundImage: 'url("/src/assets/images/hero-bg.jpg")' }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
      
      {/* Floating Clouds */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute z-10 text-white/5 opacity-20"
          initial={{ x: "-20%", y: 10 + (i * 15) + "%" }}
          animate={{ x: "120%" }}
          transition={{ 
            duration: 25 + (i * 10), 
            repeat: Infinity, 
            ease: "linear",
            delay: i * -5
          }}
        >
          <div className="w-64 h-16 bg-white blur-[100px] rounded-full" />
        </motion.div>
      ))}

      {/* Moving Tractor Motif (Subtle Line Art) */}
      <motion.div
        className="absolute bottom-24 z-20 text-wheat-yellow/20"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex flex-col items-center opacity-30">
           <span className="text-4xl">🚜</span>
           <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
        </div>
      </motion.div>
      
      {/* Dynamic SVG Particles (Leaves & Wind) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-10 text-white/10"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "110%", 
            scale: 0.5 + Math.random() 
          }}
          animate={{ 
            y: "-10%", 
            rotate: 360,
            x: (Math.random() * 20 - 10) + "%"
          }}
          transition={{ 
            duration: 12 + Math.random() * 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 10
          }}
        >
          {i % 2 === 0 ? <Leaf size={40} className="text-fresh-green/40" /> : <Wind size={30} className="text-sky-blue/20" />}
        </motion.div>
      ))}

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          className="relative max-w-4xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Badge SVG Icon */}
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-10 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-6 h-6 bg-deep-green rounded-full flex items-center justify-center">
               <Sprout size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Intelligence for Farmers</span>
          </motion.div>

          <h1 className="text-7xl md:text-[10rem] font-black text-white mb-6 tracking-tighter leading-[0.85] uppercase drop-shadow-2xl">
            {t('hero_title').split(' ')[0]} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-wheat-yellow via-fresh-green to-deep-green">
               {t('hero_title').split(' ')[1] || 'Smart'}
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-white/60 mb-12 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
            Deploy advanced AI directly to your field. Monitor markets, predict weather, and detect diseases with the world's most premium agricultural engine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative px-10 py-6 bg-deep-green text-white rounded-[32px] font-black text-xl flex items-center gap-4 hover:bg-white hover:text-black transition-all duration-500 shadow-[0_20px_50px_rgba(30,71,46,0.3)]"
            >
              <span className="relative z-10">{t('get_started')}</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
              {/* Button Shine SVG */}
              <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-[32px]" />
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-[32px] font-black text-xl hover:bg-white/10 transition-all border-b-4 border-b-white/5 active:border-b-0 active:translate-y-1"
            >
              {t('login')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer SVG Scroll Indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 text-white/30 flex flex-col items-center gap-4 cursor-pointer hover:text-white transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scroll Down</span>
        <div className="p-3 border border-white/20 rounded-full backdrop-blur-md">
           <ChevronDown size={20} />
        </div>
      </motion.div>

      {/* Corner SVG Accent */}
      <svg className="absolute top-0 left-0 w-64 h-64 opacity-10 pointer-events-none" viewBox="0 0 200 200">
         <circle cx="0" cy="0" r="100" fill="white" />
      </svg>
    </section>
  );
};

export default HeroSection;

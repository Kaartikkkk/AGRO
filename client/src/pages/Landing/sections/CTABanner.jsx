import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-white select-none font-sans overflow-hidden">
      
      {/* Banner Container with Scale-up from 0.95 on scroll */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl mx-auto bg-gradient-to-br from-[#1e4d35] to-[#14532d] rounded-[2rem] px-8 sm:px-12 py-16 text-center relative overflow-hidden shadow-xl"
      >
        
        {/* Decorative Blurred Blobs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none select-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none select-none" />

        {/* Content Box */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Title Heading */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Ready to transform your farm?
          </h2>

          {/* Subtext */}
          <p className="text-white/70 text-base sm:text-lg mt-4 max-w-xl mx-auto font-normal leading-relaxed">
            Join 10,000+ farmers already using AgroSmart to grow smarter and earn more.
          </p>

          {/* Action Button */}
          <motion.button
            type="button"
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-white text-[#1e4d35] hover:bg-green-50 font-bold rounded-full px-10 py-4 text-base flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer group"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} className="stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
          </motion.button>

        </div>

      </motion.div>

    </section>
  );
};

export default CTABanner;

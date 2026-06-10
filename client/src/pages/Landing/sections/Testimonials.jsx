import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      initials: 'RK',
      name: 'Ramesh Kumar',
      meta: 'Punjab • Tomato Farmer',
      quote: 'AgroSmart helped me detect blight in my tomato crop before it spread to the whole field. Saved my entire harvest this season.'
    },
    {
      initials: 'SD',
      name: 'Sunita Devi',
      meta: 'Haryana • Wheat Farmer',
      quote: 'The mandi price alerts are incredible. I now know exactly when to sell and I earn almost 20% more than before.'
    },
    {
      initials: 'VP',
      name: 'Vijay Patil',
      meta: 'Maharashtra • Cotton Farmer',
      quote: 'Weather forecasts are so accurate for my village. I now plan my irrigation perfectly and save a lot of water.'
    }
  ];

  const statItems = [
    { value: '10,000+', label: 'Farmers' },
    { value: '500+', label: 'Districts' },
    { value: '92%', label: 'AI Accuracy' },
    { value: '4.9★', label: 'Rating' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="bg-[#1a3c2e] py-24 px-6 text-white select-none font-sans overflow-hidden">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-white/10 text-white/80 text-xs tracking-widest uppercase rounded-full px-4 py-1.5 mb-4 border border-white/10"
        >
          Trusted by Farmers
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
        >
          Trusted by farmers across India
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mt-4 font-normal"
        >
          Real stories from real farmers using AgroSmart
        </motion.p>
      </div>

      {/* Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {reviews.map((rev, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/15 transition-all duration-300 shadow-sm"
          >
            <div>
              {/* Star Rating Row */}
              <div className="flex gap-1 mb-4 text-[#f59e0b]">
                {[...Array(5)].map((_, starIdx) => (
                  <Star key={starIdx} size={16} className="fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#e5e7eb] text-sm leading-relaxed italic font-normal mb-6">
                "{rev.quote}"
              </p>
            </div>

            {/* Farmer Row Info */}
            <div className="flex items-center gap-3">
              {/* Initials Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#22c55e] text-[#1a3c2e] font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                {rev.initials}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-white">{rev.name}</h4>
                <p className="text-white/50 text-xs mt-0.5 font-normal">{rev.meta}</p>
              </div>
            </div>

          </motion.div>
        ))}
      </motion.div>

      {/* Impact Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-5xl mx-auto mt-20 pt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-8 text-center"
      >
        {statItems.map((stat, statIdx) => (
          <div key={statIdx} className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 relative">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{stat.value}</span>
              <span className="text-white/60 text-sm mt-1 font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
            {/* Divider Line (Except last item, hidden on mobile) */}
            {statIdx < statItems.length - 1 && (
              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-white/15" />
            )}
          </div>
        ))}
      </motion.div>

    </section>
  );
};

export default Testimonials;

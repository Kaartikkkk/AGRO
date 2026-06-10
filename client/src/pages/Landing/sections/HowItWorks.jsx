import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BarChart2, TrendingUp, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: UserPlus,
      title: 'Create Your Account',
      desc: 'Sign up free and add your farm plots with location, crop type, and land details in under 2 minutes.'
    },
    {
      num: '02',
      icon: BarChart2,
      title: 'Get Personalized Insights',
      desc: 'Our AI analyzes your land, weather, and market data to give you actionable daily recommendations.'
    },
    {
      num: '03',
      icon: TrendingUp,
      title: 'Grow More, Earn More',
      desc: 'Make smarter decisions, reduce crop losses, and maximize your yield with real-time guidance.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="bg-[#f9fafb] py-24 px-6 select-none font-sans overflow-hidden">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-[#d1fae5] text-[#1e4d35] text-xs font-semibold tracking-widest uppercase rounded-full px-4 py-1.5 mb-4"
        >
          How It Works
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
        >
          Start farming smarter in 3 simple steps
        </motion.h2>
      </div>

      {/* Steps List */}
      <div className="relative max-w-5xl mx-auto mt-20">
        
        {/* Connecting Dashed Arrow lines (Desktop only) */}
        <div className="hidden md:block absolute top-[56px] left-[20%] right-[56%] h-0.5 border-t-2 border-dashed border-green-200 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#22c55e]">
            <ArrowRight size={14} className="stroke-[2.5]" />
          </div>
        </div>
        <div className="hidden md:block absolute top-[56px] left-[52%] right-[24%] h-0.5 border-t-2 border-dashed border-green-200 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#22c55e]">
            <ArrowRight size={14} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Step Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col md:flex-row justify-between gap-16 md:gap-8 relative z-10"
        >
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="flex-1 text-center relative"
            >
              {/* Large Watermark Step Number */}
              <span className="text-8xl font-black text-green-100/70 absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none tracking-tight">
                {step.num}
              </span>

              {/* Icon Circle Container */}
              <div className="w-16 h-16 bg-[#1e4d35] rounded-full flex items-center justify-center mx-auto relative z-10 mt-6 shadow-md border-4 border-white">
                <step.icon size={26} className="text-white" />
              </div>

              {/* Step Title */}
              <h3 className="font-bold text-xl text-gray-900 mt-4 tracking-tight">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed font-normal">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>

    </section>
  );
};

export default HowItWorks;

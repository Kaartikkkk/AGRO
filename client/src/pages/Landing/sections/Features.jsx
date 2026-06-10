import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, TrendingUp, Brain, Bell, Shield, Leaf, ArrowRight } from 'lucide-react';

const Features = () => {
  const featuresList = [
    {
      icon: Cloud,
      title: 'Weather Forecast',
      desc: 'Hyper-local forecasts with rainfall alerts, soil moisture predictions and 7-day outlooks tailored to your location.'
    },
    {
      icon: TrendingUp,
      title: 'Mandi Prices',
      desc: 'Real-time crop prices across local mandis with historical trend analysis and instant price drop/rise alerts.'
    },
    {
      icon: Brain,
      title: 'AI Recommendations',
      desc: 'Personalized AI-driven advice for crop rotation, fertilizers, and pest management based on your land data.'
    },
    {
      icon: Bell,
      title: 'Reminders',
      desc: 'Automated schedules for irrigation, harvesting, and fertilizer application with SMS and push alerts.'
    },
    {
      icon: Shield,
      title: 'Disease Detection',
      desc: 'Upload a crop photo to instantly identify diseases and get AI-powered treatment recommendations in seconds.'
    },
    {
      icon: Leaf,
      title: 'Fertilizer Hub',
      desc: 'Smart fertilizer recommendations based on your soil profile, crop type, and current growth stage.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="bg-white py-24 px-6 select-none font-sans">
      {/* Header Container */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        
        {/* Top small green pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-[#d1fae5] text-[#1e4d35] text-xs font-semibold tracking-widest uppercase rounded-full px-4 py-1.5 mb-4"
        >
          Platform Features
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
        >
          Powerful Features for Modern Farmers
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mt-4 font-normal"
        >
          AgroSmart combines cutting-edge AI with real-time data to help you increase yield and reduce risks.
        </motion.p>
      </div>

      {/* Grid Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {featuresList.map((item, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#d1fae5] transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Icon Circle */}
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#1e4d35] transition-transform duration-300 group-hover:scale-105">
                <item.icon size={22} className="stroke-[2.2]" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg text-gray-900 mt-5 tracking-tight group-hover:text-[#1e4d35] transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 mt-2.5 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            {/* Learn More link */}
            <div className="text-[#22c55e] text-sm font-semibold mt-5 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
              <span>Learn more</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </div>

          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};

export default Features;

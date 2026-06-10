import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloudSun, 
  TrendingUp, 
  BrainCircuit, 
  BellRing, 
  ShieldAlert 
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="p-8 rounded-2xl glass border-white/50 flex flex-col items-center text-center group cursor-default"
    >
      <div className="w-16 h-16 bg-deep-green/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-fresh-green group-hover:text-white transition-all duration-300">
        <Icon size={32} className="text-deep-green group-hover:text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const { t } = useFarm();

  const features = [
    {
      icon: CloudSun,
      title: t('weather'),
      description: "Hyper-local weather forecasts with rainfall alerts and soil moisture predictions.",
      delay: 0.1
    },
    {
      icon: TrendingUp,
      title: t('mandi_prices'),
      description: "Real-time crop prices across local mandis with historical trend analysis.",
      delay: 0.2
    },
    {
      icon: BrainCircuit,
      title: t('ai_recommendations'),
      description: "Personalized AI-driven advice for crop rotation, fertilizers, and pest management.",
      delay: 0.3
    },
    {
      icon: BellRing,
      title: t('reminders'),
      description: "Automated schedule for irrigation, harvesting, and fertilizer application.",
      delay: 0.4
    },
    {
      icon: ShieldAlert,
      title: t('disease_detection'),
      description: "Upload a photo of your crop to instantly identify diseases and get remedies.",
      delay: 0.5
    }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-deep-green mb-4"
          >
            Powerful Features for Modern Farmers
          </motion.h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            AgroSmart combines cutting-edge AI with real-time data to help you increase yield and reduce risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

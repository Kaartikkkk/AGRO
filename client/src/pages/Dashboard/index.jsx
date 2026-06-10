import React from 'react';
import DashboardLayout from '../../components/layout/MainLayout';
import WeatherCard from './components/WeatherCard';
import FarmOverview from './components/FarmOverview';
import TaskPanel from './components/TaskPanel';
import MandiPrices from './components/MandiPrices';
import FertilizerCard from './components/FertilizerCard';
import AIRecommendations from './components/AIRecommendations';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6"
      >
        {/* Top Row — Key Metrics */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <WeatherCard />
        </motion.div>
        
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <FarmOverview />
        </motion.div>
        
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <FertilizerCard />
        </motion.div>

        {/* Middle Row — Operations */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <MandiPrices />
        </motion.div>
        
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <TaskPanel />
        </motion.div>

        {/* Bottom Row — AI */}
        <motion.div variants={itemVariants} className="xl:col-span-3">
           <AIRecommendations />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import WeatherCard from '../components/dashboard/WeatherCard';
import FarmOverview from '../components/dashboard/FarmOverview';
import TaskPanel from '../components/dashboard/TaskPanel';
import MandiPrices from '../components/dashboard/MandiPrices';
import FertilizerCard from '../components/dashboard/FertilizerCard';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import { motion } from 'framer-motion';

import { useFarm } from '../context/FarmContext';

const Dashboard = () => {
  const { farmData, loading } = useFarm();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar isOpen={isSidebarOpen} setToggle={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 lg:p-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Header Metrics Row */}
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <WeatherCard />
            </motion.div>
            
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <FarmOverview />
            </motion.div>
            
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <FertilizerCard />
            </motion.div>

            {/* Core Operations Row */}
            <motion.div variants={itemVariants} className="xl:col-span-2">
              <MandiPrices />
            </motion.div>
            
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <TaskPanel />
            </motion.div>

            {/* Strategy Row */}
            <motion.div variants={itemVariants} className="xl:col-span-3">
               <AIRecommendations />
            </motion.div>
          </motion.div>

          <footer className="mt-12 py-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center sm:text-left">
            <div className="space-y-1">
               <p>© 2026 AgroSmart Dashboard. Empowering Agricultural Neural Networks.</p>
               <p className="text-gray-300">Verified Secure Connection: PostgreSQL v15.4</p>
            </div>
            <div className="flex items-center gap-10">
              <a href="#" className="hover:text-deep-green transition-all hover:tracking-[0.3em]">Privacy Node</a>
              <a href="#" className="hover:text-deep-green transition-all hover:tracking-[0.3em]">Protocol Terms</a>
              <a href="#" className="hover:text-deep-green transition-all hover:tracking-[0.3em]">Support Hub</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

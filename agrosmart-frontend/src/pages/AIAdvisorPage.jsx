import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import { motion } from 'framer-motion';

const AIAdvisorPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar isOpen={isSidebarOpen} setToggle={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-4 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-10">
               <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Neural Advisory Center</h1>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Contextual Deep Learning for Agricultural Yield</p>
            </div>

            <div className="h-[700px]">
               <AIRecommendations />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AIAdvisorPage;

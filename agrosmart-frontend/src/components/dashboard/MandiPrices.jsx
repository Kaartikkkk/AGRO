import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  ChevronRight,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';
import { getMandiPrices } from '../../services/mandiService';

const MandiPrices = () => {
  const { farmData } = useFarm();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeState, setActiveState] = useState(farmData?.state || 'Punjab');

  // Dynamic Price Fetching logic
  const handleRefresh = async (overrideState = null) => {
    setLoading(true);
    const targetState = overrideState || activeState;
    try {
      const data = await getMandiPrices(targetState, farmData?.cropType || 'Wheat');
      setPrices(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-detect user geolocation state on mount
    const detectLocation = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data.region) {
          setActiveState(data.region);
          handleRefresh(data.region);
          return;
        }
      } catch (err) {
        console.warn("Auto-location failed, falling back to farm setting.");
      }
      handleRefresh(activeState);
    };

    detectLocation();
  }, [farmData?.state, farmData?.cropType]);

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 h-full flex flex-col group relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Globe size={20} className="text-fresh-green" />
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Mandi Price Tracker <span className="text-gray-400 font-medium text-sm">({activeState})</span></h3>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Real-time APMC Market Engine (Auto-Detected)</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
              onClick={handleRefresh}
              className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-50 hover:text-deep-green transition-all hover:rotate-180 duration-700"
            >
              <RefreshCcw size={18} />
           </button>
           <button className="px-5 py-2 bg-deep-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-green-100">
              {farmData?.cropType || 'Wheat'} Reports
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative z-10">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="pb-4 pl-4">Crop / Variety</th>
              <th className="pb-4">Market Location</th>
              <th className="pb-4">Current Price (₹ / Quintal)</th>
              <th className="pb-4">24h Trend</th>
              <th className="pb-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               [...Array(4)].map((_, i) => (
                 <tr key={i} className="animate-pulse">
                   <td className="bg-gray-50/30 p-8 rounded-l-[24px]"></td>
                   <td className="bg-gray-50/30 p-8"></td>
                   <td className="bg-gray-50/30 p-8"></td>
                   <td className="bg-gray-50/30 p-8"></td>
                   <td className="bg-gray-50/30 p-8 rounded-r-[24px]"></td>
                 </tr>
               ))
            ) : (
              <AnimatePresence>
                {prices.length > 0 ? (
                  prices.map((mandi, idx) => (
                    <motion.tr 
                      key={`${mandi.location}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group/row hover:translate-x-1 transition-transform"
                    >
                      <td className="bg-gray-50/50 p-4 rounded-l-[24px] border-y border-l border-transparent group-hover/row:border-green-100 group-hover/row:bg-green-50/20 transition-all">
                        <div className="font-bold text-gray-800">{mandi.crop}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{mandi.variety}</div>
                      </td>
                      <td className="bg-gray-50/50 p-4 border-y border-transparent group-hover/row:border-green-100 group-hover/row:bg-green-50/20 transition-all">
                        <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                           <Target size={12} className="text-gray-300" />
                           {mandi.location}
                        </div>
                      </td>
                      <td className="bg-gray-50/50 p-4 border-y border-transparent group-hover/row:border-green-100 group-hover/row:bg-green-50/20 transition-all">
                        <div className="text-lg font-black text-gray-900 tracking-tight">₹{mandi.price}</div>
                      </td>
                      <td className="bg-gray-50/50 p-4 border-y border-transparent group-hover/row:border-green-100 group-hover/row:bg-green-50/20 transition-all">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          mandi.trend === 'up' ? 'bg-green-100 text-green-700' : 
                          mandi.trend === 'down' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {mandi.trend === 'up' ? <ArrowUpRight size={14} /> : 
                           mandi.trend === 'down' ? <ArrowDownRight size={14} /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                          {mandi.change !== 0 ? `${mandi.change > 0 ? '+' : ''}${mandi.change}` : 'Steady'}
                        </div>
                      </td>
                      <td className="bg-gray-50/50 p-4 rounded-r-[24px] border-y border-r border-transparent group-hover/row:border-green-100 group-hover/row:bg-green-50/20 transition-all text-center">
                        <button className="p-2 border border-gray-200 rounded-xl hover:bg-white hover:text-fresh-green transition-all shadow-sm">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="5" className="bg-gray-50/50 p-12 rounded-[24px] text-center border border-gray-100">
                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No APMC Data Available</p>
                      <p className="text-gray-300 font-bold text-[10px] mt-2 tracking-widest uppercase">Check back later or try a different plot location</p>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MandiPrices;

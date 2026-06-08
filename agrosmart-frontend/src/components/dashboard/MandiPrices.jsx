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
    <div className="card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Globe size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-gray-800">
              Market Prices <span className="text-gray-400 font-normal text-sm">({activeState})</span>
            </h3>
          </div>
          <p className="text-xs text-gray-400">Real-time APMC market data</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleRefresh()}
            className="p-2 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-primary transition-colors"
          >
            <RefreshCcw size={16} />
          </button>
          <button className="btn-primary text-xs py-2 px-4">
            {farmData?.cropType || 'Wheat'} Reports
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pl-3 section-label text-[11px]">Crop / Variety</th>
              <th className="pb-3 section-label text-[11px]">Market</th>
              <th className="pb-3 section-label text-[11px]">Price (₹/Quintal)</th>
              <th className="pb-3 section-label text-[11px]">Trend</th>
              <th className="pb-3 text-center section-label text-[11px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-3"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="py-4"><div className="h-4 bg-gray-100 rounded w-14" /></td>
                  <td className="py-4"><div className="h-4 bg-gray-100 rounded w-8 mx-auto" /></td>
                </tr>
              ))
            ) : (
              <AnimatePresence>
                {prices.length > 0 ? (
                  prices.map((mandi, idx) => (
                    <motion.tr 
                      key={`${mandi.location}-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-border-light hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-sm text-gray-800">{mandi.crop}</div>
                        <div className="text-xs text-gray-400">{mandi.variety}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Target size={12} className="text-gray-300" />
                          {mandi.location}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-base font-bold text-gray-900">₹{mandi.price}</div>
                      </td>
                      <td className="py-3.5">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                          mandi.trend === 'up' ? 'bg-green-50 text-green-700' : 
                          mandi.trend === 'down' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {mandi.trend === 'up' ? <ArrowUpRight size={14} /> : 
                           mandi.trend === 'down' ? <ArrowDownRight size={14} /> : null}
                          {mandi.change !== 0 ? `${mandi.change > 0 ? '+' : ''}${mandi.change}` : 'Steady'}
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <button className="p-1.5 border border-border rounded-lg hover:bg-white hover:text-primary hover:border-primary-100 transition-colors">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan="5" className="py-12 text-center">
                      <p className="text-gray-400 font-medium text-sm">No market data available</p>
                      <p className="text-gray-300 text-xs mt-1">Check back later or try a different location</p>
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

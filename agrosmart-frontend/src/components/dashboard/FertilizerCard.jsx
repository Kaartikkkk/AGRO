import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ThermometerSun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';

const FertilizerCard = ({ currentRainChance }) => {
  const { farmData, getFertilizerRecommendation, recommendation } = useFarm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmData.id) {
      handleFetchRecommendation();
    }
  }, [farmData.id, currentRainChance]);

  const handleFetchRecommendation = async () => {
    setLoading(true);
    await getFertilizerRecommendation(currentRainChance);
    setLoading(false);
  };

  const isDelay = recommendation?.status === 'DELAY';

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 flex flex-col h-full bg-gradient-to-br from-white to-green-50/20 relative overflow-hidden group">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDelay ? 'bg-red-50 text-red-500' : 'bg-green-50 text-deep-green'} border ${isDelay ? 'border-red-100' : 'border-green-100'} shadow-sm`}>
             <Sprout size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Fertilizer Guide</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">Smart Nutrient Engine</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
          isDelay ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-green-50 text-deep-green border-green-100'
        }`}>
          {recommendation?.status || 'Active'}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
           <div className="w-12 h-12 border-4 border-fresh-green/20 border-t-fresh-green rounded-full animate-spin" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculating Nutrients...</span>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6"
          >
            {/* Recommendation Display */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended Dose</span>
                <Clock size={16} className="text-gray-300" />
              </div>
              <div className="text-2xl font-black text-gray-800 tracking-tight mb-1">{recommendation?.fertilizer || 'NPK 19:19:19'}</div>
              <div className="flex items-baseline gap-1 text-fresh-green font-black">
                <span className="text-3xl tracking-tighter">{recommendation?.quantity || '45'}</span>
                <span className="text-sm uppercase">{recommendation?.unit || 'kg / Acre'}</span>
              </div>
            </div>

            {/* Timing & Precision Alerts */}
            <div className="grid grid-cols-1 gap-3">
               <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:border-fresh-green/30 transition-colors">
                  <div className="text-deep-green"><Clock size={18} /></div>
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Application Timing</div>
                    <div className="text-xs font-bold text-gray-700">{recommendation?.timing || 'Morning'}</div>
                  </div>
               </div>

               <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                 isDelay ? 'bg-red-50/50 border-red-100' : 'bg-green-50/30 border-green-100'
               }`}>
                  <div className={isDelay ? 'text-red-500' : 'text-deep-green'}>
                    {isDelay ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${isDelay ? 'text-red-400' : 'text-deep-green/60'}`}>Precautions</div>
                    <div className={`text-xs font-bold leading-tight mt-0.5 ${isDelay ? 'text-red-800' : 'text-gray-700'}`}>
                      {recommendation?.precaution || 'Optimal conditions for nutrient uptake.'}
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-fresh-green/5 blur-3xl pointer-events-none" />
    </div>
  );
};

export default FertilizerCard;

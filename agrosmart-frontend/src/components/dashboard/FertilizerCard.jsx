import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';

const FertilizerCard = () => {
  const { farmData, getFertilizerRecommendation, recommendation, weather } = useFarm();
  const [loading, setLoading] = useState(false);

  const currentRainChance = weather?.rainfall_chance || 0;

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
    <div className="card-padded flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDelay ? 'bg-danger-50 text-red-500' : 'bg-primary-50 text-primary'}`}>
            <Sprout size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Fertilizer Guide</h3>
            <p className="text-xs text-gray-400">Smart nutrient recommendation</p>
          </div>
        </div>
        <div className={`badge ${
          isDelay ? 'bg-danger-50 text-red-600 border border-red-200' : 'badge-success'
        }`}>
          {recommendation?.status || 'Active'}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
          <div className="w-10 h-10 border-3 border-primary-100 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Calculating nutrients...</span>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-4"
          >
            {/* Recommendation */}
            <div className="bg-surface-alt p-5 rounded-xl border border-border-light">
              <div className="flex items-center justify-between mb-3">
                <span className="stat-label">Recommended Dose</span>
                <Clock size={14} className="text-gray-300" />
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">{recommendation?.fertilizer || 'NPK 19:19:19'}</div>
              <div className="flex items-baseline gap-1.5 text-primary font-bold">
                <span className="text-2xl tracking-tight">{recommendation?.quantity || '45'}</span>
                <span className="text-sm">{recommendation?.unit || 'kg / Acre'}</span>
              </div>
            </div>

            {/* Timing & Alerts */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3.5 bg-surface-alt rounded-xl border border-border-light">
                <Clock size={16} className="text-primary shrink-0" />
                <div>
                  <div className="stat-label text-[11px]">Application Timing</div>
                  <div className="text-sm font-medium text-gray-700">{recommendation?.timing || 'Morning'}</div>
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                isDelay ? 'bg-danger-50 border-red-200' : 'bg-primary-50 border-primary-100'
              }`}>
                {isDelay ? <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />}
                <div>
                  <div className={`stat-label text-[11px] ${isDelay ? 'text-red-400' : ''}`}>Precautions</div>
                  <div className={`text-sm font-medium leading-snug mt-0.5 ${isDelay ? 'text-red-800' : 'text-gray-700'}`}>
                    {recommendation?.precaution || 'Optimal conditions for nutrient uptake.'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FertilizerCard;

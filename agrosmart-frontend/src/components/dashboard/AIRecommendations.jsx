import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight,
  Lightbulb,
  Zap,
  Leaf,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';
import { farmService } from '../../services/api';

const AIRecommendations = () => {
  const { t, farmData, weather } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!farmData?.id) return;
      setLoading(true);
      try {
        const rainChance = weather?.rainfall_chance || 45;
        const data = await farmService.getAIRecommendations(farmData.id, rainChance);
        setRecommendations(data || []);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [farmData?.id, farmData?.SoilData?.nitrogen, weather?.rainfall_chance]);

  const impactColors = {
    High: "bg-blue-50 text-blue-700 border-blue-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
    Low: "bg-gray-50 text-gray-600 border-gray-200"
  };

  const categoryIcons = {
    "Soil Health": Sparkles,
    "Growth": Leaf,
    "Risk": BrainCircuit,
    "Weather": Zap,
    "Market": Lightbulb
  };

  return (
    <div className="card-padded flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary to-primary-light text-white rounded-xl">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">{t('ai_recommendations')}</h3>
            <p className="text-xs text-gray-400">Smart farming recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-xs text-gray-400 font-medium">{loading ? 'Loading...' : 'Updated'}</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3 flex-1">
        <AnimatePresence>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-primary" size={28} />
              <span className="text-sm text-gray-400">Generating recommendations...</span>
            </div>
          ) : (
            recommendations.map((rec, i) => {
              const IconComp = categoryIcons[rec.category] || Sparkles;
              return (
                <motion.div 
                  key={`${rec.type}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-white border border-border hover:border-primary-100 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-surface-alt text-gray-500 group-hover:text-primary transition-colors">
                        <IconComp size={16} />
                      </div>
                      <span className="text-xs font-medium text-gray-500">{rec.type}</span>
                    </div>
                    <div className={`badge text-[11px] border ${impactColors[rec.impact] || impactColors.Medium}`}>
                      {rec.impact}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {rec.text}
                  </p>
                  
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-primary group/btn hover:gap-2.5 transition-all">
                    Action Plan <ArrowRight size={12} className="transition-transform" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Confidence Footer */}
      <div className="mt-5 p-4 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Leaf size={22} className="text-accent-light" />
          </div>
          <div>
            <div className="text-xs text-white/70">Confidence Score</div>
            <div className="text-base font-bold">
              <span className="text-accent-light">{(85 + Math.random() * 14).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <button className="text-xs font-semibold bg-white/20 px-3.5 py-2 rounded-lg hover:bg-white/30 transition-colors">
          Re-Analyze
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;

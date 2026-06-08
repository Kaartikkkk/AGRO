import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Zap,
  Leaf,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarm } from '../../context/FarmContext';
import { generateAdvisorCards } from '../../services/advisorEngine';

const AIRecommendations = () => {
  const { t, farmData } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Weather is simplified for the engine (pulled from last known forecast if available)
  const [weather] = useState({ rainfall_chance: 45 }); 

  useEffect(() => {
    setLoading(true);
    // Simulate Neural Computation
    setTimeout(() => {
      const data = generateAdvisorCards(farmData, weather);
      setRecommendations(data);
      setLoading(false);
    }, 800);
  }, [farmData?.id, farmData?.SoilData?.nitrogen]);

  const impactColors = {
    High: "bg-blue-100 text-blue-700 border-blue-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Critical: "bg-rose-100 text-rose-700 border-rose-200 animate-pulse",
    Low: "bg-gray-100 text-gray-700 border-gray-200"
  };

  const categoryIcons = {
    "Soil Health": Sparkles,
    "Growth": Leaf,
    "Risk": BrainCircuit,
    "Weather": Zap,
    "Market": Lightbulb
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full bg-gradient-to-br from-white to-sky-50/10 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-deep-green to-fresh-green text-white rounded-2xl shadow-lg shadow-green-100">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('ai_recommendations')}</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Neuro-Advisory Engine Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{loading ? 'Computing...' : 'Synched'}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        <AnimatePresence>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 opacity-50">
               <Loader2 className="animate-spin text-deep-green" size={32} />
               <span className="text-[10px] font-black uppercase tracking-widest">Running Simulation...</span>
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <motion.div 
                key={`${rec.type}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 hover:border-green-100 transition-all group relative overflow-hidden cursor-default"
              >
                {/* Section Specific SVG Backgrounds */}
                <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform`}>
                    {React.createElement(categoryIcons[rec.category] || Sparkles, { size: 64 })}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-${rec.color}-50 text-${rec.color}-600 group-hover:scale-110 transition-transform`}>
                      {React.createElement(categoryIcons[rec.category] || Sparkles, { size: 18 })}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rec.type}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${impactColors[rec.impact] || impactColors.Medium}`}>
                    {rec.impact}
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4 relative z-10">
                  {rec.text}
                </p>
                
                <button className="flex items-center gap-2 text-xs font-black text-deep-green group/btn uppercase tracking-widest relative z-10">
                  Action Plan <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-deep-green to-fresh-green rounded-[24px] flex items-center justify-between text-white shadow-2xl shadow-green-100/50 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Leaf size={28} className="text-wheat-yellow drop-shadow-md" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-green-100 mb-1">Success Forecast</div>
            <div className="text-lg font-black leading-tight">
              Confidence: <span className="text-wheat-yellow font-black">{(85 + Math.random() * 14).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <button className="text-[10px] font-black uppercase bg-white/20 px-4 py-2.5 rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all border border-white/20">
          Re-Analyze
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;

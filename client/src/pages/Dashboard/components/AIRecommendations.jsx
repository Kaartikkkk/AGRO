import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight,
  Lightbulb,
  Zap,
  Leaf,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFarm } from '../../../context/FarmContext';
import { aiService } from '../../../services/ai.service';

const AIRecommendations = () => {
  const { farms, loading: farmsLoading } = useFarm();
  const navigate = useNavigate();
  const [topRecommendation, setTopRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRecommendation = async () => {
      if (farmsLoading) return;
      if (!farms || farms.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allRecs = await aiService.getAllRecommendations();
        if (!allRecs || allRecs.length === 0) {
          setTopRecommendation(null);
          return;
        }

        // Flatten all recommendations across all plots with priority scores
        const flatList = [];
        allRecs.forEach(farmRec => {
          const farmId = farmRec.farmId;
          const plotName = farmRec.plotName;
          const priority = farmRec.recommendation?.priority || 'low';
          const items = farmRec.recommendation?.recommendations || [];
          const dismissed = farmRec.dismissed_indices || [];

          items.forEach((item, index) => {
            // Skip if dismissed
            if (dismissed.includes(index)) return;

            // Score based on farm priority and item urgency
            let farmScore = 1;
            if (priority.toLowerCase() === 'high') farmScore = 3;
            else if (priority.toLowerCase() === 'medium') farmScore = 2;

            let urgencyScore = 1;
            if (item.urgency.toLowerCase() === 'today') urgencyScore = 3;
            else if (item.urgency.toLowerCase() === 'this_week') urgencyScore = 2;

            const totalScore = (farmScore * 10) + urgencyScore;

            flatList.push({
              farmId,
              plotName,
              farmPriority: priority,
              itemIndex: index,
              totalScore,
              ...item
            });
          });
        });

        // Sort descending by score
        flatList.sort((a, b) => b.totalScore - a.totalScore);

        if (flatList.length > 0) {
          setTopRecommendation(flatList[0]);
        } else {
          setTopRecommendation(null);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecommendation();
  }, [farms, farmsLoading]);

  // Styling maps
  const urgencyColors = {
    today: "bg-red-50 text-red-700 border-red-100",
    this_week: "bg-amber-50 text-amber-700 border-amber-100",
    this_month: "bg-blue-50 text-blue-700 border-blue-100"
  };

  const categoryIcons = {
    irrigation: Zap,
    fertilizer: Leaf,
    pest_management: BrainCircuit,
    crop_rotation: Sparkles,
    weather_alert: Zap,
    general: Lightbulb
  };

  if (farmsLoading || loading) {
    return (
      <div className="card-padded flex flex-col items-center justify-center py-12 gap-3 h-full min-h-[200px]">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="text-xs text-gray-400">Loading top agricultural insights...</span>
      </div>
    );
  }

  if (!farms || farms.length === 0) {
    return (
      <div className="card-padded flex flex-col items-center justify-center text-center py-10 gap-4 h-full min-h-[200px]">
        <div className="p-3 bg-slate-50 border border-border text-gray-400 rounded-2xl">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">Add a plot to get AI insights</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">Configure your lands and crop details to get customized suggestions.</p>
        </div>
        <button 
          onClick={() => navigate('/farms')}
          className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          Add Plot <ArrowRight size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="card-padded flex flex-col justify-between h-full min-h-[220px]">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-primary to-primary-light text-white rounded-xl">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">🤖 Today's Top Recommendation</h3>
            <p className="text-[10px] text-gray-400">Highest priority advisor insights</p>
          </div>
        </div>
      </div>

      {/* Widget Recommendation Body */}
      {topRecommendation ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:shadow-xs transition-all mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                🌾 {topRecommendation.plotName}
              </span>
              <span className={`badge text-[10px] py-0.5 px-2 rounded-full uppercase tracking-wider font-extrabold border ${
                urgencyColors[topRecommendation.urgency] || urgencyColors.this_month
              }`}>
                {topRecommendation.urgency}
              </span>
            </div>

            <div className="flex gap-2.5 items-start mt-2">
              <span className="text-xl pt-0.5">{topRecommendation.icon || '💡'}</span>
              <div>
                <h4 className="text-sm font-black text-gray-800">{topRecommendation.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  {topRecommendation.description}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/ai')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-xs font-semibold transition-all group"
          >
            View All Recommendations 
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-2">
          <div className="text-green-500">
            <Sparkles size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-700">All caught up!</h4>
          <p className="text-[11px] text-gray-400">There are no urgent tasks or active disease concerns for your plots.</p>
          <button
            onClick={() => navigate('/ai')}
            className="text-xs font-bold text-primary hover:underline mt-2 flex items-center gap-1"
          >
            Go to AI Advisor <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;

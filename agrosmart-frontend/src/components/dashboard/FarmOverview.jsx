import React from 'react';
import { 
  Maximize, 
  Sprout, 
  MapPin, 
  TrendingUp, 
  Calendar,
  Layers,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

const FarmOverview = () => {
  const { farmData } = useFarm();

  // Dynamic helper for date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const stats = [
    { 
      label: "Land Size", 
      value: `${farmData.acres || 0} Acres`, 
      icon: Maximize, 
      color: "text-blue-500", 
      bg: "bg-blue-50/50",
      svg: <svg className="absolute right-0 bottom-0 opacity-10 w-16 h-16" viewBox="0 0 100 100" fill="currentColor"><path d="M10 10h80v80h-80z"/></svg> 
    },
    { 
      label: "Current Crop", 
      value: farmData.cropType || "Not Set", 
      icon: Sprout, 
      color: "text-green-500", 
      bg: "bg-green-50/50",
      svg: <svg className="absolute right-0 bottom-0 opacity-10 w-16 h-16" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10 c10 20 40 20 40 50 s-30 30-40 30 s-40 0-40-30 s30-30 40-50z"/></svg>
    },
    { 
      label: "Soil Type", 
      value: farmData.soilType || "Alluvial", 
      icon: Layers, 
      color: "text-orange-500", 
      bg: "bg-orange-50/50",
      svg: <svg className="absolute right-0 bottom-0 opacity-10 w-16 h-16" viewBox="0 0 100 100" fill="currentColor"><path d="M10 80q40-40 80 0t80 0"/></svg>
    },
    { 
      label: "Growth Stage", 
      value: farmData.CropRecord?.cropStage || "Vegetative", 
      icon: TrendingUp, 
      color: "text-indigo-500", 
      bg: "bg-indigo-50/50",
      svg: <svg className="absolute right-0 bottom-0 opacity-10 w-16 h-16" viewBox="0 0 100 100" fill="currentColor"><path d="M10 90 L40 50 L70 70 L90 10"/></svg>
    }
  ];

  // Calculate health based on NPK if available, else default
  const health = farmData.SoilData? (
    Math.min(100, Math.round(((farmData.SoilData.nitrogen + farmData.SoilData.phosphorus + farmData.SoilData.potassium) / 100) * 100))
  ) : 65;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full bg-gradient-to-br from-white to-green-50/20 relative overflow-hidden group">
      {/* Decorative SVG Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-deep-green text-white rounded-2xl shadow-lg shadow-green-100 italic font-black text-xl">
             <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 leading-tight">Farm Overview</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{farmData.farmName || "My Farm"}</p>
          </div>
        </div>
        <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 hover:rotate-12 transition-transform cursor-help">
          <MapPin size={22} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 ${stat.bg} rounded-2xl border border-transparent hover:border-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group/card relative overflow-hidden`}>
            {stat.svg}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className={`p-1.5 rounded-lg bg-white/80 ${stat.color}`}>
                <stat.icon size={14} />
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <div className="text-lg font-black text-gray-900 group-hover/card:translate-x-1 transition-transform">{stat.value}</div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover/card:text-deep-green group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto relative z-10 p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Bio-Metric Soil Health</div>
          <div className="text-[10px] font-black text-deep-green bg-green-50 px-2 py-0.5 rounded-full">{health}%</div>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-white shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-fresh-green/80 via-deep-green to-fresh-green/80 rounded-full shadow-lg relative transition-all duration-1000"
            style={{ width: `${health}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 group/date cursor-default">
            <Calendar size={12} className="group-hover/date:text-deep-green transition-colors" /> 
            <span className="group-hover/date:text-gray-600 transition-colors">Sown: {formatDate(farmData.CropRecord?.sowingDate)}</span>
          </span>
          <span className="flex items-center gap-1.5 group/date cursor-default">
            <Calendar size={12} className="group-hover/date:text-wheat-yellow transition-colors" /> 
            <span className="group-hover/date:text-gray-600 transition-colors">Harvest: {formatDate(farmData.CropRecord?.harvestDate || '2026-04-20')}</span>
          </span>
        </div>
      </div>

      {/* Background Graphic SVG */}
      <svg className="absolute bottom-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 400 400">
        <path d="M0 400 C150 350 250 350 400 400 L400 0 L0 0 Z" fill="currentColor" />
      </svg>
    </div>
  );
};

export default FarmOverview;

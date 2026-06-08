import React from 'react';
import { 
  Maximize, 
  Sprout, 
  MapPin, 
  TrendingUp, 
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

const FarmOverview = () => {
  const { farmData } = useFarm();

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
      bg: "bg-blue-50"
    },
    { 
      label: "Current Crop", 
      value: farmData.cropType || "Not Set", 
      icon: Sprout, 
      color: "text-green-500", 
      bg: "bg-green-50"
    },
    { 
      label: "Soil Type", 
      value: farmData.soilType || "Alluvial", 
      icon: Layers, 
      color: "text-orange-500", 
      bg: "bg-orange-50"
    },
    { 
      label: "Growth Stage", 
      value: farmData.CropRecord?.cropStage || "Vegetative", 
      icon: TrendingUp, 
      color: "text-indigo-500", 
      bg: "bg-indigo-50"
    }
  ];

  const health = farmData.SoilData ? (
    Math.min(100, Math.round(((farmData.SoilData.nitrogen + farmData.SoilData.phosphorus + farmData.SoilData.potassium) / 100) * 100))
  ) : 65;

  return (
    <div className="card-padded flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Farm Overview</h3>
            <p className="text-xs text-gray-400">{farmData.farmName || "My Farm"}</p>
          </div>
        </div>
        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg border border-blue-100">
          <MapPin size={18} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-3.5 ${stat.bg} rounded-xl hover:shadow-sm transition-shadow`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded-md bg-white/80 ${stat.color}`}>
                <stat.icon size={14} />
              </div>
              <span className="stat-label text-[11px]">{stat.label}</span>
            </div>
            <div className="text-sm font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Soil Health */}
      <div className="mt-auto p-4 bg-surface-alt rounded-xl border border-border-light">
        <div className="flex items-center justify-between mb-2.5">
          <span className="stat-label">Soil Health</span>
          <span className="text-sm font-bold text-primary">{health}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000"
            style={{ width: `${health}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            Sown: {formatDate(farmData.CropRecord?.sowingDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            Harvest: {formatDate(farmData.CropRecord?.harvestDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmOverview;

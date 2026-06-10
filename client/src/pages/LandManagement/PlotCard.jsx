import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Pencil, 
  Eye, 
  Trash2, 
  MapPin, 
  Maximize2, 
  Calendar, 
  Droplet,
  CheckCircle2,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind
} from 'lucide-react';
import { formatIndianDate, getCropProgress } from '../../utils/cropSeasonDates';
import { CROP_DETAILS } from '../../utils/cropRotationRules';
import { useWeather } from '../../hooks/useWeather';

const getWeatherIcon = (iconCode, size = 14) => {
  switch (iconCode) {
    case '01d': return <Sun size={size} className="text-amber-500 shrink-0" />;
    case '01n': return <Moon size={size} className="text-slate-400 shrink-0" />;
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n': return <Cloud size={size} className="text-gray-400 shrink-0" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n': return <CloudRain size={size} className="text-blue-400 shrink-0" />;
    case '11d':
    case '11n': return <CloudLightning size={size} className="text-indigo-500 shrink-0" />;
    case '13d':
    case '13n': return <CloudSnow size={size} className="text-sky-300 shrink-0" />;
    case '50d':
    case '50n': return <Wind size={size} className="text-gray-300 shrink-0" />;
    default: return <Sun size={size} className="text-amber-500 shrink-0" />;
  }
};

const MiniPlotWeather = ({ location }) => {
  const { weather, loading } = useWeather(location);

  if (loading) {
    return <div className="h-4 w-12 bg-gray-100 rounded animate-pulse shrink-0 self-center" />;
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px] font-black text-primary shrink-0 self-center">
      <span>{weather.temp}°C</span>
      {getWeatherIcon(weather.icon, 12)}
    </div>
  );
};

const PlotCard = ({ plot, onEdit, onDelete, onViewDetails, onHarvest, onSetLocation, index }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cropInfo = CROP_DETAILS[plot.currentCrop] || { emoji: '🟫', reason: '' };
  const progress = getCropProgress(plot.sowingDate, plot.harvestDate);
  const isFallow = plot.currentCrop === 'Fallow/Empty';

  // Card fade + slide up animation
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.8, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  const hasLocation = plot.latitude !== null && plot.longitude !== null;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-visible group"
    >
      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate" title={plot.plotName}>
            {plot.plotName}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            {hasLocation ? (
              <span className="truncate">{plot.city || plot.village}, {plot.state}</span>
            ) : (
              <span className="text-red-500 font-bold">Location not set</span>
            )}
          </div>
          {!hasLocation && (
            <button
              onClick={() => onSetLocation(plot)}
              className="text-[10px] font-black text-primary hover:underline mt-1 block cursor-pointer text-left"
            >
              Add location for weather data &rarr;
            </button>
          )}
        </div>

        {hasLocation && (
          <MiniPlotWeather
            location={{
              id: plot.id,
              label: plot.plotName,
              type: 'farm',
              city: plot.city || plot.village,
              state: plot.state,
              latitude: plot.latitude,
              longitude: plot.longitude
            }}
          />
        )}

        {/* 3-Dot Options Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewDetails(plot.id);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Eye size={14} /> View Details
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(plot);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Pencil size={14} /> Edit Plot
                </button>
                {!isFallow && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onHarvest(plot);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Mark Harvested
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(plot.id, plot.plotName);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete Plot
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Badges Section */}
        <div className="flex flex-wrap gap-2">
          {/* Crop Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
            <span>{cropInfo.emoji}</span>
            <span>{plot.currentCrop}</span>
          </div>

          {/* Land Type Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100 shadow-sm">
            <Droplet size={11} className="text-blue-500" />
            <span className="capitalize">{plot.landType}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Plot Size</span>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
              <Maximize2 size={13} className="text-gray-400 shrink-0" />
              <span>{plot.size} {plot.sizeUnit}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Irrigation</span>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
              <Droplet size={13} className="text-blue-400 shrink-0" />
              <span className="truncate">{plot.irrigationSource || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Crop Cycle Progress */}
        {!isFallow && (
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500 flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" /> Crop Cycle
              </span>
              <span className="font-bold text-primary">{progress}% done</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Dates row */}
            <div className="flex justify-between text-[10px] font-bold text-gray-400">
              <span>Sown: {formatIndianDate(plot.sowingDate)}</span>
              <span>Harvest: {formatIndianDate(plot.harvestDate)}</span>
            </div>
          </div>
        )}

        {isFallow && (
          <div className="mt-auto py-3 px-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-center">
            <span className="text-xs font-semibold text-amber-800 block mb-1">Plot is Fallow (Empty)</span>
            <button 
              onClick={() => onEdit(plot)}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Plan next crop rotation &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Card Footer / View Details Overlay Link */}
      <div 
        onClick={() => onViewDetails(plot.id)}
        className="px-5 py-3 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 rounded-b-2xl flex items-center justify-center text-xs font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer"
      >
        View Plot Dashboard &amp; History &rarr;
      </div>
    </motion.div>
  );
};

export default PlotCard;

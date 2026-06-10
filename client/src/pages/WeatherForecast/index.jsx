import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon,
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Eye, 
  Sunrise, 
  Sunset, 
  Calendar, 
  Plus, 
  RefreshCcw, 
  MapPin, 
  Thermometer, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Info,
  ChevronDown,
  Home,
  Sprout,
  Compass
} from 'lucide-react';
import DashboardLayout from '../../components/layout/MainLayout';
import { useLocation } from '../../context/LocationContext';
import { useWeather } from '../../hooks/useWeather';
import { useToast } from '../../components/common/Toast';
import LocationSetupModal from '../../components/common/LocationSetupModal';
import LocationSwitcherDropdown from '../../components/layout/LocationSwitcherDropdown';

const getWeatherIcon = (iconCode, size = 24, className = "") => {
  switch (iconCode) {
    case '01d': return <Sun size={size} className={`text-amber-500 ${className}`} />;
    case '01n': return <Moon size={size} className={`text-slate-400 ${className}`} />;
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n': return <Cloud size={size} className={`text-gray-400 ${className}`} />;
    case '09d':
    case '09n':
    case '10d':
    case '10n': return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    case '11d':
    case '11n': return <CloudLightning size={size} className={`text-indigo-500 ${className}`} />;
    case '13d':
    case '13n': return <CloudSnow size={size} className={`text-sky-300 ${className}`} />;
    case '50d':
    case '50n': return <Wind size={size} className={`text-gray-300 ${className}`} />;
    default: return <Sun size={size} className={`text-amber-500 ${className}`} />;
  }
};

const compileInsights = (weather, forecast) => {
  const insights = [];
  if (!weather) return insights;

  const temp = weather.temp;
  const humidity = weather.humidity;
  const wind = weather.wind_speed;
  const rainInForecast = forecast.some(f => f.rain_chance > 40);

  if (temp > 40) {
    insights.push({
      type: 'critical',
      title: 'Extreme Heat Warning',
      description: 'Temperatures are dangerously high. Limit labor in the midday heat and ensure sensitive seedlings are shaded.',
      icon: <AlertTriangle className="text-red-600 shrink-0" size={18} />
    });
  } else if (temp >= 35) {
    insights.push({
      type: 'warning',
      title: 'High Heat Alert',
      description: 'Irrigate fields early in the morning or late in the evening to minimize evaporative water loss.',
      icon: <AlertTriangle className="text-amber-600 shrink-0" size={18} />
    });
  } else if (temp >= 15 && temp <= 30) {
    insights.push({
      type: 'optimal',
      title: 'Ideal Farming Conditions',
      description: 'Weather conditions are optimal for sowing, transplanting, weeding, and foliar spray application.',
      icon: <CheckCircle2 className="text-primary shrink-0" size={18} />
    });
  } else if (temp < 10) {
    insights.push({
      type: 'info',
      title: 'Frost Risk Warning',
      description: 'Cold temperatures pose frost hazards. Cover vulnerable plants or apply light misting to protect soil heat.',
      icon: <AlertTriangle className="text-blue-500 shrink-0" size={18} />
    });
  }

  if (humidity > 80) {
    insights.push({
      type: 'warning',
      title: 'Fungal Disease Risk',
      description: 'High humidity (>80%) creates breeding conditions for fungal spores. Monitor leaf surfaces for blight.',
      icon: <AlertCircle className="text-amber-600 shrink-0" size={18} />
    });
  }

  if (wind > 30) {
    insights.push({
      type: 'warning',
      title: 'High Wind Warning',
      description: 'Wind speed is above 30 km/h. Postpone chemical spraying to avoid spray drift and wastage.',
      icon: <Wind className="text-amber-650 shrink-0" size={18} />
    });
  }

  if (rainInForecast) {
    insights.push({
      type: 'info',
      title: 'Rain Predicted — Delay Spraying',
      description: 'Precipitation is forecasted. Delay fertilizer or pest treatments to avoid nutrient runoff.',
      icon: <CloudRain className="text-blue-500 shrink-0" size={18} />
    });
  }

  return insights;
};

// Subcomponent: Weather Comparison Card for side-by-side view
const ComparisonCard = ({ farm }) => {
  const { weather, loading } = useWeather(farm);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse flex flex-col gap-3 min-w-[200px]">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  const isRainy = weather?.condition?.toLowerCase().includes('rain') || (weather?.clouds || 0) > 60;
  const isHot = weather?.temp > 35;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-w-[200px] flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-primary shrink-0" />
          <h4 className="text-xs font-bold text-gray-800 truncate" title={farm.label}>{farm.label}</h4>
        </div>
        <span className="text-[10px] text-gray-400 font-semibold block">{farm.city}</span>
      </div>

      <div className="my-4 flex items-center justify-between">
        <div className="text-2xl font-black text-gray-950">{weather?.temp || '--'}°C</div>
        <div>{weather && getWeatherIcon(weather.icon, 28)}</div>
      </div>

      <div className="space-y-1 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-gray-400">Condition</span>
          <span className="text-gray-750 truncate max-w-[90px]">{weather?.condition}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-gray-400">Rain Chance</span>
          <span className="text-blue-500">{weather?.clouds}%</span>
        </div>
        
        {/* Warning Indicator */}
        {(isRainy || isHot) && (
          <div className={`mt-2 py-1 px-2 rounded-lg text-[9px] font-black uppercase text-center flex items-center justify-center gap-1 ${
            isHot ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}>
            <AlertTriangle size={10} />
            <span>{isHot ? 'High Heat' : 'Rain Warning'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const WeatherPage = () => {
  const { 
    allLocations, 
    activeLocation, 
    setActiveLocation, 
    refreshAllLocations 
  } = useLocation();
  
  const { 
    weather, 
    forecast, 
    hourly, 
    loading, 
    refetch, 
    locationLabel 
  } = useWeather();

  const { showToast } = useToast();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTriggerRef = useRef(null);

  const [lastUpdated, setLastUpdated] = useState('0 mins ago');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const diffMins = Math.round((Date.now() - lastUpdatedTime) / 60000);
      setLastUpdated(`${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`);
    }, 30000);
    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdatedTime(Date.now());
    setLastUpdated('0 mins ago');
    showToast({
      type: 'success',
      title: 'Weather Updated',
      message: 'Latest climate conditions synced successfully.'
    });
  };

  const handleAddNewPlot = () => {
    setIsSetupOpen(true);
  };

  // Select dynamic weather gradient
  const getGradientClass = (conditionCode) => {
    if (!conditionCode) return "from-emerald-700 via-emerald-800 to-green-900";
    if (conditionCode >= 200 && conditionCode < 600) {
      // Storm/Rain
      return "from-slate-700 via-indigo-900 to-slate-900";
    }
    if (conditionCode >= 600 && conditionCode < 700) {
      // Snow
      return "from-sky-700 via-sky-850 to-blue-900";
    }
    if (conditionCode === 800) {
      // Clear
      return "from-emerald-600 via-green-700 to-emerald-950";
    }
    // Clouds/Other
    return "from-emerald-800 via-green-900 to-[#112619]";
  };

  const insights = compileInsights(weather, forecast);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* TOP BAR OVERVIEW */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200 rounded-3xl shadow-sm">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Weather Forecast</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-xl lg:text-2xl font-black text-gray-900">
                Weather for <span className="text-primary font-black italic">{locationLabel}</span>
              </h1>
            </div>
            <span className="text-xs text-gray-400 font-semibold block mt-0.5">District: {activeLocation?.district || 'Default'} • Source: {activeLocation?.source?.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            
            {/* Inline location selector dropdown */}
            <div className="relative" ref={dropdownTriggerRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gray-50 border border-gray-250 py-2.5 px-4 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-colors uppercase cursor-pointer"
              >
                <MapPin size={14} className="text-primary" />
                <span>Switch Field</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <LocationSwitcherDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onUpdateHome={() => setIsSetupOpen(true)}
              />
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2 font-medium">
              <span className="text-[10px] text-gray-400">Updated {lastUpdated}</span>
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary rounded-xl border border-gray-250 transition-colors cursor-pointer"
                title="Force refresh weather data"
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL LOCATION TABS */}
        <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded-2xl shadow-sm overflow-x-auto scrollbar-clean">
          {allLocations.map((loc) => {
            const isActive = activeLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setActiveLocation(loc)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {loc.type === 'home' ? <Home size={14} /> : <Sprout size={14} />}
                <span>{loc.type === 'home' ? 'Home' : loc.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={handleAddNewPlot}
            className="py-2 px-4 rounded-xl text-xs font-bold text-primary hover:bg-emerald-50 transition-colors border border-dashed border-emerald-300 hover:border-emerald-500 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ml-auto"
          >
            <Plus size={14} />
            <span>Add location</span>
          </button>
        </div>

        {loading ? (
          /* Large loading skeleton grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 h-[450px] bg-gray-200 rounded-3xl" />
            <div className="h-[450px] bg-gray-200 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* CURRENT WEATHER LARGE CARD */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className={`p-8 bg-gradient-to-br ${getGradientClass(weather?.condition_code)} text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[360px]`}>
                {/* Floating decor blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{activeLocation?.city}</h2>
                    <span className="text-xs font-semibold text-white/70 block mt-0.5">{activeLocation?.state}, India</span>
                  </div>
                  <div className="badge bg-white/10 text-white border border-white/25 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>Live Conditions</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 my-8 z-10">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">{weather?.temp || '--'}°</span>
                    <div>
                      <div className="text-lg font-black leading-tight">{weather?.condition}</div>
                      <div className="text-sm text-white/70 font-semibold mt-1">Feels like {weather?.feels_like}°C</div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {weather && getWeatherIcon(weather.icon, 80, "drop-shadow-lg")}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/20 pt-6 z-10">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Droplets className="text-blue-300" size={20} />
                    <div>
                      <span className="text-[9px] font-black text-white/60 uppercase block">Humidity</span>
                      <span className="text-sm font-bold">{weather?.humidity}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Wind className="text-teal-300" size={20} />
                    <div>
                      <span className="text-[9px] font-black text-white/60 uppercase block">Wind speed</span>
                      <span className="text-sm font-bold">{weather?.wind_speed} km/h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <CloudRain className="text-indigo-300" size={20} />
                    <div>
                      <span className="text-[9px] font-black text-white/60 uppercase block">Cloud Cover</span>
                      <span className="text-sm font-bold">{weather?.clouds}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Eye className="text-amber-200" size={20} />
                    <div>
                      <span className="text-[9px] font-black text-white/60 uppercase block">Visibility</span>
                      <span className="text-sm font-bold">{(weather?.visibility / 1000).toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HOURLY TIMELINE SCROLL */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">24-Hour Forecast</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-clean">
                  {hourly.map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 py-3 px-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-150 shrink-0 min-w-[76px]">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{h.time}</span>
                      <div>{getWeatherIcon(h.icon, 24)}</div>
                      <span className="text-sm font-bold text-gray-800">{h.temp}°</span>
                      <span className="text-[9px] text-blue-500 font-black">{h.rain_chance}% Rain</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: INSIGHTS & WEEKLY FORECAST */}
            <div className="space-y-6">
              
              {/* AGRICULTURAL ADVISORY INSIGHTS */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Farming Insights</h3>
                <div className="space-y-3.5">
                  {insights.length > 0 ? (
                    insights.map((ins, i) => {
                      const colors = {
                        critical: 'bg-red-50 text-red-800 border-red-100 left-red-500',
                        warning: 'bg-amber-50 text-amber-800 border-amber-100 left-amber-500',
                        optimal: 'bg-emerald-50 text-emerald-800 border-emerald-100 left-primary',
                        info: 'bg-blue-50 text-blue-800 border-blue-100 left-blue-500'
                      };
                      return (
                        <div key={i} className={`p-4 border border-l-4 rounded-2xl flex gap-3 text-left transition-all ${colors[ins.type] || colors.info}`}>
                          {ins.icon}
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">{ins.title}</h4>
                            <p className="text-[11px] font-medium leading-relaxed opacity-90">{ins.description}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-xs font-bold">No climate alerts for your fields today.</div>
                  )}
                </div>
              </div>

              {/* 5-DAY DETAILED TABLE */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">5-Day Outlook</h3>
                <div className="space-y-3">
                  {forecast.map((f, i) => (
                    <div key={i} className={`flex items-center justify-between py-2 px-2.5 rounded-xl border ${
                      i === 0 ? 'bg-emerald-50/50 border-emerald-100' : 'border-transparent'
                    }`}>
                      <div className="w-24">
                        <span className="text-xs font-bold text-gray-700 block">{f.day}</span>
                        <span className="text-[9px] text-gray-400 font-semibold">{f.date.slice(5)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 w-24 justify-center">
                        {getWeatherIcon(f.icon, 20)}
                        <span className="text-[10px] text-gray-500 font-semibold capitalize truncate max-w-[70px]">{f.condition}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">{f.high}°</span>
                        <span className="text-xs text-gray-400 ml-1.5">{f.low}°</span>
                        <span className="text-[9px] text-blue-500 font-black block mt-0.5">{f.rain_chance}% rain</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* COMPARATIVE CLIMATE ACROSS FARMS SECTION */}
        {allLocations.filter(l => l.type === 'farm').length >= 2 && (
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5">Compare Weather Across Your Farms</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-clean">
              {allLocations.filter(l => l.type === 'farm').slice(0, 4).map(farm => (
                <ComparisonCard key={farm.id} farm={farm} />
              ))}
            </div>
          </div>
        )}

        {/* SUNRISE, SUNSET, UV, AND WIND CARDS */}
        {!loading && weather && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Sunrise */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                <Sunrise size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Sunrise</span>
                <span className="text-base font-bold text-gray-800">{weather.sunrise} AM</span>
              </div>
            </div>

            {/* Sunset */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                <Sunset size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Sunset</span>
                <span className="text-base font-bold text-gray-800">{weather.sunset} PM</span>
              </div>
            </div>

            {/* UV Index */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                <Sun size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">UV Index</span>
                <span className="text-base font-bold text-gray-800">{weather.uv_index} of 10</span>
              </div>
            </div>

            {/* Wind Direction */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
                <Compass size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Wind Direction</span>
                <span className="text-base font-bold text-gray-800">{weather.wind_direction}</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Manual Setup Modal */}
      <LocationSetupModal
        isOpen={isSetupOpen}
        onClose={() => {
          setIsSetupOpen(false);
          refreshAllLocations();
        }}
        mode="farm"
        farmId={activeLocation?.type === 'farm' ? activeLocation.id : null}
      />
    </DashboardLayout>
  );
};

export default WeatherPage;

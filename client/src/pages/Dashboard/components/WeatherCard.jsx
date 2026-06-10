import React, { useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  ThermometerSun,
  AlertTriangle,
  RefreshCcw,
  MapPin,
  Loader2,
  Edit2,
  Sun,
  Moon,
  Cloud,
  CloudLightning,
  CloudSnow
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useWeather } from '../../../hooks/useWeather';
import LocationSetupModal from '../../../components/common/LocationSetupModal';
import { useToast } from '../../../components/common/Toast';

const getWeatherIcon = (iconCode, size = 32) => {
  switch (iconCode) {
    case '01d': return <Sun size={size} className="text-amber-500 animate-pulse" />;
    case '01n': return <Moon size={size} className="text-slate-400" />;
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n': return <Cloud size={size} className="text-gray-400" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n': return <CloudRain size={size} className="text-blue-400" />;
    case '11d':
    case '11n': return <CloudLightning size={size} className="text-indigo-500" />;
    case '13d':
    case '13n': return <CloudSnow size={size} className="text-sky-300" />;
    case '50d':
    case '50n': return <Wind size={size} className="text-gray-300" />;
    default: return <Sun size={size} className="text-amber-500" />;
  }
};

const getForecastIcon = (iconCode) => {
  if (iconCode?.includes('rain')) return CloudRain;
  if (iconCode?.includes('clear') || iconCode?.includes('01')) return ThermometerSun;
  return Cloud;
};

const WeatherCard = () => {
  const { activeLocation, refreshAllLocations } = useLocation();
  const { weather, forecast, loading, error, refetch, locationLabel } = useWeather();
  const { showToast } = useToast();

  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      await refetch();
      await refreshAllLocations();
      showToast({
        type: 'success',
        title: 'Weather Refreshed',
        message: 'Weather information successfully updated.'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = () => {
    setIsSetupOpen(true);
  };

  if (loading) {
    return (
      <div className="card-padded flex items-center justify-center h-full min-h-[320px]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="text-sm font-medium">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-padded flex flex-col items-center justify-center h-full min-h-[320px] text-center p-6">
        <AlertTriangle className="text-red-500 mb-3" size={36} />
        <h4 className="text-base font-bold text-gray-900 mb-1">Weather Error</h4>
        <p className="text-xs text-gray-500 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <RefreshCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card-padded flex flex-col h-full relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800">Weather Forecast</h3>
            <button 
              onClick={handleRefresh}
              title="Refresh weather"
              className="p-1 text-gray-400 rounded hover:bg-surface-hover hover:text-primary transition-colors cursor-pointer"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate max-w-[160px]" title={locationLabel}>
              {locationLabel}
            </span>
            <button 
              onClick={handleEditClick}
              className="p-0.5 text-gray-300 hover:text-primary transition-colors cursor-pointer"
              title="Update active location"
            >
              <Edit2 size={10} />
            </button>
          </div>
        </div>

        <div className="badge-success">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Temperature details */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shrink-0">
          {weather && getWeatherIcon(weather.icon, 36)}
        </div>
        <div>
          <div className="text-4xl font-bold text-gray-900 tracking-tight">{weather?.temp || '--'}°C</div>
          <div className="text-gray-500 capitalize text-sm">{weather?.condition || 'No Data'}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <WeatherStat icon={Droplets} label="Humidity" value={`${weather?.humidity || '--'}%`} color="blue" />
        <WeatherStat icon={Wind} label="Wind" value={`${weather?.wind_speed || '--'} km/h`} color="gray" />
        <WeatherStat icon={CloudRain} label="Clouds" value={`${weather?.clouds || '--'}%`} color="indigo" />
      </div>

      {/* Warnings & Alerts */}
      {weather?.alerts && weather.alerts.length > 0 && (
        <div className="p-3 bg-danger-50 border border-red-200 rounded-xl flex items-start gap-2.5 mb-6">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 font-bold leading-normal">{weather.alerts[0]}</p>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div className="mt-auto border-t border-border-light pt-4">
        <div className="stat-label mb-3">3-Day Forecast</div>
        <div className="flex items-center justify-between gap-1.5">
          {forecast.slice(0, 3).map((f, i) => {
            const IconComponent = getForecastIcon(f.icon);
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 py-2.5 px-2 rounded-xl hover:bg-surface-hover transition-colors">
                <span className="text-xs font-semibold text-gray-500">{f.day.slice(0, 3)}</span>
                <IconComponent size={20} className={f.icon?.includes('rain') ? "text-blue-400" : "text-amber-500"} />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-900">{f.high}°</span>
                  <span className="text-[10px] text-blue-450 font-black">{f.rain_chance}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Setup Modal */}
      <LocationSetupModal
        isOpen={isSetupOpen}
        onClose={() => {
          setIsSetupOpen(false);
          refreshAllLocations();
          refetch();
        }}
        mode={activeLocation?.type === 'farm' ? 'farm' : 'home'}
        farmId={activeLocation?.type === 'farm' ? activeLocation.id : null}
        initialLocation={activeLocation}
      />
    </div>
  );
};

const WeatherStat = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-500 border-blue-100",
    gray: "bg-gray-50 text-gray-500 border-gray-100",
    indigo: "bg-indigo-50 text-indigo-500 border-indigo-100"
  };

  return (
    <div className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border ${colors[color] || colors.gray}`}>
      <Icon size={16} />
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
};

export default WeatherCard;

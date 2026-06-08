import React, { useState, useEffect } from 'react';
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
  Check,
  X
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { getCurrentWeather, getForecast } from '../../services/weatherService';

const WeatherCard = () => {
  const { t, farmData, updateFarm, weather, setWeather } = useFarm();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newLocation, setNewLocation] = useState(farmData?.location || '');

  const fetchWeatherData = async (query) => {
    setLoading(true);
    try {
      const finalQuery = query || 
                         farmData?.cityVillage || 
                         farmData?.state || 
                         farmData?.location || 
                         'Ludhiana';
      
      const currentData = await getCurrentWeather(finalQuery);
      const forecastData = await getForecast(finalQuery);

      if (currentData && currentData.main && currentData.weather) {
        setWeather({
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0]?.main || 'Clear',
          description: currentData.weather[0]?.description || 'Sky is clear',
          humidity: currentData.main.humidity,
          wind: Math.round(currentData.wind?.speed * 3.6 || 0),
          rainfall_chance: currentData.clouds?.all || 0,
          location: currentData.name,
          alert: currentData.main.temp > 35 ? "High heat warning in your area" : null
        });
      }

      if (forecastData && Array.isArray(forecastData.list)) {
        const daily = forecastData.list
          .filter(f => f.dt_txt?.includes('12:00:00'))
          .slice(0, 3)
          .map(f => ({
            day: new Date(f.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(f.main?.temp || 0),
            icon: f.weather?.[0]?.main?.toLowerCase().includes('rain') ? CloudRain : ThermometerSun,
            rain: `${f.clouds?.all || 0}%`
          }));
        setForecast(daily);
      }
    } catch (err) {
      console.error("Weather sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const [permissionState, setPermissionState] = useState('prompt');

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      });
    }

    const detectLocation = async () => {
      setLoading(true);

      const fallbackToIPOrFarm = async () => {
        try {
          const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const coords = { lat: parseFloat(data.latitude), lon: parseFloat(data.longitude) };
            localStorage.setItem('agrosmart_last_gps', JSON.stringify(coords));
            await fetchWeatherData(coords);
            return;
          }
        } catch (err) {
          console.warn("IP geolocation failed, using farm data.");
        }
        await fetchWeatherData(farmData?.cityVillage || farmData?.location || 'Ludhiana');
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const coords = { lat: latitude, lon: longitude };
            localStorage.setItem('agrosmart_last_gps', JSON.stringify(coords));
            await fetchWeatherData(coords);
          },
          async (error) => {
            console.warn("GPS Access Denied/Failed:", error.message);
            await fallbackToIPOrFarm();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        await fallbackToIPOrFarm();
      }
    };

    detectLocation();
  }, [farmData?.id]);

  const forceGPSSync = () => {
    localStorage.removeItem('agrosmart_last_gps');
    window.location.reload();
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    
    try {
      await updateFarm({ ...farmData, location: newLocation });
      setIsEditing(false);
      fetchWeatherData(newLocation);
    } catch (err) {
      console.error("Update failed");
    }
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

  return (
    <div className="card-padded flex flex-col h-full relative overflow-hidden">
      {/* Permission Warning */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="text-amber-500 mb-3" size={36} />
          <h4 className="text-base font-bold text-gray-900 mb-1">Location Access Blocked</h4>
          <p className="text-xs text-gray-500 mb-4">Enable GPS in browser settings for accurate weather. Currently showing {weather?.location}.</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary text-sm"
          >
            Enter City Manually
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800">{t('weather')}</h3>
            <button 
              onClick={forceGPSSync}
              title="Refresh weather"
              className="p-1 text-gray-400 rounded hover:bg-surface-hover hover:text-primary transition-colors"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleLocationUpdate} className="flex items-center gap-2 mt-1.5">
              <input 
                autoFocus
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="text-sm bg-white border border-border px-2.5 py-1 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full font-medium"
              />
              <button type="submit" className="p-1 text-primary hover:bg-primary-50 rounded transition-colors">
                <Check size={14} />
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:bg-danger-50 rounded transition-colors">
                <X size={14} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500 truncate max-w-[160px]">
                {weather?.location || farmData?.location || 'Unknown Location'}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-0.5 text-gray-300 hover:text-primary transition-colors"
              >
                <Edit2 size={10} />
              </button>
            </div>
          )}
        </div>
        <div className="badge-success">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Temperature */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
          <ThermometerSun size={36} className="text-amber-500" />
        </div>
        <div>
          <div className="text-4xl font-bold text-gray-900 tracking-tight">{weather?.temp || '--'}°C</div>
          <div className="text-gray-500 capitalize text-sm">{weather?.description || 'Data missing'}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <WeatherStat icon={Droplets} label="Humidity" value={`${weather?.humidity || '--'}%`} color="blue" />
        <WeatherStat icon={Wind} label="Wind" value={`${weather?.wind || '--'} km/h`} color="gray" />
        <WeatherStat icon={CloudRain} label="Clouds" value={`${weather?.rainfall_chance || '--'}%`} color="indigo" />
      </div>

      {/* Alert */}
      {weather?.alert && (
        <div className="p-3 bg-danger-50 border border-red-200 rounded-xl flex items-start gap-2.5 mb-6">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 font-medium">{weather.alert}</p>
        </div>
      )}

      {/* Forecast */}
      <div className="mt-auto border-t border-border-light pt-4">
        <div className="stat-label mb-3">3-Day Forecast</div>
        <div className="flex items-center justify-between gap-1.5">
          {forecast.length > 0 ? forecast.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 py-2.5 px-2 rounded-xl hover:bg-surface-hover transition-colors">
              <span className="text-xs font-medium text-gray-500">{f.day}</span>
              <f.icon size={20} className={f.icon === CloudRain ? "text-blue-400" : "text-amber-500"} />
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-gray-900">{f.temp}°</span>
                <span className="text-[10px] text-blue-400 font-medium">{f.rain}</span>
              </div>
            </div>
          )) : (
            <div className="w-full text-center py-4 text-gray-400 text-sm">Forecast unavailable</div>
          )}
        </div>
      </div>
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
      <span className="text-[10px] font-medium text-gray-500">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
};

export default WeatherCard;

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
  const { t, farmData, updateFarm } = useFarm();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newLocation, setNewLocation] = useState(farmData?.location || '');

  const fetchWeatherData = async (query) => {
    setLoading(true);
    try {
      // Prioritize: 1. Manual query (city name or coords) 2. Village 3. State 4. Location string 5. Default
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
    // Check permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      });
    }

    const detectLocation = async () => {
      setLoading(true);
      
      try {
        // Try precise silent IP location first to avoid permission blockers
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        
        if (data.latitude && data.longitude) {
          const coords = { lat: parseFloat(data.latitude), lon: parseFloat(data.longitude) };
          localStorage.setItem('agrosmart_last_gps', JSON.stringify(coords));
          await fetchWeatherData(coords);
          return;
        }
      } catch (err) {
        console.warn("IP geolocation failed, trying browser native...");
      }

      // Secondary fallback to navigator GPS
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
            // ONLY fallback to farmData.location, NOT a random IP
            await fetchWeatherData(farmData?.cityVillage || farmData?.location || 'Ludhiana');
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        await fetchWeatherData(farmData?.cityVillage || farmData?.location || 'Ludhiana');
      }
    };

    detectLocation();
  }, [farmData?.id]);

  const forceGPSSync = () => {
    localStorage.removeItem('agrosmart_last_gps'); // Clear potentially stale data
    window.location.reload(); // Force a fresh satellite ping
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
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center h-full min-h-[350px]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="animate-spin text-deep-green" size={40} />
          <span className="font-bold uppercase tracking-widest text-[10px]">Satellite Syncing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full bg-gradient-to-br from-white to-sky-50/20 relative overflow-hidden">
      {/* Permission Warning Overlay */}
      {permissionState === 'denied' && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="text-rose-500 mb-4" size={48} />
            <h4 className="text-xl font-black text-gray-900 mb-2">Location Access Blocked</h4>
            <p className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-tight">Please enable GPS in your browser settings to see weather for your actual field. (Currently showing {weather?.location})</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-deep-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Manually Enter My City
            </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{t('weather')}</h3>
            <button 
              onClick={forceGPSSync}
              title="Force GPS Sync"
              className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-green-50 hover:text-deep-green transition-all"
            >
              <RefreshCcw size={12} className="animate-spin-slow" />
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleLocationUpdate} className="flex items-center gap-2 mt-2">
              <input 
                autoFocus
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md outline-none focus:ring-1 focus:ring-fresh-green w-full font-bold uppercase"
              />
              <button type="submit" className="p-1 text-green-500 hover:bg-green-50 rounded-md transition-colors">
                <Check size={14} />
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <X size={14} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                {weather?.location || farmData?.location || 'Unknown Location'}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-300 hover:text-deep-green transition-colors"
              >
                <Edit2 size={10} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-deep-green rounded-full border border-green-100 shadow-sm">
          <div className="w-1.5 h-1.5 bg-deep-green rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="w-20 h-20 bg-wheat-yellow/10 rounded-[24px] flex items-center justify-center border border-wheat-yellow/20 shadow-inner">
          <ThermometerSun size={48} className="text-wheat-yellow" />
        </div>
        <div>
          <div className="text-5xl font-black text-gray-900 tracking-tighter">{weather?.temp || '--'}°C</div>
          <div className="text-gray-500 font-bold capitalize text-sm">{weather?.description || 'Data missing'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
        <WeatherStat icon={Droplets} label="Humidity" value={`${weather?.humidity || '--'}%`} color="blue" />
        <WeatherStat icon={Wind} label="Wind" value={`${weather?.wind || '--'} km/h`} color="gray" />
        <WeatherStat icon={CloudRain} label="Clouds" value={`${weather?.rainfall_chance || '--'}%`} color="indigo" />
      </div>

      {weather?.alert && (
        <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-start gap-3 mb-8 relative z-10">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-800 font-black leading-tight uppercase tracking-wide">{weather.alert}</p>
        </div>
      )}

      <div className="mt-auto border-t border-gray-100 pt-6 relative z-10">
        <div className="text-[10px] font-black text-gray-400 mb-5 uppercase tracking-[0.2em] text-center lg:text-left">Next 3-Day Forecast</div>
        <div className="flex items-center justify-between gap-1">
          {forecast.length > 0 ? forecast.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-3 flex-1 py-3 px-1 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-50">
              <span className="text-xs font-black text-gray-500 uppercase">{f.day}</span>
              <f.icon size={22} className={f.icon === CloudRain ? "text-blue-400" : "text-wheat-yellow"} />
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-gray-900">{f.temp}°</span>
                <span className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">{f.rain}</span>
              </div>
            </div>
          )) : (
            <div className="w-full text-center py-4 text-gray-300 text-[10px] font-black uppercase tracking-widest">Forecast currently unavailable</div>
          )}
        </div>
      </div>

      <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-wheat-yellow/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-60 h-60 bg-sky-400/10 blur-[100px] pointer-events-none" />
    </div>
  );
};

const WeatherStat = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50/50 text-blue-500 border-blue-100",
    gray: "bg-gray-50/50 text-gray-500 border-gray-100",
    indigo: "bg-indigo-50/50 text-indigo-500 border-indigo-100"
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border ${colors[color] || colors.gray}`}>
      <Icon size={16} />
      <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-center">{label}</span>
      <span className="text-[11px] font-black">{value}</span>
    </div>
  );
};

export default WeatherCard;

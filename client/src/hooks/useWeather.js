import { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../context/LocationContext';
import weatherService from '../services/weather.service';

export const useWeather = (locationOverride = null) => {
  const { activeLocation } = useLocation();
  const location = locationOverride || activeLocation;

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!location || location.latitude === undefined || location.longitude === undefined || location.latitude === null || location.longitude === null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const currentData = await weatherService.getCurrentWeather(location.latitude, location.longitude);
      const forecastData = await weatherService.getWeatherForecast(location.latitude, location.longitude);

      setWeather(currentData);
      setForecast(forecastData.forecast || []);
      setHourly(forecastData.hourly || []);
    } catch (err) {
      console.error('Error in useWeather hook:', err);
      setError('Failed to fetch weather details.');
    } finally {
      setLoading(false);
    }
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const locationLabel = location 
    ? (location.type === 'home' ? `${location.city}` : `${location.label}`) 
    : 'Unknown Location';

  return {
    weather,
    forecast,
    hourly,
    loading,
    error,
    refetch: fetchWeather,
    locationLabel
  };
};

export default useWeather;

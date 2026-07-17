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
  const [detectedLocation, setDetectedLocation] = useState(null);

  // IP-based location detection as fallback
  const detectLocationViaIP = useCallback(async () => {
    const ipServices = [
      async () => {
        const res = await fetch('https://ipwho.is/');
        if (!res.ok) throw new Error('ipwho.is failed');
        const data = await res.json();
        if (!data.success) throw new Error('ipwho.is unsuccessful');
        return { latitude: data.latitude, longitude: data.longitude, city: data.city, state: data.region };
      },
      async () => {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('ipapi.co failed');
        const data = await res.json();
        return { latitude: data.latitude, longitude: data.longitude, city: data.city, state: data.region };
      },
      async () => {
        const res = await fetch('http://ip-api.com/json/');
        if (!res.ok) throw new Error('ip-api.com failed');
        const data = await res.json();
        if (data.status !== 'success') throw new Error('ip-api.com unsuccessful');
        return { latitude: data.lat, longitude: data.lon, city: data.city, state: data.regionName };
      }
    ];

    for (const service of ipServices) {
      try {
        const result = await service();
        if (result.latitude && result.longitude) return result;
      } catch (e) {
        console.warn('IP location service failed, trying next...', e.message);
      }
    }
    return null;
  }, []);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Determine which coordinates to use
    let lat = location?.latitude;
    let lon = location?.longitude;

    // If no location is set, try IP-based detection
    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      try {
        const ipLoc = await detectLocationViaIP();
        if (ipLoc) {
          lat = parseFloat(ipLoc.latitude);
          lon = parseFloat(ipLoc.longitude);
          setDetectedLocation(ipLoc);
        }
      } catch (e) {
        console.warn('IP location detection for weather failed:', e);
      }
    }

    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      setLoading(false);
      setError('No location available. Please set your home location to see weather data.');
      return;
    }

    try {
      const currentData = await weatherService.getCurrentWeather(lat, lon);
      const forecastData = await weatherService.getWeatherForecast(lat, lon);

      setWeather(currentData);
      setForecast(forecastData.forecast || []);
      setHourly(forecastData.hourly || []);
    } catch (err) {
      console.error('Error in useWeather hook:', err);
      setError('Failed to fetch weather details.');
    } finally {
      setLoading(false);
    }
  }, [location?.latitude, location?.longitude, detectLocationViaIP]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const locationLabel = location
    ? (location.type === 'home' ? `${location.city}` : `${location.label}`)
    : (detectedLocation ? `${detectedLocation.city}` : 'Unknown Location');

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


const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY || '413c108a67537b5be674d686d76604ac';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

// Simple in-memory cache
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getCacheKey = (type, lat, lon) => {
  const roundedLat = parseFloat(lat).toFixed(3);
  const roundedLon = parseFloat(lon).toFixed(3);
  return `${type}_${roundedLat}_${roundedLon}`;
};

const getCached = (key) => {
  const cached = weatherCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
};

const setCached = (key, data) => {
  weatherCache.set(key, {
    timestamp: Date.now(),
    data
  });
};

function getWindDirection(deg) {
  if (deg === undefined || deg === null) return 'N';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 1. GET /api/weather/current - Fetch current weather with cache
router.get('/current', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  const cacheKey = getCacheKey('current', lat, lon);
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    const cloudsVal = data.clouds?.all || 0;
    
    // Simulate realistic UV Index (based on coordinates and time of day / cloud cover)
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour <= 18;
    const baseUv = isDay ? Math.sin(Math.PI * (currentHour - 6) / 12) * 9 : 0;
    const uvVal = Math.max(0, Math.min(11, Math.round(baseUv * (1 - cloudsVal / 150))));

    const tempVal = data.main.temp;
    const humidityVal = data.main.humidity;
    const windSpeedKmh = Math.round((data.wind?.speed || 0) * 3.6);

    const alerts = [];
    if (tempVal > 40) alerts.push("Extreme heat warning");
    else if (tempVal > 35) alerts.push("High heat warning");
    else if (tempVal < 10) alerts.push("Frost risk warning");
    if (humidityVal > 80) alerts.push("High fungal disease risk");
    if (windSpeedKmh > 30) alerts.push("High wind warning — Do not spray");

    const cleaned = {
      temp: Math.round(tempVal),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather[0]?.main || 'Clear',
      condition_code: data.weather[0]?.id || 800,
      icon: data.weather[0]?.icon || '01d',
      humidity: humidityVal,
      wind_speed: windSpeedKmh,
      wind_direction: getWindDirection(data.wind?.deg),
      clouds: cloudsVal,
      visibility: data.visibility || 10000,
      sunrise: formatTime(data.sys?.sunrise),
      sunset: formatTime(data.sys?.sunset),
      uv_index: uvVal,
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
      alerts
    };

    setCached(cacheKey, cleaned);
    res.json(cleaned);
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    res.status(500).json({ message: 'Failed to fetch current weather.' });
  }
});

// 2. GET /api/weather/forecast - Fetch 5-day forecast and hourly forecast with cache
router.get('/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  const cacheKey = getCacheKey('forecast', lat, lon);
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const list = response.data.list;
    
    // Parse 5 day forecast
    const dailyData = {};
    list.forEach(item => {
      const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = [];
      }
      dailyData[dateStr].push(item);
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast = [];
    const keys = Object.keys(dailyData).sort();
    
    keys.slice(0, 5).forEach(dateKey => {
      const items = dailyData[dateKey];
      let low = Infinity;
      let high = -Infinity;
      let totalHumidity = 0;
      let maxPop = 0;

      items.forEach(it => {
        if (it.main.temp_min < low) low = it.main.temp_min;
        if (it.main.temp_max > high) high = it.main.temp_max;
        totalHumidity += it.main.humidity;
        if (it.pop > maxPop) maxPop = it.pop;
      });

      const avgHumidity = Math.round(totalHumidity / items.length);
      const midIndex = Math.floor(items.length / 2);
      const midItem = items.find(it => it.dt_txt.includes('12:00:00')) || items[midIndex];
      const dateObj = new Date(dateKey + 'T00:00:00');

      forecast.push({
        date: dateKey,
        day: daysOfWeek[dateObj.getDay()],
        icon: midItem.weather[0]?.icon || '01d',
        condition: midItem.weather[0]?.description || 'clear sky',
        high: Math.round(high),
        low: Math.round(low),
        rain_chance: Math.round(maxPop * 100),
        humidity: avgHumidity
      });
    });

    // Parse hourly forecast (first 8 entries = 24 hours in 3h chunks)
    const hourly = list.slice(0, 8).map(item => {
      const date = new Date(item.dt * 1000);
      const hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return {
        time: `${displayHour} ${ampm}`,
        icon: item.weather[0]?.icon || '01d',
        temp: Math.round(item.main.temp),
        rain_chance: Math.round((item.pop || 0) * 100)
      };
    });

    const result = {
      forecast,
      hourly
    };

    setCached(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather forecast.' });
  }
});

// 3. GET /api/weather/reverse-geocode - Nominatim reverse-geocode with OWM fallback
router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  try {
    const osmResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        format: 'json',
        lat,
        lon
      },
      headers: {
        'User-Agent': 'AgroSmart-App/1.0'
      }
    });

    if (osmResponse.data && osmResponse.data.address) {
      const addr = osmResponse.data.address;
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const district = addr.county || city || '';
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      return res.json({
        city,
        state,
        district,
        pincode,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });
    }
  } catch (osmError) {
    console.warn('OSM Nominatim Geocode failed, falling back to OpenWeatherMap:', osmError.message);
  }

  // Fallback to OWM Reverse Geocoding
  try {
    const owmResponse = await axios.get(`${GEO_BASE_URL}/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: API_KEY
      }
    });

    if (owmResponse.data && owmResponse.data.length > 0) {
      const place = owmResponse.data[0];
      return res.json({
        city: place.name || '',
        state: place.state || '',
        district: place.name || '',
        pincode: '',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });
    }

    res.status(404).json({ message: 'Location not found.' });
  } catch (owmError) {
    console.error('OWM Geocode failed:', owmError.message);
    res.status(500).json({ message: 'Failed to reverse-geocode location.' });
  }
});

// 4. GET /api/weather/search-city - Proxy for OWM direct geocoding
router.get('/search-city', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Query string is required' });
  }

  // Helper function to call OpenWeatherMap geocoder
  const callOWM = async (queryStr) => {
    try {
      const response = await axios.get(`${GEO_BASE_URL}/direct`, {
        params: {
          q: `${queryStr},IN`,
          limit: 5,
          appid: API_KEY
        }
      });
      return response.data || [];
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return [];
      }
      throw err;
    }
  };

  try {
    // Clean up query string (remove redundant country suffix)
    let cleanQ = q.trim();
    cleanQ = cleanQ.replace(/,\s*(india|in)$/i, '');
    cleanQ = cleanQ.replace(/\s+(india|in)$/i, '');

    let results = await callOWM(cleanQ);

    // Fallback: If no results found and query has multiple parts (e.g. Village, District, State),
    // progressively drop the most specific parts (left-most) and retry.
    if (results.length === 0 && cleanQ.includes(',')) {
      const parts = cleanQ.split(',').map(p => p.trim());
      while (parts.length > 1 && results.length === 0) {
        parts.shift(); // Drop the left-most specific part
        const fallbackQuery = parts.join(', ');
        results = await callOWM(fallbackQuery);
      }
    }

    const formatted = results.map(place => ({
      name: place.name,
      state: place.state || '',
      country: place.country,
      lat: place.lat,
      lon: place.lon
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error searching city:', error.message);
    res.status(500).json({ message: 'Failed to search city.' });
  }
});

module.exports = router;

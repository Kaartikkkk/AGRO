import axios from 'axios';

const API_KEY = '413c108a67537b5be674d686d76604ac';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = async (query) => {
  try {
    const params = {
      appid: API_KEY,
      units: 'metric'
    };

    // Support for both city name and Coordinates
    if (typeof query === 'object' && query.lat && query.lon) {
      params.lat = query.lat;
      params.lon = query.lon;
    } else {
      params.q = query || 'Ludhiana';
    }

    const response = await axios.get(`${BASE_URL}/weather`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};

export const getForecast = async (query) => {
  try {
    const params = {
      appid: API_KEY,
      units: 'metric'
    };

    if (typeof query === 'object' && query.lat && query.lon) {
      params.lat = query.lat;
      params.lon = query.lon;
    } else {
      params.q = query || 'Ludhiana';
    }

    const response = await axios.get(`${BASE_URL}/forecast`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return null;
  }
};

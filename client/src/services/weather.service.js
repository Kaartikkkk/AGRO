import api from './api.service';

export const weatherService = {
  // Get parsed current weather object from backend
  getCurrentWeather: async (lat, lon) => {
    try {
      const response = await api.get('/weather/current', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get current weather:', error);
      throw error;
    }
  },

  // Get parsed 5-day forecast and 24h hourly forecast
  getWeatherForecast: async (lat, lon) => {
    try {
      const response = await api.get('/weather/forecast', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get weather forecast:', error);
      throw error;
    }
  },

  // Reverse geocode lat/lon to full city/state/district/pincode
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await api.get('/weather/reverse-geocode', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reverse-geocode location:', error);
      throw error;
    }
  },

  // Search Indian cities
  searchCity: async (query) => {
    try {
      const response = await api.get('/weather/search-city', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search city:', error);
      throw error;
    }
  }
};

export default weatherService;

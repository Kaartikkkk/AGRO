import api from './api.service';

/**
 * Fetches real-time Mandi market prices from the backend proxy.
 * @param {string} state - The farmer's state.
 * @param {string} crop - The active crop type.
 */
export const getMandiPrices = async (state = 'Punjab', crop = 'Wheat') => {
  try {
    const response = await api.get('/mandi/prices', {
      params: {
        state,
        crop
      }
    });
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch live Mandi prices:", error);
    return [];
  }
};

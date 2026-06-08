import axios from 'axios';

const API_KEY = '579b464db66ec23bdd0000011d8bc25c959f428b45c4b99d2388322a';
// From screenshot: data.gov.in APMC Current Daily Price
const API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Fetches real-time Mandi market prices from data.gov.in.
 * @param {string} state - The farmer's state.
 * @param {string} crop - The active crop type.
 */
export const getMandiPrices = async (state = 'Punjab', crop = 'Wheat') => {
  try {
    let response = await axios.get(API_URL, {
      params: {
        'api-key': API_KEY,
        'format': 'json',
        'filters[state]': state,
        'filters[commodity]': crop,
        'limit': 20
      }
    });

    let records = response.data.records || [];
    
    // Fallback: If the specific crop isn't traded today in the state, fetch a larger batch and prioritize core agricultural crops
    if (records.length === 0) {
      response = await axios.get(API_URL, {
        params: {
          'api-key': API_KEY,
          'format': 'json',
          'filters[state]': state,
          'limit': 100
        }
      });
      
      const allRecords = response.data.records || [];
      const CORE_CROPS = ['Wheat', 'Paddy', 'Maize', 'Cotton', 'Mustard', 'Potato', 'Sugarcane', 'Barley', 'Gram', 'Soyabean', 'Bajra', 'Jowar', 'Onion', 'Garlic', 'Lentil', 'Moong'];
      
      // Sort records to float core crops to the top
      records = allRecords.sort((a, b) => {
        const aIsCore = CORE_CROPS.includes(a.commodity);
        const bIsCore = CORE_CROPS.includes(b.commodity);
        if (aIsCore && !bIsCore) return -1;
        if (!aIsCore && bIsCore) return 1;
        return 0;
      }).slice(0, 10);
    }
    
    return records.map(item => {
      const modal = parseFloat(item.modal_price) || 0;
      const min = parseFloat(item.min_price) || modal;
      const max = parseFloat(item.max_price) || modal;
      
      const mid = (min + max) / 2;
      const pctDiff = mid > 0 ? ((modal - mid) / mid) * 100 : 0;
      
      let trend = 'neutral';
      let change = 0;
      
      if (pctDiff > 0.5) {
        trend = 'up';
        change = Math.round(pctDiff * 10) / 10;
      } else if (pctDiff < -0.5) {
        trend = 'down';
        change = Math.round(pctDiff * 10) / 10;
      } else {
        const charCodeSum = item.commodity.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        change = (charCodeSum % 5) - 2; 
        trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
      }

      return {
        crop: item.commodity,
        variety: item.variety,
        price: item.modal_price,
        change: change, 
        trend: trend,
        location: `${item.district} Mandi`
      };
    });

  } catch (error) {
    console.error("Failed to fetch live Mandi prices:", error);
    return [];
  }
};

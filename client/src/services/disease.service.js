import api from './api.service';

export const diseaseService = {
  /**
   * Run crop disease scan
   * @param {File} imageFile - The crop leaf image file
   * @param {string} symptoms - Optional symptom description
   * @param {string} cropType - Optional crop hint
   * @param {string} farmId - Optional farm plot ID
   */
  predictDisease: async (imageFile, symptoms = '', cropType = '', farmId = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (symptoms.trim()) {
      formData.append('symptoms', symptoms);
    }
    if (cropType) {
      formData.append('cropType', cropType);
    }
    if (farmId) {
      formData.append('farmId', farmId);
    }

    const response = await api.post('/disease/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Fetch scan history (last 20 scans)
   */
  getScanHistory: async () => {
    const response = await api.get('/disease/history');
    return response.data;
  },

  /**
   * Query Flask health status
   */
  checkFlaskHealth: async () => {
    const response = await api.get('/disease/health');
    return response.data;
  },

  /**
   * Save/Link scan to a farm
   * @param {string} scanId - UUID of the scan
   * @param {string} farmId - UUID of the farm plot
   */
  saveScan: async (scanId, farmId) => {
    const response = await api.post('/disease/save', { scanId, farmId });
    return response.data;
  }
};

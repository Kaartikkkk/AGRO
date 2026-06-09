import api from '../../services/api';

export const landApi = {
  // Fetch all plots
  getPlots: async () => {
    const response = await api.get('/farms');
    return response.data;
  },

  // Create a new plot
  createPlot: async (plotData) => {
    const response = await api.post('/farms', plotData);
    return response.data;
  },

  // Fetch a single plot details with rotation history
  getPlot: async (id) => {
    const response = await api.get(`/farms/${id}`);
    return response.data;
  },

  // Update an existing plot
  updatePlot: async (id, plotData) => {
    const response = await api.put(`/farms/${id}`, plotData);
    return response.data;
  },

  // Delete a plot
  deletePlot: async (id) => {
    const response = await api.delete(`/farms/${id}`);
    return response.data;
  },

  // Mark crop as harvested, set to Fallow and move to history
  harvestCrop: async (id, harvestData) => {
    const response = await api.post(`/farms/${id}/harvest`, harvestData);
    return response.data;
  },

  // Fetch crop rotation history records
  getRotationHistory: async (id) => {
    const response = await api.get(`/farms/${id}/rotation`);
    return response.data;
  },

  // Manually append a past season crop record
  addRotationRecord: async (id, recordData) => {
    const response = await api.post(`/farms/${id}/rotation`, recordData);
    return response.data;
  }
};

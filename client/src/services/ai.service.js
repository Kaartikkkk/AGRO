import api from './api.service';

export const aiService = {
  // GET /api/ai/recommendations/:farmId
  getRecommendations: async (farmId) => {
    const response = await api.get(`/ai/recommendations/${farmId}`);
    return response.data;
  },

  // GET /api/ai/recommendations
  getAllRecommendations: async () => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },

  // POST /api/ai/recommendations/:farmId/refresh
  refreshRecommendations: async (farmId) => {
    const response = await api.post(`/ai/recommendations/${farmId}/refresh`);
    return response.data;
  },

  // POST /api/ai/recommendations/:id/dismiss
  dismissRecommendation: async (id, index) => {
    const response = await api.post(`/ai/recommendations/${id}/dismiss`, { 
      recommendation_index: index 
    });
    return response.data;
  },

  // POST /api/ai/chat
  sendChatMessage: async (message, history, farmId = null, lang = 'en') => {
    const response = await api.post('/ai/chat', { 
      message, 
      conversation_history: history, 
      farm_id: farmId, 
      lang 
    });
    return response.data;
  },

  // GET /api/ai/chat/history
  getChatHistory: async () => {
    const response = await api.get('/ai/chat/history');
    return response.data;
  },

  // DELETE /api/ai/chat/history
  clearChatHistory: async () => {
    const response = await api.delete('/ai/chat/history');
    return response.data;
  }
};

export default aiService;

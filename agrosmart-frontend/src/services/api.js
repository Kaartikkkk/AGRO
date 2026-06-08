import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for Auth Token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('agrosmart_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('agrosmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  uploadAvatar: async (formData) => {
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export const farmService = {
  // Returns all farms for a farmer
  getFarms: async () => {
    const response = await api.get('/farm');
    return response.data;
  },
  // Adds a new farm plot
  addFarm: async (data) => {
    const response = await api.post('/farm', data);
    return response.data;
  },
  // Updates a specific plot by ID
  updateFarm: async (id, data) => {
    const response = await api.put(`/farm/${id}`, data);
    return response.data;
  },
  // Decouples a plot
  deleteFarm: async (id) => {
    const response = await api.delete(`/farm/${id}`);
    return response.data;
  },
  // Fertilizer Recommendation Engine
  getRecommendation: async (id, weatherInfo) => {
    const response = await api.post(`/farm/${id}/recommendation`, weatherInfo);
    return response.data;
  },
  // AI Recommendations
  getAIRecommendations: async (id, rainChance) => {
    const response = await api.get(`/farm/${id}/recommendations`, {
      params: { rainChance }
    });
    return response.data;
  },
  // Crop Disease Scanning
  scanCropDisease: async (formData) => {
    const response = await api.post('/farm/diagnose', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export const reminderService = {
  getReminders: async () => {
    const response = await api.get('/reminders');
    return response.data;
  },
  createReminder: async (data) => {
    const response = await api.post('/reminders', data);
    return response.data;
  },
  updateReminder: async (id, data) => {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
  },
  deleteReminder: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  }
};

export default api;

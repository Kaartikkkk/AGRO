import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

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
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} - Auth Token Set`);
  } else {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} - No Auth Token`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response ? `Status ${error.response.status}` : error.message);
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));
      if (!isAuthRequest) {
        console.warn('[API Auth] 401 Unauthorized detected on protected route. Clearing token and redirecting to login.');
        localStorage.removeItem('agrosmart_user');
        window.location.href = '/login';
      }
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
    const response = await api.get('/farms');
    return response.data;
  },
  // Adds a new farm plot
  addFarm: async (data) => {
    const response = await api.post('/farms', data);
    return response.data;
  },
  // Updates a specific plot by ID
  updateFarm: async (id, data) => {
    const response = await api.put(`/farms/${id}`, data);
    return response.data;
  },
  // Decouples a plot
  deleteFarm: async (id) => {
    const response = await api.delete(`/farms/${id}`);
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agrosmart_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data);
      localStorage.setItem('agrosmart_user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data);
      localStorage.setItem('agrosmart_user', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Signup failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrosmart_user');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('agrosmart_user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      const response = await authService.uploadAvatar(formData);
      const newUser = { ...user, avatarUrl: response.avatarUrl };
      setUser(newUser);
      localStorage.setItem('agrosmart_user', JSON.stringify(newUser));
      return response.avatarUrl;
    } catch (error) {
      throw error.response?.data?.message || 'Avatar upload failed';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      login, 
      signup,
      logout,
      updateProfile,
      uploadAvatar
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

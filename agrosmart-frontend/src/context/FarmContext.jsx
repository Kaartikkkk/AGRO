import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { farmService } from '../services/api';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Multi-Farm State
  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [weather, setWeather] = useState(null);

  // Derived state for the currently active farm
  const farmData = farms.find(f => f.id === activeFarmId) || farms[0] || {
    id: null,
    farmName: "My Farm",
    state: "Punjab",
    cityVillage: "Ludhiana",
    location: "Ludhiana, Punjab",
    acres: 0,
    experienceYears: 0,
    cropType: "Wheat",
    soilType: "Alluvial"
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFarms();
    } else {
      setFarms([]);
      setActiveFarmId(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const data = await farmService.getFarms();
      setFarms(data);
      if (data.length > 0 && !activeFarmId) {
        setActiveFarmId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFarm = async (farmInfo) => {
    try {
      const newFarm = await farmService.addFarm(farmInfo);
      // Immediately fetch all farms to ensure full data sync including related records
      await fetchFarms();
      setActiveFarmId(newFarm.id);
      return newFarm;
    } catch (error) {
      console.error("Error adding farm:", error);
      throw error;
    }
  };

  const updateFarm = async (updatedInfo) => {
    const targetId = updatedInfo.id || activeFarmId;
    if (!targetId) return;

    try {
      const data = await farmService.updateFarm(targetId, updatedInfo);
      setFarms(prev => prev.map(f => f.id === data.id ? data : f));
      return data;
    } catch (error) {
      console.error("Error updating farm:", error);
      throw error;
    }
  };

  const deleteFarm = async (id) => {
    try {
      await farmService.deleteFarm(id);
      setFarms(prev => prev.filter(f => f.id !== id));
      if (activeFarmId === id) {
        const remaining = farms.filter(f => f.id !== id);
        setActiveFarmId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error("Error deleting farm:", error);
      throw error;
    }
  };

  const getFertilizerRecommendation = async (weatherInfo) => {
    if (!activeFarmId) return;
    try {
      const data = await farmService.getRecommendation(activeFarmId, { weather: weatherInfo });
      setRecommendation(data);
      return data;
    } catch (error) {
      console.error("Error getting recommendation:", error);
    }
  };

  const switchFarm = (id) => {
    setActiveFarmId(id);
    setRecommendation(null); // Reset recommendation on switch
  };

  const [lang, setLang] = useState('en');

  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'hi' : 'en');

  const t = (key) => {
    const translations = {
      en: {
        hero_title: "Agro Smart",
        get_started: "Get Started",
        login: "Login",
        weather: "Weather Forecast",
        farm_overview: "Farm Overview",
        mandi_prices: "Mandi Prices",
        ai_recommendations: "AI Recommendations",
        disease_detection: "Disease Detection",
        fertilizer_hub: "Fertilizer Hub",
        profile: "Farmer Profile",
        settings: "Settings",
        logout: "Logout"
      },
      hi: {
        hero_title: "एग्रो स्मार्ट",
        get_started: "शुरू करें",
        login: "लॉगिन",
        weather: "मौसम का पूर्वानुमान",
        farm_overview: "खेत का विवरण",
        mandi_prices: "मंडी के भाव",
        ai_recommendations: "एआई सुझाव",
        disease_detection: "रोग पहचान",
        fertilizer_hub: "उर्वरक केंद्र",
        profile: "किसान प्रोफाइल",
        settings: "सेटिङ्ग्ज",
        logout: "लॉग आउट"
      }
    };
    return translations[lang][key] || key;
  };

  return (
    <FarmContext.Provider value={{ 
      farms,
      activeFarmId,
      farmData,
      loading,
      recommendation,
      weather,
      setWeather,
      fetchFarms,
      addFarm,
      updateFarm,
      deleteFarm,
      getFertilizerRecommendation,
      switchFarm,
      lang,
      toggleLanguage,
      t 
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);

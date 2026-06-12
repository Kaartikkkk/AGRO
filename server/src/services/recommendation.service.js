const axios = require('axios');
const { FarmNew, CropRotation, DiseaseScan, User } = require('../models');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '413c108a67537b5be674d686d76604ac';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper to determine growth stage from crop type and days since sowing
function calculateGrowthStage(daysSinceSowing, crop) {
  if (daysSinceSowing < 0) return 'Pre-sowing';
  const cropLower = (crop || '').toLowerCase();
  
  if (cropLower.includes('wheat')) {
    if (daysSinceSowing <= 15) return 'Germination';
    if (daysSinceSowing <= 45) return 'Crown Root Initiation (Tillering)';
    if (daysSinceSowing <= 75) return 'Late Jointing';
    if (daysSinceSowing <= 95) return 'Flowering / Heading';
    if (daysSinceSowing <= 120) return 'Milking / Grain Filling';
    return 'Maturity / Harvesting';
  }
  
  if (cropLower.includes('rice') || cropLower.includes('paddy')) {
    if (daysSinceSowing <= 20) return 'Seedling / Nursery Stage';
    if (daysSinceSowing <= 45) return 'Tillering';
    if (daysSinceSowing <= 75) return 'Stem Elongation / Panicle Initiation';
    if (daysSinceSowing <= 100) return 'Flowering / Heading';
    return 'Grain Filling / Maturity';
  }
  
  if (cropLower.includes('cotton')) {
    if (daysSinceSowing <= 30) return 'Seedling Stage';
    if (daysSinceSowing <= 60) return 'Squaring Stage (Budding)';
    if (daysSinceSowing <= 90) return 'Flowering Stage';
    if (daysSinceSowing <= 130) return 'Boll Development';
    return 'Maturity / Open Boll';
  }
  
  // General fallback rules
  if (daysSinceSowing <= 20) return 'Germination / Seedling';
  if (daysSinceSowing <= 55) return 'Vegetative Growth';
  if (daysSinceSowing <= 85) return 'Flowering';
  if (daysSinceSowing <= 115) return 'Yield Formation';
  return 'Maturity / Harvest Ready';
}

// Helper to fetch OpenWeatherMap API current + forecast data
async function fetchWeatherData(lat, lon) {
  try {
    const currentRes = await axios.get(`${BASE_URL}/weather`, {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' }
    });
    
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' }
    });

    const currentData = currentRes.data;
    const forecastList = forecastRes.data.list;

    const current = {
      temp: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      condition: currentData.weather[0]?.main || 'Clear',
      wind: Math.round((currentData.wind?.speed || 0) * 3.6) // Convert m/s to km/h
    };

    const dailyData = {};
    forecastList.forEach(item => {
      const dateStr = item.dt_txt.split(' ')[0];
      if (!dailyData[dateStr]) dailyData[dateStr] = [];
      dailyData[dateStr].push(item);
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast = [];
    const keys = Object.keys(dailyData).sort();

    keys.slice(0, 5).forEach(dateKey => {
      const items = dailyData[dateKey];
      let low = Infinity;
      let high = -Infinity;
      let totalHumidity = 0;
      let maxPop = 0;

      items.forEach(it => {
        if (it.main.temp_min < low) low = it.main.temp_min;
        if (it.main.temp_max > high) high = it.main.temp_max;
        totalHumidity += it.main.humidity;
        if (it.pop > maxPop) maxPop = it.pop;
      });

      const avgHumidity = Math.round(totalHumidity / items.length);
      const midIndex = Math.floor(items.length / 2);
      const midItem = items.find(it => it.dt_txt.includes('12:00:00')) || items[midIndex];
      const dateObj = new Date(dateKey + 'T00:00:00');

      forecast.push({
        date: dateKey,
        day: daysOfWeek[dateObj.getDay()],
        condition: midItem.weather[0]?.main || 'Clear',
        high: Math.round(high),
        low: Math.round(low),
        rain_chance: Math.round(maxPop * 100),
        humidity: avgHumidity
      });
    });

    return { current, forecast };
  } catch (error) {
    console.error('⚠️ Failed to fetch weather for recommendation context:', error.message);
    // Return placeholder weather data
    return {
      current: { temp: 30, humidity: 62, condition: 'Partly Cloudy', wind: 14 },
      forecast: [
        { date: '2026-06-12', day: 'Today', condition: 'Clear', high: 34, low: 25, rain_chance: 10, humidity: 55 },
        { date: '2026-06-13', day: 'Tomorrow', condition: 'Clear', high: 34, low: 26, rain_chance: 20, humidity: 58 },
        { date: '2026-06-14', day: 'Sunday', condition: 'Partly Cloudy', high: 32, low: 25, rain_chance: 40, humidity: 68 },
        { date: '2026-06-15', day: 'Monday', condition: 'Thunderstorm', high: 29, low: 24, rain_chance: 75, humidity: 80 },
        { date: '2026-06-16', day: 'Tuesday', condition: 'Clear', high: 32, low: 25, rain_chance: 15, humidity: 62 }
      ]
    };
  }
}

/**
 * Builds farmContext object for a specific plot and farmer.
 */
async function buildFarmContext(farmId, userId) {
  const farm = await FarmNew.findOne({
    where: { id: farmId, userId }
  });

  if (!farm) {
    throw new Error('Farm plot not found or not owned by user.');
  }

  const user = await User.findByPk(userId);

  // Fetch crop rotation history (last 3 records)
  const rotationHistory = await CropRotation.findAll({
    where: { farmId },
    limit: 3,
    order: [['sowingDate', 'DESC']]
  });

  // Fetch recent disease scans (last 3 records)
  const recentDiseaseScans = await DiseaseScan.findAll({
    where: { farm_id: farmId },
    limit: 3,
    order: [['created_at', 'DESC']]
  });

  // Decide location coordinates for weather
  let lat = farm.latitude;
  let lon = farm.longitude;

  if ((!lat || !lon) && user) {
    lat = user.home_latitude;
    lon = user.home_longitude;
  }

  // Fallback to New Delhi if no coordinates are available
  if (!lat || !lon) {
    lat = 28.6139;
    lon = 77.2090;
  }

  // Fetch actual weather data
  const weather = await fetchWeatherData(lat, lon);

  // Date metrics calculations
  const today = new Date();
  const sowingDateObj = new Date(farm.sowingDate);
  const harvestDateObj = new Date(farm.harvestDate);

  const daysSinceSowing = Math.max(0, Math.floor((today - sowingDateObj) / (1000 * 60 * 60 * 24)));
  const daysUntilHarvest = Math.max(0, Math.ceil((harvestDateObj - today) / (1000 * 60 * 60 * 24)));
  const growthStage = calculateGrowthStage(daysSinceSowing, farm.currentCrop);

  return {
    plot_name: farm.plotName,
    size: farm.size,
    size_unit: farm.sizeUnit,
    land_type: farm.landType,
    soil_type: 'Alluvial', // Default soil type for AgroSmart FarmsNew model
    current_crop: farm.currentCrop,
    sowing_date: farm.sowingDate,
    harvest_date: farm.harvestDate,
    previous_crop: farm.previousCrop || 'None',
    irrigation_source: farm.irrigationSource,
    location: {
      city: farm.city || farm.village || user?.home_city || 'N/A',
      state: farm.state || user?.home_state || 'N/A',
      district: farm.district || user?.home_district || 'N/A'
    },
    weather,
    crop_rotation_history: rotationHistory,
    recent_disease_scans: recentDiseaseScans,
    days_since_sowing: daysSinceSowing,
    days_until_harvest: daysUntilHarvest,
    growth_stage: growthStage
  };
}

module.exports = {
  buildFarmContext
};

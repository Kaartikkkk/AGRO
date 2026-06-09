export const CROP_DURATIONS = {
  Wheat: 120,       // 4 months
  Rice: 120,        // 4 months
  Maize: 105,       // 3.5 months
  Cotton: 165,      // 5.5 months
  Sugarcane: 330,   // 11 months
  Mustard: 115,     // ~4 months
  Soybean: 95,      // 3 months
  Groundnut: 110,   // 3.5 months
  Pulses: 100,      // ~3.5 months
  Vegetables: 75,    // 2.5 months
  'Fallow/Empty': 30
};

export const getExpectedHarvestDate = (crop, sowingDateStr) => {
  if (!sowingDateStr) return '';
  const sowingDate = new Date(sowingDateStr);
  const duration = CROP_DURATIONS[crop] || 120;
  
  const harvestDate = new Date(sowingDate.getTime() + duration * 24 * 60 * 60 * 1000);
  return harvestDate.toISOString().split('T')[0];
};

export const formatIndianDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const getCropProgress = (sowingDateStr, harvestDateStr) => {
  if (!sowingDateStr || !harvestDateStr) return 0;
  const start = new Date(sowingDateStr).getTime();
  const end = new Date(harvestDateStr).getTime();
  const now = new Date().getTime();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.min(Math.round((elapsed / total) * 100), 100);
};

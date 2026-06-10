/**
 * AI Strategic Advisor Engine 🧠🛰️🚜
 * Generates contextual agricultural advice based on real-time soil,
 * weather, and crop lifecycle events.
 */

export const generateAdvisorCards = (farmData, weather) => {
  const rainChance = weather?.rainfall_chance || 0;
  const crop = farmData?.cropType || 'Wheat';
  const stage = farmData?.CropRecord?.cropStage || 'Vegetative';
  const soil = farmData?.SoilData || { nitrogen: 40, phosphorus: 25, potassium: 20 };

  const cards = [];

  // 1. Yield / Nutrient Optimization
  if (soil.nitrogen < 30) {
    cards.push({
      type: "Nutrient Alert",
      text: `Nitrogen level (${soil.nitrogen}) is below threshold. Apply Urea (45kg/Acre) in the next split-dose.`,
      impact: "High",
      color: "blue",
      category: "Soil Health"
    });
  } else if (stage === 'Flowering') {
    cards.push({
      type: "Yield Focus",
      text: `Crop in flowering stage. Maintain 15-20% soil moisture for optimal grain filling.`,
      impact: "High",
      color: "emerald",
      category: "Growth"
    });
  }

  // 2. Weather Precaution
  if (rainChance > 50) {
    cards.push({
      type: "Weather Guard",
      text: `High rain probability (${rainChance}%). Delay heavy fertilization to prevent nutrient runoff.`,
      impact: "Critical",
      color: "rose",
      category: "Risk"
    });
  } else {
    cards.push({
      type: "Optimal Window",
      text: `Clear sky predicted. Ideal window for manual weeding or micronutrient spraying.`,
      impact: "Medium",
      color: "sky",
      category: "Weather"
    });
  }

  // 3. Market Awareness
  const basePrice = 2275; // Dummy MSP baseline
  cards.push({
    type: "Market Pulse",
    text: `${crop} prices are currently tracking ₹${basePrice + 120} in your regional Mandi. Trending UP (+2.4%).`,
    impact: "Medium",
    color: "amber",
    category: "Market"
  });

  return cards;
};

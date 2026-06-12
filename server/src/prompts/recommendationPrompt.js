function buildRecommendationPrompt(farmContext) {
  const forecastSummary = farmContext.weather?.forecast?.map(f => 
    `${f.day}: ${f.condition} (${f.low}°C - ${f.high}°C, Rain: ${f.rain_chance}%)`
  ).join('; ') || 'No forecast data available';
  
  const rotationHistorySummary = farmContext.crop_rotation_history?.map(r => 
    `- Season ${r.season}: Crop: ${r.cropName}, Yield: ${r.yieldAmount || 'N/A'} ${r.yieldUnit || ''}, Notes: ${r.notes || ''}`
  ).join('\n') || 'No previous crop history recorded.';

  const diseaseScanSummary = farmContext.recent_disease_scans?.map(s => 
    `- Crop: ${s.crop_type}, Disease: ${s.disease_name}, Severity: ${s.severity}, Diagnosed: ${s.scan_date}`
  ).join('\n') || 'No recent crop disease issues detected.';

  return `You are an expert agricultural advisor for Indian farmers.
Analyze this farm data and provide actionable recommendations.

FARM DETAILS:
- Plot: ${farmContext.plot_name} (${farmContext.size} ${farmContext.size_unit})
- Location: ${farmContext.location?.city || 'N/A'}, ${farmContext.location?.state || 'N/A'}
- Soil Type: ${farmContext.soil_type || 'Alluvial'}
- Land Type: ${farmContext.land_type || 'irrigated'}
- Current Crop: ${farmContext.current_crop}
- Growth Stage: ${farmContext.growth_stage}
- Days since sowing: ${farmContext.days_since_sowing}
- Days until harvest: ${farmContext.days_until_harvest}
- Previous Crop: ${farmContext.previous_crop || 'None'}
- Irrigation Source: ${farmContext.irrigation_source}

CURRENT WEATHER:
- Temperature: ${farmContext.weather?.current?.temp}°C, ${farmContext.weather?.current?.condition}
- Humidity: ${farmContext.weather?.current?.humidity}%
- Wind: ${farmContext.weather?.current?.wind} km/h
- 5-Day Forecast: ${forecastSummary}

CROP ROTATION HISTORY:
${rotationHistorySummary}

RECENT DISEASE ISSUES:
${diseaseScanSummary}

Provide recommendations in this EXACT JSON format
(no markdown, no extra text, valid JSON only):
{
  "summary": "2-line overview of farm status",
  "priority": "high" | "medium" | "low",
  "recommendations": [
    {
      "category": "irrigation",
      "title": "Short actionable title",
      "description": "2-3 sentence explanation",
      "urgency": "today",
      "icon": "💧"
    }
  ],
  "next_crop_suggestion": {
    "crop": "suggested next crop name",
    "reason": "why this crop based on rotation + soil",
    "best_sowing_window": "month range"
  },
  "weather_impact": "1-2 sentences on how current weather affects this farm"
}

Give 4-6 recommendations total, prioritized by urgency.
Be specific to Indian farming practices and this region.`;
}

module.exports = { buildRecommendationPrompt };

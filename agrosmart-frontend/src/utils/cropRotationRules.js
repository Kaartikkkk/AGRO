export const CROP_DETAILS = {
  Wheat: { name: 'Wheat', emoji: '🌾', reason: 'Wheat breaks the disease cycle of summer crops.', bestMonths: { default: 'November - December' } },
  Rice: { name: 'Rice', emoji: '🌾', reason: 'Rice thrives in high water availability and wet seasons.', bestMonths: { default: 'June - July' } },
  Maize: { name: 'Maize', emoji: '🌽', reason: 'Maize improves soil organic matter and structure.', bestMonths: { default: 'June - July' } },
  Cotton: { name: 'Cotton', emoji: '🌿', reason: 'Cotton has deep roots that aerate lower soil profiles.', bestMonths: { default: 'May - June' } },
  Sugarcane: { name: 'Sugarcane', emoji: '🎋', reason: 'Sugarcane is a highly profitable, resilient cash crop.', bestMonths: { default: 'February - March' } },
  Mustard: { name: 'Mustard', emoji: '🌼', reason: 'Mustard suppresses soil-borne pests and nematodes.', bestMonths: { default: 'October - November' } },
  Soybean: { name: 'Soybean', emoji: '🫘', reason: 'Soybean acts as a natural legume that restores soil nitrogen.', bestMonths: { default: 'June - July' } },
  Groundnut: { name: 'Groundnut', emoji: '🥜', reason: 'Groundnut fixes atmospheric nitrogen and adds leaf mulch.', bestMonths: { default: 'June - July' } },
  Pulses: { name: 'Pulses', emoji: '🫘', reason: 'Pulses fix nitrogen, boosting fertility for next season.', bestMonths: { default: 'October - November' } },
  Vegetables: { name: 'Vegetables', emoji: '🥬', reason: 'Vegetables allow short-duration cultivation and fast cash.', bestMonths: { default: 'September - October' } },
  'Fallow/Empty': { name: 'Fallow/Empty', emoji: '🟫', reason: 'Fallow lets the land rest and restore natural moisture.', bestMonths: { default: 'Any Month' } }
};

export const getRotationRecommendation = (lastCrop = 'Fallow/Empty') => {
  const crop = lastCrop || 'Fallow/Empty';
  let recommendations = [];

  switch (crop) {
    case 'Wheat':
      recommendations = ['Rice', 'Maize', 'Pulses'];
      break;
    case 'Rice':
      recommendations = ['Wheat', 'Mustard', 'Vegetables'];
      break;
    case 'Maize':
      recommendations = ['Wheat', 'Soybean', 'Groundnut'];
      break;
    case 'Cotton':
      recommendations = ['Wheat', 'Pulses', 'Mustard'];
      break;
    case 'Sugarcane':
      recommendations = ['Wheat', 'Mustard'];
      break;
    case 'Mustard':
      recommendations = ['Rice', 'Maize', 'Cotton'];
      break;
    case 'Soybean':
      recommendations = ['Wheat', 'Maize', 'Pulses'];
      break;
    case 'Pulses':
      recommendations = ['Wheat', 'Maize', 'Cotton'];
      break;
    case 'Vegetables':
      recommendations = ['Wheat', 'Mustard'];
      break;
    case 'Fallow/Empty':
    default:
      recommendations = ['Wheat', 'Rice', 'Maize', 'Cotton'];
      break;
  }

  return recommendations.map(c => ({
    crop: c,
    ...CROP_DETAILS[c]
  }));
};

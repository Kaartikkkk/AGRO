const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildRecommendationPrompt } = require('../prompts/recommendationPrompt');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy-key');
// Using gemini-2.0-flash as recommended
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Fallback recommendations if Gemini fails
const getFallbackRecommendations = (farmContext = {}) => {
  const crop = farmContext.current_crop || 'Wheat';
  return {
    summary: `Farming parameters are stable for your ${crop} plot. Standard monitoring is recommended.`,
    priority: 'low',
    recommendations: [
      {
        category: 'general',
        title: 'Monitor Crop Growth',
        description: 'Walk through your plot daily to inspect crop health, soil moisture levels, and check for early pest warnings.',
        urgency: 'this_week',
        icon: '🌾'
      },
      {
        category: 'irrigation',
        title: 'Maintain Standard Moisture',
        description: 'Ensure adequate irrigation based on local soil conditions. Avoid waterlogging during vegetative stages.',
        urgency: 'this_week',
        icon: '💧'
      },
      {
        category: 'fertilizer',
        title: 'Balanced Nutrition',
        description: 'Prepare basal or top-dressing fertilizers (like urea or NPK) matching your crop growth stage if not already done.',
        urgency: 'this_month',
        icon: '🌱'
      },
      {
        category: 'pest_management',
        title: 'Preventative Weeding',
        description: 'Keep the plot clear of weeds to decrease nutrient competition and prevent host environments for common pests.',
        urgency: 'this_week',
        icon: '🐛'
      }
    ],
    next_crop_suggestion: {
      crop: crop === 'Wheat' ? 'Moong Dal (Legumes)' : 'Wheat',
      reason: 'Leguminous crops fix atmospheric nitrogen, enhancing soil fertility for the next cultivation cycle.',
      best_sowing_window: 'March - April'
    },
    weather_impact: 'Weather forecast parameters are normal. Continue standard local agricultural practices.'
  };
};

// Clean JSON code blocks from Gemini string response
function cleanGeminiResponse(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Timeout helper (15 seconds)
function runWithTimeout(promise, ms = 15000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Gemini API execution timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Generate daily agricultural recommendations based on plot & weather context.
 * Retry once with stricter formatting on failure.
 */
async function generateFarmRecommendations(farmContext) {
  if (!GEMINI_API_KEY) {
    console.warn('❌ GEMINI_API_KEY missing. Returning fallback recommendations.');
    return getFallbackRecommendations(farmContext);
  }

  const prompt = buildRecommendationPrompt(farmContext);

  try {
    const apiCall = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    const response = await runWithTimeout(apiCall, 15000);
    const rawText = response.response.text();
    const cleanedText = cleanGeminiResponse(rawText);
    const parsed = JSON.parse(cleanedText);

    // Basic structure validation
    if (!parsed.summary || !parsed.priority || !Array.isArray(parsed.recommendations)) {
      throw new Error('Missing required recommendation fields in JSON output.');
    }
    return parsed;
  } catch (error) {
    console.error('⚠️ First Gemini attempt failed or returned invalid JSON:', error.message);
    
    // Retry once with a stricter instruction
    try {
      const retryPrompt = `${prompt}\n\nWARNING: Your previous response was invalid. You MUST output a valid, clean JSON object matching the exact structure requested, with NO markdown formatting, no comments, and all required keys.`;
      
      const retryCall = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: retryPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      const response = await runWithTimeout(retryCall, 15000);
      const rawText = response.response.text();
      const cleanedText = cleanGeminiResponse(rawText);
      return JSON.parse(cleanedText);
    } catch (retryError) {
      console.error('❌ Stricter retry attempt also failed. Returning fallback recommendations:', retryError.message);
      return getFallbackRecommendations(farmContext);
    }
  }
}

/**
 * Get response from AgroBot chat session.
 * Supports custom system instruction prompts and suggestions parsing.
 */
async function getChatbotResponse(message, history, systemPrompt) {
  if (!GEMINI_API_KEY) {
    return {
      reply: "I'm sorry, my AI processing engine is currently offline (Gemini API key is missing). Please contact the administrator.",
      suggestions: ["What are some organic pest control tips?", "How do I check soil health?"]
    };
  }

  try {
    // Format history for Gemini API: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.message || msg.parts?.[0]?.text || '' }]
    }));

    // Start Gemini Chat
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    });

    const promptWithSuggestionDirective = `${message}\n\nRemember to append two suggestions at the very end formatted EXACTLY as: [[Suggestions: suggestion 1 | suggestion 2]]`;

    const apiCall = chat.sendMessage(promptWithSuggestionDirective);
    const response = await runWithTimeout(apiCall, 15000);
    const rawText = response.response.text();

    // Parse suggestions out of response
    const suggestionRegex = /\[\[Suggestions:\s*(.*?)\s*\|\s*(.*?)\s*\]\]/;
    let reply = rawText;
    let suggestions = [
      "How to increase soil organic matter?",
      "Best fertilizers for the vegetative stage"
    ];

    const match = rawText.match(suggestionRegex);
    if (match) {
      reply = rawText.replace(suggestionRegex, '').trim();
      suggestions = [match[1].trim(), match[2].trim()];
    }

    return {
      reply,
      suggestions
    };
  } catch (error) {
    console.error('❌ Chatbot response generation failed:', error.message);
    return {
      reply: "I am having trouble connecting to my farming knowledge bank right now. Please try again in a few moments, or feel free to check other features like the Fertilizer Hub.",
      suggestions: ["How to manage crop watering?", "What crops grow best in alluvial soil?"]
    };
  }
}

module.exports = {
  generateFarmRecommendations,
  getChatbotResponse
};

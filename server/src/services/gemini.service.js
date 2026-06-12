const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildRecommendationPrompt } = require('../prompts/recommendationPrompt');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy-key');

// Instantiate both models to allow quick fallback
const model20 = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const model15 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Fallback recommendations if both Gemini models fail
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

// Detailed local offline dictionary for Indian agriculture
function getOfflineChatbotResponse(message, systemPrompt) {
  const msgLower = (message || '').toLowerCase();
  
  // Try to parse language from systemPrompt or message
  const isHindi = systemPrompt?.includes('हिंदी') || msgLower.includes('हिंदी') || msgLower.includes('hindi') || msgLower.match(/[\u0900-\u097F]/);
  
  if (isHindi) {
    if (msgLower.includes('फसल') || msgLower.includes('बोएं') || msgLower.includes('plant') || msgLower.includes('next')) {
      return {
        reply: "मिट्टी की उर्वरता बढ़ाने के लिए, अनाज की फसलों (जैसे गेहूं/चावल) के बाद मूंग दाल या बीन्स जैसी फलियां (Legumes) लगाने की सलाह दी जाती है। फलियां प्राकृतिक रूप से नाइट्रोजन जमा करती हैं। रबी सीजन के लिए अक्टूबर-नवंबर और खरीफ के लिए जून-जुलाई सबसे अच्छा समय है।",
        suggestions: ["गेहूं की सिंचाई कब करें?", "गोबर खाद के फायदे क्या हैं?"]
      };
    }
    if (msgLower.includes('पानी') || msgLower.includes('सिंचाई') || msgLower.includes('water') || msgLower.includes('irrigation')) {
      return {
        reply: "फसलों के लिए सिंचाई उनके विकास के महत्वपूर्ण चरणों (Critical Stages) में बहुत जरूरी है। जैसे गेहूं में क्राउन रूट इनिशिएशन (CRI) चरण (बुवाई के 20-25 दिन बाद) और फूल आने के समय। मिट्टी में नमी रखें लेकिन पानी जमा न होने दें।",
        suggestions: ["कीट नियंत्रण कैसे करें?", "नमी बनाए रखने के उपाय क्या हैं?"]
      };
    }
    if (msgLower.includes('कीट') || msgLower.includes('कीड़ा') || msgLower.includes('बीमारी') || msgLower.includes('pest') || msgLower.includes('insect') || msgLower.includes('disease')) {
      return {
        reply: "प्राकृतिक कीट नियंत्रण के लिए, 1-2% नीम के तेल का घोल थोड़े से लिक्विड सोप के साथ मिलाकर छिड़काव करें। मित्र कीटों को आकर्षित करने और हानिकारक कीटों को दूर करने के लिए गेंदे के पौधे लगाएं। गंभीर रोग की स्थिति में हमारे 'रोग पहचान (Disease Detection)' स्कैनर का उपयोग करें।",
        suggestions: ["नीम तेल का घोल कैसे बनाएं?", "मंडी का भाव कैसे देखें?"]
      };
    }
    if (msgLower.includes('खाद') || msgLower.includes('उर्वरक') || msgLower.includes('fertilizer') || msgLower.includes('urea') || msgLower.includes('dap')) {
      return {
        reply: "फसल के अच्छे विकास के लिए संतुलित एनपीके (NPK 19:19:19) का उपयोग करें। पत्तियों के पीले होने (नाइट्रोजन की कमी) पर यूरिया का छिड़काव करें। जड़ों के मजबूत विकास के लिए डीएपी (DAP) सबसे अच्छा है। खाद हमेशा सुबह या शाम के ठंडे समय में ही डालें।",
        suggestions: ["जैविक खाद कैसे तैयार करें?", "मिट्टी परीक्षण कैसे कराएं?"]
      };
    }
    if (msgLower.includes('मौसम') || msgLower.includes('weather') || msgLower.includes('rain') || msgLower.includes('बारिश')) {
      return {
        reply: "यदि मौसम विभाग भारी बारिश की चेतावनी देता है, तो उर्वरक या कीटनाशकों का छिड़काव टाल दें, ताकि वे पानी में बहकर बर्बाद न हों। साफ मौसम में ही निराई-गुड़ाई और छिड़काव का कार्य करें।",
        suggestions: ["मंडी भाव क्या हैं?", "फसल चक्र क्या है?"]
      };
    }
    // Hindi default fallback
    return {
      reply: "यह एक अच्छा सवाल है! फसलों और मिट्टी से संबंधित सटीक सलाह के लिए अपने क्षेत्र के कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से संपर्क करें। सामान्यतः, जैविक खाद का अधिक उपयोग करें और मिट्टी का पीएच (pH) 6.0-7.0 के बीच बनाए रखें।",
      suggestions: ["मिट्टी की जांच कैसे करें?", "फसल चक्र कैसे अपनाएं?"]
    };
  }

  // English fallback responses
  if (msgLower.includes('crop') || msgLower.includes('plant') || msgLower.includes('next') || msgLower.includes('rotation')) {
    return {
      reply: "To optimize soil fertility, I recommend planting nitrogen-fixing legumes (such as Moong Dal, peas, or beans) after cereal harvests (like Wheat or Paddy). This natural crop rotation reduces dependency on chemical fertilizers. The ideal sowing window is Oct-Nov for Rabi crops and June-July for Kharif crops.",
      suggestions: ["How often should I water my crop?", "What organic fertilizers are best?"]
    };
  }
  if (msgLower.includes('water') || msgLower.includes('irrigation') || msgLower.includes('moisture') || msgLower.includes('watering')) {
    return {
      reply: "Irrigation timing is crucial. For instance, Wheat requires watering during the critical 'Crown Root Initiation' (CRI) stage (approx. 20-25 days post-sowing) and during flowering. Avoid overwatering or waterlogging, which causes root aeration failure and fungal infections.",
      suggestions: ["How to manage drainage?", "What are signs of overwatering?"]
    };
  }
  if (msgLower.includes('pest') || msgLower.includes('insect') || msgLower.includes('bug') || msgLower.includes('disease') || msgLower.includes('weed')) {
    return {
      reply: "For natural pest control, spray a diluted Neem Oil solution (1-2%) mixed with a few drops of dish soap. You can also plant companion crops like marigolds to naturally repel harmful nematodes. If leaves show spots, curl, or decay, use our Disease Detection scanner for a localized diagnosis.",
      suggestions: ["How do I make neem spray?", "Which companion plants deter pests?"]
    };
  }
  if (msgLower.includes('fertilizer') || msgLower.includes('urea') || msgLower.includes('dap') || msgLower.includes('npk')) {
    return {
      reply: "Use balanced NPK (19:19:19) for overall plant vigor. If leaves look pale yellow, it is a classic sign of nitrogen deficiency—apply Urea in split doses. For root architecture and early crop development, use DAP (Diammonium Phosphate). Always fertilize in early morning or late evening.",
      suggestions: ["Can I use vermicompost instead?", "How to do soil test?"]
    };
  }
  if (msgLower.includes('weather') || msgLower.includes('rain') || msgLower.includes('forecast') || msgLower.includes('wind')) {
    return {
      reply: "Always check local rain forecasts. If heavy precipitation is expected within 24-48 hours, suspend all fertilizer or pesticide applications to prevent chemical runoff. Low-wind periods in the early morning are ideal for foliar spraying.",
      suggestions: ["What are mandi prices today?", "How to protect crops from frost?"]
    };
  }
  
  // General fallback
  return {
    reply: "That is an interesting question! For highly localized queries, we recommend consulting your nearest KVK (Krishi Vigyan Kendra) or agricultural officer. In general, ensure your soil organic matter remains above 0.5% by applying compost regularly, and test your soil pH annually.",
    suggestions: ["How to increase soil fertility?", "Which crops grow in alluvial soil?"]
  };
}

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
 * Retry once with stricter formatting on failure. Fallback to Gemini 1.5 if 2.0 hits quota.
 */
async function generateFarmRecommendations(farmContext) {
  if (!GEMINI_API_KEY) {
    console.warn('❌ GEMINI_API_KEY missing. Returning fallback recommendations.');
    return getFallbackRecommendations(farmContext);
  }

  const prompt = buildRecommendationPrompt(farmContext);

  async function runModel(modelInstance) {
    const apiCall = modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    const response = await runWithTimeout(apiCall, 15000);
    const rawText = response.response.text();
    const cleanedText = cleanGeminiResponse(rawText);
    return JSON.parse(cleanedText);
  }

  try {
    // Try Gemini 2.0 Flash first
    return await runModel(model20);
  } catch (error) {
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('rate');
    
    if (isQuotaError) {
      console.warn('⚠️ Gemini 2.0 Flash hit quota limit. Retrying with Gemini 1.5 Flash...');
      try {
        return await runModel(model15);
      } catch (err15) {
        console.error('❌ Gemini 1.5 Flash also failed:', err15.message);
      }
    }

    // Default retry with stricter prompt
    try {
      const activeModel = isQuotaError ? model15 : model20;
      const retryPrompt = `${prompt}\n\nWARNING: Your previous response was invalid. You MUST output a valid, clean JSON object matching the exact structure requested, with NO markdown formatting, no comments, and all required keys.`;
      
      const retryCall = activeModel.generateContent({
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
 * Fallbacks to Gemini 1.5 if 2.0 hits quota, and to offline rules if both fail.
 */
async function getChatbotResponse(message, history, systemPrompt) {
  if (!GEMINI_API_KEY) {
    return getOfflineChatbotResponse(message, systemPrompt);
  }

  const formattedHistory = (history || []).map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.message || msg.parts?.[0]?.text || '' }]
  }));

  const promptWithSuggestionDirective = `${message}\n\nRemember to append two suggestions at the very end formatted EXACTLY as: [[Suggestions: suggestion 1 | suggestion 2]]`;

  async function runChat(modelInstance) {
    const chat = modelInstance.startChat({
      history: formattedHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    });

    const apiCall = chat.sendMessage(promptWithSuggestionDirective);
    const response = await runWithTimeout(apiCall, 15000);
    return response.response.text();
  }

  try {
    let rawText;
    try {
      // Try Gemini 2.0 first
      rawText = await runChat(model20);
    } catch (error) {
      const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('rate');
      if (isQuotaError) {
        console.warn('⚠️ Gemini 2.0 Flash chat hit quota limit. Retrying with Gemini 1.5 Flash...');
        rawText = await runChat(model15);
      } else {
        throw error;
      }
    }

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
    console.error('❌ Chatbot response generation failed. Loading offline helper responses:', error.message);
    return getOfflineChatbotResponse(message, systemPrompt);
  }
}

module.exports = {
  generateFarmRecommendations,
  getChatbotResponse
};

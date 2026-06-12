const express = require('express');
const { Op } = require('sequelize');
const axios = require('axios');
const { FarmNew, AIRecommendation, ChatHistory } = require('../models');
const { protect } = require('../middleware/auth.middleware');
const { buildFarmContext, calculateGrowthStage } = require('../services/recommendation.service');
const { generateFarmRecommendations, getChatbotResponse } = require('../services/gemini.service');
const { buildChatSystemPrompt } = require('../prompts/chatbotPrompt');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '413c108a67537b5be674d686d76604ac';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const router = express.Router();

// Helper to check UUID format
function isValidUuid(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 1. GET /api/ai/recommendations/:farmId
 * Fetch recommendations for a specific farm. Returns cached if valid (expires_at > now).
 */
router.get('/recommendations/:farmId', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    if (!isValidUuid(farmId)) {
      return res.status(400).json({ message: 'Invalid Farm ID format.' });
    }

    // Check if the farm exists and belongs to the user
    const farm = await FarmNew.findOne({ where: { id: farmId, userId: req.user.id } });
    if (!farm) {
      return res.status(404).json({ message: 'Farm plot not found.' });
    }

    // Retrieve cached recommendation
    const cached = await AIRecommendation.findOne({
      where: {
        farm_id: farmId,
        user_id: req.user.id,
        is_dismissed: false
      }
    });

    const now = new Date();
    if (cached && new Date(cached.expires_at) > now) {
      return res.status(200).json({
        cached: true,
        generated_at: cached.generated_at,
        expires_at: cached.expires_at,
        recommendation: cached.recommendation_json,
        dismissed_indices: cached.dismissed_indices || []
      });
    }

    // Cache missed or expired -> build context -> generate -> update cache
    console.log(`🤖 Cache miss/expired for farm ${farmId}. Calling Gemini API...`);
    const farmContext = await buildFarmContext(farmId, req.user.id);
    const recData = await generateFarmRecommendations(farmContext);

    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
    
    // Find or create recommendation record
    let recRecord = await AIRecommendation.findOne({
      where: { farm_id: farmId, user_id: req.user.id }
    });

    if (!recRecord) {
      recRecord = await AIRecommendation.create({
        farm_id: farmId,
        user_id: req.user.id,
        recommendation_json: recData,
        farm_context_snapshot: farmContext,
        generated_at: now,
        expires_at: expiresAt,
        is_dismissed: false,
        dismissed_indices: [],
        refresh_timestamps: []
      });
    } else {
      await recRecord.update({
        recommendation_json: recData,
        farm_context_snapshot: farmContext,
        generated_at: now,
        expires_at: expiresAt,
        is_dismissed: false,
        dismissed_indices: [] // Reset dismissed items on new generation
      });
    }

    res.status(200).json({
      cached: false,
      generated_at: recRecord.generated_at,
      expires_at: recRecord.expires_at,
      recommendation: recData,
      dismissed_indices: []
    });
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error.message);
    res.status(500).json({ message: 'Failed to generate recommendations: ' + error.message });
  }
});

/**
 * 2. GET /api/ai/recommendations
 * Fetch recommendations for ALL user's farms. Used for dashboard widget / overall status.
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const farms = await FarmNew.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (farms.length === 0) {
      return res.status(200).json([]);
    }

    const now = new Date();
    const results = [];

    for (const farm of farms) {
      try {
        const cached = await AIRecommendation.findOne({
          where: {
            farm_id: farm.id,
            user_id: req.user.id,
            is_dismissed: false
          }
        });

        if (cached && new Date(cached.expires_at) > now) {
          results.push({
            farmId: farm.id,
            plotName: farm.plotName,
            generated_at: cached.generated_at,
            recommendation: cached.recommendation_json,
            dismissed_indices: cached.dismissed_indices || []
          });
          continue;
        }

        // Cache miss -> build context -> generate -> save
        console.log(`🤖 Dashboard fetch: cache miss for farm ${farm.plotName}. Calling Gemini...`);
        const farmContext = await buildFarmContext(farm.id, req.user.id);
        const recData = await generateFarmRecommendations(farmContext);
        const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

        let recRecord = await AIRecommendation.findOne({
          where: { farm_id: farm.id, user_id: req.user.id }
        });

        if (!recRecord) {
          recRecord = await AIRecommendation.create({
            farm_id: farm.id,
            user_id: req.user.id,
            recommendation_json: recData,
            farm_context_snapshot: farmContext,
            generated_at: now,
            expires_at: expiresAt,
            is_dismissed: false,
            dismissed_indices: [],
            refresh_timestamps: []
          });
        } else {
          await recRecord.update({
            recommendation_json: recData,
            farm_context_snapshot: farmContext,
            generated_at: now,
            expires_at: expiresAt,
            is_dismissed: false,
            dismissed_indices: []
          });
        }

        results.push({
          farmId: farm.id,
          plotName: farm.plotName,
          generated_at: recRecord.generated_at,
          recommendation: recData,
          dismissed_indices: []
        });
      } catch (err) {
        console.error(`⚠️ Failed to load recommendation for plot ${farm.plotName}:`, err.message);
        // Fallback for this farm so others don't fail
        const fallbackPrompt = require('../services/gemini.service').generateFarmRecommendations; // triggers import dynamically
        const context = { current_crop: farm.currentCrop, plot_name: farm.plotName };
        const dummy = require('../services/gemini.service').generateFarmRecommendations(context); 
        results.push({
          farmId: farm.id,
          plotName: farm.plotName,
          generated_at: now,
          recommendation: dummy,
          dismissed_indices: []
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error in aggregating recommendations:', error.message);
    res.status(500).json({ message: 'Aggregating recommendations failed.' });
  }
});

/**
 * 3. POST /api/ai/recommendations/:farmId/refresh
 * Force regenerate recommendations. Max 5 refreshes per farm per 24 hours.
 */
router.post('/recommendations/:farmId/refresh', protect, async (req, res) => {
  try {
    const { farmId } = req.params;
    if (!isValidUuid(farmId)) {
      return res.status(400).json({ message: 'Invalid Farm ID format.' });
    }

    // Check plot ownership
    const farm = await FarmNew.findOne({ where: { id: farmId, userId: req.user.id } });
    if (!farm) {
      return res.status(404).json({ message: 'Farm plot not found.' });
    }

    // Retrieve or create cache record
    let recRecord = await AIRecommendation.findOne({
      where: { farm_id: farmId, user_id: req.user.id }
    });

    const now = new Date();
    const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
    
    let refreshTimestamps = [];
    if (recRecord && recRecord.refresh_timestamps) {
      // Parse if string (depending on DB drivers/Sequelize setup)
      let rawTimestamps = recRecord.refresh_timestamps;
      if (typeof rawTimestamps === 'string') {
        try { rawTimestamps = JSON.parse(rawTimestamps); } catch(e) {}
      }
      if (Array.isArray(rawTimestamps)) {
        // Filter timestamps from the last 24 hours
        refreshTimestamps = rawTimestamps.filter(t => new Date(t).getTime() > oneDayAgo);
      }
    }

    // Check rate limit: Max 5 refreshes per farm per day
    if (refreshTimestamps.length >= 5) {
      return res.status(429).json({
        message: 'Daily refresh limit reached. You can refresh each plot up to 5 times a day.'
      });
    }

    // Record this refresh
    refreshTimestamps.push(now.toISOString());

    console.log(`🤖 Force refresh triggered for farm ${farmId}. Calling Gemini API...`);
    const farmContext = await buildFarmContext(farmId, req.user.id);
    const recData = await generateFarmRecommendations(farmContext);
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours

    if (!recRecord) {
      recRecord = await AIRecommendation.create({
        farm_id: farmId,
        user_id: req.user.id,
        recommendation_json: recData,
        farm_context_snapshot: farmContext,
        generated_at: now,
        expires_at: expiresAt,
        is_dismissed: false,
        dismissed_indices: [],
        refresh_timestamps: refreshTimestamps
      });
    } else {
      await recRecord.update({
        recommendation_json: recData,
        farm_context_snapshot: farmContext,
        generated_at: now,
        expires_at: expiresAt,
        is_dismissed: false,
        dismissed_indices: [],
        refresh_timestamps: refreshTimestamps
      });
    }

    res.status(200).json({
      cached: false,
      generated_at: recRecord.generated_at,
      expires_at: recRecord.expires_at,
      recommendation: recData,
      dismissed_indices: []
    });
  } catch (error) {
    console.error('❌ Error force-refreshing recommendations:', error.message);
    res.status(500).json({ message: 'Failed to refresh recommendations.' });
  }
});

/**
 * 4. POST /api/ai/recommendations/:id/dismiss
 * Dismisses a single item inside the recommendations array or the entire record.
 */
router.post('/recommendations/:id/dismiss', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { recommendation_index } = req.body;

    let recRecord;
    if (isValidUuid(id)) {
      // Find by record ID or farm ID
      recRecord = await AIRecommendation.findOne({
        where: {
          [Op.or]: [{ id }, { farm_id: id }],
          user_id: req.user.id
        }
      });
    }

    if (!recRecord) {
      return res.status(404).json({ message: 'Recommendation record not found.' });
    }

    if (recommendation_index !== undefined) {
      // Dismiss an individual recommendation card inside the array
      let dismissed = recRecord.dismissed_indices || [];
      if (typeof dismissed === 'string') {
        try { dismissed = JSON.parse(dismissed); } catch(e) {}
      }

      if (Array.isArray(dismissed)) {
        if (!dismissed.includes(recommendation_index)) {
          dismissed.push(recommendation_index);
        }
        await recRecord.update({ dismissed_indices: dismissed });
      }
      return res.status(200).json({
        message: 'Recommendation item dismissed.',
        dismissed_indices: dismissed
      });
    } else {
      // Dismiss the entire plot recommendation record
      await recRecord.update({ is_dismissed: true });
      return res.status(200).json({ message: 'Plot recommendations dismissed.' });
    }
  } catch (error) {
    console.error('❌ Error dismissing recommendation:', error.message);
    res.status(500).json({ message: 'Failed to dismiss recommendation.' });
  }
});

/**
 * 5. POST /api/ai/chat
 * General farming assistant message endpoint. Rate limit: 30 messages per user per hour.
 */
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversation_history, farm_id, lang } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    // Rate limiting: Max 30 user messages per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const userMessageCount = await ChatHistory.count({
      where: {
        user_id: req.user.id,
        role: 'user',
        created_at: { [Op.gte]: oneHourAgo }
      }
    });

    if (userMessageCount >= 30) {
      return res.status(429).json({
        message: 'Message limit reached. You can send up to 30 messages per hour to AgroBot.'
      });
    }

    // Gather active farm/user context to build system prompt
    let userContext = {
      lang: lang || 'en',
      soil_type: 'Alluvial'
    };

    if (farm_id && isValidUuid(farm_id)) {
      const farm = await FarmNew.findOne({ where: { id: farm_id, userId: req.user.id } });
      if (farm) {
        // Compute active crop growth stage details
        const sowing = new Date(farm.sowingDate);
        const days = Math.max(0, Math.floor((new Date() - sowing) / (1000 * 60 * 60 * 24)));
        const stage = calculateGrowthStage ? calculateGrowthStage(days, farm.currentCrop) : 'Vegetative Stage';

        userContext.city = farm.city || farm.village || 'N/A';
        userContext.state = farm.state || 'N/A';
        userContext.current_crop = farm.currentCrop;
        userContext.growth_stage = stage;
        userContext.soil_type = 'Alluvial';

        // Fetch current temperature/weather if coordinate exists
        if (farm.latitude && farm.longitude) {
          try {
            const currentRes = await axios.get(`${BASE_URL}/weather`, {
              params: { lat: farm.latitude, lon: farm.longitude, appid: OPENWEATHER_API_KEY, units: 'metric' }
            });
            userContext.temp = Math.round(currentRes.data.main.temp);
            userContext.condition = currentRes.data.weather[0]?.main || 'Clear';
          } catch(e) {}
        }
      }
    }

    // Fallback if weather/location is missing
    if (!userContext.city && req.user) {
      userContext.city = req.user.home_city || 'N/A';
      userContext.state = req.user.home_state || 'N/A';
      if (req.user.home_latitude && req.user.home_longitude) {
        try {
          const currentRes = await axios.get(`${BASE_URL}/weather`, {
            params: { lat: req.user.home_latitude, lon: req.user.home_longitude, appid: OPENWEATHER_API_KEY, units: 'metric' }
          });
          userContext.temp = Math.round(currentRes.data.main.temp);
          userContext.condition = currentRes.data.weather[0]?.main || 'Clear';
        } catch(e) {}
      }
    }

    // Build the system prompt
    const systemPrompt = buildChatSystemPrompt(userContext);

    // Call Gemini chat handler
    const chatResult = await getChatbotResponse(message, conversation_history, systemPrompt);

    // Save message exchanges in the DB
    await ChatHistory.create({
      user_id: req.user.id,
      role: 'user',
      message: message,
      farm_id: farm_id || null
    });

    const botMessage = await ChatHistory.create({
      user_id: req.user.id,
      role: 'model',
      message: chatResult.reply,
      farm_id: farm_id || null
    });

    res.status(200).json({
      reply: chatResult.reply,
      timestamp: botMessage.created_at,
      suggestions: chatResult.suggestions
    });
  } catch (error) {
    console.error('❌ Chat endpoint failure:', error.message);
    res.status(500).json({ message: 'AgroBot chat failed.' });
  }
});

/**
 * 6. GET /api/ai/chat/history
 * Fetch past 50 chat history rows for the logged-in user.
 */
router.get('/chat/history', protect, async (req, res) => {
  try {
    const history = await ChatHistory.findAll({
      where: { user_id: req.user.id },
      limit: 50,
      order: [['created_at', 'ASC']]
    });
    res.status(200).json(history);
  } catch (error) {
    console.error('❌ Fetch chat history failed:', error.message);
    res.status(500).json({ message: 'Failed to retrieve chat history.' });
  }
});

/**
 * 7. DELETE /api/ai/chat/history
 * Delete all chatbot exchanges for the logged-in user.
 */
router.delete('/chat/history', protect, async (req, res) => {
  try {
    await ChatHistory.destroy({
      where: { user_id: req.user.id }
    });
    res.status(200).json({ message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('❌ Clear chat history failed:', error.message);
    res.status(500).json({ message: 'Failed to clear chat history.' });
  }
});

module.exports = router;

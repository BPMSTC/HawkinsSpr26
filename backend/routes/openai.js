const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

let aiRequestCount = 0;
const DAILY_LIMIT = 20;
let lastResetDate = new Date().toDateString();

function resetCounterIfNewDay() {
  const today = new Date().toDateString();

  if (today !== lastResetDate) {
    aiRequestCount = 0;
    lastResetDate = today;
  }
}

router.post('/chat', async (req, res) => {
  console.log('AI route hit:', req.body);

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A valid message string is required.',
      });
    }

    resetCounterIfNewDay();

    if (aiRequestCount >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'AI request limit reached for today. Please try again tomorrow.',
        requestsUsed: aiRequestCount,
        requestsRemaining: 0,
        dailyLimit: DAILY_LIMIT,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('Missing Gemini API key');
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY in backend/.env',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a helpful assistant for website users.',
    });

    console.log('Before Gemini call');

    const result = await model.generateContent(message);

    console.log('After Gemini call');

    const reply = result.response.text();

    aiRequestCount++;

    console.log('Final reply:', reply);
    console.log(`AI requests used: ${aiRequestCount}/${DAILY_LIMIT}`);

    return res.json({
      reply,
      requestsUsed: aiRequestCount,
      requestsRemaining: DAILY_LIMIT - aiRequestCount,
      dailyLimit: DAILY_LIMIT,
    });
  } catch (error) {
    console.error('Gemini route error:', error);

    return res.status(500).json({
      error: error.message?.includes('429')
        ? 'AI limit reached through Gemini. Please wait and try again later.'
        : 'Failed to get a response from Gemini.',
      details: error.message,
      requestsUsed: aiRequestCount,
      requestsRemaining: DAILY_LIMIT - aiRequestCount,
      dailyLimit: DAILY_LIMIT,
    });
  }
});

module.exports = router;
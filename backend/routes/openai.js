const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  console.log('AI route hit:', req.body);

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A valid message string is required.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY in .env file.',
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a helpful assistant for website users.',
      }
    );
console.log('Before Gemini call');

const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Gemini request timed out')), 15000)
);

const result = await Promise.race([
  model.generateContent(message),
  timeout
]);

console.log('After Gemini call');

const reply = result.response.text();

console.log("FULL GEMINI RESPONSE:", JSON.stringify(result, null, 2));
console.log("FINAL REPLY:", reply);

    return res.json({
      reply,
    });
  } catch (error) {
    console.error('Gemini route error:', error);

    return res.status(500).json({
      error: 'Failed to get a response from Gemini.',
      details: error.message,
    });
  }
});

module.exports = router;
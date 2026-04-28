const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

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

    console.log('Final reply:', reply);

    return res.json({
      reply,
    });
  } catch (error) {
  console.error('Gemini route error:', error);

  return res.status(500).json({
    error: 'AI limit reached. Please wait a bit and try again.',
    details: error.message,
  });
}
});

module.exports = router;
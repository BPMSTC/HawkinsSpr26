const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'A valid message string is required.',
      });
    }

    const response = await client.responses.create({
      model: 'gpt-5.4',
      instructions: 'You are a helpful assistant for website users.',
      input: message,
    });

    return res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error('OpenAI route error:', error);
    return res.status(500).json({
      error: 'Failed to get a response from OpenAI.',
    });
  }
});

module.exports = router;
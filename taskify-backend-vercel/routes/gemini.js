const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env['GEMINI_API_KEY'];

// Initialize Gemini client using the newer SDK as per user's example
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/**
 * @route POST /reason
 * @desc  Fetch reasoning for tasks using Gemini LLM with streaming
 * @access Private
 */
router.post('/reason', verifyToken, async (req, res) => {
  try {
    const { contents } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Invalid contents provided. Expected an array of chat messages.' });
    }

    // System instruction to define TaskMate's role
    const systemInstruction = {
      role: 'user',
      parts: [
        {
          text: "You are TaskMate, an agent to help users with their task management and provide reasoning for their queries. Focus on providing clear, helpful reasoning for task-related questions."
        }
      ]
    };

    // Prepend the system instruction to the chat context if it's not already there
    // For many models, prepending it to the start is effective.
    const fullContents = [systemInstruction, ...contents];

    const tools = [
      {
        googleSearch: {}
      },
    ];

    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
    };

    const model = 'gemini-flash-latest';

    // Set headers for streaming the response to the client
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call Gemini API with streaming
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents: fullContents,
    });

    // Stream chunks to the client
    for await (const chunk of response) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }

    res.end();
  } catch (error) {
    console.error('Gemini API Error:', error);

    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    // Handle common API errors (Rate limits, safety blocks, etc.)
    if (error.status === 429 || error.message?.includes('429')) {
      statusCode = 429;
      errorMessage = 'TaskMate(gemini) is currently busy (Rate limit reached). Please try again in a moment.';
    } else if (error.message?.includes('Safety') || error.message?.includes('blocked')) {
      errorMessage = 'The request was blocked due to safety guidelines.';
    }

    // If headers were already sent, we can't send a JSON response.
    if (res.headers_sent || res.headersSent) {
      res.write(`\n\n[TaskMate Error: ${errorMessage}]`);
      res.end();
    } else {
      res.status(statusCode).json({ error: errorMessage });
    }
  }
});

module.exports = router;

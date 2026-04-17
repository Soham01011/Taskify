const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { Ollama } = require('ollama');
const { getTasks, getTasksDefinition } = require('../tools/getTasks');
const { createTask, createTaskDefinition } = require('../tools/createTask');

// Initialize Ollama client with API Key support for hosted services
let ollamaHost = 'https://ollama.com/api';

// Normalize URL: remove trailing slashes and strip redundant /api suffix
ollamaHost = ollamaHost.replace(/\/+$/, '');
if (ollamaHost.endsWith('/api')) {
  ollamaHost = ollamaHost.slice(0, -4);
}

const ollama = new Ollama({
  host: ollamaHost,
  headers: process.env.OLLAMA_API_KEY ? {
    'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
  } : {}
});

const model = 'qwen3-next:80b';

/**
 * @route POST /reason
 * @desc  Fetch response from Ollama with streaming support, tool calls, and structured loop
 * @access Private
 */
router.post('/reason', verifyToken, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages provided. Expected an array of chat objects.' });
    }

    const userId = req.userId;
    const currentDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const systemPrompt = `You are an intelligent task management assistant. 
Current date and time is ${currentDate}. 
Resolve all relative dates like 'today', 'tomorrow', or 'next Friday' using this timestamp. 
Only call tools required to complete the request. 
Each Task requires 30 min and the due date are the start time for the tasks. While cheking for free time do chekc tasks dont over lap.
If you need more information from the user, ask for clarification instead of calling tools.`;

    // Ensure we have a system message with context
    let processedMessages = [...messages];
    const existingSystemIndex = processedMessages.findIndex(m => m.role === 'system');
    if (existingSystemIndex !== -1) {
      processedMessages[existingSystemIndex].content += `\n\nContext: ${systemPrompt}`;
    } else {
      processedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    // Set headers for streaming the response to the client
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const runChat = async (currentMessages, turnCount = 0) => {
      // Prevent infinite loops
      if (turnCount > 10) {
        res.write('\n\n[Error: Maximum reasoning turns exceeded]');
        return;
      }

      // Call Ollama API with streaming
      const stream = await ollama.chat({
        model: model,
        messages: currentMessages,
        tools: [getTasksDefinition, createTaskDefinition],
        stream: true,
      });

      let inThinking = false;
      let assistantMessage = { role: 'assistant', content: '' };
      let toolCalls = [];

      for await (const chunk of stream) {
        if (chunk.message) {
          const { thinking, content, tool_calls } = chunk.message;

          // Handle tool calls
          if (tool_calls && tool_calls.length > 0) {
            if (!assistantMessage.tool_calls) assistantMessage.tool_calls = [];
            assistantMessage.tool_calls.push(...tool_calls);
            toolCalls.push(...tool_calls);
          }

          // Stream thinking/content
          if (thinking) {
            if (!inThinking) {
              inThinking = true;
              res.write('\nThinking:\n');
            }
            res.write(thinking);
            assistantMessage.content += thinking;
          } else if (content) {
            if (inThinking) {
              inThinking = false;
              res.write('\n\nAnswer:\n');
            }
            res.write(content);
            assistantMessage.content += content;
          }
        }
      }

      // Execute tools if requested
      if (toolCalls.length > 0) {
        const nextMessages = [...currentMessages, assistantMessage];
        
        for (const toolCall of toolCalls) {
          let toolResult;
          if (toolCall.function.name === 'getTasks') {
            const { date, fromDate, toDate } = toolCall.function.arguments;
            toolResult = await getTasks(userId, date, fromDate, toDate);
          } else if (toolCall.function.name === 'createTask') {
            const { title, description, datetime, recurrence } = toolCall.function.arguments;
            toolResult = await createTask(userId, title, description, datetime, recurrence);
          }

          if (toolResult) {
            nextMessages.push({
              role: 'tool',
              content: JSON.stringify(toolResult),
            });
          }
        }

        // Recursive call for the next turn
        return runChat(nextMessages, turnCount + 1);
      } else {
        // No more tool calls, we are finished
        res.write('\n\n[DONE]');
      }
    };

    await runChat(processedMessages);
    res.end();
  } catch (error) {
    console.error('Ollama Reasoning Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`\n\n[Ollama Error: ${error.message}]`);
      res.end();
    }
  }
});


module.exports = router;
# Ollama Reasoning API Documentation

This API endpoint provides an agentic reasoning loop that can automatically manage user tasks by fetching current schedules and creating new entries. It handles tool execution on the server and streams the complete reasoning process back to the client.

## Endpoint Information

- **URL**: `/api/ollama/reason`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `application/json`

## Request Headers

| Header | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <your_token>` | The JWT token obtained from login. |
| `Content-Type` | `application/json` | Required. |

## Request Body Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `messages` | `Array<Object>` | An array of chat messages. Each object must have `role` ('user', 'assistant', or 'system') and `content`. |

### Example Request Body
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Check if I have free time tomorrow at 2 PM. If yes, schedule a workout."
    }
  ]
}
```

## Response (Streaming)

The response is streamed as `text/plain`. The client should read the stream chunk by chunk. The stream includes specialized markers to help parse the "Thinking" process versus the final "Answer".

### Stream Keywords/Markers

- **`Thinking:`**: Marks the beginning of the LLM's reasoning process.
- **`Answer:`**: Marks the beginning of the final response to the user.
- **`[DONE]`**: Marks the end of the entire multi-turn tool calling loop.

## Internal Logic & Constraints
- **Multi-Turn**: The API will automatically call tools (like `getTasks` and `createTask`) and finish the loop before sending the `[DONE]` signal.
- **Date Resolution**: The system automatically resolves relative dates (today, tomorrow) using the server's current timestamp.
- **Scheduling Rules**: 
  - Each task is assumed to last **30 minutes**.
  - The `dueDate` represents the **start time**.
  - The agent checks for overlapping tasks before confirming availability.

## Example Interaction (JavaScript Fetch)

```javascript
const response = await fetch('http://your-apiUrl/api/ollama/reason', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Check my tasks for today' }]
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  console.log(chunk); // Process Thinking/Answer markers here
}
```

## Available Tools (LLM-only)
The client does not need to specify these; the server manages them internally:
1. `getTasks`: Retrieves schedule for date ranges.
2. `createTask`: Schedules a new task entry.

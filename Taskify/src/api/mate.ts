import client from './client';

export interface ReasonRequest {
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[];
}

export const mateApi = {
    /**
     * Sends a prompt to the Ollama-powered reasoning engine.
     * The engine is expected to return a stream of text with Thinking/Answer blocks.
     */
    runReasoning: (prompt: string) => 
        client.post<string>('/ollama/reason', {
            messages: [{ role: 'user', content: prompt }]
        })
};

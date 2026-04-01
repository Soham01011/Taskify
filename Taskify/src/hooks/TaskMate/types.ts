export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export type AgentStatus = 'initializing' | 'ready' | 'error' | string;

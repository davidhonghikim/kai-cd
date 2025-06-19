export interface ChatSession {
  id: string;
  serviceId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ImageArtifact {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
} 
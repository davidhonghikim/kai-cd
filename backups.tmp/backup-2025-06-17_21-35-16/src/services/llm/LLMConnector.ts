import type { LLMModel, ChatMessage, ChatSession, ServiceConfig } from '@/types';
import { BaseConnector } from '../base/BaseConnector';

export abstract class LLMConnector extends BaseConnector<ServiceConfig> {
  protected models: LLMModel[] = [];
  protected abortController: AbortController | null = null;
  protected chatHistory: ChatSession[] = [];

  constructor(service: ServiceConfig) {
    super(service);
  }

  abstract validateConfig(): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }>;
  abstract getModelStatus(): Promise<Record<string, boolean>>;
  abstract chat(messages: ChatMessage[], options?: any): Promise<string>;
  abstract completion(prompt: string, options?: any): Promise<string>;
  abstract embedding(text: string): Promise<number[]>;

  public async getModels(): Promise<LLMModel[]> {
    return this.models;
  }

  public async clearHistory(): Promise<void> {
    this.chatHistory = [];
  }

  public async getHistory(): Promise<ChatSession[]> {
    return this.chatHistory;
  }

  public async sendMessage(message: string, options?: any): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    const response = await this.generateChatCompletion([userMessage], options);

    // Update chat history
    const currentSession = this.chatHistory[this.chatHistory.length - 1] || {
      id: Date.now().toString(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    currentSession.messages.push(userMessage, response);
    currentSession.updatedAt = Date.now();

    if (!this.chatHistory.includes(currentSession)) {
      this.chatHistory.push(currentSession);
    }

    return response;
  }

  async generateChatCompletion(messages: ChatMessage[], options?: any): Promise<ChatMessage> {
    const result = await this.chat(messages, options);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: result,
      timestamp: Date.now()
    };
  }
}

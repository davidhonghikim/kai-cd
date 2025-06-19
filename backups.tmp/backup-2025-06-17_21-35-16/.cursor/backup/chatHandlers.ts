import { connectorManager } from "../connectors";
import { getChatSessions, saveChatSession, getCurrentSessionId, setCurrentSessionId, clearChatSessions, getServices } from '../utils/storage';
import type { ChatMessage, RequestHandler, ChatConnector, LLMModel, ImageModel, ImageGenConnector } from "../../config/types";

// Constants
const CHAT_HISTORY_LIMIT = 100; // Maximum number of messages to keep in history

interface ChatRequest {
  serviceId: string;
  messages: ChatMessage[];
  model?: string;
  options?: Record<string, unknown>;
  sessionId?: string;
}

/**
 * Send a chat message and handle the conversation history (session-based)
 */
export const sendMessage: RequestHandler<ChatRequest, ChatMessage[]> = async ({
  serviceId,
  messages,
  model,
  options = {},
  sessionId,
}: ChatRequest) => {
  if (!serviceId || !messages?.length) {
    throw new Error("Invalid request: serviceId and messages are required");
  }

  const services: any[] = await getServices();
  const service = services.find((s: any) => s.id === serviceId);

  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  try {
    const connector = (await connectorManager.getConnector(service)) as ChatConnector | null;
    if (!connector || typeof connector.chat !== 'function') {
      throw new Error(`Connector for service ${serviceId} does not support chat`);
    }

    // Session logic
    let sessions = await getChatSessions(serviceId);
    let sid: string | undefined = sessionId || undefined;
    if (!sid) {
      sid = (await getCurrentSessionId(serviceId)) || undefined;
      if (!sid && sessions.length > 0) sid = sessions[sessions.length - 1].id;
    }
    if (!sid) {
      // Create new session if none exists
      sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessions.push({ id: sid, createdAt: Date.now(), messages: [] });
      await setCurrentSessionId(serviceId, sid);
    }
    let session = sessions.find(s => s.id === sid);
    if (!session) {
      session = { id: sid, createdAt: Date.now(), messages: [] };
      sessions.push(session);
    }

    const userMessage = messages[messages.length - 1];
    const updatedHistory: ChatMessage[] = [...session.messages, userMessage];
    if (updatedHistory.length > 100) {
      updatedHistory.splice(0, updatedHistory.length - 100);
    }
    const response = await connector.chat(updatedHistory, model, options);
    const finalHistory = [...updatedHistory, response];
    session.messages = finalHistory;
    await saveChatSession(serviceId, session);
    await setCurrentSessionId(serviceId, session.id);
    return finalHistory;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to send message: ${errorMessage}`);
  }
};

/**
 * Clear chat history for a service (all sessions)
 */
export const clearChatHistory: RequestHandler<{ serviceId: string }, void> = async ({ serviceId }) => {
  if (!serviceId) {
    throw new Error("serviceId is required");
  }
  try {
    await clearChatSessions(serviceId);
  } catch (error) {
    console.error("Error clearing chat history:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clear chat history: ${errorMessage}`);
  }
};

/**
 * Get available models for a service
 */
export const getModels: RequestHandler<{ serviceId: string }, (LLMModel | ImageModel)[]> = async ({ serviceId }) => {
  if (!serviceId) {
    throw new Error("Invalid request: serviceId is required");
  }

  const services = await getServices();
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  try {
    const connector = await connectorManager.getConnector(service);
    if (!connector) {
      throw new Error(`Connector for service ${serviceId} could not be created`);
    }

    if (typeof (connector as any).getModels === 'function') {
      return (connector as ChatConnector | ImageGenConnector).getModels();
    }

    return [];
  } catch (error) {
    console.error(`Error getting models for service ${serviceId}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get models: ${errorMessage}`);
  }
};

/**
 * Get chat sessions for a service
 */
export const getChatHistory: RequestHandler<{ serviceId: string }, any[]> = async ({ serviceId }) => {
  if (!serviceId) {
    throw new Error("serviceId is required");
  }
  try {
    return await getChatSessions(serviceId);
  } catch (error) {
    console.error("Error getting chat history:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get chat history: ${errorMessage}`);
  }
};

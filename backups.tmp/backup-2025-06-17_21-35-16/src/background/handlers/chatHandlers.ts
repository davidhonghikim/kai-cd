/* global console */
import { RequestHandler } from './types';
import { getStoredServices } from '../utils/storage';
import { serviceFactory } from '@/services/ServiceFactory';
import type { Service, ChatSession, LLMModel, ChatConnector } from '@/types';

function isChatConnector(connector: any): connector is ChatConnector {
  return typeof connector?.sendMessage === 'function' && 
         typeof connector?.getModels === 'function' &&
         typeof connector?.clearHistory === 'function' &&
         typeof connector?.getHistory === 'function';
}

async function getService(serviceId: string): Promise<Service | undefined> {
  const services = await getStoredServices();
  return services.find(s => s.id === serviceId);
}

async function getConnector(service: Service): Promise<ChatConnector> {
  const connector = await serviceFactory.getConnector(service);
  if (!connector || !isChatConnector(connector)) {
    throw new Error(`No chat connector found for service ${service.id}`);
  }
  return connector;
}

/**
 * Send a chat message and handle the conversation history (session-based)
 */
export const sendMessage: RequestHandler<{ message: string; serviceId: string }, { success: boolean; message?: string; error?: string }> = async (payload, _sender, sendResponse) => {
  try {
    const { message, serviceId } = payload;
    const service = await getService(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const connector = await getConnector(service);
    const response = await connector.sendMessage(message);

    // Convert ChatMessage to string for response
    const messageContent = typeof response === 'string' ? response : response.content;
    
    sendResponse({ success: true, message: messageContent });
  } catch (error) {
    console.error('Error sending message:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Clear chat history for a service (all sessions)
 */
export const clearChatHistory: RequestHandler<{ serviceId: string }, void> = async ({ serviceId }, _sender, sendResponse) => {
  try {
    const service = await getService(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const connector = await getConnector(service);
    await connector.clearHistory();
    sendResponse();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    sendResponse();
  }
};

/**
 * Get available models for a service
 */
export const getModels: RequestHandler<{ serviceId: string }, LLMModel[]> = async ({ serviceId }, _sender, sendResponse) => {
  try {
    const service = await getService(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const connector = await getConnector(service);
    const models = await connector.getModels();
    sendResponse(models);
  } catch (error) {
    console.error('Error getting models:', error);
    sendResponse([]);
  }
};

/**
 * Get chat sessions for a service
 */
export const getChatHistory: RequestHandler<{ serviceId: string }, ChatSession[]> = async ({ serviceId }, _sender, sendResponse) => {
  try {
    const service = await getService(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const connector = await getConnector(service);
    const history = await connector.getHistory();
    sendResponse(history);
  } catch (error) {
    console.error('Error getting chat history:', error);
    sendResponse([]);
  }
};

export const chatHandlers = {
  sendMessage,
  clearChatHistory,
  getModels,
  getChatHistory
};

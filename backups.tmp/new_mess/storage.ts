import { storageManager } from "../../storage/storageManager";
import type { Service, ChatMessage, ImageArtifact } from "../../config/types";
import { ChatSession } from '../../types/chat';

// Service Management
export const getServices = async (): Promise<Service[]> => {
  const services = await storageManager.get<Service[]>('services', []);
  return services;
};

export const saveService = async (service: Service): Promise<void> => {
  const services = await storageManager.get<Service[]>('services', []);
  const index = services.findIndex(s => s.id === service.id);
  if (index >= 0) {
    services[index] = service;
  } else {
    services.push(service);
  }
  await storageManager.set('services', services);
};

export const deleteService = async (serviceId: string): Promise<void> => {
  const services = await storageManager.get<Service[]>('services', []);
  const filteredServices = services.filter(s => s.id !== serviceId);
  await storageManager.set('services', filteredServices);
};

// Chat History (Sessions)
interface ChatSession {
  id: string;
  createdAt: number;
  messages: ChatMessage[];
}

// Structure: { [serviceId]: ChatSession[] }

export const getChatSessions = async (serviceId: string): Promise<ChatSession[]> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions', {});
  return all[serviceId] || [];
};

export const saveChatSession = async (session: ChatSession): Promise<void> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions', {});
  const sessions = all[session.serviceId] || [];
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  all[session.serviceId] = sessions;
  await storageManager.set('chatSessions', all);
};

export const deleteChatSession = async (serviceId: string, sessionId: string): Promise<void> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions', {});
  const sessions = all[serviceId] || [];
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  all[serviceId] = filteredSessions;
  await storageManager.set('chatSessions', all);
};

export const getCurrentChatSessionId = async (serviceId: string): Promise<string | null> => {
  const ids = await storageManager.get<Record<string, string>>('currentChatSessionIds', {});
  return ids[serviceId] || null;
};

export const setCurrentChatSessionId = async (serviceId: string, sessionId: string): Promise<void> => {
  const ids = await storageManager.get<Record<string, string>>('currentChatSessionIds', {});
  ids[serviceId] = sessionId;
  await storageManager.set('currentChatSessionIds', ids);
};

// Image Artifacts
export const getImageArtifacts = async (): Promise<ImageArtifact[]> => {
  const artifacts = await storageManager.get<ImageArtifact[]>('imageArtifacts', []);
  return artifacts;
};

export const saveImageArtifact = async (artifact: ImageArtifact): Promise<void> => {
  const artifacts = await storageManager.get<ImageArtifact[]>('imageArtifacts', []);
  artifacts.push(artifact);
  await storageManager.set('imageArtifacts', artifacts);
};

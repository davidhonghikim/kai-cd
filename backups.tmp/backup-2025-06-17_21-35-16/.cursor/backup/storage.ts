import { storageManager } from "../../storage/storageManager";
import type { Service, ChatMessage, ImageArtifact } from "../../config/types";

// Service Management
export const getServices = async (): Promise<Service[]> => {
  const services = await storageManager.get<Service[]>('services');
  return Array.isArray(services) ? services : [];
};

export const saveServices = async (services: Service[]): Promise<void> => {
  await storageManager.set('services', services);
};

// Chat History (Sessions)
interface ChatSession {
  id: string;
  createdAt: number;
  messages: ChatMessage[];
}

// Structure: { [serviceId]: ChatSession[] }

export const getChatSessions = async (serviceId: string): Promise<ChatSession[]> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions');
  if (!all || typeof all !== 'object') return [];
  return Array.isArray(all[serviceId]) ? all[serviceId] : [];
};

export const saveChatSession = async (serviceId: string, session: ChatSession): Promise<void> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions') || {};
  const sessions = Array.isArray(all[serviceId]) ? all[serviceId] : [];
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  all[serviceId] = sessions;
  await storageManager.set('chatSessions', all);
};

export const clearChatSessions = async (serviceId: string): Promise<void> => {
  const all = await storageManager.get<Record<string, ChatSession[]>>('chatSessions') || {};
  all[serviceId] = [];
  await storageManager.set('chatSessions', all);
};

export const getCurrentSessionId = async (serviceId: string): Promise<string | null> => {
  const ids = await storageManager.get<Record<string, string>>('currentChatSessionIds') || {};
  return ids[serviceId] || null;
};

export const setCurrentSessionId = async (serviceId: string, sessionId: string): Promise<void> => {
  const ids = await storageManager.get<Record<string, string>>('currentChatSessionIds') || {};
  ids[serviceId] = sessionId;
  await storageManager.set('currentChatSessionIds', ids);
};

// Image Artifacts
export const getImageArtifacts = async (): Promise<ImageArtifact[]> => {
  const artifacts = await storageManager.get<ImageArtifact[]>('imageArtifacts');
  return Array.isArray(artifacts) ? artifacts : [];
};

export const addImageArtifact = async (newArtifact: ImageArtifact): Promise<void> => {
  if (!newArtifact || typeof newArtifact !== 'object') {
    throw new Error('Invalid artifact');
  }
  const artifacts = await getImageArtifacts();
  const updatedArtifacts = [...artifacts, newArtifact];
  await storageManager.set('imageArtifacts', updatedArtifacts);
};

export const deleteImageArtifact = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('ID is required');
  }
  const artifacts = await getImageArtifacts();
  const filtered = artifacts.filter((a) => a.id !== id);
  await storageManager.set('imageArtifacts', filtered);
};

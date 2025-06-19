import { storageManager } from "../../storage/storageManager";
import type { Service, ChatSession, ImageArtifact } from "@/types";
import { SERVERS_KEY } from "../../utils/settingsIO";

// Service Management
export const getStoredServices = async (): Promise<Service[]> => {
  const services = await storageManager.get<Service[]>(SERVERS_KEY);
  return Array.isArray(services) ? services : [];
};

export const saveServices = async (services: Service[]): Promise<void> => {
  await storageManager.set(SERVERS_KEY, services);
};

// Chat History (Sessions)
// Structure: { [serviceId]: ChatSession[] }

export const getChatSessions = async (serviceId: string): Promise<ChatSession[]> => {
  const sessions = await storageManager.get<ChatSession[]>(`chat_sessions_${serviceId}`, []);
  return Array.isArray(sessions) ? sessions : [];
};

export const saveChatSession = async (serviceId: string, session: ChatSession): Promise<void> => {
  const sessions = await getChatSessions(serviceId);
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  await storageManager.set(`chat_sessions_${serviceId}`, sessions);
};

export const getCurrentSessionId = async (serviceId: string): Promise<string | null> => {
  const result = await storageManager.get<string | null>(`current_session_${serviceId}`);
  return result ?? null;
};

export const setCurrentSessionId = async (serviceId: string, sessionId: string): Promise<void> => {
  await storageManager.set(`current_session_${serviceId}`, sessionId);
};

export const clearChatSessions = async (serviceId: string): Promise<void> => {
  await storageManager.set(`chat_sessions_${serviceId}`, []);
  await storageManager.set(`current_session_${serviceId}`, null);
};

// Image Artifacts
export const getImageArtifacts = async (): Promise<ImageArtifact[]> => {
  const artifacts = await storageManager.get<ImageArtifact[]>('imageArtifacts');
  return Array.isArray(artifacts) ? artifacts : [];
};

export const addImageArtifact = async (newArtifact: ImageArtifact): Promise<void> => {
  const artifacts = await getImageArtifacts();
  artifacts.push(newArtifact);
  await storageManager.set('imageArtifacts', artifacts);
};

export const deleteImageArtifact = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('ID is required');
  }
  const artifacts = await getImageArtifacts();
  const filtered = artifacts.filter((a) => a.id !== id);
  await storageManager.set('imageArtifacts', filtered);
};

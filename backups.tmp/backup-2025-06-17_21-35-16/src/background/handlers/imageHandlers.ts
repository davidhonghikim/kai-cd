/* global console */
import { connectorManager } from "../connectors";
import {
  getStoredServices,
  getImageArtifacts as getArtifactsFromStorage,
  deleteImageArtifact as deleteArtifactFromStorage,
} from "../utils/storage";
import type {
  RequestHandler,
  ImageArtifact,
  ImageGenConnector,
  ImageGenOptions,
  ImageModel,
  Service,
} from '@/types';

interface GenerateImageRequest {
  serviceId: string;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  options?: ImageGenOptions;
}

function isImageGenConnector(connector: unknown): connector is ImageGenConnector {
  return typeof (connector as ImageGenConnector)?.generateImage === 'function' && 
         typeof (connector as ImageGenConnector)?.getImageModels === 'function';
}

function hasGetLoras(connector: unknown): connector is { getLoras: () => Promise<ImageModel[]> } {
  return typeof (connector as { getLoras?: () => Promise<ImageModel[]> })?.getLoras === 'function';
}

function hasGetEmbeddings(connector: unknown): connector is { getEmbeddings: () => Promise<ImageModel[]> } {
  return typeof (connector as { getEmbeddings?: () => Promise<ImageModel[]> })?.getEmbeddings === 'function';
}

/**
 * Generate an image using a service
 */
export const generateImage: RequestHandler<GenerateImageRequest, { success: boolean; imageUrl?: string; error?: string }> = async ({ prompt, serviceId, options }, _, sendResponse) => {
  try {
    const services: Service[] = await getStoredServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Service with ID ${serviceId} not found`);
    const connector = await connectorManager.getConnector(service);
    if (!connector || !isImageGenConnector(connector)) throw new Error(`No image connector found for service ${serviceId}`);
    const response = await connector.generateImage(prompt, options);
    sendResponse({ success: true, imageUrl: response.url });
  } catch (error) {
    console.error('Error generating image:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to generate image' });
  }
};

/**
 * Stop an ongoing image generation
 */
export const stopGeneration: RequestHandler<{ serviceId: string }, { success: boolean; message: string }> = async ({ serviceId }, _, sendResponse) => {
  console.log(`--- Stopping Generation for ${serviceId} ---`);
  sendResponse({ success: true, message: "Image generation stopped." });
};

export const getImageArtifacts: RequestHandler<void, ImageArtifact[]> = async (_, __, sendResponse) => {
  try {
    const artifacts = await getArtifactsFromStorage();
    sendResponse(artifacts);
  } catch (error) {
    console.error("Error fetching image artifacts:", error);
    sendResponse([]);
  }
};

export const deleteImageArtifact: RequestHandler<{ id: string }, void> = async ({ id }, _, sendResponse) => {
  if (!id) {
    sendResponse();
    return;
  }
  try {
    await deleteArtifactFromStorage(id);
    sendResponse();
  } catch (error) {
    console.error("Error deleting image artifact:", error);
    sendResponse();
  }
};

/**
 * Get available LoRAs for a service
 */
export const getLoras: RequestHandler<{ serviceId: string }, ImageModel[]> = async ({ serviceId }, _, sendResponse) => {
  try {
    const services = await getStoredServices();
    const service = services.find((s: Service) => s.id === serviceId);
    if (!service) throw new Error(`Service not found: ${serviceId}`);
    const connector = await connectorManager.getConnector(service);
    if (connector && hasGetLoras(connector)) {
      const loras = await connector.getLoras();
      sendResponse(loras);
    } else {
      sendResponse([]);
    }
  } catch (error) {
    console.error(`Error getting LoRAs for service ${serviceId}:`, error);
    sendResponse([]);
  }
};

/**
 * Get available embeddings for a service
 */
export const getEmbeddings: RequestHandler<{ serviceId: string }, ImageModel[]> = async ({ serviceId }, _, sendResponse) => {
  try {
    const services = await getStoredServices();
    const service = services.find((s: Service) => s.id === serviceId);
    if (!service) throw new Error(`Service not found: ${serviceId}`);
    const connector = await connectorManager.getConnector(service);
    if (connector && hasGetEmbeddings(connector)) {
      const embeddings = await connector.getEmbeddings();
      sendResponse(embeddings);
    } else {
      sendResponse([]);
    }
  } catch (error) {
    console.error(`Error getting embeddings for service ${serviceId}:`, error);
    sendResponse([]);
  }
};

/**
 * Retrieves all image artifacts from storage.
 */
export const getArtifacts: RequestHandler<null, ImageArtifact[]> = async (_, __, sendResponse) => {
  try {
    const artifacts = await getArtifactsFromStorage();
    sendResponse(artifacts);
  } catch (error) {
    sendResponse([]);
  }
};

export const getImageModels: RequestHandler<{ serviceId: string }, { success: boolean; models?: ImageModel[]; error?: string }> = async ({ serviceId }, _, sendResponse) => {
  try {
    const services: Service[] = await getStoredServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Service with ID ${serviceId} not found`);
    const connector = await connectorManager.getConnector(service);
    if (!connector || !isImageGenConnector(connector)) throw new Error(`No image connector found for service ${serviceId}`);
    const models = await (connector as any).getImageModels();
    sendResponse({ success: true, models });
  } catch (error) {
    console.error('Error getting image models:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to get image models' });
  }
};

export const imageHandlers = {
  generateImage,
  getImageModels,
  stopGeneration,
  getImageArtifacts,
  deleteImageArtifact,
  getLoras,
  getEmbeddings,
  getArtifacts
};

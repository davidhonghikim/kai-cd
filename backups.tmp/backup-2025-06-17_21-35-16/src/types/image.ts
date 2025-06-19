export interface ImageGenOptions {
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  negativePrompt?: string;
  model?: string;
  [key: string]: any;
}

export interface ImageArtifact {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  timestamp: number;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  [key: string]: any;
}

export interface ImageGenConnector {
  generateImage(prompt: string, options?: ImageGenOptions): Promise<Partial<ImageArtifact>>;
  getCategory(): string;
  updateService(service: any): void;
} 
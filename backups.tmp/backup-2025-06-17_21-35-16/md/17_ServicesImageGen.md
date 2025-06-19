# 17_ServicesImageGen.md
# ChatDemon Service Integration Guide - Image Generation

**Title:** Service Integration Guide - Image Generation

**Overview:** This guide details the integration of various Image Generation services into the ChatDemon extension.

**Goal:** To allow users to generate images directly from the ChatDemon UI.

**Supported Services:**

*   A1111 (Stable Diffusion WebUI): Connects to a running A1111 instance.
*   ComfyUI: Connects to a running ComfyUI instance.
*   InvokeAI: Connects to a running InvokeAI instance.
*   Fooocus: Connects to a running Fooocus instance.

**Connector Implementation:**

```typescript
interface ImageGenConnector {
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getModels(): Promise<ImageGenModel[]>; //  List of models
    generateImage(prompt: string, model: ImageGenModel, options?: any): Promise<string>;  // Returns image URL or base64 data
    streamGeneration(prompt: string, model: ImageGenModel, options?: any): AsyncGenerator<GenerationProgress>;
    cancelGeneration(): void; // Cancels a generation stream
    getSettings(): Promise<ImageGenSettings>; //  Returns settings
    updateSettings(settings: ImageGenSettings): Promise<void>; //  Updates settings
    getErrorMessage(): string | null;
}

interface ImageGenModel {
    id: string;
    name: string;
}

interface ImageGenSettings {
    url: string;  //Base URL (e.g., http://localhost:7860 for A1111)
    apiKey?: string; // API Key (if required)
    model?: string;  // Default Model
    sampler?: string; //  Sampler
    steps?: number; //  Steps
    cfgScale?: number; //  CFG Scale
    width?: number;   // Width
    height?: number;  // Height
}

interface GenerationProgress {
  step: number;
  totalSteps: number;
  previewImage?: string; // Base64 encoded image
}

Implementation Details:
A1111 Connector:
Connects to the A1111 API.
Allows specifying prompts, models, samplers, steps, and other A1111 settings.
Retrieves the generated image URL or base64 data.
ComfyUI Connector:
Connects to the ComfyUI API.
Allows specifying workflows and input parameters.
Triggers the workflow and retrieves the generated image.
InvokeAI Connector:
Connects to the InvokeAI API.
Allows specifying prompts, models, and other generation parameters.
Retrieves the generated image.
Fooocus Connector:
Connects to the Fooocus API.
Allows specifying prompts, parameters, and other generation parameters.
Retrieves the generated image
Default Configurations:
A1111:
ID: a1111
Name: Stable Diffusion WebUI (A1111)
URL: http://localhost:7860 (default)
API Key: None
Active: false
Endpoints (Example): Models: /sdapi/v1/sd-models, Generate: /sdapi/v1/txt2img
ComfyUI:
ID: comfyui
Name: ComfyUI
URL: http://localhost:8188 (default)
API Key: None
Active: false
Endpoints (Example): History: /history, Prompt: /prompt, Models: /object_info (Adapt to ComfyUI API)
Workflow for Generating Images (for Coding Agent):
The user enters a prompt in the ChatDemon side panel (or retrieves it from the LLM response).
The UI sends the prompt, along with the selected Image Generation service ID, model ID, and any other specified options, to the background script.
The background script retrieves the appropriate Image Generation connector.
The connector sends the prompt and options to the service's API (or communicates with the service's UI via iframes).
The service generates the image and returns the URL or base64 data.
The connector receives the image data and returns it to the background script.
The background script updates the UI with the generated image.
Error Handling:
Implement robust error handling to catch connection errors, API errors, and image generation failures.
Security Considerations:
Validate all input to prevent security vulnerabilities.
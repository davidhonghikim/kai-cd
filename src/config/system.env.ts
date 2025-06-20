/**
 * System-wide Default Configuration
 *
 * This file contains the default settings for the application.
 * Do not modify this file directly for local development.
 * Instead, create a `user.env.ts` file to override these settings.
 */
export const systemConfig = {
	// --- Networking ---
	networking: {
		localIp: 'localhost',
		remoteIp: '', // Needs to be configured by the user
		defaultTimeoutMs: 15000
	},

	// --- Service Defaults ---
	services: {
		defaultOllamaModel: 'gemma3:1b',
		defaultOpenAiModel: 'gpt-4o',
		defaultOpenWebUIModel: 'gemma:latest',
		defaultComfyUIModel: 'v1-5-pruned-emaonly.safetensors',
		defaultA1111Model: '',
		defaultA1111Refiner: '',
		defaultAnthropicModel: 'claude-3-haiku-20240307',
		defaultHuggingFaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
		defaultHuggingFaceImageModel: 'stabilityai/stable-diffusion-2-1'
	},

	// --- UI/UX Settings ---
	ui: {
		defaultTheme: 'dark',
		showCategoryHeaders: true
	},

	// --- Developer & Debugging ---
	developer: {
		logLevel: 'info',
        loadDefaultServices: true,
		featureFlags: {
			enableGraphExecutionUi: false
		}
	},

    // --- Logging ---
    logging: {
        enabled: true, // Master switch for all logging
        level: 'info' // Default log level: 'debug', 'info', 'warn', 'error', 'silent'
    }
};

export type SystemConfig = typeof systemConfig; 
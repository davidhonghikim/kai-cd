/**
 * Centralized Application Configuration
 *
 * This file contains all environment and user-configurable settings for the application.
 * Modify the values here to customize the application's behavior.
 */
export const config = {
	// --- Networking ---
	// IP addresses for local and remote services.
	networking: {
		localIp: '127.0.0.1', // Your local machine's IP
		remoteIp: '192.168.1.159', // A remote server's IP
		defaultTimeoutMs: 15000 // API request timeout
	},

	// --- Service Defaults ---
	// Default models and settings for AI services.
	services: {
		defaultOllamaModel: 'llama3',
		defaultOpenAiModel: 'gpt-4o'
	},

	// --- UI/UX Settings ---
	// Customize the look and feel of the application.
	ui: {
		defaultTheme: 'dark', // 'light', 'dark', or 'system'
		showCategoryHeaders: true // Show/hide category headers in the service list
	},

	// --- Developer & Debugging ---
	// Settings for development, debugging, and experimental features.
	developer: {
		logLevel: 'info', // 'debug', 'info', 'warn', 'error', or 'silent'

		// Experimental feature flags
		featureFlags: {
			enableGraphExecutionUi: false // Enables the graph UI for ComfyUI
		}
	}
}; 
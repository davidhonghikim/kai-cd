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
		localIp: 'localhost', // Use localhost for local services
		remoteIp: '', // A remote server's IP - should be configured by the user
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
        loadDefaultServices: true, // Load default services if the store is empty

		// Experimental feature flags
		featureFlags: {
			enableGraphExecutionUi: false // Enables the graph UI for ComfyUI
		}
	}
}; 
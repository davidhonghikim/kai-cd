import type { NewService } from '../types';
// Note: This file is currently not used but kept for future reference

export const DEFAULT_SERVICES: NewService[] = [
	// --- Local Services ---
	{
		name: 'Ollama (Local)',
		serviceDefinitionId: 'ollama',
		ipType: 'local',
	},
	{
		name: 'Open WebUI (Local)',
		serviceDefinitionId: 'open-webui',
		ipType: 'local',
	},
	{
		name: 'A1111 (Local)',
		serviceDefinitionId: 'a1111',
		ipType: 'local',
	},
	{
		name: 'ComfyUI (Local)',
		serviceDefinitionId: 'comfyui',
		ipType: 'local',
	},
	// --- Remote Services ---
	{
		name: 'Ollama (Remote)',
		serviceDefinitionId: 'ollama',
		ipType: 'remote',
	},
	{
		name: 'Open WebUI (Remote)',
		serviceDefinitionId: 'open-webui',
		ipType: 'remote',
	},
	{
		name: 'A1111 (Remote)',
		serviceDefinitionId: 'a1111',
		ipType: 'remote',
	},
	{
		name: 'ComfyUI (Remote)',
		serviceDefinitionId: 'comfyui',
		ipType: 'remote',
	},
	// --- Cloud Services ---
	{
		name: 'OpenAI API',
		serviceDefinitionId: 'openai-compatible',
		ipType: 'cloud',
		customUrl: 'https://api.openai.com/v1',
	}
]; 
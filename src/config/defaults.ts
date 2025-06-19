import type { Service } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { a1111Definition } from '../connectors/definitions/a1111';
import { ollamaDefinition } from '../connectors/definitions/ollama';
import { openWebUIDefinition } from '../connectors/definitions/open-webui';
import { comfyuiDefinition } from '../connectors/definitions/comfyui';
import { openAICompatibleDefinition } from '../connectors/definitions/openai-compatible';
import { config } from './env';

export const DEFAULT_SERVICES: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isConnected' | 'status' | 'enabled'>[] = [
	// --- Local Services ---
	{
		...ollamaDefinition,
		name: 'Ollama (Local)',
		url: `http://${config.networking.localIp}:11434`,
	},
	{
		...openWebUIDefinition,
		name: 'Open WebUI (Local)',
		url: `http://${config.networking.localIp}:8080`,
	},
	{
		...a1111Definition,
		name: 'A1111 (Local)',
		url: `http://${config.networking.localIp}:7860`,
	},
	{
		...comfyuiDefinition,
		name: 'ComfyUI (Local)',
		url: `http://${config.networking.localIp}:8188`,
	},
	// --- Remote Services ---
	{
		...ollamaDefinition,
		name: 'Ollama (Remote)',
		url: `http://${config.networking.remoteIp}:11434`,
	},
	{
		...openWebUIDefinition,
		name: 'Open WebUI (Remote)',
		url: `http://${config.networking.remoteIp}:3000`,
	},
	{
		...a1111Definition,
		name: 'A1111 (Remote)',
		url: `http://${config.networking.remoteIp}:7860`,
	},
	{
		...comfyuiDefinition,
		name: 'ComfyUI (Remote)',
		url: `http://${config.networking.remoteIp}:8188`,
	},
	// --- Cloud Services ---
	{
		...openAICompatibleDefinition,
		name: 'OpenAI API',
		url: 'https://api.openai.com',
	}
]; 
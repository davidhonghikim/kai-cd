import type { Service } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { a1111Definition } from '../connectors/definitions/a1111';
import { ollamaDefinition } from '../connectors/definitions/ollama';
import OpenWebUIDefinition from '../connectors/definitions/open-webui';
import { comfyuiDefinition } from '../connectors/definitions/comfyui';
import { openAICompatibleDefinition } from '../connectors/definitions/openai-compatible';
import { config } from './env';

export const DEFAULT_SERVICES: Service[] = [
	// --- Local Services ---
	{
		id: uuidv4(),
		name: 'Ollama (Local)',
		type: 'ollama',
		url: `http://${config.networking.localIp}:11434`,
		enabled: true,
		status: 'unknown',
		category: ollamaDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: ollamaDefinition.authentication,
		capabilities: ollamaDefinition.capabilities
	},
	{
		id: uuidv4(),
		name: 'Open WebUI (Local)',
		type: 'open-webui',
		url: `http://${config.networking.localIp}:8080`,
		enabled: true,
		status: 'unknown',
		category: OpenWebUIDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: OpenWebUIDefinition.authentication,
		capabilities: OpenWebUIDefinition.capabilities
	},
	{
		id: uuidv4(),
		name: 'A1111 (Local)',
		type: 'a1111',
		url: `http://${config.networking.localIp}:7860`,
		enabled: true,
		status: 'unknown',
		category: a1111Definition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: a1111Definition.authentication,
		capabilities: a1111Definition.capabilities
	},
	{
		id: uuidv4(),
		name: 'ComfyUI (Local)',
		type: 'comfyui',
		url: `http://${config.networking.localIp}:8188`,
		enabled: true,
		status: 'unknown',
		category: comfyuiDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: comfyuiDefinition.authentication,
		capabilities: comfyuiDefinition.capabilities
	},
	// --- Remote Services ---
	{
		id: uuidv4(),
		name: 'Ollama (Remote)',
		type: 'ollama',
		url: `http://${config.networking.remoteIp}:11434`,
		enabled: true,
		status: 'unknown',
		category: ollamaDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: ollamaDefinition.authentication,
		capabilities: ollamaDefinition.capabilities
	},
	{
		id: uuidv4(),
		name: 'Open WebUI (Remote)',
		type: 'open-webui',
		url: `http://${config.networking.remoteIp}:3000`,
		enabled: true,
		status: 'unknown',
		category: OpenWebUIDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: OpenWebUIDefinition.authentication,
		capabilities: OpenWebUIDefinition.capabilities
	},
	{
		id: uuidv4(),
		name: 'A1111 (Remote)',
		type: 'a1111',
		url: `http://${config.networking.remoteIp}:7860`,
		enabled: true,
		status: 'unknown',
		category: a1111Definition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: a1111Definition.authentication,
		capabilities: a1111Definition.capabilities
	},
	{
		id: uuidv4(),
		name: 'ComfyUI (Remote)',
		type: 'comfyui',
		url: `http://${config.networking.remoteIp}:8188`,
		enabled: true,
		status: 'unknown',
		category: comfyuiDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: comfyuiDefinition.authentication,
		capabilities: comfyuiDefinition.capabilities
	},
	// --- Cloud Services ---
	{
		id: uuidv4(),
		name: 'OpenAI API',
		type: 'openai-compatible',
		url: 'https://api.openai.com',
		enabled: true,
		status: 'unknown',
		category: openAICompatibleDefinition.category,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		isActive: false,
		isConnected: false,
		authentication: openAICompatibleDefinition.authentication,
		capabilities: openAICompatibleDefinition.capabilities
	}
]; 
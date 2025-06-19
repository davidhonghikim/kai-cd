import type { Service } from '../types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_IP = '192.168.1.159';

export const DEFAULT_SERVICES: Service[] = [
  {
    id: uuidv4(),
    name: 'Ollama (Local)',
    type: 'ollama',
    url: `http://${LOCAL_IP}:11434`,
    isConnected: false,
  },
  {
    id: uuidv4(),
    name: 'Open WebUI (Local)',
    type: 'open-webui',
    url: `http://${LOCAL_IP}:8080`,
    isConnected: false,
  },
  {
    id: uuidv4(),
    name: 'A1111 (Local)',
    type: 'a1111',
    url: `http://${LOCAL_IP}:7860`,
    isConnected: false,
  },
  {
    id: uuidv4(),
    name: 'OpenAI API',
    type: 'openai-compatible',
    url: 'https://api.openai.com',
    isConnected: false,
  }
]; 
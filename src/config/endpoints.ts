import type { ServiceEndpoints } from '../types';

export const SERVICE_ENDPOINTS: ServiceEndpoints = {
  'ollama': {
    getModels: { path: '/api/tags', method: 'GET' },
    generate: { path: '/api/generate', method: 'POST' },
    chat: { path: '/api/chat', method: 'POST' },
  },
  'open-webui': {
    getModels: { path: '/api/v1/models', method: 'GET' },
    chat: { path: '/api/v1/chat/completions', method: 'POST' },
  },
  'a1111': {
    getModels: { path: '/sdapi/v1/sd-models', method: 'GET' },
    getSamplers: { path: '/sdapi/v1/samplers', method: 'GET' },
    txt2img: { path: '/sdapi/v1/txt2img', method: 'POST' },
    img2img: { path: '/sdapi/v1/img2img', method: 'POST' },
  },
  'comfy-ui': {
    // ComfyUI is websocket based, API is less direct
  },
  'llama-cpp': {
    // Similar to Ollama but might have different paths
  },
  'vllm': {
      // OpenAI compatible
  },
  'llm-studio': {
      // Local server, often OpenAI compatible
  },
  'openai-compatible': {
    getModels: { path: '/v1/models', method: 'GET' },
    chat: { path: '/v1/chat/completions', method: 'POST' },
  },
  'n8n': {
    getWorkflows: { path: '/api/v1/workflows', method: 'GET' },
    executeWorkflow: { path: '/webhook/{{workflowId}}', method: 'POST' },
  },
  'milvus': {},
  'qdrant': {},
  'chroma': {},
  'weaviate': {},
  'huginn': {},
  'node-red': {},
  'jellyfin': {},
  'tailscale': {},
}; 
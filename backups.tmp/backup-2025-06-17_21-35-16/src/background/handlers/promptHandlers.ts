import { storageManager } from '../../storage/storageManager';
import type { Prompt, RequestHandler } from '@/types';

/**
 * Get all prompts
 */
export const getPrompts: RequestHandler<null, Prompt[]> = async (_, __, sendResponse) => {
  const prompts = await storageManager.get<Prompt[]>('prompts', []);
  sendResponse(prompts);
};

/**
 * Save a new prompt
 */
export const savePrompt: RequestHandler<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, Prompt> = async (promptData, _, sendResponse) => {
  const prompts = await storageManager.get<Prompt[]>('prompts', []);
  const prompt = {
    id: `prompt_${Date.now()}`,
    name: promptData.name,
    content: promptData.content,
    category: promptData.category || 'general',
    tags: promptData.tags || []
  };
  const updatedPrompts = [...prompts, prompt];
  await storageManager.set('prompts', updatedPrompts);
  sendResponse(prompt);
};

/**
 * Delete a prompt
 */
export const deletePrompt: RequestHandler<{ promptId: string }, Prompt[]> = async ({ promptId }, _, sendResponse) => {
  const prompts = await storageManager.get<Prompt[]>('prompts', []);
  const updatedPrompts = prompts.filter((p) => p.id !== promptId);
  await storageManager.set('prompts', updatedPrompts);
  sendResponse(updatedPrompts);
};

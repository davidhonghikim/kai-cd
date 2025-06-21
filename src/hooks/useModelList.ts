import { useState, useEffect, useMemo } from 'react';
import type { LlmChatCapability, ImageGenerationCapability, SelectOption } from '../types';
import { apiClient } from '../utils/apiClient';
import { useServiceStore } from '../store/serviceStore';
import { logger } from '../utils/logger';

// A custom hook to fetch and manage the model list for a given service.
export const useModelList = (serviceId: string | null, activeView: 'chat' | 'image') => {
    const [models, setModels] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const service = useServiceStore(state => state.getServiceById(serviceId || ''));

    const capability = useMemo(() => {
        if (!service) return null;
        if (activeView === 'chat') {
            return service.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;
        }
        if (activeView === 'image') {
            return service.capabilities.find(c => c.capability === 'image_generation') as ImageGenerationCapability | undefined;
        }
        return null;
    }, [service, activeView]);

    useEffect(() => {
        if (!service || !capability) {
            setModels([]);
            return;
        }

        // Debounce: wait 300ms after last change
        const debounceId = setTimeout(() => {
            const fetchModels = async () => {
                setIsLoading(true);
                setError(null);
                
                try {
                    logger.debug('[useModelList] Starting fetchModels...');
                    logger.debug('[useModelList] Service:', service);
                    logger.debug('[useModelList] Capability:', capability);

                    const getModelsEndpoint = (capability as any)?.endpoints?.getModels;

                    logger.debug('[useModelList] getModelsEndpoint:', getModelsEndpoint);

                    if (!getModelsEndpoint) {
                        const staticModels = (capability as any)?.models?.map((m: string) => ({ value: m, label: m })) || [];
                        logger.debug('[useModelList] No dynamic endpoint. Using static models:', staticModels);
                        setModels(staticModels);
                        setIsLoading(false);
                        return;
                    }

                    const response = await apiClient.get(service.id, getModelsEndpoint.path);
                    logger.debug('[useModelList] API Response:', response);

                    let modelParam = null;
                    if ((capability as any)?.parameters) {
                        for (const key in (capability as any).parameters) {
                            const params = (capability as any).parameters[key];
                            if (Array.isArray(params)) {
                                modelParam = params.find((p: any) => p.optionsEndpoint === 'getModels');
                                if (modelParam) break;
                            }
                        }
                    }
                    logger.debug('[useModelList] Found modelParam:', modelParam);

                    const optionsPath = modelParam?.optionsPath || '';
                    const valueKey = modelParam?.optionsValueKey || 'id';
                    const labelKey = modelParam?.optionsLabelKey || 'name';
                    logger.debug('[useModelList] Mapping with keys:', { optionsPath, valueKey, labelKey });

                    let modelsData = response;
                    if (optionsPath) {
                        modelsData = optionsPath.split('.').reduce((o, i) => o?.[i], response) || [];
                    }
                    logger.debug('[useModelList] Extracted modelsData:', modelsData);
                    
                    if (!Array.isArray(modelsData)) {
                        logger.error('[useModelList] ERROR: modelsData is not an array!', modelsData);
                        throw new Error('Expected an array of models, but received a different type.');
                    }

                    const parsedModels: SelectOption[] = modelsData.map((m: any) => ({
                        value: m[valueKey],
                        label: m[labelKey],
                    })).filter((m: SelectOption) => m.value && m.label);
                    
                    logger.debug('[useModelList] Parsed models:', parsedModels);
                    setModels(parsedModels);

                } catch (err: any) {
                    logger.error(`[useModelList] FATAL ERROR in fetchModels for ${service?.name}:`, err);
                    setError(err.message || 'An unknown error occurred.');
                    setModels([]);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchModels();
        }, 300);

        return () => clearTimeout(debounceId);
    }, [service, capability]);

    return { models, isLoading, error };
}; 
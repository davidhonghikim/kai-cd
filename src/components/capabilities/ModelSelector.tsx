import React, { useEffect } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useViewStateStore } from '../../store/viewStateStore';
import { useModelList } from '../../hooks/useModelList';

const ModelSelector: React.FC = () => {
  const { activeServiceId, activeModel, setActiveModel } = useViewStateStore();
  const { models, isLoading, error } = useModelList(activeServiceId, 'chat');

  useEffect(() => {
    // When models load and there's no active model, or the active model is not in the list,
    // default to the first model in the list.
    if (models.length > 0 && (!activeModel || !models.some(m => m.value === activeModel))) {
        setActiveModel(models[0].value);
    }
  }, [models, activeModel, setActiveModel]);
  
  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading models...</div>;
  }
  
  if (error) {
    return <div className="text-sm text-red-500" title={error}>Error</div>;
  }

  if (models.length === 0) {
    return <div className="text-sm font-semibold">{activeModel || 'No models found'}</div>;
  }

  return (
    <div className="relative">
      <select
        value={activeModel || ''}
        onChange={(e) => setActiveModel(e.target.value)}
        className="appearance-none w-full bg-transparent font-semibold text-lg pr-8 focus:outline-none"
        disabled={models.length === 0}
      >
        {models.map(model => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
      <ChevronUpDownIcon className="h-5 w-5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default ModelSelector; 
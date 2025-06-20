import React, { useState, useEffect, useCallback } from 'react';
import { useServiceStore } from '../store/serviceStore';
import {
  TrashIcon,
  PencilIcon,
  WifiIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  CloudIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/solid';
import ServiceForm from './ServiceForm';
import ServiceEditor from './ServiceEditor';
import type { Service, LlmChatCapability } from '../types';
import { apiClient } from '../utils/apiClient';
import toast from 'react-hot-toast';
import StatusIndicator from './StatusIndicator';

// --- Placeholder Components ---
const PlaceholderManager: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-6 text-slate-400">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">{title}</h2>
        <p>This feature is coming soon.</p>
    </div>
);

const LlmModelDetails: React.FC<{ capability: LlmChatCapability, service: Service }> = ({ capability, service }) => {
    const [models, setModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getModelsEndpoint = capability.endpoints.getModels;
        if (!getModelsEndpoint) {
            setError('Service does not support listing models.');
            return;
        }

        const fetchModels = async () => {
            setIsLoadingModels(true);
            setError(null);
            try {
                const response = await apiClient.get(service.url, getModelsEndpoint.path, service.authentication);
                const modelsData = response.data || response;
                let parsedModels: string[] = [];
                if (Array.isArray(modelsData)) {
                    parsedModels = modelsData.map(m => m.id || m.name).filter(Boolean);
                } else if (modelsData && typeof modelsData === 'object' && 'models' in modelsData && Array.isArray(modelsData.models)) {
                    parsedModels = modelsData.models.map((m: any) => m.id || m.name).filter(Boolean);
                }
                setModels(parsedModels);
            } catch (_err) {
                setError('Failed to fetch models.');
                toast.error(`Failed to fetch models for ${service.name}.`);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, [capability, service]);

    return (
        <div className="mt-2">
            <h5 className="font-semibold text-slate-400">Models</h5>
            {isLoadingModels && <p className="text-sm text-slate-500">Loading models...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!isLoadingModels && !error && models.length > 0 && (
                <ul className="list-disc list-inside max-h-40 overflow-y-auto text-sm text-slate-300">
                    {models.map(m => <li key={m}>{m}</li>)}
                </ul>
            )}
            {!isLoadingModels && !error && models.length === 0 && (
                <p className="text-sm text-slate-500">No models found.</p>
            )}
        </div>
    );
};

// --- Service Details Sub-component ---
const ServiceDetails: React.FC<{ service: Service }> = ({ service }) => {
    const llmCapability = service.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;
    
    return (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
            <h4 className="font-semibold mb-2 text-slate-200">Service Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold text-slate-400">Category:</span> {service.category}</div>
                <div><span className="font-semibold text-slate-400">Enabled:</span> {service.enabled ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold text-slate-400">Type:</span> <span className="capitalize">{service.type.replace(/_/g, ' ')}</span></div>
            </div>
            {llmCapability && <LlmModelDetails capability={llmCapability} service={service} />}
        </div>
    );
};


// --- Service Manager Core Component ---
const ServiceManagerCore: React.FC = () => {
  const { services, removeService, updateService, checkServiceStatus, _hasHydrated } = useServiceStore();
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated) {
      // Check the status of all active services once the store is hydrated
      const activeServices = services.filter(s => !s.archived);
      activeServices.forEach(service => {
        // Only check status if it's unknown, to avoid spamming checks on re-renders
        if (service.status === 'unknown') {
            checkServiceStatus(service);
        }
      });
    }
  }, [_hasHydrated, services, checkServiceStatus]); // Re-run if hydration completes or services change

  const handleAddClick = () => {
    setIsAddingService(true);
    setEditingServiceId(null);
    setExpandedServiceId(null);
  };

  const handleEditClick = (service: Service) => {
    setEditingServiceId(service.id);
    setExpandedServiceId(null);
    setIsAddingService(false);
  };
  
  const handleCloseForms = () => {
    setIsAddingService(false);
    setEditingServiceId(null);
  };

  const handleArchiveService = (service: Service) => {
    if (window.confirm(`Are you sure you want to archive ${service.name}? It will be hidden but not deleted.`)) {
      updateService({ ...service, archived: true });
      toast.success(`${service.name} has been archived.`);
    }
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${serviceName}? This action cannot be undone.`)) {
      removeService(serviceId);
      toast.success(`${serviceName} has been deleted.`);
    }
  };
  
  const handleCheckStatus = async (service: Service) => {
    toast.loading(`Checking status for ${service.name}...`, { id: `status-${service.id}` });
    await checkServiceStatus(service);
    toast.dismiss(`status-${service.id}`);
  };

  const _onDragEnd = useCallback((_result: any) => {
    // Drag and drop functionality is disabled for now
    // TODO: Re-implement with a React 19 compatible library
  }, []);
  
  const toggleDetails = (serviceId: string) => {
    setExpandedServiceId(prevId => (prevId === serviceId ? null : serviceId));
    setEditingServiceId(null);
    setIsAddingService(false);
  };
    
  const activeServices = services.filter(s => !s.archived);
  const _archivedServices = services.filter(s => s.archived);

  return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            {isAddingService && (
                <div className="mb-4 bg-slate-800 rounded-lg shadow-2xl p-4">
                     <h3 className="text-xl font-semibold mb-4 text-slate-100">Add a New Service</h3>
                     <ServiceForm onClose={handleCloseForms} />
                </div>
            )}
            
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-100">Active Services</h2>
                        <button onClick={handleAddClick} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700" title="Add a new service">Add New Service</button>
                    </div>
                    {activeServices.map((service, _index) => (
                    <div key={service.id} className="bg-slate-800 rounded-lg shadow-md transition-all hover:shadow-lg">
                        <div className="flex items-center p-4">
                            <div className="flex-none text-slate-500 pr-4" title="Drag to reorder (disabled)"><ArrowsUpDownIcon className="h-5 w-5" /></div>
                            <div className="flex-grow">
                                <div className="flex items-center space-x-3">
                                    <StatusIndicator status={service.status} />
                                    <p className="font-bold text-lg text-slate-100">{service.name}</p>
                                </div>
                                <p className="text-sm text-slate-400">{service.url}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleCheckStatus(service)} className="p-2 text-slate-400 hover:text-white" title="Check Service Status">
                                    <WifiIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleEditClick(service)} className="p-2 text-slate-400 hover:text-white" title="Edit Service">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => toggleDetails(service.id)} className="p-2 text-slate-400 rounded-md hover:bg-slate-700" title={expandedServiceId === service.id ? 'Hide Details' : 'Show Details'}><ChevronDownIcon className={`h-5 w-5 transition-transform ${expandedServiceId === service.id ? 'rotate-180' : ''}`} /></button>
                                <button onClick={() => handleArchiveService(service)} className="p-2 text-amber-500 rounded-md hover:bg-amber-700 hover:text-white" title="Archive Service"><ArchiveBoxIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteService(service.id, service.name)} className="p-2 text-red-500 rounded-md hover:bg-red-700 hover:text-white" title="Delete Service"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        {editingServiceId === service.id && <ServiceEditor service={service} onClose={handleCloseForms} />}
                        {expandedServiceId === service.id && <ServiceDetails service={service} />}
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Main Component with Sidebar Navigation ---
const ServiceManagement: React.FC = () => {
    const [activeManager, setActiveManager] = useState('Services');

    const navItems = [
        { name: 'Services', icon: CloudIcon },
        { name: 'Prompts', icon: ClipboardDocumentListIcon },
        { name: 'Artifacts', icon: ArchiveBoxIcon },
    ];

    const renderContent = () => {
        switch (activeManager) {
            case 'Services':
                return <ServiceManagerCore />;
            case 'Prompts':
                return <PlaceholderManager title="Prompt Manager" />;
            case 'Artifacts':
                return <PlaceholderManager title="Artifacts Manager" />;
            default:
                return <ServiceManagerCore />;
        }
    };

    return (
        <div className="flex h-full bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <div className="w-60 bg-slate-900 flex flex-col p-4">
                <h2 className="text-xl font-semibold mb-6 text-slate-100">Manage</h2>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveManager(item.name)}
                            className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium ${activeManager === item.name ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};


export default ServiceManagement; 
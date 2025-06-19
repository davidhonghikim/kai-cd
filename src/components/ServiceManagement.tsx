import React, { useState, useEffect } from 'react';
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
import AddServiceForm from './AddServiceForm';
import type { Service, LlmChatCapability, HealthCapability } from '../types';
import { apiClient } from '../utils/apiClient';
import toast from 'react-hot-toast';

// --- Placeholder Components ---
const PlaceholderManager: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-6 text-slate-400">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">{title}</h2>
        <p>This feature is coming soon.</p>
    </div>
);

// --- Service Details Sub-component ---
const ServiceDetails: React.FC<{ service: Service }> = ({ service }) => {
    const [models, setModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    useEffect(() => {
        const llmCapability = service.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;
        if (llmCapability?.endpoints.getModels) {
            const fetchModels = async () => {
                setIsLoadingModels(true);
                try {
                    const response = await apiClient.get(service.url, llmCapability.endpoints.getModels.path, service.authentication);
                    const modelsData = response.data || response;
                    if (Array.isArray(modelsData)) {
                        setModels(modelsData.map(m => m.id || m.name).filter(Boolean));
                    } else if (modelsData && typeof modelsData === 'object') {
                        const modelsList = (modelsData as any).models || [];
                        setModels(modelsList.map((m: any) => m.id || m.name).filter(Boolean));
                    }
                } catch (error) {
                    toast.error(`Failed to fetch models for ${service.name}.`);
                } finally {
                    setIsLoadingModels(false);
                }
            };
            fetchModels();
        }
    }, [service]);

    return (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
            <h4 className="font-semibold mb-2 text-slate-200">Service Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold text-slate-400">Category:</span> {service.category}</div>
                <div><span className="font-semibold text-slate-400">Enabled:</span> {service.enabled ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold text-slate-400">Type:</span> <span className="capitalize">{service.type.replace(/_/g, ' ')}</span></div>
            </div>
            {service.capabilities.some(c => c.capability === 'llm_chat') && (
                 <div className="mt-2">
                    <h5 className="font-semibold text-slate-400">Models</h5>
                    {isLoadingModels ? <p className="text-sm text-slate-500">Loading models...</p> : 
                        models.length > 0 ? (
                            <ul className="list-disc list-inside max-h-40 overflow-y-auto text-sm text-slate-300">
                                {models.map(m => <li key={m}>{m}</li>)}
                            </ul>
                        ) : <p className="text-sm text-slate-500">No models found or unable to fetch.</p>
                    }
                </div>
            )}
        </div>
    );
};


// --- Service Manager Core Component (the part you liked) ---
const ServiceManagerCore: React.FC = () => {
  const { services, removeService, updateService, setServices } = useServiceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [status, setStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const handleAddClick = () => {
    setServiceToEdit(null);
    setIsFormOpen(true);
    setExpandedServiceId(null);
  };

  const handleEditClick = (service: Service) => {
    setServiceToEdit(service);
    setIsFormOpen(true);
    setExpandedServiceId(null);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setServiceToEdit(null);
  };

   const handleCheckStatus = async (service: Service) => {
    setStatus(prev => ({ ...prev, [service.id]: 'checking' }));
    toast.loading(`Checking status for ${service.name}...`, { id: `status-${service.id}` });
    try {
      const healthCapability = service.capabilities.find(c => c.capability === 'health') as HealthCapability | undefined;
      const path = healthCapability?.endpoints.health.path || '/';
      await apiClient.get(service.url, path, service.authentication);
      setStatus(prev => ({ ...prev, [service.id]: 'online' }));
      updateService({ ...service, status: 'online' });
      toast.success(`${service.name} is online!`, { id: `status-${service.id}` });
    } catch (error) {
      console.error(`Status check failed for ${service.name}:`, error);
      setStatus(prev => ({ ...prev, [service.id]: 'offline' }));
      updateService({ ...service, status: 'offline' });
      toast.error(`${service.name} is offline.`, { id: `status-${service.id}` });
    }
  };

  useEffect(() => {
    services.forEach(service => {
        if (service.enabled && !status[service.id]) {
            handleCheckStatus(service);
        }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]); 

  const onDragEnd = (result: any) => {
    // This functionality is temporarily disabled until a React 19 compatible library is found.
    toast.error('Reordering is currently disabled.');
  };
  
  const toggleDetails = (serviceId: string) => {
    setExpandedServiceId(prevId => (prevId === serviceId ? null : serviceId));
    setIsFormOpen(false);
  };
    
    const handleExportServices = () => {
    const servicesJson = JSON.stringify(services, null, 2);
    const blob = new Blob([servicesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kai-cd-services.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Services exported successfully!');
  };

  const handleImportServices = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedServices = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedServices)) {
          setServices(importedServices);
          toast.success('Services imported successfully!');
        } else {
          toast.error('Invalid file format. Expected a JSON array of services.');
        }
      } catch (error) {
        toast.error('Failed to parse or import the file.');
      }
    };
    reader.readAsText(file);
  };

  const renderStatusIndicator = (serviceId: string) => {
    const s = status[serviceId] || 'unknown';
    let bgColor = 'bg-slate-500'; 
    let title = 'Status Unknown';
    if (s === 'checking') {
        bgColor = 'bg-yellow-500 animate-pulse';
        title = 'Checking...';
    } else if (s === 'online') {
        bgColor = 'bg-green-500';
        title = 'Online';
    } else if (s === 'offline') {
        bgColor = 'bg-red-500';
        title = 'Offline';
    }
    return <span title={title} className={`block w-3 h-3 rounded-full ${bgColor}`} />;
  };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Configure Services</h3>
                 <div className="flex items-center gap-2">
                    <button onClick={handleExportServices} className="px-3 py-2 text-sm bg-slate-700 rounded-md hover:bg-slate-600" title="Export service configurations">Export</button>
                    <input type="file" id="import-services" className="hidden" onChange={handleImportServices} accept=".json" />
                    <label htmlFor="import-services" className="cursor-pointer px-3 py-2 text-sm bg-slate-700 rounded-md hover:bg-slate-600" title="Import service configurations">Import</label>
                    <button onClick={handleAddClick} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700" title="Add new service">Add New Service</button>
                </div>
            </div>

            {isFormOpen && (
                <div className="mb-4">
                    <AddServiceForm onClose={handleCloseForm} serviceToEdit={serviceToEdit} />
                </div>
            )}

            <div className="flex-grow overflow-y-auto pr-2 max-w-4xl w-full mx-auto">
                <div className="space-y-4">
                    {services.map((service, index) => (
                    <div key={service.id} className="bg-slate-800 rounded-lg shadow-md transition-all hover:shadow-lg">
                        <div className="flex items-center p-4">
                            <div className="flex-none text-slate-500 pr-4" title="Drag to reorder"><ArrowsUpDownIcon className="h-5 w-5" /></div>
                            <div className="flex-grow">
                                <div className="flex items-center space-x-3">
                                    {renderStatusIndicator(service.id)}
                                    <p className="font-bold text-lg text-slate-100">{service.name}</p>
                                </div>
                                <p className="text-sm text-slate-400 break-all">{service.url}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleCheckStatus(service)} className="p-2 text-slate-400 rounded-md hover:bg-slate-700" title="Check Status"><WifiIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleEditClick(service)} className="p-2 text-slate-400 rounded-md hover:bg-slate-700" title="Edit Service"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => toggleDetails(service.id)} className="p-2 text-slate-400 rounded-md hover:bg-slate-700" title={expandedServiceId === service.id ? 'Hide Details' : 'Show Details'}><ChevronDownIcon className={`h-5 w-5 transition-transform ${expandedServiceId === service.id ? 'rotate-180' : ''}`} /></button>
                                <button onClick={() => { if (window.confirm(`Are you sure you want to delete ${service.name}?`)) { removeService(service.id); } }} className="p-2 text-red-500 rounded-md hover:bg-red-700 hover:text-white" title="Delete Service"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
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
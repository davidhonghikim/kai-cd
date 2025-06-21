import { Button } from '../shared/components/forms';
import IconButton from '../components/ui/IconButton';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useServiceStore } from '../store/serviceStore';
import {
  TrashIcon,
  PencilIcon,
  WifiIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  CloudIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
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
                const response = await apiClient.get(service.id, getModelsEndpoint.path);
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
                <div><span className="font-semibold text-slate-400">Last Checked:</span> {service.lastChecked ? new Date(service.lastChecked).toLocaleString() : 'Never'}</div>
            </div>
            {llmCapability && <LlmModelDetails capability={llmCapability} service={service} />}
        </div>
    );
};

// --- Enhanced Service Item Component ---
const ServiceItem: React.FC<{
  service: Service;
  onEdit: (service: Service) => void;
  onCheckStatus: (service: Service) => void;
  onToggleDetails: (serviceId: string) => void;
  onToggleArchive: (serviceId: string) => void;
  onDelete: (serviceId: string, serviceName: string) => void;
  isExpanded: boolean;
  isEditing: boolean;
  onCloseEdit: () => void;
}> = ({ service, onEdit, onCheckStatus, onToggleDetails, onToggleArchive, onDelete, isExpanded, isEditing, onCloseEdit }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="h-5 w-5 text-green-400 drop-shadow-lg" />;
      case 'offline': return <XCircleIcon className="h-5 w-5 text-red-500 drop-shadow-lg" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600 drop-shadow-lg" />;
      case 'checking': return <ClockIcon className="h-5 w-5 text-yellow-400 animate-spin drop-shadow-lg" />;
      default: return <ClockIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center p-4">
        <div className="flex-grow">
          <div className="flex items-center space-x-3">
            {getStatusIcon(service.status)}
            <p className="font-bold text-lg text-slate-100">{service.name}</p>
            {service.archived && <span className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded">Archived</span>}
          </div>
          <p className="text-sm text-slate-400">{service.url}</p>
          <p className="text-xs text-slate-500 capitalize">{service.type.replace(/_/g, ' ')} • {service.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          <IconButton 
            icon={WifiIcon} 
            onClick={() => onCheckStatus(service)} 
            title="Check Service Status"
            variant="ghost"
            disabled={service.status === 'checking'}
          />
          <IconButton 
            icon={PencilIcon} 
            onClick={() => onEdit(service)} 
            title="Edit Service"
            variant="ghost"
          />
          <IconButton 
            icon={ChevronDownIcon} 
            onClick={() => onToggleDetails(service.id)} 
            title={isExpanded ? 'Hide Details' : 'Show Details'}
            variant="ghost"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
          <IconButton 
            icon={service.archived ? EyeIcon : ArchiveBoxIcon} 
            onClick={() => onToggleArchive(service.id)} 
            title={service.archived ? 'Restore Service' : 'Archive Service'}
            variant="warning"
          />
        </div>
      </div>
      
      {isEditing && (
        <div className="border-t border-slate-700 p-4">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Edit Service</h4>
            <ServiceEditor service={service} onClose={onCloseEdit} />
          </div>
          
          {/* Delete section in edit menu */}
          <div className="border-t border-slate-600 pt-4">
            <h5 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h5>
            {!showDeleteConfirm ? (
              <Button 
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                className="text-sm"
              >
                Delete Service
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Are you sure? This action cannot be undone.</p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => {
                      onDelete(service.id, service.name);
                      setShowDeleteConfirm(false);
                      onCloseEdit();
                    }}
                    variant="danger"
                    className="text-sm"
                  >
                    Yes, Delete
                  </Button>
                  <Button 
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isExpanded && !isEditing && <ServiceDetails service={service} />}
    </div>
  );
};

// --- Service Manager Core Component ---
const ServiceManagerCore: React.FC = () => {
  const { 
    services, 
    removeService, 
    checkServiceStatus, 
    sortServices, 
    toggleServiceArchive,
    startPeriodicStatusCheck,
    stopPeriodicStatusCheck,
    _hasHydrated 
  } = useServiceStore();
  
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'type' | 'lastChecked'>('name');
  const periodicCheckRef = useRef<number | null>(null);

  // Initialize periodic status checking
  useEffect(() => {
    if (_hasHydrated) {
      // Initial status check for unknown services
      const unknownServices = services.filter(s => !s.archived && s.status === 'unknown');
      unknownServices.forEach(service => {
        checkServiceStatus(service);
      });

      // Start periodic checking
      periodicCheckRef.current = startPeriodicStatusCheck();
      
      return () => {
        if (periodicCheckRef.current) {
          stopPeriodicStatusCheck(periodicCheckRef.current);
        }
      };
    }
  }, [_hasHydrated, startPeriodicStatusCheck, stopPeriodicStatusCheck, checkServiceStatus]);

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

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    removeService(serviceId);
    toast.success(`${serviceName} has been deleted.`);
  };
  
  const handleCheckStatus = async (service: Service) => {
    await checkServiceStatus(service);
    toast.success(`Status checked for ${service.name}`);
  };

  const handleToggleArchive = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toggleServiceArchive(serviceId);
      toast.success(`${service.name} ${service.archived ? 'restored' : 'archived'}`);
    }
  };
  
  const toggleDetails = (serviceId: string) => {
    setExpandedServiceId(prevId => (prevId === serviceId ? null : serviceId));
    setEditingServiceId(null);
    setIsAddingService(false);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    sortServices(newSortBy);
  };
    
  // Apply sorting to filtered services
  const sortedServices = [...services].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        const statusOrder = { 'online': 0, 'checking': 1, 'offline': 2, 'error': 3, 'unknown': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'type':
        return a.type.localeCompare(b.type);
      case 'lastChecked':
        return b.lastChecked - a.lastChecked;
      default:
        return 0;
    }
  });
  
  const activeServices = sortedServices.filter(s => !s.archived);
  const archivedServices = sortedServices.filter(s => s.archived);
  const displayServices = showArchived ? archivedServices : activeServices;

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {isAddingService && (
        <div className="mb-4 bg-slate-800 rounded-lg shadow-2xl p-4">
          <h3 className="text-xl font-semibold mb-4 text-slate-100">Add a New Service</h3>
          <ServiceForm onClose={handleCloseForms} />
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-4">
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-slate-100">
                {showArchived ? 'Archived Services' : 'Active Services'}
                <span className="ml-2 text-sm text-slate-400">
                  ({displayServices.length})
                </span>
              </h2>
              <Button 
                onClick={() => setShowArchived(!showArchived)}
                variant="secondary"
                className="text-sm"
              >
                {showArchived ? <EyeIcon className="h-4 w-4 mr-1" /> : <EyeSlashIcon className="h-4 w-4 mr-1" />}
                {showArchived ? `Show Active (${activeServices.length})` : `Show Archived (${archivedServices.length})`}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Sort controls */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-slate-400" />
                <select 
                  value={sortBy} 
                  onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200"
                >
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                  <option value="type">Sort by Type</option>
                  <option value="lastChecked">Sort by Last Checked</option>
                </select>
              </div>
              
              {!showArchived && (
                <Button onClick={handleAddClick} variant="primary" title="Add a new service">
                  Add New Service
                </Button>
              )}
            </div>
          </div>

          {/* Services list */}
          {displayServices.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CloudIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">
                {showArchived ? 'No archived services' : 'No active services'}
              </p>
              <p className="text-sm">
                {showArchived 
                  ? 'Services you archive will appear here' 
                  : 'Add your first AI service to get started'
                }
              </p>
            </div>
          ) : (
            displayServices.map((service) => (
              <ServiceItem
                key={service.id}
                service={service}
                onEdit={handleEditClick}
                onCheckStatus={handleCheckStatus}
                onToggleDetails={toggleDetails}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDeleteService}
                isExpanded={expandedServiceId === service.id}
                isEditing={editingServiceId === service.id}
                onCloseEdit={handleCloseForms}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Simplified Main Component (Remove sidebar navigation) ---
const ServiceManagement: React.FC = () => {
  return <ServiceManagerCore />;
};

export default ServiceManagement; 
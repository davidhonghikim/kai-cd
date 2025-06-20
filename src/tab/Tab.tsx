import React, { useState, useEffect, useMemo } from 'react';
import { useServiceStore } from '../store/serviceStore';
import { switchToPanel } from '../store/viewStateStore';
import CapabilityUI from '../components/CapabilityUI';
import { Cog6ToothIcon, CloudIcon, DocumentTextIcon, CommandLineIcon, ArrowTopRightOnSquareIcon, ShieldExclamationIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ServiceManagement from '../components/ServiceManagement';
import SettingsView from '../components/SettingsView';
import DocsViewer from '../docs/DocsViewer';
import IFrameView from '../components/IFrameView';
import type { Service } from '../types';
import { VIEW_STATES, INITIAL_TAB_VIEW_KEY, SELECTED_SERVICE_ID_KEY } from '../config/constants';
import ServiceSelector from '../components/ServiceSelector';
import ConsoleLogView from '../components/ConsoleLogView';
import type { TabView } from '../store/viewStateStore';

const getPrimaryViewForService = (service: Service): TabView => {
    const capabilities = service.capabilities.map(c => c.capability);
    if (capabilities.includes('llm_chat')) {
        return 'chat';
    }
    if (capabilities.includes('image_generation')) {
        return 'image';
    }
    return 'chat'; 
}

const Tab: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId, getServiceById } = useServiceStore();
  const [activeKey, setActiveKey] = useState<TabView>('chat');
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);

  useEffect(() => {
    const getInitialState = async () => {
      try {
        // First, try to get the service ID from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const serviceIdFromUrl = urlParams.get('serviceId');
        
        let serviceIdToSelect: string | null = null;
        let viewToSelect: TabView | null = null;

        if (serviceIdFromUrl) {
          console.log(`[Tab] Found serviceId in URL: ${serviceIdFromUrl}`);
          const service = getServiceById(serviceIdFromUrl);
          if (service) {
            serviceIdToSelect = service.id;
            viewToSelect = getPrimaryViewForService(service);
          }
        } else {
          // Fallback to chrome.storage.local if no URL param
          const result = await chrome.storage.local.get([INITIAL_TAB_VIEW_KEY, SELECTED_SERVICE_ID_KEY]);
          
          viewToSelect = result[INITIAL_TAB_VIEW_KEY];
          serviceIdToSelect = result[SELECTED_SERVICE_ID_KEY];
          
          // Clean up storage keys after reading them
          await chrome.storage.local.remove([INITIAL_TAB_VIEW_KEY, SELECTED_SERVICE_ID_KEY]);
        }
        
        if (serviceIdToSelect) {
            console.log(`[Tab] Setting selected service ID to: ${serviceIdToSelect}`);
            setSelectedServiceId(serviceIdToSelect);
        }

        if (viewToSelect && ['chat', 'image', 'services', 'docs', 'settings', 'console'].includes(viewToSelect)) {
          console.log(`[Tab] Setting initial view to: ${viewToSelect}`);
          setActiveKey(viewToSelect as TabView);
        }

      } catch (error) {
        console.error('[Tab] Failed to get initial state:', error);
      } finally {
        setInitialStateLoaded(true);
        // Let the background script know the tab has loaded its state and can close the side panel
        chrome.runtime.sendMessage({ action: 'closeSidePanel' });
      }
    };

    getInitialState();

    const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        if (message.type === 'SWITCH_SERVICE') {
            console.log(`[Tab] Received SWITCH_SERVICE message:`, message);
            if(message.serviceId) {
                setSelectedServiceId(message.serviceId);
            }
            if(message.view) {
                setActiveKey(message.view);
            }
        }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [setSelectedServiceId, getServiceById]);

  const activeService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  useEffect(() => {
    // When the view changes, if there's no active service that matches the view,
    // find and select the first available one.
    if (!initialStateLoaded) return;

    const suitableServiceExists = activeService && 
        ((activeKey === 'chat' && activeService.capabilities.some(c => c.capability === 'llm_chat')) ||
         (activeKey === 'image' && activeService.capabilities.some(c => c.capability === 'image_generation')));

    if (suitableServiceExists) {
        return; // Already have a good service selected
    }

    if (activeKey === 'chat') {
        const firstChatService = services.find(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'llm_chat'));
        if (firstChatService) {
            setSelectedServiceId(firstChatService.id);
        }
    } else if (activeKey === 'image') {
        const firstImageService = services.find(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'image_generation'));
        if (firstImageService) {
            setSelectedServiceId(firstImageService.id);
        }
    }
  }, [activeKey, services, activeService, setSelectedServiceId, initialStateLoaded]);

  const navItems: { name: TabView; icon: React.FC<any> }[] = [
    { name: 'chat', icon: CommandLineIcon },
    { name: 'image', icon: PhotoIcon },
    { name: 'services', icon: CloudIcon },
    { name: 'docs', icon: DocumentTextIcon },
    { name: 'settings', icon: Cog6ToothIcon },
    { name: 'console', icon: ShieldExclamationIcon },
  ];

  const getServiceHost = (service?: Service) => {
    if (!service || !service.url) return '';
    try {
      const url = new URL(service.url);
      return url.host;
    } catch (error) {
      return '';
    }
  };

  const renderContent = () => {
    if (!initialStateLoaded) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CloudIcon className="w-16 h-16 animate-pulse" />
                <h2 className="text-xl font-semibold mt-4">Loading...</h2>
            </div>
        );
    }
    
    if (!activeService && (activeKey === 'chat' || activeKey === 'image')) {
        const message = activeKey === 'chat' ? 'No Chat Service' : 'No Image Service';
        const capabilityMessage = activeKey === 'chat' ? 'chat' : 'image generation';
        const Icon = activeKey === 'chat' ? CommandLineIcon : PhotoIcon;
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Icon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">{message}</h2>
            <p>Go to "Services" to add and enable a service with {capabilityMessage} capabilities.</p>
          </div>
        );
    }

    switch (activeKey) {
      case 'chat':
        if (activeService && activeService.capabilities.some(c => c.capability === 'llm_chat')) {
          return <CapabilityUI service={activeService} />;
        }
        break; // Fall through to default message if service doesn't have the capability
      case 'image':
        if (activeService && activeService.capabilities.some(c => c.capability === 'image_generation')) {
          return <CapabilityUI service={activeService} />;
        }
        break; // Fall through to default message if service doesn't have the capability
      case 'services':
        return <ServiceManagement />;
      case 'docs':
        return <DocsViewer />;
      case 'settings':
        return <SettingsView />;
      case 'console':
        return <ConsoleLogView />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CloudIcon className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">No Active Services</h2>
                <p>Go to the "Services" tab to add and enable a service.</p>
            </div>
        );
    }
    // Default case for when a service is selected but doesn't have the right capability for the view
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <ShieldExclamationIcon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">Capability Mismatch</h2>
            <p><span className="font-bold">{activeService?.name}</span> does not have <span className="font-bold">{activeKey}</span> capabilities.</p>
        </div>
    );
  };

  const getHeaderInfo = () => {
    const selectedService = services.find(s => s.id === selectedServiceId);

    switch (activeKey) {
      case 'chat':
        const chatService = selectedService || services.find(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'llm_chat'));
        return { title: 'Chat', host: getServiceHost(chatService), service: chatService };
      case 'image':
        const imageService = selectedService || services.find(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'image_generation'));
        return { title: 'Image Generation', host: getServiceHost(imageService), service: imageService };
      case 'services':
        return { title: 'Service Manager', host: '', service: null };
      case 'docs':
        return { title: 'Documentation', host: '', service: null };
      case 'settings':
        return { title: 'Settings', host: '', service: null };
      case 'console':
        return { title: 'Console Logs', host: '', service: null };
      default:
        const activeService = services.find(s => s.id === selectedServiceId) || services.find(s => s.enabled && !s.archived);
        return { title: activeService?.name || 'Kai', host: getServiceHost(activeService), service: activeService };
    }
  }

  const { title, host, service: currentService } = getHeaderInfo();
  
  const chatServices = services.filter(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'llm_chat'));
  const imageServices = services.filter(s => s.enabled && !s.archived && s.capabilities.some(c => c.capability === 'image_generation'));
  
  const getSelectorServices = () => {
    switch(activeKey) {
        case 'chat': return chatServices;
        case 'image': return imageServices;
        default: return [];
    }
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-slate-950 flex flex-col items-center py-4 space-y-4">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => {
              console.log(`[Tab] Setting activeKey to: ${item.name}`);
              setActiveKey(item.name);
            }}
            className={`p-2 rounded-lg ${activeKey === item.name ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            title={item.name}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {host && <p className="text-xs text-slate-400">{host}</p>}
          </div>
          <div className="flex items-center gap-4">
            {(activeKey === 'chat' || activeKey === 'image') && (
              <ServiceSelector 
                services={getSelectorServices()}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
              />
            )}
            {currentService && (
              <button
                onClick={() => switchToPanel(currentService)}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Open in side panel"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-950">
          {initialStateLoaded ? renderContent() : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CloudIcon className="w-16 h-16 animate-pulse" />
                <h2 className="text-xl font-semibold mt-4">Loading...</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tab; 
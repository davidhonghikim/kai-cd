import React, { useState, useEffect } from 'react';
import { useServiceStore } from '../store/serviceStore';
import { switchToPanel } from '../store/viewStateStore';
import CapabilityUI from '../components/CapabilityUI';
import { Cog6ToothIcon, CloudIcon, DocumentTextIcon, CommandLineIcon, ArrowTopRightOnSquareIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import ServiceManagement from '../components/ServiceManagement';
import SettingsView from '../components/SettingsView';
import DocsViewer from '../docs/DocsViewer';
import IFrameView from '../components/IFrameView';
import type { Service } from '../types';
import { VIEW_STATES, INITIAL_TAB_VIEW_KEY, SELECTED_SERVICE_ID_KEY } from '../config/constants';
import ServiceSelector from '../components/ServiceSelector';
import ConsoleLogView from '../components/ConsoleLogView';
import type { TabView } from '../store/viewStateStore';

const Tab: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId } = useServiceStore();
  const [activeKey, setActiveKey] = useState<TabView>('chat');

  useEffect(() => {
    const getInitialState = async () => {
      try {
        const result = await chrome.storage.local.get([INITIAL_TAB_VIEW_KEY, SELECTED_SERVICE_ID_KEY]);
        
        const initialView = result[INITIAL_TAB_VIEW_KEY];
        if (initialView && ['chat', 'services', 'docs', 'settings', 'console'].includes(initialView)) {
          console.log(`Found initial view in storage: ${initialView}`);
          setActiveKey(initialView as TabView);
          await chrome.storage.local.remove(INITIAL_TAB_VIEW_KEY);
        }

        const serviceId = result[SELECTED_SERVICE_ID_KEY];
        if (serviceId) {
            console.log(`Found selected service ID in storage: ${serviceId}`);
            setSelectedServiceId(serviceId);
            await chrome.storage.local.remove(SELECTED_SERVICE_ID_KEY);
        }

      } catch (error) {
        console.error('Failed to get initial state from storage', error);
      }
    };

    getInitialState();
  }, []);

  useEffect(() => {
    // When the chat tab is active, ensure a chat service is selected.
    if (activeKey === 'chat' && !selectedServiceId) {
        const firstChatService = services.find(s => s.enabled && s.capabilities.some(c => c.capability === 'llm_chat'));
        if (firstChatService) {
            console.log(`[Tab] No chat service selected. Defaulting to first available: ${firstChatService.name}`);
            setSelectedServiceId(firstChatService.id);
        }
    }
  }, [activeKey, services, selectedServiceId, setSelectedServiceId]);

  const navItems: { name: TabView; icon: React.FC<any> }[] = [
    { name: 'chat', icon: CommandLineIcon },
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
    const selectedService = services.find(s => s.id === selectedServiceId);

    switch (activeKey) {
      case 'chat':
        if (selectedService && selectedService.capabilities.some(c => c.capability === 'llm_chat')) {
          return <CapabilityUI service={selectedService} />;
        }
        const firstChatService = services.find(s => s.enabled && s.capabilities.some(c => c.capability === 'llm_chat'));
        if (firstChatService) {
          return <CapabilityUI service={firstChatService} />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <CommandLineIcon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">No Chat Service</h2>
            <p>Go to "Services" to add and enable a service with chat capabilities.</p>
          </div>
        );
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
  };

  const getHeaderInfo = () => {
    const selectedService = services.find(s => s.id === selectedServiceId);

    switch (activeKey) {
      case 'chat':
        const chatService = selectedService || services.find(s => s.enabled && s.capabilities.some(c => c.capability === 'llm_chat'));
        return { title: 'Chat', host: getServiceHost(chatService), service: chatService };
      case 'services':
        return { title: 'Service Manager', host: '', service: null };
      case 'docs':
        return { title: 'Documentation', host: '', service: null };
      case 'settings':
        return { title: 'Settings', host: '', service: null };
      case 'console':
        return { title: 'Console Logs', host: '', service: null };
      default:
        const activeService = services.find(s => s.id === selectedServiceId) || services.find(s => s.enabled);
        return { title: activeService?.name || 'Kai', host: getServiceHost(activeService), service: activeService };
    }
  }

  const { title, host, service: activeService } = getHeaderInfo();
  
  const chatServices = services.filter(s => s.capabilities.some(c => c.capability === 'llm_chat'));
  const allServices = services; // For the service selector dropdown

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
            {activeKey === 'chat' && (
              <ServiceSelector 
                services={chatServices}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
              />
            )}
            {activeService && (
              <button
                onClick={() => switchToPanel(activeService)}
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Tab; 
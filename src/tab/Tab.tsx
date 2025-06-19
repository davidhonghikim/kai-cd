import React, { useState } from 'react';
import { useServiceStore } from '../store/serviceStore';
import CapabilityUI from '../components/CapabilityUI';
import { Cog6ToothIcon, CloudIcon, DocumentTextIcon, CommandLineIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { switchToPanel } from '../store/viewStateStore';
import ServiceManagement from '../components/ServiceManagement';
import SettingsView from '../components/SettingsView';
import DocsViewer from '../docs/DocsViewer';
import IFrameView from '../components/IFrameView';
import type { Service } from '../types';
import { VIEW_STATES } from '../config/constants';

type MainView = typeof VIEW_STATES[keyof typeof VIEW_STATES];

const Tab: React.FC = () => {
  const { services } = useServiceStore();
  const [mainView, setMainView] = useState<MainView>(VIEW_STATES.CHAT);

  const navItems = [
    { name: VIEW_STATES.CHAT, icon: CommandLineIcon },
    { name: VIEW_STATES.SERVICES, icon: CloudIcon },
    { name: VIEW_STATES.DOCS, icon: DocumentTextIcon },
    { name: VIEW_STATES.SETTINGS, icon: Cog6ToothIcon },
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
    switch (mainView) {
      case VIEW_STATES.CHAT:
        const chatService = services.find(s => s.enabled && s.capabilities.some(c => c.capability === 'llm_chat'));
        if (chatService) {
          return <CapabilityUI service={chatService} />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <CommandLineIcon className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">No Chat Service</h2>
            <p>Go to "Services" to add and enable a service with chat capabilities.</p>
          </div>
        );
      case VIEW_STATES.SERVICES:
        return <ServiceManagement />;
      case VIEW_STATES.DOCS:
        return <DocsViewer />;
      case VIEW_STATES.SETTINGS:
        return <SettingsView />;
      default:
        const serviceWithUi = services.find(s => s.enabled && s.hasExternalUi);
        if (serviceWithUi) {
          return <IFrameView service={serviceWithUi} />;
        }
        const serviceWithCapability = services.find(s => s.enabled && s.capabilities.length > 0);
        if (serviceWithCapability) {
          return <CapabilityUI service={serviceWithCapability} />;
        }
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
    switch (mainView) {
      case VIEW_STATES.CHAT:
        const chatService = services.find(s => s.enabled && s.capabilities.some(c => c.capability === 'llm_chat'));
        return { title: 'Chat', host: getServiceHost(chatService) };
      case VIEW_STATES.SERVICES:
        return { title: 'Service Manager', host: '' };
      case VIEW_STATES.DOCS:
        return { title: 'Documentation', host: '' };
      case VIEW_STATES.SETTINGS:
        return { title: 'Settings', host: '' };
      default:
        const activeService = services.find(s => s.enabled);
        return { title: activeService?.name || 'Kai', host: getServiceHost(activeService) };
    }
  }

  const { title, host } = getHeaderInfo();
  const serviceForPanel = services.find(s => s.enabled);

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-slate-950 flex flex-col items-center py-4 space-y-4">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => setMainView(item.name)}
            className={`p-2 rounded-lg ${mainView === item.name ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
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
          <div className="flex items-center gap-2">
            {serviceForPanel && (
              <button
                onClick={() => switchToPanel(serviceForPanel)}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Open in side panel"
              >
                <ArrowTopRightOnSquareIcon className="w-6 h-6" />
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
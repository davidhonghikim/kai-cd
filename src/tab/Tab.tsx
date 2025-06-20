import React, { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import { useServiceStore } from '../store/serviceStore';
import { useViewStateStore } from '../store/viewStateStore';
import CapabilityUI from '../components/CapabilityUI';
import StatusIndicator from '../components/StatusIndicator';
import { ArrowTopRightOnSquareIcon, ArrowsPointingOutIcon, CloudIcon, DocumentTextIcon, Cog6ToothIcon, CommandLineIcon, ShieldExclamationIcon, PhotoIcon, WrenchScrewdriverIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import ServiceSelector from '../components/ServiceSelector';
import IFrameView from '../components/IFrameView';
import type { Service } from '../types';
import type { TabView } from '../store/viewStateStore';
import ServiceManagement from '../components/ServiceManagement';
import DocsViewer from '../docs/DocsViewer';
import SettingsView from '../components/SettingsView';
import ConsoleLogView from '../components/ConsoleLogView';
import ServiceStatusList from '../components/ServiceStatusList';
import VaultManager from '../components/VaultManager';
import CredentialManager from '../components/CredentialManager';
import SecurityHub from '../components/SecurityHub';
import useVaultStore from '../store/vaultStore';

const Tab: React.FC = () => {
  const serviceStoreHasHydrated = useStore(useServiceStore, (s) => s._hasHydrated);
  const viewStateStoreHasHydrated = useStore(useViewStateStore, (s) => s._hasHydrated);

  const { services } = useServiceStore();
  const { activeServiceId, setActiveServiceId } = useViewStateStore();
  const { status: vaultStatus } = useVaultStore();
  const [activeView, setActiveView] = useState<TabView>('services');
  const [showIframeView, setShowIframeView] = useState(false);

  // Always execute hooks; render loading placeholder conditionally later.
  const isLoading = !serviceStoreHasHydrated || !viewStateStoreHasHydrated;

  const activeService = services.find((s) => s.id === activeServiceId);

  // Effect for handling incoming messages from the background script
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'setState') {
        const { serviceId, view } = message.payload;
        console.log(`[Tab] Received setState message. ServiceID: ${serviceId}, View: ${view}`);
        if (view) {
          setActiveView(view);
        }
        // IMPORTANT: Only set active service if one was provided.
        // Don't nullify it if the message was just for a view change (e.g., 'settings').
        if (serviceId) {
          setActiveServiceId(serviceId);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [setActiveServiceId]); // Dependency on the setter function

  // Effect for initializing state from URL or setting a default service
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceIdFromUrl = urlParams.get('serviceId');
    const viewFromUrl = urlParams.get('view') as TabView | null;

    // Prioritize URL parameters
    if (viewFromUrl) {
      setActiveView(viewFromUrl);
    }
    if (serviceIdFromUrl) {
      setActiveServiceId(serviceIdFromUrl);
    } else if (!activeServiceId && services && services.length > 0) {
      // If no service is active (from URL or message) AND services are loaded,
      // set a default service and view.
      setActiveServiceId(services[0].id);
      setActiveView('chat');
    }

    // Let the background script know the tab is ready
    chrome.runtime.sendMessage({ action: 'closeSidePanel' });
    
  }, [services, activeServiceId, setActiveServiceId]); // Re-run when services or activeId changes

  useEffect(() => {
    // If the active service changes, always reset to the capability view
    setShowIframeView(false);
  }, [activeServiceId]);
  
  // Auto-switch view if the current service doesn't support the active view
  useEffect(() => {
    if (activeService) {
        const capabilities = activeService.capabilities.map(c => c.capability);
        if (activeView === 'chat' && !capabilities.includes('llm_chat')) {
            setActiveView('services');
        } else if (activeView === 'image' && !capabilities.includes('image_generation')) {
            setActiveView('services');
        }
    }
  }, [activeService, activeView]);

  const getServiceHost = (service?: Service) => {
    if (!service || !service.url) return '';
    try {
      const url = new URL(service.url);
      return url.host;
    } catch (_error) {
      return '';
    }
  };

  const renderMainContent = () => {
    if (showIframeView && activeService) {
      return <IFrameView src={activeService.url} title={activeService.name} />;
    }
    
    switch (activeView) {
      case 'chat':
      case 'image':
        return activeService ? <CapabilityUI service={activeService} /> : <NoServiceSelectedView />;
      case 'services':
        return <ServiceManagement />;
      case 'vault':
        return (
          <div className="p-6">
            <VaultManager />
            {vaultStatus === 'UNLOCKED' && (
              <div className="mt-8">
                <CredentialManager />
              </div>
            )}
          </div>
        );
      case 'security':
        return <SecurityHub />;
      case 'docs':
        return <DocsViewer />;
      case 'settings':
        return <SettingsView />;
      case 'console':
        return <ConsoleLogView />;
      default:
        return <NoServiceSelectedView />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <nav className="w-16 bg-slate-900 flex flex-col items-center py-4 space-y-4">
        {/* Main Navigation Icons */}
        <NavItem icon={CommandLineIcon} view="chat" activeView={activeView} setView={setActiveView} title="LLM Chat - AI conversation interface" />
        <NavItem icon={PhotoIcon} view="image" activeView={activeView} setView={setActiveView} title="Image Generation - AI image creation tools" />
        <div className="flex-grow"></div>
        {/* Settings/Management Icons */}
        <NavItem icon={WrenchScrewdriverIcon} view="services" activeView={activeView} setView={setActiveView} title="Service Management - Configure AI services" />
        <NavItem icon={LockClosedIcon} view="vault" activeView={activeView} setView={setActiveView} title="Secure Vault - Encrypted credential storage" />
        <NavItem icon={ShieldCheckIcon} view="security" activeView={activeView} setView={setActiveView} title="Security Toolkit - Cryptographic and security tools" />
        <NavItem icon={DocumentTextIcon} view="docs" activeView={activeView} setView={setActiveView} title="Documentation - User guides and help" />
        <NavItem icon={Cog6ToothIcon} view="settings" activeView={activeView} setView={setActiveView} title="Application Settings - Themes and preferences" />
        <NavItem icon={ShieldExclamationIcon} view="console" activeView={activeView} setView={setActiveView} title="Debug Console - Application logs and diagnostics" />
      </nav>
      
      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-3 border-b border-slate-800 shrink-0">
          <div className="flex-1 min-w-0 flex items-center">
            <h1 className="text-xl font-bold text-slate-200 truncate" title={activeService?.name}>
              {activeService ? activeService.name : 'Manage Services'}
            </h1>
            {activeService && (
              <>
                <span className="mx-2 text-slate-600">|</span>
                <StatusIndicator status={activeService.status} />
                <span className="ml-2 text-sm text-slate-400">{getServiceHost(activeService)}</span>
                {activeService.hasExternalUi && (
                  <button onClick={() => setShowIframeView(!showIframeView)} className="ml-3 p-1 text-slate-400 hover:text-white" title={showIframeView ? 'Show Capability View' : 'Show Service Web UI'}>
                    {showIframeView ? <ArrowsPointingOutIcon className="h-5 w-5" /> : <ArrowTopRightOnSquareIcon className="h-5 w-5" />}
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ServiceStatusList />
            <ServiceSelector
              services={services}
              selectedServiceId={activeServiceId}
              onSelectService={setActiveServiceId}
            />
          </div>
        </header>
        <main className="flex-1 bg-slate-950 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{icon: React.FC<any>, view: TabView, activeView: TabView, setView: (v: TabView) => void, title?: string}> = 
({icon: Icon, view, activeView, setView, title}) => (
    <button onClick={() => setView(view)} className={`p-2 rounded-md ${activeView === view ? 'bg-cyan-600' : 'hover:bg-slate-800'}`} title={title || view.charAt(0).toUpperCase() + view.slice(1)}>
        <Icon className="h-6 w-6" />
    </button>
);

const NoServiceSelectedView: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
            <CloudIcon className="mx-auto h-12 w-12" />
            <h2 className="mt-4 text-xl font-semibold">No Active Service</h2>
            <p className="mt-2">Please select a service from the dropdown above.</p>
        </div>
    </div>
);

export default Tab; 
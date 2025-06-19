import React, { useState, useEffect } from 'react';
import { useServiceStore, type Service } from '../store/serviceStore';
import toast, { Toaster } from 'react-hot-toast';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ServerStackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { switchToPanel, switchToTab, useViewStateStore, type MainView } from '../store/viewStateStore';
import { allServiceDefinitions } from '../connectors/definitions/all';
import { INITIAL_TAB_VIEW_KEY } from '../config/constants';
import type { TabView } from '../store/viewStateStore';

const Popup: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId } = useServiceStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Check panel status on component mount
  useEffect(() => {
    const checkPanelStatus = async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
          const options = await chrome.sidePanel.getOptions({ tabId: tabs[0].id });
          setIsPanelOpen(options?.enabled ?? false);
        }
      } catch (error) {
        // Silently fail if sidePanel is not available, e.g. on Firefox
      }
    };
    checkPanelStatus();
  }, []);

  const handleServiceClick = async (service: Service) => {
    // Check if a tab for this service is already open
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('tab.html') });
    
    let serviceTab = tabs[0]; 

    const serviceDefinition = allServiceDefinitions.find(def => def.type === service.type);
    const hasExternalUi = serviceDefinition?.hasExternalUi || false;

    if (hasExternalUi) {
      if (serviceTab) {
        setSelectedServiceId(service.id);
        await chrome.tabs.update(serviceTab.id!, { active: true });
        await chrome.windows.update(serviceTab.windowId, { focused: true });
      } else {
        await switchToTab(service);
      }
    } else {
      await switchToPanel(service);
    }
     window.close(); // Close the popup
  };

  const openViewInNewTab = (view: TabView) => {
    console.log(`Setting initial view for new tab: ${view}`);
    chrome.storage.local.set({ [INITIAL_TAB_VIEW_KEY]: view }, () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
      window.close();
    });
  };

  const togglePanel = async () => {
    if (!selectedServiceId) {
      toast.error('Select a service first');
      return;
    }
    const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    if (currentTab.id) {
      await chrome.sidePanel.setOptions({
        tabId: currentTab.id,
        path: 'sidepanel.html',
        enabled: !isPanelOpen,
      });
      await chrome.sidePanel.open({ tabId: currentTab.id });
      setIsPanelOpen(!isPanelOpen);
    }
  };

  return (
    <div className="w-[640px] text-sm font-sans select-none bg-background-primary text-text-primary">
      <Toaster
        toastOptions={{
          className: 'bg-background-secondary text-text-primary',
        }}
      />
      <header className="flex items-center justify-between bg-background-secondary px-3 py-2">
        <div className="flex items-center gap-2">
          <ServerStackIcon className="h-5 w-5 text-accent-primary" />
          <span className="font-semibold">Kai-CD</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePanel}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label={isPanelOpen ? 'Hide Panel' : 'Show Panel'}
            title={isPanelOpen ? 'Hide Panel' : 'Show Panel'}
          >
            {isPanelOpen ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => openViewInNewTab('services')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label="Service Manager"
            title="Service Manager"
          >
            <WrenchScrewdriverIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openViewInNewTab('settings')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label="Settings"
            title="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openViewInNewTab('docs')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label="Documentation"
            title="Documentation"
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="overflow-y-auto p-4 space-y-4">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`bg-background-secondary rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 ${
                  selectedServiceId === service.id
                    ? 'border-accent-primary'
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {service.name}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">
                      {service.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        console.log(`[Popup] "Tab" button clicked for service: ${service.name} (${service.id})`);
                        await switchToTab(service);
                        window.close();
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-accent-primary text-white hover:bg-accent-primary-state focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    >
                      Tab
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        console.log(`[Popup] "Panel" button clicked for service: ${service.name} (${service.id})`);
                        await switchToPanel(service);
                        window.close();
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-background-tertiary text-text-primary hover:bg-border-primary focus:outline-none focus:ring-2 focus:ring-border-primary"
                    >
                      Panel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-text-secondary" />
            <h3 className="mt-2 text-lg font-medium text-text-primary">No services configured</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Click the 'Service Manager' icon to add a new service.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Popup;
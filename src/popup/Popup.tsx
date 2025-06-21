import React, { useState, useEffect } from 'react';
import { useServiceStore } from '../store/serviceStore';
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
import { switchToPanel, switchToTab } from '../store/viewStateStore';
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
      } catch (_error) {
        // Silently fail if sidePanel is not available, e.g. on Firefox
      }
    };
    checkPanelStatus();
  }, []);

  const _openViewInNewTab = (view: TabView) => {
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
    
    try {
      const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
      if (currentTab?.id) {
        if (isPanelOpen) {
          // Close the panel
          await chrome.sidePanel.setOptions({
            tabId: currentTab.id,
            enabled: false,
          });
          setIsPanelOpen(false);
        } else {
          // Open the panel
          await chrome.sidePanel.setOptions({
            tabId: currentTab.id,
            path: 'sidepanel.html',
            enabled: true,
          });
          await chrome.sidePanel.open({ tabId: currentTab.id });
          setIsPanelOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle panel:', error);
      toast.error('Failed to toggle panel');
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    console.log(`[Popup] Service selected: ${serviceId}`);
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
            onClick={async () => { await switchToTab('services'); window.close(); }}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label="Service Manager"
            title="Service Manager"
          >
            <WrenchScrewdriverIcon className="h-5 w-5" />
          </button>
          <button
            onClick={async () => { await switchToTab('settings'); window.close(); }}
            className="flex items-center gap-1 px-2 py-1 hover:bg-background-tertiary rounded"
            aria-label="Settings"
            title="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            onClick={async () => { await switchToTab('docs'); window.close(); }}
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
            {services.filter(s => s.enabled && !s.archived).map(service => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`bg-background-secondary rounded-lg p-4 shadow-md hover:shadow-lg transition-all border-2 cursor-pointer ${
                  selectedServiceId === service.id
                    ? 'border-accent-primary bg-accent-primary bg-opacity-10'
                    : 'border-transparent hover:border-accent-primary hover:border-opacity-50'
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
                    {selectedServiceId === service.id && (
                      <p className="text-xs text-accent-primary font-medium mt-1">
                        ✓ Selected
                      </p>
                    )}
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
                      title={`Open ${service.name} in a new tab`}
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
                      title={`Open ${service.name} in the side panel`}
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

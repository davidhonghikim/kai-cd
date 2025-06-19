import React, { useState, useEffect } from 'react';
import { useServiceStore, type Service } from '../store/serviceStore';
import toast, { Toaster } from 'react-hot-toast';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { switchToPanel, switchToTab } from '../store/viewStateStore';
import { allServiceDefinitions } from '../connectors/definitions/all';

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
    
    // This is a rough check. A more robust solution would be to store the active service ID
    // in the viewStateStore and check that. For now, we assume if ANY service tab is open,
    // we should just switch the service in it. A better check would be needed for multi-tab support.
    let serviceTab = tabs[0]; 

    // Determine if the service has an external UI
    const serviceDefinition = allServiceDefinitions.find(def => def.type === service.type);
    const hasExternalUi = serviceDefinition?.hasExternalUi || false;

    if (hasExternalUi) {
      if (serviceTab) {
        // If a tab exists, just update its service and focus it
        setSelectedServiceId(service.id);
        await chrome.tabs.update(serviceTab.id!, { active: true });
        await chrome.windows.update(serviceTab.windowId, { focused: true });
      } else {
        // Otherwise, create a new tab
        await switchToTab(service);
      }
    } else {
      // For internal UIs (like chat), always switch to panel
      await switchToPanel(service);
    }
     window.close(); // Close the popup
  };

  const openViewInTab = (view: 'service-manager' | 'settings' | 'docs') => {
    const url = view === 'docs' ? 'docs.html' : `tab.html?view=${view}`;
    chrome.tabs.create({ url });
  };

  const openServicePanel = async (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    if (currentTab.id) {
      await chrome.sidePanel.setOptions({
        tabId: currentTab.id,
        path: 'sidepanel.html',
        enabled: true,
      });
      await chrome.sidePanel.open({ tabId: currentTab.id });
      setIsPanelOpen(true);
    }
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
    <div className="w-[420px] text-sm font-sans select-none">
      <Toaster
        toastOptions={{
          className: 'dark:bg-slate-700 dark:text-white',
        }}
      />
      <header className="flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-t-md">
        <div className="flex items-center gap-2">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="font-semibold">Kai-CD</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePanel}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
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
            onClick={() => openViewInTab('service-manager')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
            aria-label="Service Manager"
            title="Service Manager"
          >
            <WrenchScrewdriverIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openViewInTab('settings')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
            aria-label="Settings"
            title="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openViewInTab('docs')}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
            aria-label="Documentation"
            title="Documentation"
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3 space-y-3">
        {services.length > 0 ? (
          <ul className="grid gap-3">
            {services.map(service => (
              <li
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`bg-white dark:bg-slate-800 border-l-4 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedServiceId === service.id
                    ? 'border-cyan-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {service.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {service.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        switchToTab(service);
                        window.close();
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      Tab
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        switchToPanel(service);
                        window.close();
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-slate-600 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      Panel
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-slate-500">No services configured.</p>
        )}
      </main>
    </div>
  );
};

export default Popup;
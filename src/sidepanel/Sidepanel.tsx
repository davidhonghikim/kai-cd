import React from 'react';
import { useServiceStore, type Service } from '../store/serviceStore';

import CapabilityUI from '../components/CapabilityUI';
import ServiceSelector from '../components/ServiceSelector';
import { CubeTransparentIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { switchToTab } from '../store/viewStateStore';
import type { TabView } from '../store/viewStateStore';
import type { ServiceCapability } from '../types';

const getPrimaryCapability = (service: Service | undefined): TabView => {
    if (!service) return 'chat';
    if (service.capabilities.some((c: ServiceCapability) => c.capability === 'llm_chat')) return 'chat';
    if (service.capabilities.some((c: ServiceCapability) => c.capability === 'image_generation')) return 'image';
    return 'chat'; // Fallback
}

const Sidepanel: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId } = useServiceStore();
  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {selectedService ? (
        <>
          <header className="flex-shrink-0 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{selectedService.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {selectedService.type.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                onClick={async () => await switchToTab(selectedService)}
                className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                title="Open in new tab"
                >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={async () => {
                        try {
                            const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
                            if (currentTab?.id) {
                                await chrome.sidePanel.setOptions({ tabId: currentTab.id, enabled: false });
                                // Also close the panel window if possible
                                window.close();
                            }
                        } catch (error) {
                            console.error('Failed to close side panel:', error);
                            // Fallback: try to close the window
                            window.close();
                        }
                    }}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    title="Close Panel"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
          </header>
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <ServiceSelector
                services={services}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
                activeView={getPrimaryCapability(selectedService)}
            />
          </div>
          <main className="flex-1 overflow-y-auto">
            <CapabilityUI service={selectedService} />
          </main>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <CubeTransparentIcon className="w-16 h-16 mb-4" />
          <h2 className="text-lg font-semibold">No Service Selected</h2>
          <p className="text-sm">Select a service from the popup to begin.</p>
        </div>
      )}
    </div>
  );
};

export default Sidepanel; 
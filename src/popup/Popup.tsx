import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ServiceSelector from '../components/ServiceSelector';
import CapabilityUI from '../components/CapabilityUI';
import ImageGalleryView from '../components/ImageGalleryView';
import SettingsView from '../components/SettingsView';
import { useServiceStore } from '../store/serviceStore';

type Tab = 'services' | 'gallery' | 'settings';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const { selectedService } = useServiceStore();

  return (
    <div className="w-[800px] h-[600px] flex flex-col bg-gray-800 text-white">
      <Toaster />
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b border-gray-700">
        <h1 className="text-lg font-bold">Kai-CD</h1>
        {/* Placeholder for settings/status icons */}
        <div></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Service Selection */}
        <aside className="w-1/4 p-2 overflow-y-auto bg-gray-900 border-r border-gray-700">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'services' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'gallery' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </nav>
          {activeTab === 'services' && (
            <div className="mt-4">
              <h2 className="mb-2 text-md font-semibold">Service Instances</h2>
              <ServiceSelector />
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'services' && (
            <div className="p-4">
              {selectedService ? (
                <CapabilityUI />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Select a service to begin.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'gallery' && <ImageGalleryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Popup;
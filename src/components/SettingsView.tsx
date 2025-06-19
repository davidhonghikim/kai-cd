import React from 'react';
import ServiceManagement from './ServiceManagement';
import ImportExportButtons from './ImportExportButtons';

const SettingsView: React.FC = () => {
  return (
    <div className="p-6 bg-background-primary text-text-primary h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b border-border-primary pb-2">Data Management</h2>
          <p className="text-text-secondary mb-4 text-sm">
            Export all your services and settings to a JSON file. You can import this file on another device or browser to restore your configuration.
          </p>
          <ImportExportButtons />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 border-b border-border-primary pb-2">Service Management</h2>
          <ServiceManagement />
        </div>
      </div>
    </div>
  );
};

export default SettingsView; 
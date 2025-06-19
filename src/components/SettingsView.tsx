import React from 'react';
import ServiceManagement from './ServiceManagement';

const SettingsView: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900 text-white h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <ServiceManagement />
    </div>
  );
};

export default SettingsView; 
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

export interface ExportOptions {
  includeServices: boolean;
  includeVault: boolean;
  includeSettings: boolean;
  includeLogs: boolean;
  includeThemes: boolean;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [options, setOptions] = useState<ExportOptions>({
    includeServices: true,
    includeVault: true,
    includeSettings: true,
    includeLogs: false,
    includeThemes: true,
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleExportClick = () => {
    onExport(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-100">Export Configuration</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Select the data you want to include in the backup file.
        </p>
        <div className="space-y-4">
          <Checkbox name="includeServices" label="Services & Connections" checked={options.includeServices} onChange={handleCheckboxChange} />
          <Checkbox name="includeVault" label="Credentials Vault (Encrypted)" checked={options.includeVault} onChange={handleCheckboxChange} />
          <Checkbox name="includeSettings" label="Application Settings" checked={options.includeSettings} onChange={handleCheckboxChange} />
          <Checkbox name="includeThemes" label="Custom Themes" checked={options.includeThemes} onChange={handleCheckboxChange} />
          <Checkbox name="includeLogs" label="Console Logs" checked={options.includeLogs} onChange={handleCheckboxChange} />
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={handleExportClick}
            className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Export File
          </button>
        </div>
      </div>
    </div>
  );
};

const Checkbox: React.FC<{name: keyof ExportOptions, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = 
({ name, label, checked, onChange }) => (
    <label className="flex items-center space-x-3 p-3 rounded-md bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
      />
      <span className="text-slate-200">{label}</span>
    </label>
);

export default ExportModal; 
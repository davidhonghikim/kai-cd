import React, { useRef, useState } from 'react';
import { exportData, importData } from '../utils/backupManager';
import toast from 'react-hot-toast';
import ExportModal, { type ExportOptions } from './ExportModal';

const ImportExportButtons: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = async (options: ExportOptions) => {
    try {
      await exportData(options);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Are you sure you want to import this file? This will overwrite your current settings and services.')) {
      return;
    }

    try {
      await importData(file);
      toast.success('Data imported successfully! The app will now reload.');
      // Optionally, reload the extension or app to apply all settings
       setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2 text-sm rounded-md bg-slate-600 text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          title="Export services and settings to a file"
        >
          Export
        </button>
        <button
          onClick={handleImportClick}
          className="px-4 py-2 text-sm rounded-md bg-slate-600 text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          title="Import services and settings from a file"
        >
          Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".json"
        />
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </>
  );
};

export default ImportExportButtons; 
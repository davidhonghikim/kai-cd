import React from 'react';
import ImportExportButtons from './ImportExportButtons';

const DataManagement: React.FC = () => {
    return (
        <div className="p-4 md:p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Data Management</h3>
            <div className="bg-slate-800 p-6 rounded-lg max-w-2xl">
                <p className="text-slate-300 mb-4 text-sm">
                    Export all your services and settings to a JSON file. You can import this file on another device or browser to restore your configuration.
                </p>
                <ImportExportButtons />
            </div>
        </div>
    );
};

export default DataManagement; 
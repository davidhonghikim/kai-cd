import React, { useState } from 'react';
import { CloudIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, ArrowDownOnSquareStackIcon } from '@heroicons/react/24/outline';
import ServiceManagement from './ServiceManagement';
import DataManagement from './DataManagement';

// Placeholder for future components
const PlaceholderManager: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-4 md:p-6 text-slate-400">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">{title}</h2>
        <p>This feature is coming soon.</p>
    </div>
);

const SettingsView: React.FC = () => {
    const [activeManager, setActiveManager] = useState('Services');

    const navItems = [
        { name: 'Services', icon: CloudIcon, component: <ServiceManagement /> },
        { name: 'Data', icon: ArrowDownOnSquareStackIcon, component: <DataManagement /> },
        { name: 'Prompts', icon: ClipboardDocumentListIcon, component: <PlaceholderManager title="Prompt Manager" /> },
        { name: 'Artifacts', icon: ArchiveBoxIcon, component: <PlaceholderManager title="Artifact Manager" /> },
    ];

    const renderContent = () => {
        const activeItem = navItems.find(item => item.name === activeManager);
        return activeItem ? activeItem.component : <div>Select a category</div>;
    };

    return (
        <div className="flex h-full bg-slate-900 text-slate-200">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950 flex flex-col p-4 border-r border-slate-800">
                <h1 className="text-xl font-bold mb-6 px-2">Settings</h1>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveManager(item.name)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeManager === item.name 
                                ? 'bg-cyan-600 text-white' 
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsView; 
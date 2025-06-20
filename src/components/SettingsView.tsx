import React from 'react';
import DataManagement from './DataManagement';
import BugReportView from './BugReportView';
import StorageManagement from './StorageManagement';
import ThemeCustomizer from './ThemeCustomizer';
import { useSettingsStore, type LogLevel } from '../store/settingsStore';
import { type ThemePreference } from '../types/theme';
import useVaultStore, { type AutoLockTimeout } from '../store/vaultStore';

const SettingsView: React.FC = () => {
    const { theme, setTheme, logLevel, setLogLevel } = useSettingsStore();
    const { autoLockTimeout, setAutoLockTimeout } = useVaultStore();

    const handleThemeChange = (themeId: ThemePreference) => {
        setTheme(themeId);
    };

    return (
        <div className="p-4 md:p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>
            <div className="space-y-8 max-w-4xl mx-auto">
                
                {/* Theme Customization */}
                <ThemeCustomizer onThemeChange={handleThemeChange} />

                <div className="p-4 md:p-6">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Application Settings</h3>
                    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="loglevel-selector" className="text-slate-300 text-sm">Log Level</label>
                            <select
                                id="loglevel-selector"
                                value={logLevel}
                                onChange={(e) => setLogLevel(e.target.value as LogLevel)}
                                className="bg-slate-700 text-slate-100 rounded px-3 py-1 text-sm"
                            >
                                <option value="DEBUG">Debug</option>
                                <option value="INFO">Info</option>
                                <option value="WARN">Warn</option>
                                <option value="ERROR">Error</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 md:p-6">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">Vault Security</h3>
                    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="autolock-selector" className="text-slate-300 text-sm">Auto-Lock Timeout</label>
                                <p className="text-xs text-slate-500 mt-1">Automatically lock the vault after period of inactivity</p>
                            </div>
                            <select
                                id="autolock-selector"
                                value={autoLockTimeout}
                                onChange={(e) => setAutoLockTimeout(Number(e.target.value) as AutoLockTimeout)}
                                className="bg-slate-700 text-slate-100 rounded px-3 py-1 text-sm"
                            >
                                <option value={0}>Disabled</option>
                                <option value={5}>5 minutes</option>
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                            </select>
                        </div>
                    </div>
                </div>
                <StorageManagement />
                <DataManagement />
                <BugReportView />
            </div>
        </div>
    );
};

export default SettingsView; 
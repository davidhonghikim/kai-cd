import { useLogStore } from '../store/logStore';
import { useServiceStore, type Service } from '../store/serviceStore';
import { useSettingsStore } from '../store/settingsStore';

const sanitizeService = (service: Service) => {
    // Remove sensitive or overly verbose fields
    const { authentication, history: _history, ...rest } = service;
    const sanitizedAuth = { type: authentication.type }; // Only show auth type
    return { ...rest, authentication: sanitizedAuth };
};

const getSystemInfo = () => {
    return `
### System Information
- **Browser:** ${navigator.userAgent}
- **Platform:** ${navigator.platform}
- **CPU Cores:** ${navigator.hardwareConcurrency}
    `.trim();
};

const getExtensionInfo = () => {
    const manifest = chrome.runtime.getManifest();
    return `
### Extension Information
- **Version:** ${manifest.version}
- **Name:** ${manifest.name}
    `.trim();
};

const getSettings = () => {
    const { logLevel } = useSettingsStore.getState();
    const { services } = useServiceStore.getState();
    const sanitizedServices = services.map(sanitizeService);
    
    return `
### Application Settings & Services
- **Log Level:** ${logLevel}
- **Services:**
\`\`\`json
${JSON.stringify(sanitizedServices, null, 2)}
\`\`\`
    `.trim();
};

const getLogs = () => {
    const { logs } = useLogStore.getState();
    return `
### Console Logs
\`\`\`json
${JSON.stringify(logs, null, 2)}
\`\`\`
    `.trim();
};


export const generateBugReport = async (
    options: Record<string, boolean>, 
    description: string
): Promise<string> => {
    let report = `## Bug Report\n\n`;
    report += `**Description:**\n${description}\n\n---\n`;
    
    if (options.systemInfo) {
        report += `${getSystemInfo()}\n\n`;
    }
    if (options.extensionInfo) {
        report += `${getExtensionInfo()}\n\n`;
    }
    if (options.settings) {
        report += `${getSettings()}\n\n`;
    }
    if (options.logs) {
        report += `${getLogs()}\n\n`;
    }

    return report;
}; 
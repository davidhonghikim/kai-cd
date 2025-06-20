import { useServiceStore } from '../store/serviceStore';
import { useSettingsStore } from '../store/settingsStore';
import { useLogStore } from '../store/logStore';
import useVaultStore from '../store/vaultStore';
import { type ExportOptions } from '../components/ExportModal';
import themeManager from './themeManager';

const KAI_CD_BACKUP_VERSION = "1.0";

/**
 * Exports user data to a JSON file based on selected options.
 */
export const exportData = async (options: ExportOptions) => {
  // 1. Gather data from stores
  const backupData: Record<string, any> = {
    version: KAI_CD_BACKUP_VERSION,
    metadata: {
      exportDate: new Date().toISOString(),
      source: `kai-cd-v${import.meta.env.PACKAGE_VERSION || '0.0.0'}`
    },
    data: {}
  };

  if (options.includeServices) {
    backupData.data.services = useServiceStore.getState().services;
  }
  if (options.includeVault) {
    backupData.data.vault = useVaultStore.getState().encryptedVault;
  }
  if (options.includeSettings) {
    const { theme, logLevel } = useSettingsStore.getState();
    backupData.data.settings = { theme, logLevel };
  }
  if (options.includeThemes) {
    await themeManager.initialize();
    const customThemes = themeManager.getAllThemes().filter(t => !t.isBuiltIn);
    backupData.data.themes = customThemes;
  }
  if (options.includeLogs) {
    backupData.data.logs = useLogStore.getState().logs;
  }

  // 2. Trigger download
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kai-cd-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Imports user data from a JSON file.
 * @param file The JSON file to import.
 */
export const importData = async (file: File) => {
  // 1. Read and parse the file
  const fileContent = await file.text();
  const backupData = JSON.parse(fileContent);

  // 2. Validate version (basic check)
  if (!backupData.version || backupData.version !== KAI_CD_BACKUP_VERSION) {
    throw new Error(`Invalid or unsupported backup version. Expected ${KAI_CD_BACKUP_VERSION}.`);
  }

  // 3. Import data into stores
  const { services, settings, logs, vault, themes } = backupData.data;

  if (services) {
    useServiceStore.getState().setServices(services);
  }
  if (vault) {
    // This requires the user to re-enter their password to decrypt and use the vault.
    useVaultStore.getState().lock();
    useVaultStore.setState({ encryptedVault: vault, status: 'LOCKED' });
  }
  if (logs) {
    useLogStore.getState().setLogs(logs);
  }

  if (settings && settings.theme) {
    useSettingsStore.getState().setTheme(settings.theme);
  }
  if (settings && settings.logLevel) {
    useSettingsStore.getState().setLogLevel(settings.logLevel);
  }

  if (themes && Array.isArray(themes)) {
    await themeManager.initialize();
    for (const theme of themes) {
      try {
        await themeManager.saveTheme(theme);
      } catch (error) {
        console.error('Failed to import theme:', theme.name, error);
      }
    }
  }
}; 
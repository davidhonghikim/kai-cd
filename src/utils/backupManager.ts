import { useServiceStore } from '../store/serviceStore';
import { useThemeStore } from '../store/themeStore';

const KAI_CD_BACKUP_VERSION = "1.0";

/**
 * Exports all user data to a JSON file.
 */
export const exportData = () => {
  // Placeholder for implementation
  console.log("Exporting data...");

  // 1. Gather data from stores
  const services = useServiceStore.getState().services;
  const theme = useThemeStore.getState().theme;
  
  // 2. Construct the backup object
  const backupData = {
    version: KAI_CD_BACKUP_VERSION,
    metadata: {
      exportDate: new Date().toISOString(),
      source: `kai-cd-v${process.env.PACKAGE_VERSION || '0.0.0'}`
    },
    data: {
      services: services,
      settings: {
        theme: theme,
      },
      history: {}, // Future-proofing
    }
  };

  // 3. Trigger download
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
  // Placeholder for implementation
  console.log("Importing data from", file.name);

  // 1. Read and parse the file
  const fileContent = await file.text();
  const backupData = JSON.parse(fileContent);

  // 2. Validate version (basic check)
  if (!backupData.version || backupData.version !== KAI_CD_BACKUP_VERSION) {
    throw new Error(`Invalid or unsupported backup version. Expected ${KAI_CD_BACKUP_VERSION}.`);
  }

  // 3. Import data into stores (add confirmation logic in the UI)
  const { services, settings } = backupData.data;

  if (services) {
    useServiceStore.getState().setServices(services);
  }

  if (settings && settings.theme) {
    useThemeStore.getState().setTheme(settings.theme);
  }
}; 
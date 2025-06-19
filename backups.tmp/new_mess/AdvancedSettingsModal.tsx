import React, { Suspense, useState, useEffect } from 'react';
import { SETTINGS_SCHEMA } from '../../config/settingsSchema';
import { exportSettingsOnlyWithEndpoints, importSettingsOnly, exportAllSettingsAndServers, importAllSettingsAndServers, SETTINGS_KEY } from '../../utils/settingsIO';
import { storageManager } from '../../storage/storageManager';
import styles from './AdvancedSettings.module.css';

const sectionNames = Array.from(new Set(SETTINGS_SCHEMA.map(s => s.section)));

interface SectionProps {
  onUpdate: (settings: Record<string, any>) => void;
}

const sectionComponents: Record<string, React.LazyExoticComponent<React.ComponentType<SectionProps>>> = {};
sectionNames.forEach(section => {
  if (section === 'ServerManager') {
    sectionComponents[section] = React.lazy(() => import('./sections/ServerManagerSection'));
  } else {
    sectionComponents[section] = React.lazy(() => import(`./sections/${section}SettingsSection`));
  }
});

interface AdvancedSettingsModalProps {
  show: boolean;
  onClose: () => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ show, onClose }) => {
  const [activeSection, setActiveSection] = useState(sectionNames[0]);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (show) {
      loadSettings();
    }
  }, [show]);

  const loadSettings = async () => {
    const loadedSettings = await storageManager.get(SETTINGS_KEY, {});
    setSettings(loadedSettings);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleSettingsUpdate = async (newSettings: Record<string, any>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await storageManager.set(SETTINGS_KEY, updatedSettings);
    setSettings(updatedSettings);
  };

  const handleImportSettings = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importSettingsOnly(file);
          await loadSettings();
        } catch (err) {
          console.error('Failed to import settings:', err);
        }
      }
    };
    input.click();
  };

  const handleImportAll = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importAllSettingsAndServers(file);
          await loadSettings();
        } catch (err) {
          console.error('Failed to import all:', err);
        }
      }
    };
    input.click();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Advanced Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.sidebar}>
            {sectionNames.map(section => {
              const sectionConfig = SETTINGS_SCHEMA.find(s => s.section === section);
              return (
                <button
                  key={section}
                  className={`${styles.sidebarButton} ${activeSection === section ? styles.active : ''}`}
                  onClick={() => handleSectionChange(section)}
                >
                  {sectionConfig?.icon && (
                    <span className={styles.icon}>{sectionConfig.icon}</span>
                  )}
                  {sectionConfig?.title || section}
                </button>
              );
            })}
          </div>

          <div className={styles.content}>
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
              {React.createElement(sectionComponents[activeSection], {
                onUpdate: handleSettingsUpdate
              })}
            </Suspense>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.importExport}>
            <button onClick={() => exportSettingsOnlyWithEndpoints()}>Export Settings</button>
            <button onClick={handleImportSettings}>Import Settings</button>
            <button onClick={() => exportAllSettingsAndServers()}>Export All</button>
            <button onClick={handleImportAll}>Import All</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal; 
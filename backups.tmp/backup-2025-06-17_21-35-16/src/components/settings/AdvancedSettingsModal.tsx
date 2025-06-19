import React, { Suspense, useState, useEffect } from 'react';
import { SETTINGS_SCHEMA } from '../../config/settingsSchema';
import { exportSettingsOnlyWithEndpoints, importSettingsOnly, exportAllSettingsAndServers, importAllSettingsAndServers, SETTINGS_KEY } from '../../utils/settingsIO';
import { storageManager } from '../../storage/storageManager';
import styles from './AdvancedSettings.module.css';

const sectionNames = Array.from(new Set(SETTINGS_SCHEMA.map(s => s.section)));

const sectionComponents: Record<string, React.LazyExoticComponent<any>> = {};
sectionNames.forEach(section => {
  sectionComponents[section] = React.lazy(() => import(`./sections/${section}SettingsSection.tsx`));
});

const getDefaultSettings = () => {
  const defaults: Record<string, any> = {};
  for (const s of SETTINGS_SCHEMA) defaults[s.key] = s.default;
  return defaults;
};

const AdvancedSettingsModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState(sectionNames[0]);
  const [editing, setEditing] = useState<Record<string, any>>(getDefaultSettings());
  const [original, setOriginal] = useState<Record<string, any>>(getDefaultSettings());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    storageManager.get(SETTINGS_KEY, {}).then(stored => {
      setEditing({ ...getDefaultSettings(), ...stored });
      setOriginal({ ...getDefaultSettings(), ...stored });
    });
  }, []);

  const handleImportSettings = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await importSettingsOnly(file);
        alert('Settings imported successfully!');
        const stored = await storageManager.get(SETTINGS_KEY, {});
        setEditing({ ...getDefaultSettings(), ...stored });
        setOriginal({ ...getDefaultSettings(), ...stored });
      } catch (err) {
        alert('Import failed: ' + (err instanceof Error ? err.message : err));
      }
    };
    input.click();
  };
  const handleExportSettings = () => {
    exportSettingsOnlyWithEndpoints();
  };
  const handleImportAll = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await importAllSettingsAndServers(file);
        alert('Settings and servers imported successfully!');
        const stored = await storageManager.get(SETTINGS_KEY, {});
        setEditing({ ...getDefaultSettings(), ...stored });
        setOriginal({ ...getDefaultSettings(), ...stored });
      } catch (err) {
        alert('Import failed: ' + (err instanceof Error ? err.message : err));
      }
    };
    input.click();
  };
  const handleExportAll = () => {
    exportAllSettingsAndServers();
  };

  const handleSave = async () => {
    await storageManager.set(SETTINGS_KEY, editing);
    setOriginal(editing);
    alert('Settings saved!');
  };
  const handleReset = () => {
    setEditing(getDefaultSettings());
  };
  const handleCancel = () => {
    setEditing(original);
  };

  const SectionComponent = sectionComponents[activeSection];

  return (
    <div className={styles.advancedSettingsModal}>
      <aside className={styles.sidebar} aria-label="Settings Sections">
        <nav>
          <ul className={styles.sectionList}>
            {sectionNames.map(section => (
              <li key={section}>
                <button
                  className={activeSection === section ? styles.activeSection : ''}
                  onClick={() => setActiveSection(section)}
                  aria-current={activeSection === section ? 'page' : undefined}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <hr className={styles.sidebarDivider} />
        <div className={styles.sidebarActions}>
          <button onClick={handleImportSettings} aria-label="Import Settings">Import Settings</button>
          <button onClick={handleExportSettings} aria-label="Export Settings">Export Settings</button>
          <button className={styles.powerUserToggle} style={{ fontSize: 12, opacity: 0.7 }} onClick={() => setShowAll(v => !v)}>
            {showAll ? 'Hide Power User Options' : 'Show Power User Options'}
          </button>
          {showAll && <>
            <button onClick={handleImportAll} aria-label="Import All">Import All (Settings + Servers)</button>
            <button onClick={handleExportAll} aria-label="Export All">Export All (Settings + Servers)</button>
          </>}
        </div>
      </aside>
      <main className={styles.settingsContent}>
        <Suspense fallback={<div>Loading...</div>}>
          {SectionComponent ? (
            React.createElement(SectionComponent as React.ComponentType<{ editing: Record<string, any>; setEditing: (v: Record<string, any>) => void }>, { editing, setEditing })
          ) : (
            <div>No section selected</div>
          )}
        </Suspense>
        <div className={styles.buttonRow}>
          <button onClick={handleSave} className={styles.primaryButton} aria-label="Save Settings">Save</button>
          <button onClick={handleReset} className={styles.secondaryButton} aria-label="Reset Settings">Reset</button>
          <button onClick={handleCancel} className={styles.secondaryButton} aria-label="Cancel Changes">Cancel</button>
        </div>
      </main>
    </div>
  );
};

export default AdvancedSettingsModal; 
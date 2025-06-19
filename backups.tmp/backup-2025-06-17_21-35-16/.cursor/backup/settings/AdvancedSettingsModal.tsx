import React, { Suspense, useState, useEffect } from 'react';
import { SETTINGS_SCHEMA } from '../../config/settingsSchema';
import { exportAllSettingsAndServers, importAllSettingsAndServers, SETTINGS_KEY } from '../../utils/settingsIO';
import { storageManager } from '../../storage/storageManager';

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

  useEffect(() => {
    storageManager.get(SETTINGS_KEY, {}).then(stored => {
      setEditing({ ...getDefaultSettings(), ...stored });
      setOriginal({ ...getDefaultSettings(), ...stored });
    });
  }, []);

  const handleImport = async () => {
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
  const handleExport = () => {
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
    <div className="advanced-settings-modal">
      <div className="settings-sidebar">
        {sectionNames.map(section => (
          <button key={section} onClick={() => setActiveSection(section)}>{section}</button>
        ))}
        <hr />
        <button onClick={handleImport}>Import Settings</button>
        <button onClick={handleExport}>Export Settings</button>
      </div>
      <div className="settings-content">
        <Suspense fallback={<div>Loading...</div>}>
          {SectionComponent ? (
            React.createElement(SectionComponent as React.ComponentType<{ editing: Record<string, any>; setEditing: (v: Record<string, any>) => void }>, { editing, setEditing })
          ) : (
            <div>No section selected</div>
          )}
        </Suspense>
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button onClick={handleSave} className="primaryButton">Save</button>
          <button onClick={handleReset} className="secondaryButton">Reset</button>
          <button onClick={handleCancel} className="secondaryButton">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal; 
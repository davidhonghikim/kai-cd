import React, { useState, useEffect } from 'react';
import { SETTINGS_SCHEMA } from '../../../config/settingsSchema';
import { storageManager } from '../../../storage/storageManager';
import styles from './NetworkSettingsSection.module.css';

interface NetworkSettingsSectionProps {
  onUpdate: (settings: Record<string, any>) => void;
}

interface SettingOption {
  value: string;
  label: string;
}

const NetworkSettingsSection: React.FC<NetworkSettingsSectionProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await storageManager.get<Record<string, any>>('settings', {});
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (key: string, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await storageManager.set('settings', newSettings);
      setSettings(newSettings);
      onUpdate(newSettings);
    } catch (err) {
      setError('Failed to save setting');
      console.error('Error saving setting:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={loadSettings}>Retry</button>
      </div>
    );
  }

  const networkSettings = SETTINGS_SCHEMA.filter(setting => 
    setting.type !== 'section' && setting.category === 'network'
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Network Settings</h3>
      </div>

      <div className={styles.settingsList}>
        {networkSettings.map(setting => (
          <div key={setting.key} className={styles.settingGroup}>
            <label htmlFor={setting.key}>{setting.label}</label>
            {setting.type === 'text' && (
              <input
                type="text"
                id={setting.key}
                value={settings[setting.key] || ''}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                placeholder={setting.placeholder}
              />
            )}
            {setting.type === 'number' && (
              <input
                type="number"
                id={setting.key}
                value={settings[setting.key] || 0}
                onChange={(e) => handleChange(setting.key, Number(e.target.value))}
                min={setting.min as number}
                max={setting.max as number}
                step={setting.step as number}
              />
            )}
            {setting.type === 'boolean' && (
              <input
                type="checkbox"
                id={setting.key}
                checked={settings[setting.key] || false}
                onChange={(e) => handleChange(setting.key, e.target.checked)}
              />
            )}
            {setting.type === 'select' && (
              <select
                id={setting.key}
                value={settings[setting.key] || ''}
                onChange={(e) => handleChange(setting.key, e.target.value)}
              >
                {(setting.options as SettingOption[]).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {setting.description && (
              <p className={styles.settingDescription}>{setting.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkSettingsSection; 
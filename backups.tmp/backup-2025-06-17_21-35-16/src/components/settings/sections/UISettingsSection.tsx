import React from 'react';
import { SETTINGS_SCHEMA } from '../../../config/settingsSchema';
import styles from './UISettingsSection.module.css';

const uiSettings = SETTINGS_SCHEMA.filter(s => s.section === 'UI');

interface SectionProps {
  editing: Record<string, any>;
  setEditing: (v: Record<string, any>) => void;
}

const UISettingsSection: React.FC<SectionProps> = ({ editing, setEditing }) => {
  const handleChange = (key: string, value: any) => {
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>UI Settings</h2>
      {uiSettings.map(setting => (
        <div key={setting.key} className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <span className={styles.settingName}>{setting.label}</span>
            <span className={styles.settingDescription}>{setting.description}</span>
          </label>
          
          {setting.type === 'select' && setting.options && (
            <select 
              className={styles.select}
              value={editing[setting.key] ?? setting.default} 
              onChange={e => handleChange(setting.key, e.target.value)}
            >
              {setting.options.map(opt => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          )}
          
          {setting.type === 'string' && (
            <input 
              type="text" 
              className={styles.input}
              value={editing[setting.key] ?? setting.default} 
              onChange={e => handleChange(setting.key, e.target.value)} 
            />
          )}
          
          {setting.type === 'number' && (
            <input 
              type="number" 
              className={styles.input}
              value={editing[setting.key] ?? setting.default} 
              onChange={e => handleChange(setting.key, Number(e.target.value))} 
            />
          )}
          
          {setting.type === 'boolean' && (
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={editing[setting.key] ?? setting.default} 
                onChange={e => handleChange(setting.key, e.target.checked)} 
              />
              <span className={styles.slider}></span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
};

export default UISettingsSection; 
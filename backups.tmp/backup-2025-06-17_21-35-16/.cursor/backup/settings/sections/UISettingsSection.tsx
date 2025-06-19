import React from 'react';
import { SETTINGS_SCHEMA } from '../../../config/settingsSchema';

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
    <div>
      <h2>UI Settings</h2>
      {uiSettings.map(setting => (
        <div key={setting.key} style={{ marginBottom: 16 }}>
          <label><b>{setting.label}</b></label>
          <div>{setting.description}</div>
          {setting.type === 'select' && setting.options && (
            <select value={editing[setting.key] ?? setting.default} onChange={e => handleChange(setting.key, e.target.value)}>
              {setting.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {setting.type === 'string' && (
            <input type="text" value={editing[setting.key] ?? setting.default} onChange={e => handleChange(setting.key, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
};
export default UISettingsSection; 
import React from 'react';
import { SETTINGS_SCHEMA } from '../../../config/settingsSchema';

const networkSettings = SETTINGS_SCHEMA.filter(s => s.section === 'Network');

interface SectionProps {
  editing: Record<string, any>;
  setEditing: (v: Record<string, any>) => void;
}

const NetworkSettingsSection: React.FC<SectionProps> = ({ editing, setEditing }) => {
  const handleChange = (key: string, value: any) => {
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div>
      <h2>Network Settings</h2>
      {networkSettings.map(setting => (
        <div key={setting.key} style={{ marginBottom: 16 }}>
          <label><b>{setting.label}</b></label>
          <div>{setting.description}</div>
          {setting.type === 'number' && (
            <input type="number" value={editing[setting.key] ?? setting.default} onChange={e => handleChange(setting.key, Number(e.target.value))} />
          )}
          {setting.type === 'json' && (
            <textarea value={JSON.stringify(editing[setting.key] ?? setting.default, null, 2)} onChange={e => {
              try {
                handleChange(setting.key, JSON.parse(e.target.value));
              } catch {}
            }} rows={4} />
          )}
          {setting.type === 'string' && (
            <input type="text" value={editing[setting.key] ?? setting.default} onChange={e => handleChange(setting.key, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
};
export default NetworkSettingsSection; 
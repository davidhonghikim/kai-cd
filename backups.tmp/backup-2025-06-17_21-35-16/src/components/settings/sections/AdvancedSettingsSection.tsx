import React from 'react';
import { SETTINGS_SCHEMA } from '../../../config/settingsSchema';

const advancedSettings = SETTINGS_SCHEMA.filter(s => s.section === 'Advanced');

interface SectionProps {
  editing: Record<string, any>;
  setEditing: (v: Record<string, any>) => void;
}

const AdvancedSettingsSection: React.FC<SectionProps> = ({ editing, setEditing }) => {
  const handleChange = (key: string, value: any) => {
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div>
      <h2>Advanced Settings</h2>
      {advancedSettings.map(setting => (
        <div key={setting.key} style={{ marginBottom: 16 }}>
          <label><b>{setting.label}</b></label>
          <div>{setting.description}</div>
          {setting.type === 'boolean' && (
            <input type="checkbox" checked={!!(editing[setting.key] ?? setting.default)} onChange={e => handleChange(setting.key, e.target.checked)} />
          )}
        </div>
      ))}
    </div>
  );
};
export default AdvancedSettingsSection; 
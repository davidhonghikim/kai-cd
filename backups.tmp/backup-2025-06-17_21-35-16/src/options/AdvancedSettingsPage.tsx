import React from 'react';
import AdvancedSettingsModal from '../components/settings/AdvancedSettingsModal';
import styles from '@/styles/components/options/Options.module.css';

const AdvancedSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className={styles.optionsPage} style={{ minHeight: '100vh', background: 'var(--background, #18181b)', color: 'var(--text, #fff)' }}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.secondaryButton}>&larr; Back</button>
        <h1>Advanced Settings</h1>
      </header>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <AdvancedSettingsModal />
      </div>
    </div>
  );
};

export default AdvancedSettingsPage; 
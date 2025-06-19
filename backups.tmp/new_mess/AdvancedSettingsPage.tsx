import React, { useState } from 'react';
import AdvancedSettingsModal from '../components/settings/AdvancedSettingsModal';
import styles from './AdvancedSettingsPage.module.css';

const AdvancedSettingsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className={styles.container}>
      <AdvancedSettingsModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AdvancedSettingsPage; 
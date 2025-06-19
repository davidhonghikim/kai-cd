import React, { useState } from 'react';
import { Service } from '@/types';
import { SERVICE_CATEGORIES, SERVICE_TYPES } from '@/config/constants';
import { IframeView } from './IframeView';
import A1111View from '@/views/A1111View';
import ComfyUIView from '@/views/ComfyUIView';
import styles from '@/styles/components/ViewRouter.module.css';

export interface ViewRouterProps {
  service: Service;
  onClose: () => void;
}

export const ViewRouter: React.FC<ViewRouterProps> = ({ service, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    // Implement refresh logic if needed
  };

  const renderView = () => {
    const category = service.category;

    if (category === SERVICE_CATEGORIES.IMAGE_GENERATION) {
      if (service.type === SERVICE_TYPES.A1111) {
        return <A1111View service={service} />;
      } else if (service.type === SERVICE_TYPES.COMFY_UI) {
        return <ComfyUIView service={service} />;
      }
    }

    return (
      <IframeView
        url={service.url}
        onClose={onClose}
        onFullscreen={handleFullscreen}
        onRefresh={handleRefresh}
        isFullscreen={isFullscreen}
      />
    );
  };

  return (
    <div className={styles.container}>
      {renderView()}
    </div>
  );
};

export default ViewRouter;

import React, { useState } from 'react';
import styles from '@/styles/components/IframeView.module.css';

interface IframeViewProps {
  url: string;
  onClose: () => void;
  onFullscreen?: () => void;
  onRefresh?: () => void;
  isFullscreen?: boolean;
}

export const IframeView: React.FC<IframeViewProps> = ({
  url,
  onClose,
  onFullscreen,
  onRefresh,
  isFullscreen = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>Service View</div>
        <div className={styles.controls}>
          {onFullscreen && (
            <button onClick={onFullscreen} className={styles.button}>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          )}
          {onRefresh && (
            <button onClick={onRefresh} className={styles.button}>
              Refresh
            </button>
          )}
          <button onClick={onClose} className={styles.button}>
            Close
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <div>Loading...</div>
          </div>
        )}

        {hasError && (
          <div className={styles.errorOverlay}>
            <div>Failed to load content</div>
            <button onClick={onRefresh} className={styles.button}>
              Retry
            </button>
          </div>
        )}

        <iframe
          src={url}
          className={styles.iframe}
          onLoad={handleLoad}
          onError={handleError}
          data-testid="service-iframe"
        />
      </div>
    </div>
  );
};

export default IframeView; 
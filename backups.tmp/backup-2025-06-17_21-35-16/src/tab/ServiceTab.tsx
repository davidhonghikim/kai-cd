import React, { useState, useEffect } from 'react';
import { Service } from '@/types';
import ViewRouter from '@/components/ViewRouter';
import { sendMessage } from '@/utils/chrome';
import styles from '@/styles/components/tab/ServiceTab.module.css';
import '@/styles/global.css';
import { connectToBackground } from '@/utils/keepAlive';

const ServiceTab: React.FC = () => {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectToBackground('tab');
  }, []);

  useEffect(() => {
    const loadService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get service ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const serviceId = urlParams.get('serviceId');

        if (!serviceId) {
          throw new Error('No service ID provided');
        }

        // Get all services
        const response = await sendMessage('getServices', null);
        if (response.success && response.data) {
          const activeService = response.data.find((s: Service) => s.id === serviceId);
          if (!activeService) {
            throw new Error(`Service with ID ${serviceId} not found`);
          }
          setService(activeService);
        } else {
          throw new Error(response.error || 'Failed to load services');
        }
      } catch (error) {
        console.error('Error loading service:', error);
        setError(error instanceof Error ? error.message : 'Failed to load service');
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No service selected</p>
          <button onClick={() => window.location.href = chrome.runtime.getURL('src/popup/index.html')}>
            Open Popup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ViewRouter service={service} onClose={() => window.close()} />
    </div>
  );
};

export default ServiceTab; 
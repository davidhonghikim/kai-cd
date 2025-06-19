import React from 'react';
import styles from '@/styles/components/ServiceAnalytics.module.css';
import { Service } from '@/types';

interface ServiceAnalyticsProps {
  service: Service;
}

interface AnalyticsData {
  requests: number;
  errors: number;
  avgResponseTime: number;
  lastUsed: string;
}

const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ service: _service }) => {
  // This would typically come from a real analytics service
  const analytics: AnalyticsData = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    lastUsed: 'Never'
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Service Analytics</h3>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Requests</span>
          <span className={styles.statValue}>{analytics.requests}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Errors</span>
          <span className={styles.statValue}>{analytics.errors}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Response Time</span>
          <span className={styles.statValue}>{analytics.avgResponseTime}ms</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Last Used</span>
          <span className={styles.statValue}>{analytics.lastUsed}</span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <p className={styles.chartPlaceholder}>Analytics charts coming soon...</p>
      </div>
    </div>
  );
};

export default ServiceAnalytics; 
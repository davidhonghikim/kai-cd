// Debug logging for service worker compatibility
console.log('[STORAGE_QUOTA] Starting storageQuotaManager module initialization...');

import { useLogStore } from '../store/logStore';
import { logger } from './logger';

console.log('[STORAGE_QUOTA] All imports completed successfully');

// Chrome storage.local quota is 10MB for unlimited storage extensions, 5MB for others
// We'll be conservative and treat it as 5MB
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; // 5MB
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const CRITICAL_THRESHOLD = 0.9; // Auto-purge at 90% usage

export interface StorageUsageInfo {
  totalBytes: number;
  quotaBytes: number;
  usagePercent: number;
  isWarning: boolean;
  isCritical: boolean;
  itemBreakdown: Record<string, number>;
}

/**
 * Get detailed storage usage information
 */
export async function getStorageUsage(): Promise<StorageUsageInfo> {
  try {
    const allItems = await chrome.storage.local.get(null);
    const itemBreakdown: Record<string, number> = {};
    let totalBytes = 0;

    for (const [key, value] of Object.entries(allItems)) {
      const itemSize = new Blob([JSON.stringify(value)]).size;
      itemBreakdown[key] = itemSize;
      totalBytes += itemSize;
    }

    const usagePercent = totalBytes / STORAGE_QUOTA_BYTES;

    return {
      totalBytes,
      quotaBytes: STORAGE_QUOTA_BYTES,
      usagePercent,
      isWarning: usagePercent >= WARNING_THRESHOLD,
      isCritical: usagePercent >= CRITICAL_THRESHOLD,
      itemBreakdown
    };
  } catch (error) {
    logger.error('Failed to get storage usage:', error);
    throw error;
  }
}

/**
 * Auto-purge logs when storage usage is critical
 */
export async function autoManageStorage(): Promise<void> {
  const usage = await getStorageUsage();
  
  if (usage.isCritical) {
    logger.warn(`Storage usage critical: ${(usage.usagePercent * 100).toFixed(1)}%. Auto-purging logs...`);
    
    // Get current logs and reduce them by 50%
    const logStore = useLogStore.getState();
    const currentLogs = logStore.logs;
    
    if (currentLogs.length > 10) {
      const keepCount = Math.floor(currentLogs.length * 0.5);
      const recentLogs = currentLogs.slice(-keepCount);
      logStore.setLogs(recentLogs);
      
      logger.info(`Auto-purged ${currentLogs.length - keepCount} log entries. Kept ${keepCount} most recent.`);
    }
    
    // Check if we're still critical after log purge
    const newUsage = await getStorageUsage();
    if (newUsage.isCritical) {
      logger.error(`Storage still critical after log purge: ${(newUsage.usagePercent * 100).toFixed(1)}%`);
    } else {
      logger.info(`Storage usage reduced to ${(newUsage.usagePercent * 100).toFixed(1)}% after auto-purge`);
    }
  } else if (usage.isWarning) {
    logger.warn(`Storage usage high: ${(usage.usagePercent * 100).toFixed(1)}%. Consider clearing old data.`);
  }
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get storage usage as percentage string
 */
export function getUsagePercentString(usage: StorageUsageInfo): string {
  return `${(usage.usagePercent * 100).toFixed(1)}%`;
}

/**
 * Manual cleanup of old log entries
 */
export async function manualLogCleanup(keepDays: number = 7): Promise<number> {
  const logStore = useLogStore.getState();
  const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
  
  const originalCount = logStore.logs.length;
  const recentLogs = logStore.logs.filter(log => log.timestamp >= cutoffTime);
  
  logStore.setLogs(recentLogs);
  
  const removedCount = originalCount - recentLogs.length;
  if (removedCount > 0) {
    logger.info(`Manual cleanup removed ${removedCount} log entries older than ${keepDays} days`);
  }
  
  return removedCount;
}

/**
 * Initialize storage monitoring - call this once at app startup
 */
export function initializeStorageMonitoring(): void {
  // Check storage on startup
  autoManageStorage().catch(error => {
    logger.error('Failed to run initial storage check:', error);
  });
  
  // Set up periodic monitoring (every 5 minutes)
  setInterval(() => {
    autoManageStorage().catch(error => {
      logger.error('Failed to run periodic storage check:', error);
    });
  }, 5 * 60 * 1000);
  
  logger.info('Storage quota monitoring initialized');
} 
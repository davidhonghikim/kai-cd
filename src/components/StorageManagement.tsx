import React, { useState, useEffect } from 'react';
import { 
  CircleStackIcon, 
  ExclamationTriangleIcon, 
  TrashIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import { 
  getStorageUsage, 
  formatBytes, 
  getUsagePercentString, 
  manualLogCleanup,
  autoManageStorage,
  type StorageUsageInfo 
} from '../utils/storageQuotaManager';
import toast from 'react-hot-toast';

const StorageManagement: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPerformingCleanup, setIsPerformingCleanup] = useState(false);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      toast.error('Failed to load storage information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const handleManualCleanup = async (days: number) => {
    setIsPerformingCleanup(true);
    try {
      const removedCount = await manualLogCleanup(days);
      toast.success(`Removed ${removedCount} old log entries`);
      await loadStorageInfo(); // Refresh storage info
    } catch (error) {
      toast.error('Failed to cleanup logs');
    } finally {
      setIsPerformingCleanup(false);
    }
  };

  const handleAutoManage = async () => {
    setIsPerformingCleanup(true);
    try {
      await autoManageStorage();
      toast.success('Auto-management completed');
      await loadStorageInfo(); // Refresh storage info
    } catch (error) {
      toast.error('Failed to run auto-management');
    } finally {
      setIsPerformingCleanup(false);
    }
  };

  const getStatusColor = (info: StorageUsageInfo) => {
    if (info.isCritical) return 'text-red-400';
    if (info.isWarning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressBarColor = (info: StorageUsageInfo) => {
    if (info.isCritical) return 'bg-red-500';
    if (info.isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="text-slate-400">Loading storage information...</div>
        </div>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-400">Failed to load storage information</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <CircleStackIcon className="h-8 w-8 text-cyan-400" />
        <h2 className="text-2xl font-bold text-slate-100">Storage Management</h2>
      </div>

      {/* Storage Overview */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Storage Usage Overview</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Current Usage:</span>
            <span className={`font-mono ${getStatusColor(storageInfo)}`}>
              {formatBytes(storageInfo.totalBytes)} / {formatBytes(storageInfo.quotaBytes)}
            </span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${getProgressBarColor(storageInfo)}`}
              style={{ width: `${Math.min(storageInfo.usagePercent * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Usage Percentage:</span>
            <span className={`font-mono ${getStatusColor(storageInfo)}`}>
              {getUsagePercentString(storageInfo)}
            </span>
          </div>

          {storageInfo.isWarning && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-200 font-medium">
                  {storageInfo.isCritical ? 'Critical Storage Usage' : 'High Storage Usage'}
                </p>
                <p className="text-yellow-300 mt-1">
                  {storageInfo.isCritical 
                    ? 'Storage is critically low. Auto-cleanup will run automatically.'
                    : 'Consider cleaning up old data to prevent storage issues.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Storage Breakdown</h3>
        
        <div className="space-y-3">
          {Object.entries(storageInfo.itemBreakdown)
            .sort(([,a], [,b]) => b - a) // Sort by size descending
            .map(([key, size]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                <span className="text-slate-300 font-medium">{key}</span>
                <span className="text-slate-400 font-mono text-sm">{formatBytes(size)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Cleanup Actions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Cleanup Actions</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p>Cleanup operations remove old log entries to free up storage space. Services, settings, and vault data are preserved.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleManualCleanup(7)}
              disabled={isPerformingCleanup}
              className="flex items-center space-x-2 p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <ClockIcon className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <div className="text-slate-200 font-medium">Clean Old Logs (7 days)</div>
                <div className="text-slate-400 text-sm">Remove logs older than 7 days</div>
              </div>
            </button>

            <button
              onClick={() => handleManualCleanup(1)}
              disabled={isPerformingCleanup}
              className="flex items-center space-x-2 p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <div className="text-slate-200 font-medium">Clean Old Logs (1 day)</div>
                <div className="text-slate-400 text-sm">Remove logs older than 1 day</div>
              </div>
            </button>

            <button
              onClick={handleAutoManage}
              disabled={isPerformingCleanup}
              className="flex items-center space-x-2 p-4 bg-cyan-700 hover:bg-cyan-600 border border-cyan-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <CircleStackIcon className="h-5 w-5 text-cyan-300" />
              <div className="text-left">
                <div className="text-cyan-100 font-medium">Run Auto-Management</div>
                <div className="text-cyan-200 text-sm">Apply automatic storage optimization</div>
              </div>
            </button>

            <button
              onClick={loadStorageInfo}
              disabled={isPerformingCleanup}
              className="flex items-center space-x-2 p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <InformationCircleIcon className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <div className="text-slate-200 font-medium">Refresh Usage Info</div>
                <div className="text-slate-400 text-sm">Update storage statistics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageManagement; 
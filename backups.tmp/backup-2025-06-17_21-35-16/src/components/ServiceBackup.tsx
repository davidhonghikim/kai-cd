import React, { useState, useEffect } from 'react';
import { Service } from '@/types';
import { ServiceBackupService } from '@/services/backup/ServiceBackupService';
import styles from '@/styles/components/ServiceBackup.module.css';

interface ServiceBackupProps {
  service: Service;
  onBackup?: (backup: any) => void;
  onRestore?: (backup: any) => void;
}

interface ServiceBackup {
  id: string;
  serviceId: string;
  timestamp: number;
  data: any;
}

const ServiceBackup: React.FC<ServiceBackupProps> = ({ service, onBackup, onRestore }) => {
  const [backups, setBackups] = useState<ServiceBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, [service.id]);

  const loadBackups = async () => {
    try {
      const serviceBackups = await ServiceBackupService.getBackups(service.id);
      setBackups(serviceBackups);
    } catch (err) {
      setError('Failed to load backups');
      console.error('Error loading backups:', err);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      const backup = await ServiceBackupService.createBackup(service.id, service);
      setBackups(prev => [...prev, backup]);
      onBackup?.(backup);
    } catch (err) {
      setError('Failed to create backup');
      console.error('Error creating backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backup: ServiceBackup) => {
    try {
      setLoading(true);
      setError(null);
      const restoredData = await ServiceBackupService.restoreBackup(backup.id);
      onRestore?.(restoredData);
    } catch (err) {
      setError('Failed to restore backup');
      console.error('Error restoring backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      setLoading(true);
      setError(null);
      await ServiceBackupService.deleteBackup(backupId);
      setBackups(prev => prev.filter(b => b.id !== backupId));
    } catch (err) {
      setError('Failed to delete backup');
      console.error('Error deleting backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      const exportPath = await ServiceBackupService.exportBackups();
      console.log('Backups exported to:', exportPath);
    } catch (err) {
      setError('Failed to export backups');
      console.error('Error exporting backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await ServiceBackupService.importBackups(file);
      await loadBackups();
    } catch (err) {
      setError('Failed to import backups');
      console.error('Error importing backups:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Service Backups</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.actions}>
        <button 
          onClick={handleCreateBackup} 
          disabled={loading}
          className={styles.button}
        >
          Create Backup
        </button>
        
        <button 
          onClick={handleExport} 
          disabled={loading}
          className={styles.button}
        >
          Export All
        </button>
        
        <label className={styles.importButton}>
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className={styles.backupList}>
        {backups.map(backup => (
          <div key={backup.id} className={styles.backupItem}>
            <span>{new Date(backup.timestamp).toLocaleString()}</span>
            <div className={styles.backupActions}>
              <button
                onClick={() => handleRestore(backup)}
                disabled={loading}
                className={styles.button}
              >
                Restore
              </button>
              <button
                onClick={() => handleDelete(backup.id)}
                disabled={loading}
                className={styles.button}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceBackup; 
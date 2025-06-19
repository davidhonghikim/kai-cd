import React, { useState, useEffect } from 'react';
import type { Service, ServiceStatus } from '@/types';
import { storageManager } from '@/utils/storage';
import { sendMessage } from '@/utils/chrome';
import styles from './ServerManagerSection.module.css';
import ServerFormModal from './ServerFormModal';
import { SERVERS_KEY } from '../../../utils/settingsIO';

interface ServerManagerSectionProps {
  onUpdate: (settings: Record<string, any>) => void;
}

const ServerManagerSection: React.FC<ServerManagerSectionProps> = ({ onUpdate }) => {
  const [servers, setServers] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<Service | null>(null);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadServers();
    handleGetActiveService();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const loadedServers = await storageManager.get<Service[]>(SERVERS_KEY, []);
      
      // Sort servers by creation date (newest first)
      const sortedServers = loadedServers.sort((a, b) => 
        (b.createdAt || 0) - (a.createdAt || 0)
      );
      
      // Verify each server's connection
      const verifiedServers = await Promise.all(
        sortedServers.map(async (server) => {
          try {
            const response = await sendMessage('checkServerStatus', { server });
            return {
              ...server,
              status: response.success ? response.status : 'error'
            };
          } catch (err) {
            console.error(`Error checking server ${server.name}:`, err);
            return {
              ...server,
              status: 'error'
            };
          }
        })
      );
      
      setServers(verifiedServers);
      setError(null);
    } catch (err) {
      setError('Failed to load servers. Please try again.');
      console.error('Error loading servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = () => {
    setSelectedServer(null);
    setIsAddingServer(true);
  };

  const handleEditServer = (server: Service) => {
    setSelectedServer(server);
    setIsAddingServer(true);
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!window.confirm('Are you sure you want to delete this server?')) {
      return;
    }

    try {
      const updatedServers = servers.filter(s => s.id !== serverId);
      await storageManager.set(SERVERS_KEY, updatedServers);
      setServers(updatedServers);
      onUpdate({ servers: updatedServers });
    } catch (err) {
      setError('Failed to delete server. Please try again.');
      console.error('Error deleting server:', err);
    }
  };

  const handleCheckStatus = async (server: Service) => {
    try {
      setCheckingStatus(prev => ({ ...prev, [server.id]: true }));
      const response = await sendMessage('checkServerStatus', { server });
      
      if (response.success) {
        const updatedServers = servers.map(s => 
          s.id === server.id ? { ...s, status: response.status as ServiceStatus } : s
        );
        setServers(updatedServers);
        await storageManager.set(SERVERS_KEY, updatedServers);
        onUpdate({ servers: updatedServers });
      } else {
        throw new Error(response.error || 'Failed to check server status');
      }
    } catch (err) {
      console.error('Error checking server status:', err);
      setError(`Failed to check status for ${server.name}. Please try again.`);
    } finally {
      setCheckingStatus(prev => ({ ...prev, [server.id]: false }));
    }
  };

  const handleGetActiveService = async () => {
    try {
      const response = await sendMessage('getActiveService', {});
      if (response.success) {
        const activeService = response.service;
        const updatedServers = servers.map(s => 
          s.id === activeService.id ? { ...s, isActive: true } : { ...s, isActive: false }
        );
        setServers(updatedServers);
        await storageManager.set(SERVERS_KEY, updatedServers);
        onUpdate({ servers: updatedServers });
      } else {
        throw new Error(response.error || 'Failed to get active service');
      }
    } catch (err) {
      console.error('Error getting active service:', err);
      setError('Failed to get active service. Please try again.');
    }
  };

  const handleSubmit = async (serverData: Service) => {
    try {
      let updatedServers: Service[];
      
      if (selectedServer) {
        // Update existing server
        updatedServers = servers.map(s =>
          s.id === selectedServer.id
            ? { ...s, ...serverData, updatedAt: Date.now() }
            : s
        );
      } else {
        // Add new server at the beginning of the list
        const newServer = {
          ...serverData,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        updatedServers = [newServer, ...servers];
      }
      
      await storageManager.set(SERVERS_KEY, updatedServers);
      setServers(updatedServers);
      setIsAddingServer(false);
      setSelectedServer(null);
      onUpdate({ servers: updatedServers });
    } catch (error) {
      console.error('Error saving server:', error);
      setError('Failed to save server. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading servers...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Server Manager</h3>
          <p className={styles.description}>
            Manage your server connections and endpoints
          </p>
        </div>
        <button 
          className={styles.addButton}
          onClick={handleAddServer}
        >
          Add Server
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadServers}>Retry</button>
        </div>
      )}

      {servers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📡</div>
          <p>No servers configured</p>
          <p className={styles.emptyStateDescription}>
            Click "Add Server" to configure your first server connection
          </p>
        </div>
      ) : (
        <div className={styles.serverList}>
          {servers.map(server => (
            <div key={server.id} className={styles.serverCard}>
              <div className={styles.serverInfo}>
                <h4 className={styles.serverName}>{server.name}</h4>
                <p className={styles.serverUrl}>{server.url}</p>
                <p className={`${styles.serverStatus} ${styles[server.status || 'unknown']}`}>
                  {server.status === 'active' ? '🟢 Online' :
                   server.status === 'inactive' ? '🔴 Offline' :
                   server.status === 'error' ? '⚠️ Error' : '⚪ Unknown'}
                </p>
              </div>
              <div className={styles.serverActions}>
                <button
                  onClick={() => handleCheckStatus(server)}
                  disabled={checkingStatus[server.id]}
                  className={styles.actionButton}
                >
                  {checkingStatus[server.id] ? 'Checking...' : 'Check Status'}
                </button>
                <button
                  onClick={() => handleEditServer(server)}
                  className={styles.actionButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteServer(server.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddingServer && (
        <ServerFormModal
          isOpen={isAddingServer}
          onClose={() => {
            setIsAddingServer(false);
            setSelectedServer(null);
          }}
          onSubmit={handleSubmit}
          server={selectedServer}
        />
      )}
    </div>
  );
};

export default ServerManagerSection; 
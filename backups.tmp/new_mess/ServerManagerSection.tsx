import React, { useState, useEffect } from 'react';
import { Service, ServiceStatus } from '../../../types';
import { storageManager } from '../../../storage/storageManager';
import { sendMessage } from '../../../utils/messaging';
import styles from './ServerManagerSection.module.css';
import ServerFormModal from './ServerFormModal';

interface ServerManagerSectionProps {
  onUpdate: (settings: Record<string, any>) => void;
}

const ServerManagerSection: React.FC<ServerManagerSectionProps> = ({ onUpdate }) => {
  const [servers, setServers] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<Service | null>(null);
  const [isAddingServer, setIsAddingServer] = useState(false);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const loadedServers = await storageManager.get<Service[]>('servers', []);
      setServers(loadedServers);
      setError(null);
    } catch (err) {
      setError('Failed to load servers');
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
    try {
      const updatedServers = servers.filter(s => s.id !== serverId);
      await storageManager.set('servers', updatedServers);
      setServers(updatedServers);
      onUpdate({ servers: updatedServers });
    } catch (err) {
      setError('Failed to delete server');
      console.error('Error deleting server:', err);
    }
  };

  const handleCheckStatus = async (server: Service) => {
    try {
      const response = await sendMessage('checkServerStatus', { server });
      if (response.success) {
        const updatedServers = servers.map(s => 
          s.id === server.id ? { ...s, status: response.status as ServiceStatus } : s
        );
        setServers(updatedServers);
        await storageManager.set('servers', updatedServers);
        onUpdate({ servers: updatedServers });
      }
    } catch (err) {
      console.error('Error checking server status:', err);
    }
  };

  const handleSubmit = async (serverData: Service) => {
    try {
      let updatedServers: Service[];
      if (selectedServer) {
        updatedServers = servers.map(s => 
          s.id === selectedServer.id ? { ...serverData, id: s.id } : s
        );
      } else {
        updatedServers = [...servers, { ...serverData, id: Date.now().toString() }];
      }
      await storageManager.set('servers', updatedServers);
      setServers(updatedServers);
      setIsAddingServer(false);
      setSelectedServer(null);
      onUpdate({ servers: updatedServers });
    } catch (err) {
      setError('Failed to save server');
      console.error('Error saving server:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading servers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={loadServers}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Server Manager</h3>
        <button 
          className={styles.addButton}
          onClick={handleAddServer}
        >
          Add Server
        </button>
      </div>

      {servers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No servers configured. Click "Add Server" to get started.</p>
        </div>
      ) : (
        <div className={styles.serverList}>
          {servers.map(server => (
            <div key={server.id} className={styles.serverCard}>
              <div className={styles.serverInfo}>
                <h4>{server.name}</h4>
                <p>{server.url}</p>
                <div className={styles.serverStatus}>
                  <span className={`${styles.status} ${styles[server.status || 'unknown']}`}>
                    {server.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className={styles.serverActions}>
                <button onClick={() => handleCheckStatus(server)}>
                  Check Status
                </button>
                <button onClick={() => handleEditServer(server)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteServer(server.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServerFormModal
        show={isAddingServer}
        onClose={() => {
          setIsAddingServer(false);
          setSelectedServer(null);
        }}
        onSubmit={handleSubmit}
        server={selectedServer}
      />
    </div>
  );
};

export default ServerManagerSection; 
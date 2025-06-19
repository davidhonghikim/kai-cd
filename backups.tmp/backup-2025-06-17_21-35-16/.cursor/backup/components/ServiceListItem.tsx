import React, { useState, useEffect } from 'react';
import { Service, ServiceType, Model } from '@/config/types';
import { SERVICE_TYPES, DEFAULT_PORTS, DEFAULT_PATHS } from '@/config/constants';
import { sendMessage } from '@/utils/chrome';
import styles from './ServiceListItem.module.css';
import { storageManager } from '@/storage/storageManager';

interface ServiceListItemProps {
  service: Service;
  onUpdate: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  startExpanded?: boolean;
}

type Status = 'online' | 'offline' | 'checking' | 'unknown' | 'error';

const IP_HISTORY_KEY = 'ip_history';

const parseUrl = (url: string) => {
  try {
    const u = new URL(url);
    return {
      protocol: u.protocol.replace(':', ''),
      ip: u.hostname,
      port: u.port || '',
      path: u.pathname.replace(/\/$/, ''),
    };
  } catch {
    return { protocol: 'http', ip: '', port: '', path: '' };
  }
};

const buildUrl = (protocol: string, ip: string, port: string, path: string) => {
  let url = `${protocol}://${ip}`;
  if (port) url += `:${port}`;
  if (path) url += path.startsWith('/') ? path : `/${path}`;
  return url;
};

const ServiceListItem: React.FC<ServiceListItemProps> = ({ service, onUpdate, onDelete, startExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [formData, setFormData] = useState<Service>(service);
  const [status, setStatus] = useState<Status>('unknown');
  const [models, setModels] = useState<Model[]>([]);
  const [ipHistory, setIpHistory] = useState<string[]>([]);
  const urlParts = parseUrl(formData.url);

  const handleCheckStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('checking');
    try {
      const result = await sendMessage<{ status: Status }>('checkStatus', { serviceId: service.id });
      setStatus(result.status);
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus('error');
    }
  };

  const handleToggleExpand = () => {
    if (isExpanded && JSON.stringify(formData) !== JSON.stringify(service)) {
        if (window.confirm("You have unsaved changes. Do you want to save them?")) {
            handleSave();
        } else {
            setFormData(service);
        }
    }
    setIsExpanded(!isExpanded);
  };
  
  const handleSave = async () => {
    // Update IP history
    if (urlParts.ip && !ipHistory.includes(urlParts.ip)) {
      const newHistory = [urlParts.ip, ...ipHistory].slice(0, 10);
      setIpHistory(newHistory);
      await storageManager.set(IP_HISTORY_KEY, newHistory);
    }
    await sendMessage('updateService', formData);
    onUpdate(formData);
    setIsExpanded(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      onDelete(service.id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ServiceType;
    setFormData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleSetDefaultModel = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    const updatedFormData = { ...formData, model: modelId };
    setFormData(updatedFormData);
    await sendMessage('updateService', updatedFormData);
    onUpdate(updatedFormData);
  };

  useEffect(() => {
    if (isExpanded && ['OLLAMA', 'A1111', 'COMFYUI'].includes(service.type)) {
      const fetchModels = async () => {
        try {
          const fetchedModels = await sendMessage('getModels', { serviceId: service.id });
          setModels(fetchedModels || []);
        } catch (error) {
          console.error(`Failed to fetch models for ${service.name}`, error);
          setModels([]);
        }
      };
      fetchModels();
    }
  }, [isExpanded, service.id, service.type, service.name]);

  useEffect(() => {
    storageManager.get<string[]>(IP_HISTORY_KEY, []).then(setIpHistory);
  }, []);

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const ip = e.target.value;
    const newUrl = buildUrl(urlParts.protocol, ip, urlParts.port, urlParts.path);
    setFormData(prev => ({ ...prev, url: newUrl }));
  };
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const port = e.target.value;
    const newUrl = buildUrl(urlParts.protocol, urlParts.ip, port, urlParts.path);
    setFormData(prev => ({ ...prev, url: newUrl }));
  };
  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value;
    const newUrl = buildUrl(urlParts.protocol, urlParts.ip, urlParts.port, path);
    setFormData(prev => ({ ...prev, url: newUrl }));
  };

  return (
    <div className={styles.serviceItem}>
      <div className={styles.summary} onClick={handleToggleExpand}>
        <div className={styles.summaryContent}>
          <span 
            className={`${styles.statusIndicator} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]}`} 
            title={`Status: ${status}`} 
          />
          <div>
            <div className={styles.serviceName}>{service.name}</div>
            <div className={styles.serviceType}>{service.type}</div>
          </div>
        </div>
        <div className={styles.summaryActions}>
            <button onClick={handleCheckStatus}>Check Status</button>
            <button className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}>
              ▶
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Service Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Service Type</label>
                <select name="type" value={formData.type} onChange={handleTypeChange}>
                  {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                    <option key={key} value={value as string}>{key}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>IP/Host</label>
                <input
                  list="ip-history"
                  value={urlParts.ip}
                  onChange={handleIpChange}
                  placeholder="e.g., 192.168.1.100 or localhost"
                />
                <datalist id="ip-history">
                  {ipHistory.map(ip => <option key={ip} value={ip} />)}
                </datalist>
              </div>
              <div className={styles.formGroup}>
                <label>Port</label>
                <input
                  type="text"
                  value={urlParts.port}
                  onChange={handlePortChange}
                  placeholder="e.g., 11434"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Endpoint Path</label>
                <input
                  type="text"
                  value={urlParts.path}
                  onChange={handlePathChange}
                  placeholder="e.g., /api/chat"
                />
              </div>
              <div className={styles.formGroup}>
                <label>API Key (optional)</label>
                <input name="apiKey" type="password" placeholder="••••••••" value={formData.apiKey || ''} onChange={handleChange} />
              </div>

              {models.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Default Model</label>
                  <select name="model" value={formData.model || ''} onChange={handleSetDefaultModel}>
                    <option value="">-- Select a model --</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
          </div>
          
          <div className={styles.detailActions}>
            <button onClick={handleDelete} className={styles.dangerButton}>Delete</button>
            <div style={{flexGrow: 1}} />
            <button onClick={() => setIsExpanded(false)} className={styles.secondaryButton}>Cancel</button>
            <button onClick={handleSave} className={styles.primaryButton}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceListItem; 
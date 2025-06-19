import React, { useState, useEffect } from 'react';
import type { Service, ServiceType, ServiceStatus } from '@/types';
import { sendMessage } from '@/utils/chrome';
import { SERVICE_TYPES, SERVICE_DISPLAY_NAMES, SERVICE_TYPE_TO_CATEGORY, SERVICE_CATEGORIES } from '@/config/constants';
import styles from './ServerFormModal.module.css';

interface ServerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (server: Service) => void;
  server?: Service | null;
}

// Define a form type for only the fields needed
interface ServiceFormData {
  name: string;
  type: ServiceType;
  url: string;
  enabled: boolean;
  status: ServiceStatus;
  category: string;
  requiresApiKey: boolean;
  apiKey?: string;
}

const initialFormData: ServiceFormData = {
  name: '',
  type: SERVICE_TYPES.OLLAMA,
  url: '',
  enabled: true,
  status: 'inactive',
  category: SERVICE_CATEGORIES.LLM,
  requiresApiKey: false,
  apiKey: ''
};

const ServerFormModal: React.FC<ServerFormModalProps> = ({ isOpen, onClose, onSubmit, server }) => {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name,
        type: server.type,
        url: server.url,
        apiKey: server.apiKey || '',
        enabled: server.enabled ?? true,
        status: server.status || 'inactive',
        category: SERVICE_TYPE_TO_CATEGORY[server.type] || SERVICE_CATEGORIES.LLM,
        requiresApiKey: server.requiresApiKey ?? false
      });
    } else {
      setFormData(initialFormData);
    }
  }, [server]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset verification when form changes
    setIsVerified(false);
    setVerificationError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }
    if (!formData.url.trim()) {
      return 'URL is required';
    }
    try {
      new URL(formData.url);
    } catch {
      return 'Invalid URL format';
    }
    return null;
  };

  const handleVerify = async () => {
    const validationError = validateForm();
    if (validationError) {
      setVerificationError(validationError);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await sendMessage('checkServerStatus', { 
        server: {
          ...formData,
          id: server?.id || 'temp',
          status: 'inactive'
        }
      });

      if (response.success) {
        setIsVerified(true);
        setVerificationError(null);
      } else {
        throw new Error(response.error || 'Failed to connect to server');
      }
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'Failed to verify connection');
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      setVerificationError('Please verify the connection first');
      return;
    }
    const cleanFormData = {
      ...formData,
      id: server?.id || `service_${Date.now()}`,
      type: formData.type || SERVICE_TYPES.OLLAMA,
      enabled: formData.enabled ?? true,
      status: formData.status || 'inactive',
      category: SERVICE_CATEGORIES.LLM,
      requiresApiKey: formData.requiresApiKey ?? false
    };
    onSubmit({
      ...cleanFormData,
      createdAt: server?.createdAt || Date.now(),
      updatedAt: Date.now(),
      isActive: formData.enabled ?? false
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{server ? 'Edit Server' : 'Add New Server'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter server name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {SERVICE_DISPLAY_NAMES[value as keyof typeof SERVICE_DISPLAY_NAMES] || key}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url">URL</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="Enter server URL (e.g., http://localhost:11434)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="apiKey">API Key (if required)</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Enter API key if required"
            />
          </div>

          {verificationError && (
            <div className={styles.error}>
              {verificationError}
            </div>
          )}

          {isVerified && (
            <div className={styles.success}>
              Connection verified successfully!
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className={styles.verifyButton}
            >
              {isVerifying ? 'Verifying...' : 'Verify Connection'}
            </button>
            <button
              type="submit"
              disabled={!isVerified}
              className={styles.submitButton}
            >
              {server ? 'Save Changes' : 'Add Server'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServerFormModal;
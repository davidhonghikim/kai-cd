import React, { useState, useEffect } from 'react';
import { Service } from '@/types';
import styles from './ServerForm.module.css';
import { SERVICE_TYPES, SERVICE_CATEGORIES } from '@/config/constants';

interface ServerFormProps {
  server?: Service | null;
  onSubmit: (server: Service) => void;
  onCancel: () => void;
}

export const ServerForm: React.FC<ServerFormProps> = ({ server, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    type: SERVICE_TYPES.OLLAMA,
    url: '',
    enabled: true,
    status: 'inactive',
    category: SERVICE_CATEGORIES.LLM,
    requiresApiKey: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false
  });

  useEffect(() => {
    if (server) {
      setFormData(server);
    }
  }, [server]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url || !formData.type) {
      return;
    }
    onSubmit(formData as Service);
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>
        {server ? 'Edit Server' : 'Add New Server'}
      </h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Server Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="url">Server URL</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="http://localhost:7860"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="type">Server Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="a1111">Automatic1111</option>
            <option value="comfyui">ComfyUI</option>
            <option value="openwebui">OpenWebUI</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apiKey">API Key (Optional)</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {server ? 'Update Server' : 'Add Server'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}; 
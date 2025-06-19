import React, { useState } from 'react';
import type { Service } from '@/types';

interface ServiceListItemProps {
  service: Service;
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
}

const ServiceListItem: React.FC<ServiceListItemProps> = ({ service, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: service.name,
    url: service.url,
    type: service.type,
    enabled: service.enabled,
    status: service.status,
    category: service.category,
    requiresApiKey: service.requiresApiKey,
    apiKey: service.apiKey
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...service,
      ...formData,
      updatedAt: Date.now()
    });
    setIsEditing(false);
  };

  return (
    <div className="service-list-item">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>URL:</label>
            <input
              type="text"
              name="url"
              value={formData.url || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Enabled:</label>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Requires API Key:</label>
            <input
              type="checkbox"
              name="requiresApiKey"
              checked={formData.requiresApiKey}
              onChange={handleInputChange}
            />
          </div>
          {formData.requiresApiKey && (
            <div>
              <label>API Key:</label>
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey || ''}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="service-info">
            <h3>{service.name}</h3>
            <p>URL: {service.url}</p>
            <p>Type: {service.type}</p>
            <p>Status: {service.status}</p>
            <p>Category: {service.category}</p>
            <p>Enabled: {service.enabled ? 'Yes' : 'No'}</p>
            {service.requiresApiKey && <p>API Key: {service.apiKey ? '****' : 'Not Set'}</p>}
          </div>
          <div className="service-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(service.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceListItem; 
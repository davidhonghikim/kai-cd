import React, { useState, useEffect } from 'react';
import type { Service } from '../types';
import { useServiceStore } from '../store/serviceStore';
import toast from 'react-hot-toast';

interface ServiceEditorProps {
  service: Service;
  onClose: () => void;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({ service, onClose }) => {
  const [formData, setFormData] = useState<Service>(service);
  const { updateService } = useServiceStore();

  useEffect(() => {
    setFormData(service);
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateService(formData);
    toast.success(`${formData.name} updated successfully!`);
    onClose();
  };

  return (
    <div className="p-4 bg-slate-900 rounded-b-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Service Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white"
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-300">URL</label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white"
          />
        </div>
        {/* Add more fields for other editable properties like port, endpoints etc. as needed */}
        <div className="flex items-center">
            <input 
                id="enabled"
                name="enabled"
                type="checkbox"
                checked={formData.enabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-slate-300">Enabled</label>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceEditor; 
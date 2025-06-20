import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClipboardIcon,
  LockClosedIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import useVaultStore from '../store/vaultStore';
import toast from 'react-hot-toast';
import type { Credential, AuthType } from '../types';

interface CredentialFormData {
  name: string;
  type: AuthType;
  value: string;
}

const CredentialManager: React.FC = () => {
  const { 
    status, 
    credentials, 
    addCredential, 
    updateCredential, 
    deleteCredential, 
    lock,
    updateActivity,
    getRemainingTime,
    autoLockTimeout
  } = useVaultStore();
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CredentialFormData>({
    name: '',
    type: 'api_key',
    value: ''
  });
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Update activity on any interaction and track remaining time
  useEffect(() => {
    updateActivity();
    
    // Update remaining time every second if auto-lock is enabled
    const interval = autoLockTimeout > 0 ? setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000) : undefined;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [updateActivity, getRemainingTime, autoLockTimeout]);

  // Track activity on component interactions
  const handleActivity = () => {
    updateActivity();
  };

  if (status !== 'UNLOCKED') {
    return (
      <div className="text-center p-6 text-slate-400">
        <KeyIcon className="h-12 w-12 mx-auto mb-3" />
        <p>Vault must be unlocked to manage credentials</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleActivity(); // Track activity
    
    if (!formData.name.trim() || !formData.value.trim()) {
      toast.error('Name and value are required');
      return;
    }

    try {
      if (editingCredentialId) {
        updateCredential(editingCredentialId, formData);
        toast.success('Credential updated successfully');
      } else {
        addCredential(formData);
        toast.success('Credential added successfully');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Failed to save credential');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'api_key', value: '' });
    setIsAddingCredential(false);
    setEditingCredentialId(null);
  };

  const handleEdit = (credential: Credential) => {
    handleActivity(); // Track activity
    setFormData({
      name: credential.name,
      type: credential.type,
      value: credential.value
    });
    setEditingCredentialId(credential.id);
    setIsAddingCredential(true);
  };

  const handleDelete = (id: string, name: string) => {
    handleActivity(); // Track activity
    if (window.confirm(`Are you sure you want to delete the credential "${name}"?`)) {
      deleteCredential(id);
      toast.success('Credential deleted');
    }
  };

  const handleManualLock = () => {
    if (window.confirm('Are you sure you want to lock the vault? You will need to enter your master password to unlock it again.')) {
      lock();
      toast.success('Vault locked');
    }
  };

  const copyToClipboard = async (value: string, name: string) => {
    handleActivity(); // Track activity
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${name} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toggleShowValue = (id: string) => {
    handleActivity(); // Track activity
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const authTypeOptions: { value: AuthType; label: string }[] = [
    { value: 'api_key', label: 'API Key' },
    { value: 'bearer_token', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'none', label: 'None' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto" onClick={handleActivity}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Credential Management</h2>
          {autoLockTimeout > 0 && remainingTime > 0 && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-slate-400">
              <ClockIcon className="h-4 w-4" />
              <span>Auto-lock in: {formatTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {!isAddingCredential && (
            <button
              onClick={() => {
                handleActivity();
                setIsAddingCredential(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Credential</span>
            </button>
          )}
          <button
            onClick={handleManualLock}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Lock Vault"
          >
            <LockClosedIcon className="h-4 w-4" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {isAddingCredential && (
        <div className="mb-6 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            {editingCredentialId ? 'Edit Credential' : 'Add New Credential'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="credentialName" className="block text-sm font-medium text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="credentialName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., OpenAI Production Key"
                required
              />
            </div>

            <div>
              <label htmlFor="credentialType" className="block text-sm font-medium text-slate-300 mb-1">
                Type
              </label>
              <select
                id="credentialType"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AuthType }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {authTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="credentialValue" className="block text-sm font-medium text-slate-300 mb-1">
                Value
              </label>
              <input
                type="password"
                id="credentialValue"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter the credential value"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {editingCredentialId ? 'Update' : 'Save'} Credential
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {credentials.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            <KeyIcon className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">No credentials stored</p>
            <p className="text-sm">Add your first credential to get started</p>
          </div>
        ) : (
          credentials.map(credential => (
            <div key={credential.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">{credential.name}</h3>
                  <p className="text-sm text-slate-400 mb-2 capitalize">
                    {credential.type.replace('_', ' ')}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type={showValues[credential.id] ? 'text' : 'password'}
                        value={credential.value}
                        readOnly
                        className="w-full px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm font-mono"
                      />
                    </div>
                    <button
                      onClick={() => toggleShowValue(credential.id)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                      title={showValues[credential.id] ? 'Hide value' : 'Show value'}
                    >
                      {showValues[credential.id] ? 
                        <EyeSlashIcon className="h-4 w-4" /> : 
                        <EyeIcon className="h-4 w-4" />
                      }
                    </button>
                    <button
                      onClick={() => copyToClipboard(credential.value, credential.name)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                      title="Copy to clipboard"
                    >
                      <ClipboardIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(credential)}
                    className="p-2 text-slate-400 hover:text-slate-200"
                    title="Edit credential"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(credential.id, credential.name)}
                    className="p-2 text-red-400 hover:text-red-300"
                    title="Delete credential"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CredentialManager; 
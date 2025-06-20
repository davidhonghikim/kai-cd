import React, { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface VaultUnlockProps {
  onUnlock: (password: string) => Promise<boolean>;
  isLoading?: boolean;
}

const VaultUnlock: React.FC<VaultUnlockProps> = ({ onUnlock, isLoading = false }) => {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsUnlocking(true);
    try {
      const success = await onUnlock(password);
      if (success) {
        toast.success('Vault unlocked successfully!');
        setPassword('');
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      console.error('Failed to unlock vault:', error);
      toast.error('Failed to unlock vault');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="text-center mb-6">
        <LockClosedIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-slate-100 mb-2">Unlock Vault</h2>
        <p className="text-sm text-slate-400">
          Enter your master password to access your stored credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="unlockPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Master Password
          </label>
          <input
            type="password"
            id="unlockPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter your master password"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isUnlocking}
          className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
        >
          {isLoading || isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
        </button>
      </form>
    </div>
  );
};

export default VaultUnlock; 
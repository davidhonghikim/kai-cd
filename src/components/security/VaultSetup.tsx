import React, { useState } from 'react';
import { KeyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PasswordGenerator from './PasswordGenerator';
import toast from 'react-hot-toast';

interface VaultSetupProps {
  onSetupComplete: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const VaultSetup: React.FC<VaultSetupProps> = ({ onSetupComplete, onCancel, isLoading = false }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    onSetupComplete(password);
  };

  const handlePasswordGenerated = (generatedPassword: string) => {
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="text-center mb-6">
        <KeyIcon className="h-12 w-12 text-cyan-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-slate-100 mb-2">Set Up Secure Vault</h2>
        <p className="text-sm text-slate-400">
          Create a master password to securely store your API keys and credentials.
        </p>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-200 font-medium">Important Security Notice</p>
            <p className="text-yellow-300 mt-1">
              Your master password cannot be recovered if lost. Please store it securely.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Master Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter a strong password or generate one below"
            required
            minLength={8}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Confirm your password"
            required
            minLength={8}
          />
        </div>

        {/* Password Generator Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowGenerator(!showGenerator)}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showGenerator ? 'Hide Password Generator' : 'Show Password Generator'}
          </button>
        </div>

        {/* Password Generator */}
        {showGenerator && (
          <PasswordGenerator 
            onPasswordGenerated={handlePasswordGenerated}
            showCopyButton={false}
            className="mt-4"
          />
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Vault'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaultSetup; 
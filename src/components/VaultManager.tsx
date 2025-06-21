import React, { useState } from 'react';
import { LockOpenIcon, KeyIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import useVaultStore from '../store/vaultStore';
import toast from 'react-hot-toast';
import {
  generateDicewarePassphrase,
  generateSimplePassword,
  DICEWARE_PRESETS,
  WORDLIST_INFO,
  type DicewareResult,
  type DicewareOptions
} from '../utils/diceware';

const VaultManager: React.FC = () => {
  const { status, setMasterPassword, unlock } = useVaultStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [dicewareResult, setDicewareResult] = useState<DicewareResult | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customOptions, setCustomOptions] = useState<DicewareOptions>({
    wordlist: 'eff_large',
    wordCount: 5,
    separator: 'space',
    capitalization: 'none',
    numbers: 'none',
    numberCount: 2
  });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      setMasterPassword(password);
      toast.success('Vault created successfully!');
      setPassword('');
      setConfirmPassword('');
      setShowSetup(false);
    } catch (_error) {
      toast.error('Failed to create vault');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await unlock(password);
      if (success) {
        toast.success('Vault unlocked successfully!');
        setPassword('');
      } else {
        toast.error('Incorrect password');
      }
    } catch (_error) {
      toast.error('Failed to unlock vault');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiceware = async (preset?: keyof typeof DICEWARE_PRESETS, options?: DicewareOptions) => {
    try {
      const dicewareOptions = options || (preset ? DICEWARE_PRESETS[preset] : customOptions);
      const result = await generateDicewarePassphrase(dicewareOptions);
      setDicewareResult(result);
      setPassword(result.passphrase);
      setConfirmPassword(result.passphrase);
      
      const wordlistName = WORDLIST_INFO[result.wordlistInfo.type].name;
      toast.success(`Generated ${result.words.length}-word passphrase using ${wordlistName} (${result.entropyBits} bits entropy)`);
    } catch (error) {
      console.error('Failed to generate Diceware passphrase:', error);
      toast.error('Failed to generate passphrase. Please try again.');
    }
  };

  const generateLegacyPassword = () => {
    const result = generateSimplePassword(16);
    setPassword(result);
    setConfirmPassword(result);
    setDicewareResult(null);
    toast.success('Generated random password');
  };

  const getStrengthColor = (strength: DicewareResult['strength']) => {
    switch (strength) {
      case 'weak': return 'text-red-400';
      case 'fair': return 'text-yellow-400';
      case 'good': return 'text-blue-400';
      case 'strong': return 'text-green-400';
      case 'excellent': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  if (status === 'UNLOCKED') {
    return (
      <div className="flex items-center space-x-2 text-green-400">
        <LockOpenIcon className="h-5 w-5" />
        <span className="text-sm">Vault Unlocked</span>
      </div>
    );
  }

  if (status === 'UNSET') {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-center mb-6">
          <KeyIcon className="h-12 w-12 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Set Up Secure Vault</h2>
          <p className="text-sm text-slate-400">
            Create a master password to securely store your API keys and credentials.
          </p>
        </div>

        {!showSetup ? (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
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
            <button
              onClick={() => setShowSetup(true)}
              className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              Create Master Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Master Password
              </label>
              <div className="space-y-3">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setDicewareResult(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter a strong password or generate one below"
                  required
                  minLength={8}
                />
                
                {/* Diceware Info Display */}
                {dicewareResult && (
                  <div className="p-3 bg-slate-700 rounded-md border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">
                        {dicewareResult.wordlistInfo.type.replace('_', ' ').toUpperCase()} Passphrase
                      </span>
                      <span className={`text-xs font-medium ${getStrengthColor(dicewareResult.strength)} capitalize`}>
                        {dicewareResult.strength} ({dicewareResult.entropyBits} bits)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Words: {dicewareResult.words.join(' • ')}</div>
                      {dicewareResult.numbersAdded.length > 0 && (
                        <div>Numbers: {dicewareResult.numbersAdded.join(', ')}</div>
                      )}
                      <div>Wordlist: {WORDLIST_INFO[dicewareResult.wordlistInfo.type].name}</div>
                    </div>
                  </div>
                )}
                
                {/* Password Generation Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <InformationCircleIcon className="h-4 w-4" />
                      <span>Generate secure password:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      {showAdvancedOptions ? 'Hide Options' : 'Advanced Options'}
                    </button>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => generateDiceware('standard')}
                      className="px-3 py-1.5 bg-cyan-700 text-cyan-100 rounded text-xs hover:bg-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      5 Words (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => generateDiceware('strong')}
                      className="px-3 py-1.5 bg-green-700 text-green-100 rounded text-xs hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      6 Words (Strong)
                    </button>
                    <button
                      type="button"
                      onClick={() => generateDiceware('excellent')}
                      className="px-3 py-1.5 bg-emerald-700 text-emerald-100 rounded text-xs hover:bg-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      7 Words (Excellent)
                    </button>
                    <button
                      type="button"
                      onClick={generateLegacyPassword}
                      className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded text-xs hover:bg-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      Random (Legacy)
                    </button>
                  </div>
                  
                  {/* Advanced Options */}
                  {showAdvancedOptions && (
                    <div className="p-3 bg-slate-800 rounded-md border border-slate-600 space-y-3">
                      <div className="text-xs font-medium text-slate-300 mb-2">Custom Diceware Options</div>
                      
                      {/* Wordlist Selection */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Wordlist</label>
                        <select
                          value={customOptions.wordlist}
                          onChange={(e) => setCustomOptions(prev => ({ ...prev, wordlist: e.target.value as WordlistType }))}
                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-slate-100"
                        >
                          <option value="eff_large">EFF Large (7,776 words, 12.9 bits/word)</option>
                          <option value="eff_short_1">EFF Short #1 (1,296 words, 10.3 bits/word)</option>
                          <option value="eff_short_2">EFF Short #2 (1,296 words, auto-complete friendly)</option>
                        </select>
                      </div>
                      
                      {/* Word Count */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Word Count: {customOptions.wordCount} 
                          <span className="ml-1 text-slate-500">
                            (~{Math.round(customOptions.wordCount * WORDLIST_INFO[customOptions.wordlist].bitsPerWord)} bits)
                          </span>
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={customOptions.wordCount}
                          onChange={(e) => setCustomOptions(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Separator */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Separator</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['space', 'dash', 'dot', 'underscore', 'none'] as SeparatorType[]).map(sep => (
                            <button
                              key={sep}
                              type="button"
                              onClick={() => setCustomOptions(prev => ({ ...prev, separator: sep }))}
                              className={`px-2 py-1 text-xs rounded ${
                                customOptions.separator === sep 
                                  ? 'bg-cyan-600 text-white' 
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              {sep === 'space' ? 'Space' : sep === 'none' ? 'None' : sep.charAt(0).toUpperCase() + sep.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Capitalization */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Capitalization</label>
                        <div className="grid grid-cols-2 gap-1">
                          {(['none', 'first', 'all', 'random'] as CapitalizationType[]).map(cap => (
                            <button
                              key={cap}
                              type="button"
                              onClick={() => setCustomOptions(prev => ({ ...prev, capitalization: cap }))}
                              className={`px-2 py-1 text-xs rounded ${
                                customOptions.capitalization === cap 
                                  ? 'bg-cyan-600 text-white' 
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              {cap === 'none' ? 'None' : cap === 'first' ? 'First Letter' : cap.charAt(0).toUpperCase() + cap.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Numbers */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Numbers</label>
                        <div className="grid grid-cols-2 gap-1">
                          {(['none', 'end', 'random', 'between'] as NumberPosition[]).map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setCustomOptions(prev => ({ ...prev, numbers: num }))}
                              className={`px-2 py-1 text-xs rounded ${
                                customOptions.numbers === num 
                                  ? 'bg-cyan-600 text-white' 
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              {num === 'none' ? 'None' : num === 'end' ? 'At End' : num.charAt(0).toUpperCase() + num.slice(1)}
                            </button>
                          ))}
                        </div>
                        {customOptions.numbers !== 'none' && (
                          <div className="mt-2">
                            <label className="block text-xs text-slate-400 mb-1">Number of Digits: {customOptions.numberCount}</label>
                            <input
                              type="range"
                              min="1"
                              max="4"
                              value={customOptions.numberCount || 2}
                              onChange={(e) => setCustomOptions(prev => ({ ...prev, numberCount: parseInt(e.target.value) }))}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Generate Custom */}
                      <button
                        type="button"
                        onClick={() => generateDiceware(undefined, customOptions)}
                        className="w-full px-3 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        Generate Custom Passphrase
                      </button>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 italic">
                    Tip: <a href="https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">EFF Diceware passphrases</a> are easier to remember and type than random passwords
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
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

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowSetup(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Vault'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Status is 'LOCKED'
  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="text-center mb-6">
        <LockClosedIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-slate-100 mb-2">Unlock Vault</h2>
        <p className="text-sm text-slate-400">
          Enter your master password to access your stored credentials.
        </p>
      </div>

      <form onSubmit={handleUnlock} className="space-y-4">
        <div>
          <label htmlFor="unlockPassword" className="block text-sm font-medium text-slate-300 mb-1">
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
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isLoading ? 'Unlocking...' : 'Unlock Vault'}
        </button>
      </form>
    </div>
  );
};

export default VaultManager; 
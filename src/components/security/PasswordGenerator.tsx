import React, { useState, useEffect } from 'react';
import { KeyIcon, InformationCircleIcon, DocumentDuplicateIcon, CheckIcon, ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import {
  generateDicewarePassphrase,
  generateSimplePassword,
  DICEWARE_PRESETS,
  WORDLIST_INFO,
  type DicewareResult,
  type DicewareOptions,
  type WordlistType,
  type SeparatorType,
  type CapitalizationType,
  type NumberPosition
} from '../../utils/diceware';
import useVaultStore from '../../store/vaultStore';
import useSecurityStateStore from '../../store/securityStateStore';
import toast from 'react-hot-toast';

// Type declaration for process.env
declare const process: { env: { NODE_ENV: string } };

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  showCopyButton?: boolean;
  className?: string;
  onAnalyzePassword?: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onPasswordGenerated,
  showCopyButton = true,
  className = '',
  onAnalyzePassword
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const { status: vaultStatus, addCredential } = useVaultStore();
  const {
    generatedPassword,
    dicewareResult,
    customDicewareOptions,
    setGeneratedPassword,
    setCustomDicewareOptions,
    setAnalyzedPassword,
    updateActivity
  } = useSecurityStateStore();

  // Update activity on any interaction
  useEffect(() => {
    const initActivity = async () => {
      try {
        await updateActivity();
      } catch (error) {
        console.error("Failed to update activity:", error);
      }
    };
    initActivity();
  }, [updateActivity]);



  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
      toast.success('Password copied to clipboard');
      await updateActivity();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy password');
    }
  };

  const analyzeCurrentPassword = async () => {
    if (generatedPassword && onAnalyzePassword) {
      try {
        // Set the password in the analyzer store and call the callback - AWAIT the async operation
        await setAnalyzedPassword(generatedPassword);
        onAnalyzePassword(generatedPassword);
        toast.success('Password sent to analyzer');
        await updateActivity();
      } catch (error) {
        console.error('Failed to analyze password:', error);
        toast.error('Failed to send password to analyzer');
      }
    }
  };

  const addToVault = async () => {
    if (!generatedPassword) {
      toast.error('No password to save');
      return;
    }

    if (vaultStatus !== 'UNLOCKED') {
      toast.error('Vault must be unlocked to save passwords');
      return;
    }

    try {
      await addCredential({
        name: `Generated Password - ${new Date().toLocaleDateString()}`,
        type: 'none',
        value: generatedPassword
      });
      
      toast.success('Password saved to vault');
      await updateActivity();
    } catch (error) {
      console.error('Failed to save to vault:', error);
      toast.error('Failed to save password to vault');
    }
  };

  const generateDiceware = async (preset?: keyof typeof DICEWARE_PRESETS, options?: DicewareOptions) => {
    try {
      const dicewareOptions = options || (preset ? DICEWARE_PRESETS[preset] : customDicewareOptions);
      const result = await generateDicewarePassphrase(dicewareOptions);
      
      // Store in security state - AWAIT the async operation
      await setGeneratedPassword(result.passphrase, result);
      
      if (onPasswordGenerated) {
        onPasswordGenerated(result.passphrase);
      }
      
      const wordlistName = WORDLIST_INFO[result.wordlistInfo.type].name;
      toast.success(`Generated ${result.words.length}-word passphrase using ${wordlistName} (${result.entropyBits} bits entropy)`);
    } catch (error) {
      console.error('Failed to generate Diceware passphrase:', error);
      toast.error('Failed to generate passphrase. Please try again.');
    }
  };

  const generateLegacyPassword = async () => {
    try {
      const result = generateSimplePassword(16);
      
      // Store in security state - AWAIT the async operation
      await setGeneratedPassword(result, null);
      
      if (onPasswordGenerated) {
        onPasswordGenerated(result);
      }
      
      toast.success('Generated random password');
    } catch (error) {
      console.error('Failed to generate password:', error);
      toast.error('Failed to generate password. Please try again.');
    }
  };

  const updateCustomOptions = async (newOptions: Partial<DicewareOptions>) => {
    try {
      const updatedOptions = { ...customDicewareOptions, ...newOptions };
      // AWAIT the async operation
      await setCustomDicewareOptions(updatedOptions);
      await updateActivity();
    } catch (error) {
      console.error('Failed to update custom options:', error);
      toast.error('Failed to update settings');
    }
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

  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <KeyIcon className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-slate-100">Password Generator</h3>
      </div>

      <div className="space-y-4">
        {/* Debug info for troubleshooting */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-slate-500 bg-slate-900 p-2 rounded">
            Debug: generatedPassword={generatedPassword ? 'SET' : 'NULL'}, 
            dicewareResult={dicewareResult ? 'SET' : 'NULL'}
          </div>
        )}
        
        {/* Generated Password Display */}
        {/* Debug info for troubleshooting */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-slate-500 bg-slate-900 p-2 rounded">
            Debug: generatedPassword={generatedPassword ? 'SET' : 'NULL'}, 
            dicewareResult={dicewareResult ? 'SET' : 'NULL'}
          </div>
        )}
        
        {/* Show prompt to generate password if none exists */}
        {!generatedPassword && (
          <div className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50 text-center">
            <KeyIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No password generated yet</p>
            <p className="text-xs text-slate-500">Click one of the buttons below to generate a secure password</p>
          </div>
        )}
                {generatedPassword && (
          <div className="p-3 bg-slate-700 rounded-md border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Generated Password</span>
              <div className="flex items-center space-x-2">
                {onAnalyzePassword && (
                  <button
                    onClick={analyzeCurrentPassword}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Analyze this password in the security analyzer"
                  >
                    <ArrowRightIcon className="h-4 w-4 text-purple-400" />
                  </button>
                )}
                {vaultStatus === 'UNLOCKED' && (
                  <button
                    onClick={addToVault}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Save to secure vault"
                  >
                    <LockClosedIcon className="h-4 w-4 text-green-400" />
                  </button>
                )}
                {showCopyButton && (
                  <button
                    onClick={() => copyToClipboard(generatedPassword, 'password')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedItem === 'password' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                )}
              </div>
            </div>
            <div className="font-mono text-sm text-slate-100 break-all bg-slate-800 p-2 rounded border">
              {generatedPassword}
            </div>
          </div>
        )}

        {/* Show prompt to generate password if none exists */}
        {!generatedPassword && (
          <div className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50 text-center">
            <KeyIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No password generated yet</p>
            <p className="text-xs text-slate-500">Click one of the buttons below to generate a secure password</p>
          </div>
        )}

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

        {/* Generation Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <InformationCircleIcon className="h-4 w-4" title="Password generation options and security information" />
              <span>Generate secure password:</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              title={showAdvancedOptions ? 'Hide customization options' : 'Show customization options'}
            >
              {showAdvancedOptions ? 'Hide Options' : 'Advanced Options'}
            </button>
          </div>
          
          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => generateDiceware('standard')}
              title="Generate a 5-word Diceware passphrase (standard security ~65 bits entropy)"
              className="px-3 py-2 bg-cyan-700 text-cyan-100 rounded text-sm hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            >
              5 Words (Standard)
            </button>
            <button
              type="button"
              onClick={() => generateDiceware('strong')}
              title="Generate a 6-word Diceware passphrase with capitalization and numbers (strong security ~80 bits entropy)"
              className="px-3 py-2 bg-green-700 text-green-100 rounded text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              6 Words (Strong)
            </button>
            <button
              type="button"
              onClick={() => generateDiceware('excellent')}
              title="Generate a 7-word Diceware passphrase with dashes, capitalization and random numbers (excellent security ~90 bits entropy)"
              className="px-3 py-2 bg-emerald-700 text-emerald-100 rounded text-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              7 Words (Excellent)
            </button>
            <button
              type="button"
              onClick={generateLegacyPassword}
              title="Generate a 16-character random password with mixed characters (legacy format, harder to remember)"
              className="px-3 py-2 bg-slate-600 text-slate-300 rounded text-sm hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            >
              Random (Legacy)
            </button>
          </div>
          
          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="p-4 bg-slate-700/50 rounded-md border border-slate-600/50 space-y-4">
              <div className="text-sm font-medium text-slate-300 mb-3">Custom Diceware Options</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wordlist Selection */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Wordlist</label>
                  <select
                    value={customDicewareOptions.wordlist}
                    onChange={(e) => updateCustomOptions({ wordlist: e.target.value as WordlistType })}
                    title="Choose the wordlist for generating passphrases"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="eff_large">EFF Large (7,776 words, 12.9 bits/word)</option>
                    <option value="eff_short_1">EFF Short #1 (1,296 words, 10.3 bits/word)</option>
                    <option value="eff_short_2">EFF Short #2 (1,296 words, auto-complete friendly) - Default</option>
                  </select>
                </div>

                {/* Separator Selection */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Word Separator</label>
                  <select
                    value={customDicewareOptions.separator}
                    onChange={(e) => updateCustomOptions({ separator: e.target.value as SeparatorType })}
                    title="Choose how words are separated"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="space">Space ( )</option>
                    <option value="dash">Dash (-)</option>
                    <option value="dot">Dot (.)</option>
                    <option value="underscore">Underscore (_)</option>
                    <option value="none">No separator</option>
                    <option value="custom">Custom symbol</option>
                  </select>
                </div>

                {/* Custom Separator */}
                {customDicewareOptions.separator === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Custom Separator</label>
                    <input
                      type="text"
                      value={customDicewareOptions.customSeparator || ''}
                      onChange={(e) => updateCustomOptions({ customSeparator: e.target.value })}
                      placeholder="Enter custom separator (e.g., !@#, |, etc.)"
                      title="Enter any custom separator characters"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}

                {/* Capitalization */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Capitalization</label>
                  <select
                    value={customDicewareOptions.capitalization}
                    onChange={(e) => updateCustomOptions({ capitalization: e.target.value as CapitalizationType })}
                    title="Choose capitalization style"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="none">No capitalization</option>
                    <option value="first">First letter of each word</option>
                    <option value="all">ALL UPPERCASE</option>
                    <option value="random">Random per character</option>
                  </select>
                </div>

                {/* Numbers */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Numbers</label>
                  <select
                    value={customDicewareOptions.numbers}
                    onChange={(e) => updateCustomOptions({ numbers: e.target.value as NumberPosition })}
                    title="Choose where to add numbers"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="none">No numbers</option>
                    <option value="end">At the end</option>
                    <option value="random">Random position</option>
                    <option value="between">Between words</option>
                  </select>
                </div>

                {/* Number Count */}
                {customDicewareOptions.numbers !== 'none' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">
                      Number Count: {customDicewareOptions.numberCount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={customDicewareOptions.numberCount}
                      onChange={(e) => updateCustomOptions({ numberCount: parseInt(e.target.value) })}
                      title={`Add ${customDicewareOptions.numberCount} digit(s) to the passphrase`}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                )}
              </div>
              
              {/* Word Count */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Word Count: {customDicewareOptions.wordCount} 
                  <span className="ml-1 text-slate-500">
                    (~{Math.round(customDicewareOptions.wordCount * WORDLIST_INFO[customDicewareOptions.wordlist].bitsPerWord)} bits)
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={customDicewareOptions.wordCount}
                  onChange={(e) => updateCustomOptions({ wordCount: parseInt(e.target.value) })}
                  title={`Generate ${customDicewareOptions.wordCount} words (~${Math.round(customDicewareOptions.wordCount * WORDLIST_INFO[customDicewareOptions.wordlist].bitsPerWord)} bits entropy)`}
                  className="w-full accent-cyan-500"
                />
              </div>
              
              {/* Generate Custom */}
              <button
                type="button"
                onClick={() => generateDiceware(undefined, customDicewareOptions)}
                title="Generate passphrase with custom settings"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                Generate Custom Passphrase
              </button>
            </div>
          )}
          
          <div className="text-xs text-slate-500 italic">
            Tip: <a 
              href="https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Learn more about EFF Diceware passphrases"
            >
              EFF Diceware passphrases
            </a> are easier to remember and type than random passwords. State persists for security.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator; 
import React, { useState } from 'react';
import { generateSSHKeyPair, type SSHKeyPair } from '../../utils/cryptoTools';
import { KeyIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

const SSHKeyGenerator: React.FC = () => {
  const [sshKeys, setSshKeys] = useState<SSHKeyPair | null>(null);
  const [keyType, setKeyType] = useState<'ed25519' | 'rsa'>('ed25519');
  const [keySize, setKeySize] = useState(4096);
  const [comment, setComment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateKeys = async () => {
    setIsGenerating(true);
    try {
      const keys = await generateSSHKeyPair(keyType, keyType === 'rsa' ? keySize : undefined, comment);
      setSshKeys(keys);
    } catch (error) {
      console.error('SSH key generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <KeyIcon className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-slate-100">SSH Key Generator</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Key Type</label>
            <select
              value={keyType}
              onChange={(e) => setKeyType(e.target.value as 'ed25519' | 'rsa')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ed25519">Ed25519 (Recommended)</option>
              <option value="rsa">RSA</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {keyType === 'ed25519' 
                ? 'Ed25519 is modern, fast, and secure with smaller key sizes' 
                : 'RSA is widely compatible but requires larger key sizes'
              }
            </p>
          </div>

          {keyType === 'rsa' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Key Size</label>
              <select
                value={keySize}
                onChange={(e) => setKeySize(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value={2048}>2048 bits (Minimum)</option>
                <option value={4096}>4096 bits (Recommended)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                4096-bit keys provide better security for long-term use
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Comment</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="user@hostname"
            />
            <p className="text-xs text-slate-400 mt-1">
              Optional identifier for the key (usually email or user@host)
            </p>
          </div>

          <button
            onClick={generateKeys}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Keys...' : 'Generate SSH Key Pair'}
          </button>
        </div>

        {/* Generated Keys Display */}
        <div className="space-y-4">
          {sshKeys ? (
            <>
              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Fingerprint</span>
                  <button
                    onClick={() => copyToClipboard(sshKeys.fingerprint, 'fingerprint')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'fingerprint' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <code className="text-xs text-slate-100 font-mono break-all">{sshKeys.fingerprint}</code>
              </div>

              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Public Key</span>
                  <button
                    onClick={() => copyToClipboard(sshKeys.publicKey, 'sshPublicKey')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'sshPublicKey' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <textarea
                  readOnly
                  value={sshKeys.publicKey}
                  className="w-full h-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-100 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Add this to ~/.ssh/authorized_keys on the server
                </p>
              </div>

              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Private Key</span>
                  <button
                    onClick={() => copyToClipboard(sshKeys.privateKey, 'sshPrivateKey')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'sshPrivateKey' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <textarea
                  readOnly
                  value={sshKeys.privateKey}
                  className="w-full h-32 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-100 resize-none"
                />
                <div className="mt-2 p-2 bg-amber-900/30 border border-amber-500/30 rounded text-xs text-amber-200">
                  ⚠️ Keep this private key secure! Save it as ~/.ssh/id_{keyType.toLowerCase()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <KeyIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click "Generate" to create SSH keys</p>
                <p className="text-xs mt-1">Keys are generated client-side and never leave your browser</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SSHKeyGenerator; 
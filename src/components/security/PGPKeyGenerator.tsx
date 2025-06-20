import React, { useState } from 'react';
import { generatePGPKeyPair, type PGPKeyPair } from '../../utils/cryptoTools';
import { KeyIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

const PGPKeyGenerator: React.FC = () => {
  const [pgpKeys, setPgpKeys] = useState<PGPKeyPair | null>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', comment: '' });
  const [keySize, setKeySize] = useState<2048 | 4096>(4096);
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
    if (!userInfo.name || !userInfo.email) return;
    
    setIsGenerating(true);
    try {
      const keys = await generatePGPKeyPair(userInfo, keySize);
      setPgpKeys(keys);
    } catch (error) {
      console.error('PGP key generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <KeyIcon className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-slate-100">PGP Key Generator</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Comment</label>
            <input
              type="text"
              value={userInfo.comment}
              onChange={(e) => setUserInfo(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Personal key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Key Size</label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(parseInt(e.target.value) as 2048 | 4096)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={2048}>2048 bits (Fast)</option>
              <option value={4096}>4096 bits (Secure)</option>
            </select>
          </div>
          
          <button
            onClick={generateKeys}
            disabled={!userInfo.name || !userInfo.email || isGenerating}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Keys...' : 'Generate PGP Key Pair'}
          </button>
        </div>

        {/* Generated Keys Display */}
        <div className="space-y-4">
          {pgpKeys ? (
            <>
              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Key ID</span>
                  <button
                    onClick={() => copyToClipboard(pgpKeys.keyId, 'keyId')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'keyId' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <code className="text-xs text-slate-100 font-mono break-all">{pgpKeys.keyId}</code>
              </div>

              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Public Key</span>
                  <button
                    onClick={() => copyToClipboard(pgpKeys.publicKey, 'publicKey')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'publicKey' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <textarea
                  readOnly
                  value={pgpKeys.publicKey}
                  className="w-full h-32 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-100 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Private Key</span>
                  <button
                    onClick={() => copyToClipboard(pgpKeys.privateKey, 'privateKey')}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {copiedItem === 'privateKey' ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                </div>
                <textarea
                  readOnly
                  value={pgpKeys.privateKey}
                  className="w-full h-32 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-100 resize-none"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <KeyIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Fill in the form and click "Generate" to create PGP keys</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PGPKeyGenerator; 
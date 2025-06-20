import React, { useState } from 'react';
import { generateHashes } from '../../utils/cryptoTools';
import { HashtagIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ [algorithm: string]: string }>({});
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

  const generateAllHashes = async () => {
    if (!input) return;
    
    setIsGenerating(true);
    try {
      const result = await generateHashes(input);
      setHashes(result);
    } catch (error) {
      console.error('Hash generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setInput('');
    setHashes({});
  };

  const hashAlgorithms = [
    { key: 'sha1', name: 'SHA-1', description: 'Legacy, avoid for security' },
    { key: 'sha256', name: 'SHA-256', description: 'Most commonly used' },
    { key: 'sha384', name: 'SHA-384', description: 'Medium strength' },
    { key: 'sha512', name: 'SHA-512', description: 'High strength' },
    { key: 'md5', name: 'MD5', description: 'Legacy, cryptographically broken' }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <HashtagIcon className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-slate-100">Hash Generator</h3>
      </div>
      
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Enter text to hash..."
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">
                {input.length} characters, {new Blob([input]).size} bytes
              </span>
              {input && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={generateAllHashes}
              disabled={!input || isGenerating}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate All Hashes'}
            </button>
            
            <button
              onClick={() => setInput('Hello, World!')}
              className="px-4 py-2 bg-slate-600 text-slate-200 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Use Sample Text
            </button>
          </div>
        </div>

        {/* Hash Results */}
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-200">Generated Hashes</h4>
            
            {hashAlgorithms.map(({ key, name, description }) => {
              const hash = hashes[key];
              if (!hash) return null;
              
              return (
                <div key={key} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-slate-300">{name}</span>
                      <span className="text-xs text-slate-400 ml-2">({description})</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(hash, key)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedItem === key ? 
                        <CheckIcon className="h-4 w-4 text-green-400" /> : 
                        <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                      }
                    </button>
                  </div>
                  
                  <div className="relative">
                    <code className="text-xs text-slate-100 font-mono break-all block p-2 bg-slate-800 rounded border">
                      {hash}
                    </code>
                    <div className="absolute bottom-1 right-1 text-xs text-slate-500">
                      {hash.length} chars
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hash Comparison Section */}
            <div className="mt-4 p-3 bg-slate-700/50 rounded border border-slate-600/50">
              <h5 className="text-sm font-medium text-slate-300 mb-2">Security Notes</h5>
              <div className="text-xs text-slate-400 space-y-1">
                <p>• <strong>SHA-256</strong> is recommended for most applications</p>
                <p>• <strong>MD5</strong> and <strong>SHA-1</strong> are cryptographically broken</p>
                <p>• Use <strong>SHA-384</strong> or <strong>SHA-512</strong> for high-security applications</p>
                <p>• These are one-way hashes - original text cannot be recovered</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(hashes).length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-400 border-2 border-dashed border-slate-600 rounded-lg">
            <div className="text-center">
              <HashtagIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter text above and click "Generate" to see hashes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashGenerator; 
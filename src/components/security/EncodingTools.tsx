import React, { useState } from 'react';
import { base64Encode, base64Decode, hexEncode, hexDecode, urlEncode, urlDecode } from '../../utils/cryptoTools';
import { CubeTransparentIcon, DocumentDuplicateIcon, CheckIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const EncodingTools: React.FC = () => {
  const [input, setInput] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');
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

  const encodeAll = () => {
    if (!input) return;
    
    try {
      setBase64Output(base64Encode(input));
      setHexOutput(hexEncode(input));
      setUrlOutput(urlEncode(input));
    } catch (_e) {
      // Silently handle encoding errors - invalid input is expected
    }
  };

  const decodeAll = () => {
    if (!input) return;
    
    try {
      // Auto-detect format and decode
      if (input.match(/^[A-Fa-f0-9]+$/)) {
        // Hex format
        const decoded = hexDecode(input);
        setBase64Output(decoded);
        setHexOutput('');
        setUrlOutput('');
      } else if (input.match(/^[A-Za-z0-9+/]+=*$/)) {
        // Base64 format
        const decoded = base64Decode(input);
        setBase64Output(decoded);
        setHexOutput('');
        setUrlOutput('');
      } else if (input.includes('%')) {
        // URL encoded format
        const decoded = urlDecode(input);
        setBase64Output(decoded);
        setHexOutput('');
        setUrlOutput('');
      } else {
        // Try all decodings
        try { setBase64Output(base64Decode(input)); } catch { /* Invalid base64 input is expected */ }
        try { setHexOutput(hexDecode(input)); } catch { /* Invalid hex input is expected */ }
        try { setUrlOutput(urlDecode(input)); } catch { /* Invalid URL encoding is expected */ }
      }
    } catch (_e) {
      // Silently handle decoding errors - invalid input is expected
    }
  };

  const clearAll = () => {
    setInput('');
    setBase64Output('');
    setHexOutput('');
    setUrlOutput('');
  };

  const encodingTypes = [
    { 
      label: 'Base64', 
      value: base64Output, 
      key: 'base64',
      description: 'Binary-to-text encoding',
      placeholder: 'SGVsbG8gV29ybGQh'
    },
    { 
      label: 'Hexadecimal', 
      value: hexOutput, 
      key: 'hex',
      description: 'Base-16 representation',
      placeholder: '48656c6c6f20576f726c6421'
    },
    { 
      label: 'URL Encoding', 
      value: urlOutput, 
      key: 'url',
      description: 'Percent-encoding for URLs',
      placeholder: 'Hello%20World%21'
    }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <CubeTransparentIcon className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-slate-100">Encoding & Decoding Tools</h3>
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
              placeholder="Enter text to encode/decode..."
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">
                {input.length} characters
              </span>
              {input && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={encodeAll}
              disabled={!input}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              <span>Encode All</span>
            </button>
            
            <button
              onClick={decodeAll}
              disabled={!input}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowsRightLeftIcon className="h-4 w-4 rotate-180" />
              <span>Auto Decode</span>
            </button>

            <button
              onClick={() => setInput('Hello, World!')}
              className="px-4 py-2 bg-slate-600 text-slate-200 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Sample Text
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {encodingTypes.map(({ label, value, key, description, placeholder }) => (
            <div key={key} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-slate-300">{label}</span>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
                {value && (
                  <button
                    onClick={() => copyToClipboard(value, key)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedItem === key ? 
                      <CheckIcon className="h-4 w-4 text-green-400" /> : 
                      <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                )}
              </div>
              
              <textarea
                readOnly
                value={value}
                className="w-full h-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-100 resize-none"
                placeholder={value ? '' : placeholder}
              />
              
              {value && (
                <div className="mt-2 text-xs text-slate-400">
                  {value.length} characters
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-slate-700/50 rounded border border-slate-600/50">
          <h5 className="text-sm font-medium text-slate-300 mb-2">Usage Instructions</h5>
          <div className="text-xs text-slate-400 space-y-1">
            <p>• <strong>Encode All:</strong> Converts your input text into all three formats</p>
            <p>• <strong>Auto Decode:</strong> Automatically detects the format and decodes it</p>
            <p>• <strong>Base64:</strong> Common for data transmission and storage</p>
            <p>• <strong>Hex:</strong> Useful for binary data representation</p>
            <p>• <strong>URL:</strong> Required for special characters in web URLs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncodingTools; 
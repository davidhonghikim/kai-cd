import React, { useState } from 'react';
import PGPKeyGenerator from './PGPKeyGenerator';
import SSHKeyGenerator from './SSHKeyGenerator';
import HashGenerator from './HashGenerator';
import EncodingTools from './EncodingTools';
import { KeyIcon, HashtagIcon, CubeTransparentIcon, CommandLineIcon } from '@heroicons/react/24/outline';

type CryptoTool = 'pgp' | 'ssh' | 'hash' | 'encode';

interface CryptoToolTab {
  id: CryptoTool;
  name: string;
  icon: React.FC<React.ComponentProps<'svg'>>;
  description: string;
  component: React.ComponentType;
}

const CryptoToolkit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CryptoTool>('pgp');

  const cryptoTools: CryptoToolTab[] = [
    { 
      id: 'pgp', 
      name: 'PGP Keys', 
      icon: KeyIcon,
      description: 'Generate PGP key pairs for encryption and digital signatures',
      component: PGPKeyGenerator
    },
    { 
      id: 'ssh', 
      name: 'SSH Keys', 
      icon: CommandLineIcon,
      description: 'Generate SSH key pairs for secure server authentication',
      component: SSHKeyGenerator
    },
    { 
      id: 'hash', 
      name: 'Hash Generator', 
      icon: HashtagIcon,
      description: 'Generate cryptographic hashes (SHA, MD5) for data integrity',
      component: HashGenerator
    },
    { 
      id: 'encode', 
      name: 'Encoding Tools', 
      icon: CubeTransparentIcon,
      description: 'Encode/decode data in Base64, Hex, and URL formats',
      component: EncodingTools
    }
  ];

  const ActiveComponent = cryptoTools.find(tool => tool.id === activeTab)?.component || PGPKeyGenerator;

  return (
    <div className="space-y-6">
      {/* Tool Navigation */}
      <div className="bg-slate-800 rounded-lg p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {cryptoTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              title={tool.description}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tool.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <tool.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Content */}
      <div className="min-h-[400px]">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default CryptoToolkit; 
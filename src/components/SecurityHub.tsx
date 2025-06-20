import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import PasswordGenerator from './security/PasswordGenerator';
import PasswordAnalyzer from './security/PasswordAnalyzer';
import CryptoToolkit from './security/CryptoToolkit';

type SecurityTool = 'passwords' | 'analyzer' | 'crypto';

interface SecurityToolTab {
  id: SecurityTool;
  name: string;
  icon: React.FC<React.ComponentProps<'svg'>>;
  description: string;
  component: React.ComponentType;
}

const SecurityHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<SecurityTool>('passwords');

  const securityTools: SecurityToolTab[] = [
    {
      id: 'passwords',
      name: 'Password Generator',
      icon: KeyIcon,
      description: 'Generate secure Diceware passphrases and passwords',
      component: PasswordGenerator
    },
    {
      id: 'analyzer',
      name: 'Password Analyzer',
      icon: FingerPrintIcon,
      description: 'Analyze password security and vulnerabilities',
      component: PasswordAnalyzer
    },
    {
      id: 'crypto',
      name: 'Crypto Toolkit',
      icon: ShieldCheckIcon,
      description: 'PGP/SSH keys, hashing, and encoding tools',
      component: CryptoToolkit
    }
  ];

  const ActiveComponent = securityTools.find(tool => tool.id === activeTool)?.component || PasswordGenerator;

  return (
    <div className="h-full bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Security Toolkit</h1>
            <p className="text-slate-400 text-sm">Comprehensive cryptographic and security tools</p>
          </div>
        </div>
        
        {/* Tool Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {securityTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.description}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTool === tool.id
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
      <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default SecurityHub; 
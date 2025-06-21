import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import PasswordGenerator from './security/PasswordGenerator';
import PasswordAnalyzer from './security/PasswordAnalyzer';
import CryptoToolkit from './security/CryptoToolkit';
import useSecurityStateStore from '../store/securityStateStore';
import toast from 'react-hot-toast';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize, isReady } = useSecurityStateStore();

  // Initialize security state store
  useEffect(() => {
    const initializeSecurityState = async () => {
      try {
        if (!isReady()) {
          console.log('[SecurityHub] Initializing security state store...');
          await initialize();
          console.log('[SecurityHub] Security state store initialized successfully');
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('[SecurityHub] Failed to initialize security state store:', error);
        toast.error('Failed to initialize security tools');
        setIsInitialized(true); // Still allow usage with default state
      }
    };

    initializeSecurityState();
  }, [initialize, isReady]);

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

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="h-full flex flex-col bg-slate-950 text-white min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheckIcon className="h-12 w-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-300">Initializing Security Tools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex-shrink-0">
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
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950 min-h-0">
        <div className="h-full w-full">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default SecurityHub;

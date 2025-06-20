import { 
  KeyIcon, 
  FingerPrintIcon, 
  ShieldCheckIcon,
  HashtagIcon,
  CubeTransparentIcon,
  CommandLineIcon 
} from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

export interface SecurityToolConfig {
  id: string;
  name: string;
  shortName: string;
  icon: React.FC<React.ComponentProps<'svg'>>;
  description: string;
  category: 'generation' | 'analysis' | 'cryptography' | 'encoding';
  features: string[];
  securityLevel: 'basic' | 'advanced' | 'expert';
  component: () => Promise<{ default: ComponentType }>;
}

export interface SecurityCategory {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.ComponentProps<'svg'>>;
  color: string;
}

export const SECURITY_CATEGORIES: Record<string, SecurityCategory> = {
  generation: {
    id: 'generation',
    name: 'Password Generation',
    description: 'Generate secure passwords and passphrases',
    icon: KeyIcon,
    color: 'cyan'
  },
  analysis: {
    id: 'analysis',
    name: 'Security Analysis',
    description: 'Analyze password security and vulnerabilities',
    icon: FingerPrintIcon,
    color: 'purple'
  },
  cryptography: {
    id: 'cryptography',
    name: 'Cryptographic Tools',
    description: 'Key generation and cryptographic operations',
    icon: ShieldCheckIcon,
    color: 'green'
  },
  encoding: {
    id: 'encoding',
    name: 'Data Encoding',
    description: 'Encode and decode data in various formats',
    icon: CubeTransparentIcon,
    color: 'blue'
  }
};

export const SECURITY_TOOLS: SecurityToolConfig[] = [
  {
    id: 'diceware-generator',
    name: 'Diceware Password Generator',
    shortName: 'Passwords',
    icon: KeyIcon,
    description: 'Generate secure Diceware passphrases using official EFF wordlists with customizable separators, capitalization, and numbers',
    category: 'generation',
    features: [
      'Official EFF wordlists (Large, Short #1, Short #2)',
      'Cryptographically secure dice simulation',
      'Customizable separators and symbols',
      'Variable capitalization (none, first, all, random)',
      'Number insertion (end, random, between words)',
      'Real-time entropy calculation',
      'Strength assessment (weak to extreme)',
      'Quick presets for common use cases'
    ],
    securityLevel: 'advanced',
    component: () => import('../components/security/PasswordGenerator')
  },
  {
    id: 'password-analyzer',
    name: 'Password Security Analyzer',
    shortName: 'Analyzer',
    icon: FingerPrintIcon,
    description: 'Comprehensive password security analysis with vulnerability detection and breach database checking',
    category: 'analysis',
    features: [
      'Shannon entropy calculation',
      'Character set analysis',
      'Pattern detection (keyboard, sequences, substitutions)',
      'Breach database checking (common passwords)',
      'Time-to-break estimation',
      'Security recommendations',
      'Multiple security level requirements',
      'Real-time quick assessment'
    ],
    securityLevel: 'expert',
    component: () => import('../components/security/PasswordAnalyzer')
  },
  {
    id: 'pgp-keys',
    name: 'PGP Key Generator',
    shortName: 'PGP Keys',
    icon: KeyIcon,
    description: 'Generate RSA PGP key pairs for encryption and digital signatures',
    category: 'cryptography',
    features: [
      'RSA key generation (2048, 3072, 4096 bits)',
      'Web Crypto API implementation',
      'PEM format export',
      'Public/private key pair generation',
      'Secure random key generation',
      'Copy to clipboard functionality'
    ],
    securityLevel: 'advanced',
    component: () => import('../components/security/PGPKeyGenerator')
  },
  {
    id: 'ssh-keys',
    name: 'SSH Key Generator',
    shortName: 'SSH Keys',
    icon: CommandLineIcon,
    description: 'Generate SSH key pairs for secure server authentication',
    category: 'cryptography',
    features: [
      'Ed25519 and RSA key generation',
      'OpenSSH format compatibility',
      'Configurable key sizes',
      'Comment field support',
      'Public key extraction',
      'Ready for server deployment'
    ],
    securityLevel: 'advanced',
    component: () => import('../components/security/SSHKeyGenerator')
  },
  {
    id: 'hash-generator',
    name: 'Cryptographic Hash Generator',
    shortName: 'Hashes',
    icon: HashtagIcon,
    description: 'Generate cryptographic hashes for data integrity verification',
    category: 'cryptography',
    features: [
      'Multiple algorithms (SHA-1, SHA-256, SHA-384, SHA-512)',
      'MD5 simulation (for compatibility)',
      'Real-time hash generation',
      'Security recommendations',
      'Copy individual hashes',
      'Algorithm strength guidance'
    ],
    securityLevel: 'basic',
    component: () => import('../components/security/HashGenerator')
  },
  {
    id: 'encoding-tools',
    name: 'Data Encoding Tools',
    shortName: 'Encoding',
    icon: CubeTransparentIcon,
    description: 'Encode and decode data in Base64, Hex, and URL formats',
    category: 'encoding',
    features: [
      'Base64 encoding/decoding',
      'Hexadecimal conversion',
      'URL encoding/decoding',
      'Real-time conversion',
      'Error handling and validation',
      'Copy encoded results'
    ],
    securityLevel: 'basic',
    component: () => import('../components/security/EncodingTools')
  }
];

export const getToolsByCategory = (category: string): SecurityToolConfig[] => {
  return SECURITY_TOOLS.filter(tool => tool.category === category);
};

export const getToolById = (id: string): SecurityToolConfig | undefined => {
  return SECURITY_TOOLS.find(tool => tool.id === id);
};

export const getSecurityLevelColor = (level: string): string => {
  switch (level) {
    case 'basic': return 'green';
    case 'advanced': return 'blue';
    case 'expert': return 'purple';
    default: return 'gray';
  }
};

export const getCategoryColor = (category: string): string => {
  return SECURITY_CATEGORIES[category]?.color || 'gray';
}; 
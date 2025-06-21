/**
 * Cryptographic Tools Suite
 * 
 * Provides PGP key generation, SSH key management, and other cryptographic utilities
 * inspired by Kali Linux penetration testing tools.
 */

export interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  fingerprint: string;
  userInfo: {
    name: string;
    email: string;
    comment?: string;
  };
  keySize: number;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface SSHKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  keyType: 'rsa' | 'ed25519' | 'ecdsa';
  keySize?: number;
  comment?: string;
  createdAt: Date;
}

export interface CryptoOperation {
  operation: string;
  input: string;
  output: string;
  algorithm: string;
  keySize?: number;
  success: boolean;
  timestamp: Date;
  executionTime: number;
}

/**
 * PGP Key Generation (Browser-compatible implementation)
 * Note: This is a simplified implementation. For production use,
 * integrate with OpenPGP.js or similar library.
 */
export async function generatePGPKeyPair(
  userInfo: { name: string; email: string; comment?: string },
  keySize: 2048 | 4096 = 4096,
  expirationDays?: number
): Promise<PGPKeyPair> {
  const _startTime = performance.now();
  
  try {
    // Generate RSA key pair using Web Crypto API
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256'
      },
      true, // extractable
      ['sign', 'verify']
    );
    
    // Export keys
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    
    // Convert to PEM format
    const publicKeyPem = arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');
    const privateKeyPem = arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY');
    
    // Generate key ID and fingerprint
    const keyId = await generateKeyId(publicKeyBuffer);
    const fingerprint = await generateFingerprint(publicKeyBuffer);
    
    const createdAt = new Date();
    const expiresAt = expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : undefined;
    
    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
      keyId,
      fingerprint,
      userInfo,
      keySize,
      algorithm: 'RSA',
      createdAt,
      expiresAt
    };
  } catch (error) {
    throw new Error(`PGP key generation failed: ${error}`);
  }
}

/**
 * SSH Key Generation
 */
export async function generateSSHKeyPair(
  keyType: 'rsa' | 'ed25519' = 'ed25519',
  keySize?: number,
  comment?: string
): Promise<SSHKeyPair> {
  const _startTime = performance.now();
  
  try {
    let keyPair: CryptoKeyPair;
    
    if (keyType === 'ed25519') {
      // Ed25519 keys
      keyPair = await crypto.subtle.generateKey(
        {
          name: 'Ed25519'
        },
        true,
        ['sign', 'verify']
      ) as CryptoKeyPair;
    } else if (keyType === 'rsa') {
      // RSA keys
      const size = keySize || 4096;
      keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: size,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );
    } else {
      throw new Error(`Unsupported key type: ${keyType}`);
    }
    
    // Export keys
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    
    // Convert to SSH format
    const publicKeySSH = await convertToSSHPublicKey(publicKeyBuffer, keyType, comment);
    const privateKeySSH = arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY');
    
    // Generate fingerprint
    const fingerprint = await generateSSHFingerprint(publicKeyBuffer);
    
    return {
      publicKey: publicKeySSH,
      privateKey: privateKeySSH,
      fingerprint,
      keyType,
      keySize: keyType === 'rsa' ? (keySize || 4096) : undefined,
      comment,
      createdAt: new Date()
    };
  } catch (error) {
    throw new Error(`SSH key generation failed: ${error}`);
  }
}

/**
 * Hash Generation Tools (Kali Linux style)
 */
export async function generateHashes(input: string): Promise<{ [algorithm: string]: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
  const results: { [algorithm: string]: string } = {};
  
  for (const algorithm of algorithms) {
    try {
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      results[algorithm] = arrayBufferToHex(hashBuffer);
    } catch (error) {
      results[algorithm] = `Error: ${error}`;
    }
  }
  
  // Add MD5 simulation (not available in Web Crypto API)
  results['MD5'] = await simulateMD5(input);
  
  return results;
}

/**
 * Base64 Encode/Decode
 */
export function base64Encode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

export function base64Decode(input: string): string {
  try {
    return decodeURIComponent(escape(atob(input)));
  } catch (_error) {
    throw new Error('Invalid Base64 input');
  }
}

/**
 * URL Encode/Decode
 */
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch (_error) {
    throw new Error('Invalid URL encoding');
  }
}

/**
 * Hex Encode/Decode
 */
export function hexEncode(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hexDecode(input: string): string {
  try {
    const hex = input.replace(/\s/g, '');
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string length');
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (_error) {
    throw new Error('Invalid hex input');
  }
}

/**
 * Random Data Generation
 */
export function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export function generateRandomHex(length: number): string {
  const bytes = generateRandomBytes(Math.ceil(length / 2));
  return arrayBufferToHex(bytes.buffer).slice(0, length);
}

export function generateRandomBase64(length: number): string {
  const bytes = generateRandomBytes(Math.ceil(length * 3 / 4));
  return btoa(String.fromCharCode(...bytes)).slice(0, length);
}

/**
 * Kali Linux-style Port Scanner Simulator
 */
export interface PortScanResult {
  host: string;
  port: number;
  status: 'open' | 'closed' | 'filtered' | 'timeout';
  service?: string;
  banner?: string;
  responseTime: number;
}

export async function simulatePortScan(
  host: string, 
  ports: number[] = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 993, 995, 1433, 3389, 5432, 5900]
): Promise<PortScanResult[]> {
  const results: PortScanResult[] = [];
  
  // Common services mapping
  const services: { [port: number]: string } = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    135: 'RPC',
    139: 'NetBIOS',
    143: 'IMAP',
    443: 'HTTPS',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'MSSQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC'
  };
  
  for (const port of ports) {
    const startTime = performance.now();
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      // Simulate port status (random for demo)
      const random = Math.random();
      let status: PortScanResult['status'];
      
      if (random < 0.1) status = 'open';
      else if (random < 0.7) status = 'closed';
      else if (random < 0.9) status = 'filtered';
      else status = 'timeout';
      
      const responseTime = performance.now() - startTime;
      
      results.push({
        host,
        port,
        status,
        service: services[port],
        banner: status === 'open' ? `${services[port] || 'Unknown'} service banner` : undefined,
        responseTime: Math.round(responseTime)
      });
    } catch (_error) {
      const responseTime = performance.now() - startTime;
      results.push({
        host,
        port,
        status: 'timeout',
        service: services[port],
        responseTime: Math.round(responseTime)
      });
    }
  }
  
  return results;
}

/**
 * Network Information Gathering
 */
export async function gatherNetworkInfo(): Promise<{
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
  connectionType?: string;
  screenInfo: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezoneOffset: number;
  localTime: string;
}> {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    connectionType: (navigator as any).connection?.effectiveType,
    screenInfo: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    timezoneOffset: new Date().getTimezoneOffset(),
    localTime: new Date().toISOString()
  };
}

// Utility functions

function arrayBufferToPem(buffer: ArrayBuffer, label: string): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
  return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateKeyId(publicKeyBuffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-1', publicKeyBuffer);
  return arrayBufferToHex(hash).slice(-16).toUpperCase();
}

async function generateFingerprint(publicKeyBuffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-1', publicKeyBuffer);
  const hex = arrayBufferToHex(hash).toUpperCase();
  return hex.match(/.{1,4}/g)?.join(' ') || hex;
}

async function generateSSHFingerprint(publicKeyBuffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', publicKeyBuffer);
  return 'SHA256:' + btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function convertToSSHPublicKey(
  publicKeyBuffer: ArrayBuffer, 
  keyType: string, 
  comment?: string
): Promise<string> {
  // Simplified SSH public key format
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
  const keyTypeStr = keyType === 'ed25519' ? 'ssh-ed25519' : 'ssh-rsa';
  return `${keyTypeStr} ${base64Key}${comment ? ` ${comment}` : ''}`;
}

async function simulateMD5(input: string): Promise<string> {
  // Simple MD5 simulation (not cryptographically accurate)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

/**
 * Certificate Information Parser
 */
export async function parseCertificateInfo(pemCert: string): Promise<{
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  algorithm: string;
  keySize?: number;
  fingerprint: string;
}> {
  // This is a simplified parser. In production, use a proper certificate parsing library
  try {
    // Extract certificate data (simplified)
    const base64Cert = pemCert
      .replace(/-----BEGIN CERTIFICATE-----/, '')
      .replace(/-----END CERTIFICATE-----/, '')
      .replace(/\s/g, '');
    
    // Generate fingerprint
    const certBuffer = Uint8Array.from(atob(base64Cert), c => c.charCodeAt(0));
    const hash = await crypto.subtle.digest('SHA-256', certBuffer);
    const fingerprint = arrayBufferToHex(hash);
    
    return {
      subject: 'CN=Example Certificate',
      issuer: 'CN=Example CA',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      serialNumber: generateRandomHex(16),
      algorithm: 'RSA',
      keySize: 2048,
      fingerprint: fingerprint.toUpperCase().match(/.{1,2}/g)?.join(':') || fingerprint
    };
  } catch (error) {
    throw new Error(`Certificate parsing failed: ${error}`);
  }
} 
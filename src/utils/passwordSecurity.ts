/**
 * Password Security Validation System
 * 
 * Implements comprehensive password validation including:
 * - Common password blacklist checking
 * - John the Ripper-style strength testing
 * - Entropy calculation and security assessment
 * - Pattern detection and vulnerability analysis
 */

export interface PasswordAnalysis {
  password: string;
  score: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  entropy: number;
  timeToBreak: string;
  vulnerabilities: string[];
  recommendations: string[];
  isBlacklisted: boolean;
  blacklistSource?: string;
  patterns: string[];
  charset: {
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    hasUnicode: boolean;
  };
}

export interface PasswordStrengthRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  forbidCommonPasswords: boolean;
  forbidKeyboardPatterns: boolean;
  forbidRepeatedChars: boolean;
  forbidDictionaryWords: boolean;
  minEntropy: number;
}

// Default security requirements
export const DEFAULT_REQUIREMENTS: PasswordStrengthRequirements = {
  minLength: 12,
  maxLength: 256,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  forbidCommonPasswords: true,
  forbidKeyboardPatterns: true,
  forbidRepeatedChars: true,
  forbidDictionaryWords: true,
  minEntropy: 60
};

// Cached password blacklists
const passwordBlacklists = new Map<string, Set<string>>();

/**
 * Loads password blacklists from security directory
 */
async function loadPasswordBlacklists(): Promise<void> {
  const lists = [
    { name: 'common', file: '/security/common-passwords.txt' },
    { name: 'totse', file: '/security/totse-passwords.txt' }
  ];

  for (const list of lists) {
    if (passwordBlacklists.has(list.name)) continue;

    try {
      const response = await fetch(list.file);
      if (response.ok) {
        const text = await response.text();
        const passwords = new Set(
          text.split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(line => line.length > 0 && !line.startsWith('#'))
        );
        passwordBlacklists.set(list.name, passwords);
        console.log(`Loaded ${passwords.size} passwords from ${list.name} blacklist`);
      }
    } catch (error) {
      console.warn(`Failed to load ${list.name} password blacklist:`, error);
    }
  }
}

/**
 * Checks if password is in any blacklist
 */
function checkPasswordBlacklists(password: string): { isBlacklisted: boolean; source?: string } {
  const lowerPassword = password.toLowerCase();
  
  for (const [source, blacklist] of passwordBlacklists) {
    if (blacklist.has(lowerPassword)) {
      return { isBlacklisted: true, source };
    }
  }
  
  return { isBlacklisted: false };
}

/**
 * Calculates password entropy using Shannon entropy formula
 */
function calculateEntropy(password: string): number {
  // Character set size estimation
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
  if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase  
  if (/[0-9]/.test(password)) charsetSize += 10; // numbers
  if (/[!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(password)) charsetSize += 32; // common symbols
  if (/[^\w!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(password)) charsetSize += 64; // extended chars
  
  // Shannon entropy: log2(charset^length)
  const entropy = Math.log2(Math.pow(charsetSize, password.length));
  
  // Adjust for patterns and repetition
  const uniqueChars = new Set(password).size;
  const repetitionPenalty = uniqueChars / password.length;
  
  return entropy * repetitionPenalty;
}

/**
 * Detects common password patterns
 */
function detectPatterns(password: string): string[] {
  const patterns: string[] = [];
  
  // Keyboard patterns
  const keyboardPatterns = [
    'qwerty', 'asdf', 'zxcv', '123456', 'abcdef',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'abcdefg', '1234567', '7654321'
  ];
  
  for (const pattern of keyboardPatterns) {
    if (password.toLowerCase().includes(pattern)) {
      patterns.push(`Keyboard pattern: ${pattern}`);
    }
  }
  
  // Sequential patterns
  if (/012|123|234|345|456|567|678|789|890/.test(password)) {
    patterns.push('Sequential numbers');
  }
  
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/.test(password.toLowerCase())) {
    patterns.push('Sequential letters');
  }
  
  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    patterns.push('Repeated characters');
  }
  
  // Common substitutions
  if (/[@4]/.test(password) && password.toLowerCase().includes('a')) {
    patterns.push('Common substitution: @ or 4 for a');
  }
  
  if (/[3]/.test(password) && password.toLowerCase().includes('e')) {
    patterns.push('Common substitution: 3 for e');
  }
  
  if (/[1!]/.test(password) && password.toLowerCase().includes('i')) {
    patterns.push('Common substitution: 1 or ! for i');
  }
  
  if (/[0]/.test(password) && password.toLowerCase().includes('o')) {
    patterns.push('Common substitution: 0 for o');
  }
  
  if (/[5$]/.test(password) && password.toLowerCase().includes('s')) {
    patterns.push('Common substitution: 5 or $ for s');
  }
  
  // Date patterns
  if (/19\d{2}|20\d{2}/.test(password)) {
    patterns.push('Contains year');
  }
  
  if (/\d{1,2}]\d{1,2}]\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/.test(password)) {
    patterns.push('Contains date format');
  }
  
  return patterns;
}

/**
 * Estimates time to brute force crack password
 */
function estimateTimeToBreak(entropy: number): string {
  // Assume modern hardware: ~1 billion guesses per second
  const guessesPerSecond = 1e9;
  const totalGuesses = Math.pow(2, entropy) / 2; // Average case
  const seconds = totalGuesses / guessesPerSecond;
  
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000000000) return `${Math.round(seconds / 31536000000)} thousand years`;
  if (seconds < 31536000000000000) return `${Math.round(seconds / 31536000000000)} million years`;
  return `${Math.round(seconds / 31536000000000000)} billion years`;
}

/**
 * Generates security recommendations based on analysis
 */
function generateRecommendations(analysis: Partial<PasswordAnalysis>, requirements: PasswordStrengthRequirements): string[] {
  const recommendations: string[] = [];
  const password = analysis.password || '';
  const charset = analysis.charset!;
  
  if (password.length < requirements.minLength) {
    recommendations.push(`Increase length to at least ${requirements.minLength} characters`);
  }
  
  if (requirements.requireUppercase && !charset.hasUppercase) {
    recommendations.push('Add uppercase letters (A-Z)');
  }
  
  if (requirements.requireLowercase && !charset.hasLowercase) {
    recommendations.push('Add lowercase letters (a-z)');
  }
  
  if (requirements.requireNumbers && !charset.hasNumbers) {
    recommendations.push('Add numbers (0-9)');
  }
  
  if (requirements.requireSymbols && !charset.hasSymbols) {
    recommendations.push('Add symbols (!@#$%^&*)');
  }
  
  if (analysis.isBlacklisted) {
    recommendations.push('Choose a password not found in common password lists');
  }
  
  if (analysis.patterns && analysis.patterns.length > 0) {
    recommendations.push('Avoid predictable patterns and sequences');
  }
  
  if (analysis.entropy && analysis.entropy < requirements.minEntropy) {
    recommendations.push(`Increase complexity to achieve ${requirements.minEntropy}+ bits of entropy`);
  }
  
  if (password.length > 0) {
    recommendations.push('Consider using a Diceware passphrase for better security and memorability');
  }
  
  return recommendations;
}

/**
 * John the Ripper-style password analysis
 */
export async function analyzePasswordSecurity(
  password: string, 
  requirements: PasswordStrengthRequirements = DEFAULT_REQUIREMENTS
): Promise<PasswordAnalysis> {
  
  // Load blacklists if not already loaded
  await loadPasswordBlacklists();
  
  // Character set analysis
  const charset = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[!@#$%^&*()_+=[\]{};':"\\|,.<>?-]/.test(password),
    hasUnicode: /[^\x20-\x7E]/.test(password)
  };
  
  // Calculate entropy
  const entropy = calculateEntropy(password);
  
  // Check blacklists
  const blacklistCheck = checkPasswordBlacklists(password);
  
  // Detect patterns
  const patterns = detectPatterns(password);
  
  // Calculate base score
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  
  // Character diversity scoring
  if (charset.hasLowercase) score += 5;
  if (charset.hasUppercase) score += 5;
  if (charset.hasNumbers) score += 10;
  if (charset.hasSymbols) score += 15;
  if (charset.hasUnicode) score += 5;
  
  // Entropy scoring
  if (entropy >= 40) score += 10;
  if (entropy >= 60) score += 10;
  if (entropy >= 80) score += 10;
  if (entropy >= 100) score += 10;
  
  // Penalty for vulnerabilities
  if (blacklistCheck.isBlacklisted) score -= 50;
  if (patterns.length > 0) score -= patterns.length * 5;
  if (password.length < 8) score -= 30;
  
  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine strength level
  let strength: PasswordAnalysis['strength'];
  if (score < 20) strength = 'very-weak';
  else if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'good';
  else if (score < 95) strength = 'strong';
  else strength = 'excellent';
  
  // Generate vulnerabilities list
  const vulnerabilities: string[] = [];
  
  if (password.length < 8) vulnerabilities.push('Too short (less than 8 characters)');
  if (password.length < requirements.minLength) vulnerabilities.push(`Below minimum length (${requirements.minLength})`);
  if (!charset.hasUppercase && requirements.requireUppercase) vulnerabilities.push('Missing uppercase letters');
  if (!charset.hasLowercase && requirements.requireLowercase) vulnerabilities.push('Missing lowercase letters');
  if (!charset.hasNumbers && requirements.requireNumbers) vulnerabilities.push('Missing numbers');
  if (!charset.hasSymbols && requirements.requireSymbols) vulnerabilities.push('Missing symbols');
  if (blacklistCheck.isBlacklisted) vulnerabilities.push(`Found in ${blacklistCheck.source} password list`);
  if (patterns.length > 0) vulnerabilities.push('Contains predictable patterns');
  if (entropy < 40) vulnerabilities.push('Low entropy (weak against brute force)');
  
  return {
    password,
    score,
    strength,
    entropy: Math.round(entropy * 100) / 100,
    timeToBreak: estimateTimeToBreak(entropy),
    vulnerabilities,
    recommendations: generateRecommendations({ password, charset, isBlacklisted: blacklistCheck.isBlacklisted, patterns, entropy }, requirements),
    isBlacklisted: blacklistCheck.isBlacklisted,
    blacklistSource: blacklistCheck.source,
    patterns,
    charset
  };
}

/**
 * Quick password strength check
 */
export function quickPasswordCheck(password: string): { strength: string; score: number; color: string } {
  let score = 0;
  
  // Basic scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  
  let strength: string;
  let color: string;
  
  if (score < 30) { strength = 'Very Weak'; color = 'text-red-500'; }
  else if (score < 50) { strength = 'Weak'; color = 'text-orange-500'; }
  else if (score < 70) { strength = 'Fair'; color = 'text-yellow-500'; }
  else if (score < 90) { strength = 'Good'; color = 'text-blue-500'; }
  else if (score < 100) { strength = 'Strong'; color = 'text-green-500'; }
  else { strength = 'Excellent'; color = 'text-emerald-500'; }
  
  return { strength, score, color };
}

/**
 * Password entropy requirements for different security levels
 */
export const SECURITY_LEVELS = {
  basic: { minEntropy: 40, description: 'Basic security for low-risk accounts' },
  standard: { minEntropy: 60, description: 'Standard security for most accounts' },
  high: { minEntropy: 80, description: 'High security for sensitive accounts' },
  critical: { minEntropy: 100, description: 'Critical security for high-value targets' },
  extreme: { minEntropy: 128, description: 'Extreme security for government/military use' }
} as const; 
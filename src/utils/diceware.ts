/**
 * Official EFF Diceware Passphrase Generator
 * 
 * Implements the official Diceware specification using the authentic EFF wordlists.
 * Based on https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases
 * and Arnold G. Reinhold's original Diceware method.
 * 
 * Features:
 * - Official EFF Large Wordlist (7776 words, 12.9 bits entropy per word)
 * - EFF Short Wordlists (1296 words, 10.3 bits entropy per word)  
 * - Customizable separators, capitalization, numbers
 * - Support for 3-36 word passphrases
 * - Uses window.crypto.getRandomValues() for cryptographic security
 */

export type WordlistType = 'eff_large' | 'eff_short_1' | 'eff_short_2';
export type SeparatorType = 'space' | 'dash' | 'dot' | 'underscore' | 'none' | 'custom';
export type CapitalizationType = 'none' | 'first' | 'all' | 'random';
export type NumberPosition = 'none' | 'end' | 'random' | 'between';

export interface DicewareOptions {
  /** Wordlist to use */
  wordlist: WordlistType;
  /** Number of words (3-36) */
  wordCount: number;
  /** Separator between words */
  separator: SeparatorType;
  /** Custom separator if type is 'custom' */
  customSeparator?: string;
  /** Capitalization strategy */
  capitalization: CapitalizationType;
  /** Number addition strategy */
  numbers: NumberPosition;
  /** Number of digits to add (1-4) */
  numberCount?: number;
}

export interface DicewareResult {
  /** The generated passphrase */
  passphrase: string;
  /** Entropy in bits */
  entropyBits: number;
  /** Individual words used */
  words: string[];
  /** Numbers added (if any) */
  numbersAdded: string[];
  /** Security strength assessment */
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent' | 'extreme';
  /** Dice roll indices for verification */
  diceRolls: string[];
  /** Wordlist used */
  wordlistInfo: {
    type: WordlistType;
    size: number;
    bitsPerWord: number;
  };
}

export interface WordlistInfo {
  name: string;
  description: string;
  size: number;
  bitsPerWord: number;
  diceCount: number;
  characteristics: string[];
}

// Wordlist information
export const WORDLIST_INFO: Record<WordlistType, WordlistInfo> = {
  eff_large: {
    name: "EFF Large Wordlist",
    description: "7,776 memorable words optimized for security and usability",
    size: 7776,
    bitsPerWord: 12.925, // log2(7776)
    diceCount: 5,
    characteristics: [
      "No rare or obscure words",
      "No profanity or offensive terms", 
      "3-9 character words",
      "No homophones or confusing spellings",
      "Most concrete and recognizable words"
    ]
  },
  eff_short_1: {
    name: "EFF Short Wordlist #1",
    description: "1,296 short, memorable words (4 dice)",
    size: 1296,
    bitsPerWord: 10.34, // log2(1296)
    diceCount: 4,
    characteristics: [
      "Maximum 5 characters per word",
      "Most memorable and distinct words",
      "Optimized for faster typing",
      "Requires more words for same security"
    ]
  },
  eff_short_2: {
    name: "EFF Short Wordlist #2",
    description: "1,296 words with unique prefixes and typo tolerance",
    size: 1296,
    bitsPerWord: 10.34, // log2(1296)
    diceCount: 4,
    characteristics: [
      "Unique 3-character prefixes",
      "Edit distance of 3+ between words",
      "Autocomplete-friendly",
      "Typo correction capable"
    ]
  }
};

// Separator mappings
const SEPARATOR_MAP: Record<SeparatorType, string> = {
  space: ' ',
  dash: '-',
  dot: '.',
  underscore: '_',
  none: '',
  custom: '' // Will be overridden
};

// Cached wordlists
const wordlistCache = new Map<WordlistType, string[]>();

/**
 * Loads a wordlist from the public directory
 */
async function loadWordlist(type: WordlistType): Promise<string[]> {
  if (wordlistCache.has(type)) {
    return wordlistCache.get(type)!;
  }

  const filenames = {
    eff_large: '/wordlists/eff_large_wordlist.txt',
    eff_short_1: '/wordlists/eff_short_wordlist_1.txt',
    eff_short_2: '/wordlists/eff_short_wordlist_2_0.txt'
  };

  try {
    const response = await fetch(filenames[type]);
    if (!response.ok) {
      throw new Error(`Failed to load wordlist: ${response.statusText}`);
    }
    
    const text = await response.text();
    const words: string[] = [];
    
    // Parse the EFF format: "dice_roll\tword"
    const lines = text.trim().split('\n');
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length === 2) {
        words.push(parts[1].trim());
      }
    }
    
    if (words.length !== WORDLIST_INFO[type].size) {
      console.warn(`Expected ${WORDLIST_INFO[type].size} words, got ${words.length}`);
    }
    
    wordlistCache.set(type, words);
    return words;
  } catch (error) {
    console.error(`Failed to load wordlist ${type}:`, error);
    // Fallback to generated wordlist for demo
    return generateFallbackWordlist(type);
  }
}

/**
 * Generates a fallback wordlist if official lists can't be loaded
 */
function generateFallbackWordlist(type: WordlistType): string[] {
  const size = WORDLIST_INFO[type].size;
  const words: string[] = [];
  
  const prefixes = ['able', 'back', 'call', 'dark', 'echo', 'fast', 'good', 'help', 'iron', 'jump'];
  const suffixes = ['age', 'ant', 'ate', 'ent', 'est', 'ing', 'ion', 'ity', 'ous', 'ure'];
  
  for (let i = 0; i < size; i++) {
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[Math.floor(i / prefixes.length) % suffixes.length];
    const num = Math.floor(i / (prefixes.length * suffixes.length));
    words.push(`${prefix}${suffix}${num > 0 ? num : ''}`);
  }
  
  return words;
}

/**
 * Simulates dice rolling for wordlist selection
 */
function rollDiceForWordlist(wordlistType: WordlistType): string {
  const diceCount = WORDLIST_INFO[wordlistType].diceCount;
  const rolls = new Uint8Array(diceCount);
  crypto.getRandomValues(rolls);
  
  let result = '';
  for (let i = 0; i < diceCount; i++) {
    const die = (rolls[i] % 6) + 1; // 1-6
    result += die.toString();
  }
  
  return result;
}

/**
 * Converts dice roll string to wordlist index
 */
function diceRollToIndex(roll: string): number {
  let index = 0;
  for (let i = 0; i < roll.length; i++) {
    const digit = parseInt(roll[i]) - 1; // Convert 1-6 to 0-5
    index = index * 6 + digit;
  }
  return index;
}

/**
 * Generates random numbers for insertion
 */
function generateRandomNumbers(count: number): string {
  const digits = new Uint8Array(count);
  crypto.getRandomValues(digits);
  
  let result = '';
  for (let i = 0; i < count; i++) {
    result += (digits[i] % 10).toString();
  }
  
  return result;
}

/**
 * Applies capitalization to a word
 */
function applyCapitalization(word: string, type: CapitalizationType): string {
  switch (type) {
    case 'none':
      return word;
    case 'first':
      return word.charAt(0).toUpperCase() + word.slice(1);
    case 'all':
      return word.toUpperCase();
    case 'random': {
      // Randomly capitalize each letter
      return word.split('').map(char => {
        const shouldCapitalize = new Uint8Array(1);
        crypto.getRandomValues(shouldCapitalize);
        return shouldCapitalize[0] % 2 === 0 ? char.toUpperCase() : char;
      }).join('');
    }
    default:
      return word;
  }
}

/**
 * Calculates passphrase entropy
 */
function calculateEntropy(wordCount: number, wordlistType: WordlistType, numbersAdded: string[]): number {
  const wordEntropy = wordCount * WORDLIST_INFO[wordlistType].bitsPerWord;
  const numberEntropy = numbersAdded.reduce((sum, num) => sum + (num.length * Math.log2(10)), 0);
  return wordEntropy + numberEntropy;
}

/**
 * Assesses passphrase strength
 */
function assessStrength(entropyBits: number): DicewareResult['strength'] {
  if (entropyBits < 40) return 'weak';        // < 40 bits - not recommended
  if (entropyBits < 60) return 'fair';        // 40-59 bits - basic security
  if (entropyBits < 80) return 'good';        // 60-79 bits - good security
  if (entropyBits < 100) return 'strong';     // 80-99 bits - strong security
  if (entropyBits < 128) return 'excellent';  // 100-127 bits - excellent security
  return 'extreme';                           // 128+ bits - extreme security
}

/**
 * Default options for common use cases
 */
export const DICEWARE_PRESETS = {
  // Standard options
  standard: {
    wordlist: 'eff_large' as WordlistType,
    wordCount: 5,
    separator: 'space' as SeparatorType,
    capitalization: 'none' as CapitalizationType,
    numbers: 'none' as NumberPosition
  },
  strong: {
    wordlist: 'eff_large' as WordlistType,
    wordCount: 6,
    separator: 'space' as SeparatorType,
    capitalization: 'first' as CapitalizationType,
    numbers: 'end' as NumberPosition,
    numberCount: 2
  },
  excellent: {
    wordlist: 'eff_large' as WordlistType,
    wordCount: 7,
    separator: 'dash' as SeparatorType,
    capitalization: 'first' as CapitalizationType,
    numbers: 'random' as NumberPosition,
    numberCount: 3
  },
  // Short wordlist options
  shortMemorable: {
    wordlist: 'eff_short_1' as WordlistType,
    wordCount: 8,
    separator: 'space' as SeparatorType,
    capitalization: 'first' as CapitalizationType,
    numbers: 'end' as NumberPosition,
    numberCount: 2
  },
  shortTypeFriendly: {
    wordlist: 'eff_short_2' as WordlistType,
    wordCount: 8,
    separator: 'dash' as SeparatorType,
    capitalization: 'none' as CapitalizationType,
    numbers: 'end' as NumberPosition,
    numberCount: 1
  }
} as const;

/**
 * Main function to generate Diceware passphrases
 */
export async function generateDicewarePassphrase(options: DicewareOptions): Promise<DicewareResult> {
  // Validate options
  if (options.wordCount < 3 || options.wordCount > 36) {
    throw new Error('Word count must be between 3 and 36');
  }

  // Load wordlist
  const wordlist = await loadWordlist(options.wordlist);
  const words: string[] = [];
  const diceRolls: string[] = [];
  const numbersAdded: string[] = [];

  // Generate words
  for (let i = 0; i < options.wordCount; i++) {
    const roll = rollDiceForWordlist(options.wordlist);
    const index = diceRollToIndex(roll);
    let word = wordlist[index] || `word${index}`;
    
    // Apply capitalization
    word = applyCapitalization(word, options.capitalization);
    
    words.push(word);
    diceRolls.push(roll);
  }

  // Add numbers if requested
  if (options.numbers !== 'none' && options.numberCount && options.numberCount > 0) {
    const numberString = generateRandomNumbers(options.numberCount);
    
    switch (options.numbers) {
      case 'end':
        numbersAdded.push(numberString);
        break;
      case 'random': {
        // Insert at random position
        const randomPos = new Uint8Array(1);
        crypto.getRandomValues(randomPos);
        const insertIndex = randomPos[0] % (words.length + 1);
        words.splice(insertIndex, 0, numberString);
        numbersAdded.push(numberString);
        break;
      }
      case 'between': {
        // Insert numbers between words
        for (let i = 1; i < words.length; i += 2) {
          const num = generateRandomNumbers(1);
          words.splice(i, 0, num);
          numbersAdded.push(num);
        }
        break;
      }
    }
  }

  // Choose separator
  const separator = options.separator === 'custom' && options.customSeparator 
    ? options.customSeparator 
    : SEPARATOR_MAP[options.separator];

  // Build final passphrase
  let passphrase = words.join(separator);
  
  // Add end numbers if specified
  if (options.numbers === 'end' && numbersAdded.length > 0) {
    passphrase += separator + numbersAdded.join('');
  }

  // Calculate entropy and strength
  const entropyBits = calculateEntropy(options.wordCount, options.wordlist, numbersAdded);
  const strength = assessStrength(entropyBits);

  return {
    passphrase,
    entropyBits: Math.round(entropyBits * 100) / 100,
    words: words.filter(w => !numbersAdded.includes(w)), // Exclude numbers from words array
    numbersAdded,
    strength,
    diceRolls,
    wordlistInfo: {
      type: options.wordlist,
      size: WORDLIST_INFO[options.wordlist].size,
      bitsPerWord: WORDLIST_INFO[options.wordlist].bitsPerWord
    }
  };
}

/**
 * Quick generation functions for presets
 */
export const generateStandardPassphrase = () => generateDicewarePassphrase(DICEWARE_PRESETS.standard);
export const generateStrongPassphrase = () => generateDicewarePassphrase(DICEWARE_PRESETS.strong);
export const generateExcellentPassphrase = () => generateDicewarePassphrase(DICEWARE_PRESETS.excellent);

/**
 * Legacy simple password generator for fallback compatibility
 * 
 * @deprecated Use Diceware passphrases for better security and usability
 */
export const generateSimplePassword = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  
  // Use crypto.getRandomValues for secure randomness
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(array[i] % chars.length);
  }
  
  return result;
}; 
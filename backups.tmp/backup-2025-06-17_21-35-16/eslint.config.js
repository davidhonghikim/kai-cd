import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'backups/',
      'backup/',
      'public/',
      'scripts/',
      'open-webui/',
      'package-lock.json',
      '*.log',
      '*.md',
      '*.sh',
      '*.json',
      '*.css',
      '*.png',
      '*.jpg',
      '*.jpeg',
      '*.svg',
      '*.ico',
      '*.mp3',
      '*.mp4',
      '*.webm',
      '*.ttf',
      '*.woff',
      '*.woff2',
      '*.eot',
      '*.map',
      'vite.config.ts',
      'tsconfig*.json',
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        chrome: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FileReader: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        navigator: 'readonly',
        queueMicrotask: 'readonly',
        self: 'readonly',
        AbortController: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        TextDecoder: 'readonly',
        MediaQueryListEvent: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]; 
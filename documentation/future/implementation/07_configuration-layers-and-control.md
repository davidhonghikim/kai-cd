---
title: "Configuration Layers and Control Planes"
description: "Modular configuration architecture with user, agent, and system-wide settings"
type: "architecture"
category: "implementation"
subcategory: "configuration"
context: "kAI/kOS configuration management and control systems"
implementation_status: "future"
decision_scope: "system-wide"
complexity: "high"
last_updated: "2025-01-20"
code_references: ["src/core/config/", "configs/", "src/core/security/VaultService.ts"]
related_documents: ["08_system-configuration-architecture.md", "02_data-storage-and-security.md"]
dependencies: ["AES-256-GCM encryption", "PBKDF2", "Zod validation", "YAML/JSON5 parsers"]
breaking_changes: "None - new configuration system"
agent_notes: "Complete configuration architecture with hierarchical overrides, security, and hot-reloading capabilities"
---

# Configuration Layers and Control Planes

## Agent Context

This document defines the configuration and control layer architecture of Kind AI (kAI) and Kind OS (kOS) with maximum modularity and override flexibility across device-local, user-managed, system-wide, and policy-based configurations.

**Implementation Guidance**: Use this architecture for implementing hierarchical configuration management with secure vault integration, hot-reloading, and centralized control plane support. All configuration access should go through the ConfigLoader API.

## Quick Summary

Three-tier configuration system with global defaults, system profiles, and user overrides supporting hot-reloading, cryptographic signing, and centralized management.

## I. Configuration Philosophy

### Three-Tier Override Model

1. **Global Defaults** (checked into source)
2. **System Profiles** (environment-specific: dev/staging/prod)
3. **User Overrides** (per-device, per-profile, per-session)

### Core Principles

- **Hot-Reloadable:** All configs support live updates via file watchers or API reload hooks
- **Secure & Declarative:** All config files are JSON5 / TOML / YAML with strong schema validation via Zod
- **Cryptographic Signing (Optional):** Trusted config bundles (e.g., from enterprise admins) can be signed and verified

## II. Directory Layout (Config Files)

```typescript
config/
├── global/
│   ├── defaults.yaml              # Core system-wide settings
│   ├── prompts.yaml               # Shared system prompt templates
│   ├── ai-profiles.yaml           # Default AI personality configs
│   └── services.yaml              # Built-in and external service mappings
├── environments/
│   ├── dev.yaml                   # Dev overrides
│   ├── prod.yaml                  # Production secure settings
│   └── test.yaml                  # For automated test environments
├── user/
│   ├── prefs.json5                # Per-user preferences (theme, hotkeys)
│   ├── vault.json                 # Encrypted credentials
│   ├── keybindings.json           # Custom key mappings
│   └── session.json               # Temporary session variables
├── secrets/
│   ├── jwt-secret.key             # Signing key for access tokens
│   ├── api-keys.env               # Dotenv-compatible secrets
│   └── encryption-passphrase.txt  # Master vault passphrase (optional)
└── agents/
    ├── scheduler.yaml             # Agent-specific runtime behaviors
    ├── orchestrator.yaml          # Priority rules and delegation logic
    └── watchdog.yaml              # Crash recovery and error hooks
```

## III. Configuration Schemas

### A. User Preferences (`prefs.json5`)

```typescript
interface UserPreferences {
  theme: "dark" | "light" | "auto";
  fontSize: number;
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    telemetry: boolean;
    localLogging: boolean;
  };
}

// Example configuration
const examplePrefs: UserPreferences = {
  theme: "dark",
  fontSize: 14,
  language: "en-US",
  notifications: {
    enabled: true,
    sound: false,
    vibration: true
  },
  privacy: {
    telemetry: false,
    localLogging: true
  }
};
```

### B. Service Definitions (`services.yaml`)

```typescript
interface ServiceConfig {
  type: "local" | "cloud";
  baseUrl: string;
  capabilities: string[];
  auth?: {
    type: "bearer_token" | "api_key" | "oauth";
    tokenEnv?: string;
    endpoint?: string;
  };
  timeout?: number;
  retries?: number;
}

// YAML Example
const servicesYaml = `
ollama:
  type: local
  baseUrl: "http://localhost:11434"
  capabilities: [llm_chat, embeddings]
  timeout: 30000
  
openai:
  type: cloud
  baseUrl: "https://api.openai.com/v1"
  capabilities: [llm_chat, embeddings, image_generation]
  auth:
    type: bearer_token
    tokenEnv: OPENAI_API_KEY
  timeout: 60000
  retries: 3
`;
```

### C. Agent Runtime (`scheduler.yaml`)

```typescript
interface AgentRuntimeConfig {
  maxConcurrentTasks: number;
  retryPolicy: {
    retries: number;
    backoff: number;
  };
  allowedHours: {
    start: string;
    end: string;
  };
  resources: {
    maxMemoryMB: number;
    maxCpuPercent: number;
  };
}

// YAML Example
const schedulerYaml = `
scheduler:
  maxConcurrentTasks: 5
  retryPolicy:
    retries: 3
    backoff: 2000
  allowedHours:
    start: "07:00"
    end: "23:00"
  resources:
    maxMemoryMB: 512
    maxCpuPercent: 50
`;
```

### D. Infrastructure Environment (`prod.yaml`)

```typescript
interface InfrastructureConfig {
  telemetry: boolean;
  secureMode: boolean;
  auth: {
    require2FA: boolean;
    allowFallback: boolean;
    sessionTimeout: number;
  };
  database: {
    postgres?: {
      uri: string;
      poolSize: number;
    };
    redis?: {
      uri: string;
      ttl: number;
    };
  };
  vectorDb: {
    provider: "qdrant" | "chroma" | "weaviate";
    host: string;
    port: number;
    apiKey?: string;
  };
}

// YAML Example
const prodYaml = `
telemetry: true
secureMode: true
auth:
  require2FA: true
  allowFallback: false
  sessionTimeout: 3600
database:
  postgres:
    uri: "postgresql://kuser:pass@db.internal:5432/kind"
    poolSize: 10
  redis:
    uri: "redis://redis.internal:6379"
    ttl: 86400
vectorDb:
  provider: qdrant
  host: "qdrant.internal"
  port: 6333
  apiKey: "${QDRANT_API_KEY}"
`;
```

## IV. Configuration Access API

```typescript
interface ConfigManager {
  getConfig<T>(path: string): Promise<T>;
  setConfig<T>(path: string, value: T): Promise<void>;
  watchConfig(callback: (path: string, value: any) => void): () => void;
  reloadConfig(): Promise<void>;
  validateConfig(config: any): ValidationResult;
}

class ConfigLoader implements ConfigManager {
  private cache: Map<string, any> = new Map();
  private watchers: Map<string, ((value: any) => void)[]> = new Map();
  
  async getConfig<T>(path: string): Promise<T> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    const value = await this.loadConfigValue(path);
    this.cache.set(path, value);
    return value;
  }
  
  async setConfig<T>(path: string, value: T): Promise<void> {
    await this.saveConfigValue(path, value);
    this.cache.set(path, value);
    this.notifyWatchers(path, value);
  }
  
  watchConfig(callback: (path: string, value: any) => void): () => void {
    const watcherId = crypto.randomUUID();
    // Implementation for file watching and callback registration
    return () => this.removeWatcher(watcherId);
  }
  
  async reloadConfig(): Promise<void> {
    this.cache.clear();
    await this.loadAllConfigs();
  }
  
  private async loadEffectiveConfig(agentId?: string): Promise<Config> {
    const systemDefaults = await this.loadJson('config/global/defaults.yaml');
    const envConfig = await this.loadJson(`config/environments/${process.env.NODE_ENV || 'dev'}.yaml`);
    const userPrefs = await this.loadJson('config/user/prefs.json5');
    const agentOverrides = agentId ? 
      await this.loadJson(`config/agents/${agentId}/overrides.json`) : {};
    const sessionState = await this.loadJson('config/user/session.json');

    return this.deepMerge(systemDefaults, envConfig, userPrefs, agentOverrides, sessionState);
  }
  
  private deepMerge(...objects: any[]): any {
    // Deep merge implementation with @locked annotation handling
    return objects.reduce((acc, obj) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          acc[key] = this.deepMerge(acc[key] || {}, obj[key]);
        } else if (!acc[key] || !obj[key]?.['@locked']) {
          acc[key] = obj[key];
        }
      }
      return acc;
    }, {});
  }
}

// Usage Examples
const configManager = new ConfigLoader();

// Get configuration values
const theme = await configManager.getConfig<string>('user.prefs.theme');
const dbUri = await configManager.getConfig<string>('database.postgres.uri');

// Set configuration values
await configManager.setConfig('user.prefs.theme', 'light');
await configManager.setConfig('agents.scheduler.maxConcurrentTasks', 10);

// Watch for changes
const unwatch = configManager.watchConfig((path, value) => {
  console.log(`Config changed: ${path} = ${value}`);
});
```

## V. Vault Access (Encrypted Secrets)

```typescript
interface VaultEntry {
  id: string;
  type: "api_key" | "password" | "certificate" | "ssh_key";
  value: string; // Encrypted
  metadata?: Record<string, any>;
  created: string;
  lastAccessed?: string;
  expiresAt?: string;
}

interface VaultConfig {
  version: number;
  entries: VaultEntry[];
  keyDerivation: {
    algorithm: "PBKDF2" | "Argon2id";
    iterations: number;
    saltRotationDays: number;
  };
}

class VaultService {
  private masterKey: CryptoKey | null = null;
  
  async unlock(password: string): Promise<void> {
    const salt = await this.getSalt();
    this.masterKey = await this.deriveKey(password, salt);
  }
  
  async store(entry: Omit<VaultEntry, 'created'>): Promise<void> {
    if (!this.masterKey) throw new Error('Vault locked');
    
    const encryptedValue = await this.encrypt(entry.value, this.masterKey);
    const vaultEntry: VaultEntry = {
      ...entry,
      value: encryptedValue,
      created: new Date().toISOString()
    };
    
    await this.saveEntry(vaultEntry);
  }
  
  async retrieve(id: string): Promise<string> {
    if (!this.masterKey) throw new Error('Vault locked');
    
    const entry = await this.getEntry(id);
    if (!entry) throw new Error('Entry not found');
    
    entry.lastAccessed = new Date().toISOString();
    await this.updateEntry(entry);
    
    return await this.decrypt(entry.value, this.masterKey);
  }
  
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 150000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  private async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(data)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  private async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  }
}

// Usage Example
const vault = new VaultService();
await vault.unlock('user-password');
await vault.store({
  id: 'openai-api',
  type: 'api_key',
  value: 'sk-...',
  metadata: { service: 'OpenAI', created_by: 'user' }
});

const apiKey = await vault.retrieve('openai-api');
```

## VI. Governance and Central Control

For multi-device sync or enterprise deployment, `kControlPlane` enables remote management:

```typescript
interface ControlPlaneConfig {
  endpoints: {
    sync: string;
    audit: string;
    revoke: string;
    federation: string;
  };
  agents: {
    activeList: AgentInfo[];
    trustScores: Record<string, number>;
  };
  policies: {
    klpAccessPolicies: AccessPolicy[];
    configOverrides: Record<string, any>;
  };
}

class ControlPlaneClient {
  async syncConfig(): Promise<ConfigDiff[]> {
    // Sync encrypted configs via TLS and mutual certs
  }
  
  async auditLog(events: AuditEvent[]): Promise<void> {
    // Push audit log to kLog
  }
  
  async revokeAccess(agentId: string): Promise<void> {
    // Revoke agent access and update policies
  }
  
  async updatePolicies(policies: AccessPolicy[]): Promise<void> {
    // Update KLP access policies
  }
}
```

## VII. Change Log and Audit

```typescript
interface ConfigChangeEvent {
  id: string;
  timestamp: string;
  path: string;
  oldValue: any;
  newValue: any;
  source: "user" | "system" | "agent" | "remote";
  agentId?: string;
  userId?: string;
}

class AuditLogger {
  async logConfigChange(event: ConfigChangeEvent): Promise<void> {
    // Log to kLog (append-only)
    await this.appendToLog(event);
    
    // Trigger change events
    this.emitChangeEvent(event);
  }
  
  async getConfigHistory(path: string): Promise<ConfigChangeEvent[]> {
    return await this.queryLog({ path });
  }
  
  async createSnapshot(): Promise<ConfigSnapshot> {
    const currentConfig = await this.configLoader.reloadConfig();
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      config: currentConfig,
      hash: await this.hashConfig(currentConfig)
    };
  }
  
  async compareSnapshots(snapshot1: string, snapshot2: string): Promise<ConfigDiff[]> {
    // Forensic comparison for drift detection
    const s1 = await this.getSnapshot(snapshot1);
    const s2 = await this.getSnapshot(snapshot2);
    
    return this.diffConfigs(s1.config, s2.config);
  }
}
```

## VIII. CLI Overrides

```typescript
// CLI command interface
interface KCtlCommands {
  'config set': (key: string, value: string) => Promise<void>;
  'config get': (key: string) => Promise<any>;
  'config list': () => Promise<Record<string, any>>;
  'config validate': () => Promise<ValidationResult>;
  'config export': (format: 'yaml' | 'json') => Promise<string>;
  'config import': (file: string) => Promise<void>;
  'agent reload': (agentId: string, options?: ReloadOptions) => Promise<void>;
  'vault status': () => Promise<VaultStatus>;
  'vault unlock': () => Promise<void>;
  'vault lock': () => Promise<void>;
}

// CLI Implementation Examples
class KCtl {
  async configSet(key: string, value: string): Promise<void> {
    await this.configManager.setConfig(key, this.parseValue(value));
    console.log(`✓ Set ${key} = ${value}`);
  }
  
  async configGet(key: string): Promise<any> {
    const value = await this.configManager.getConfig(key);
    console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
    return value;
  }
  
  async agentReload(agentId: string, options?: ReloadOptions): Promise<void> {
    await this.agentManager.reload(agentId, {
      persona: options?.persona,
      config: options?.config
    });
    console.log(`✓ Reloaded agent ${agentId}`);
  }
}

// Usage Examples:
// kctl config set theme solarized-light
// kctl config get vault-status
// kctl agent reload persona --agent=calendarAgent
// kctl config export yaml > backup.yaml
```

## IX. Security Considerations

```typescript
interface SecurityConfig {
  encryption: {
    algorithm: "AES-256-GCM";
    keyDerivation: "PBKDF2" | "Argon2id";
    iterations: number;
  };
  signing: {
    algorithm: "Ed25519";
    required: boolean;
  };
  access: {
    biometricUnlock: boolean;
    sessionTimeout: number;
    maxFailedAttempts: number;
  };
}

class ConfigSecurity {
  async signConfig(config: any, privateKey: string): Promise<SignedConfig> {
    const signature = await this.sign(JSON.stringify(config), privateKey);
    return { config, signature, timestamp: Date.now() };
  }
  
  async verifyConfig(signedConfig: SignedConfig, publicKey: string): Promise<boolean> {
    return await this.verify(
      JSON.stringify(signedConfig.config),
      signedConfig.signature,
      publicKey
    );
  }
  
  async detectTamper(configPath: string): Promise<TamperResult> {
    const currentHash = await this.hashFile(configPath);
    const expectedHash = await this.getExpectedHash(configPath);
    
    return {
      tampered: currentHash !== expectedHash,
      currentHash,
      expectedHash
    };
  }
}
```

## X. Related Documentation

- **System Configuration**: See `08_system-configuration-architecture.md`
- **Security Framework**: See `02_data-storage-and-security.md`
- **Service Management**: See `15_service-manager-stack.md`
- **Agent Architecture**: See `03_agent-protocols-and-hierarchy.md`

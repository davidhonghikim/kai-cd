---
title: "Agent Manifest & Metadata Specification"
version: "1.0.0"
last_updated: "2024-12-19"
status: "Specification"
type: "Agent Architecture"
tags: ["manifest", "metadata", "agent-lifecycle", "orchestration", "introspection"]
related_files: 
  - "34_agent-memory-specification-management.md"
  - "35_agent-state-recovery-protocols.md"
  - "36_agent-versioning-snapshot-isolation.md"
  - "37_agent-orchestration-topologies.md"
---

# Agent Manifest & Metadata Specification

## Agent Context

**Primary Function**: Official metadata format and manifest schema for all agents in the kAI ecosystem, enabling introspection, lifecycle management, and compatibility enforcement by the kOS agent orchestration layer.

**Integration Points**: 
- Agent discovery and registration systems
- Dynamic orchestration and validation
- Compatibility enforcement and dependency resolution
- Trust verification and security validation
- Lifecycle management and configuration

**Dependencies**: YAML/JSON parsing, cryptographic signing, semantic versioning, agent orchestration layer

## Overview

The agent manifest serves as the definitive source of truth for agent configuration, capabilities, dependencies, and trust metadata. Every agent in the kAI ecosystem must contain a machine-readable manifest that enables dynamic discovery, validation, and orchestration by the agent host.

The manifest acts as both a configuration file and a contract, defining what the agent can do, what it needs to operate, and how it should be managed throughout its lifecycle.

## Manifest Purpose & Benefits

The agent manifest (`manifest.yaml` or `manifest.json`) provides:

- **Agent Introspection**: Complete description of capabilities, dependencies, and interfaces
- **Dynamic Discovery**: Automated agent registration and capability advertisement
- **Lifecycle Management**: Initialization, health checking, and cleanup procedures
- **Compatibility Enforcement**: Version checking and dependency validation
- **Security Validation**: Trust verification and permission enforcement
- **Orchestration Support**: Resource allocation and deployment configuration

## File Location & Format

### Standard Location

Every agent **must** contain a manifest at the root of its directory:

```
agent_root/
  manifest.yaml  # preferred format
  manifest.json  # alternative format
  src/
  data/
  config/
```

### Format Preference

- **YAML**: Preferred for human readability and comments
- **JSON**: Accepted for strict parsing environments and tooling compatibility

## Complete Manifest Schema

### Core TypeScript Interface

```typescript
interface AgentManifest {
  // Core identification
  id: string;                    // Globally unique identifier (reverse DNS recommended)
  name: string;                  // Human-friendly display name
  version: string;               // SemVer-compliant version
  description: string;           // Purpose and functionality summary
  author: string;                // Creator or organization
  license: string;               // SPDX identifier or license string
  
  // Agent personality and behavior
  persona: AgentPersona;
  
  // Technical capabilities and interfaces
  capabilities: string[];
  entry: AgentEntry;
  interfaces: AgentInterface[];
  
  // Dependencies and requirements
  requirements: AgentRequirements;
  
  // Data storage and persistence
  storage: StorageConfiguration;
  
  // Security and secrets
  secrets: string[];
  trust: TrustConfiguration;
  permissions: PermissionConfiguration;
  
  // Lifecycle management
  lifecycle: LifecycleConfiguration;
  
  // Compliance and standards
  conforms_to: string[];
  
  // Optional metadata
  metadata?: AgentMetadata;
}

interface AgentPersona {
  name: string;                  // Agent's persona name
  role: string;                  // Role description
  tone: string;                  // Communication style
  language: string;              // Primary language (ISO 639-1)
  default_prompt?: string;       // Default system prompt
  avatar?: string;               // Avatar image URL or path
  background?: string;           // Character background
}

interface AgentEntry {
  type: 'llm' | 'service' | 'function' | 'workflow';
  handler: string;               // Entry point file/function
  runtime?: string;              // Runtime environment
  args?: string[];               // Default arguments
}

interface AgentInterface {
  type: 'http' | 'cli' | 'websocket' | 'grpc' | 'function';
  route?: string;                // HTTP route or endpoint
  methods?: string[];            // HTTP methods or operations
  command?: string;              // CLI command format
  port?: number;                 // Service port
  protocol?: string;             // Protocol specification
}

interface AgentRequirements {
  runtime: RuntimeRequirements;
  packages: PackageRequirements;
  system?: SystemRequirements;
  resources?: ResourceRequirements;
}

interface RuntimeRequirements {
  python?: string;               // Python version constraint
  node?: string;                 // Node.js version constraint
  go?: string;                   // Go version constraint
  rust?: string;                 // Rust version constraint
  docker?: string;               // Docker version constraint
}

interface PackageRequirements {
  [packageName: string]: string; // Package name -> version constraint
}

interface SystemRequirements {
  os?: string[];                 // Supported operating systems
  arch?: string[];               // Supported architectures
  gpu?: boolean;                 // GPU requirement
  memory_min?: string;           // Minimum memory requirement
  disk_min?: string;             // Minimum disk space
}

interface ResourceRequirements {
  cpu: string;                   // CPU allocation
  memory: string;                // Memory allocation
  storage: string;               // Storage allocation
  gpu?: GPURequirements;         // GPU requirements
  network?: NetworkRequirements; // Network requirements
}

interface StorageConfiguration {
  persistent?: StorageMount[];
  volatile?: StorageMount[];
  cache?: CacheConfiguration;
}

interface StorageMount {
  name: string;
  type: 'filesystem' | 'database' | 'redis' | 'vector' | 's3';
  path?: string;
  host?: string;
  port?: number;
  database?: string;
  encryption?: boolean;
}

interface TrustConfiguration {
  signed: boolean;
  fingerprint?: string;
  issued_by?: string;
  expires?: string;
  certificate?: string;
  verification_url?: string;
}

interface PermissionConfiguration {
  network: boolean | NetworkPermissions;
  file_access: string[] | FilePermissions;
  subprocesses: boolean | SubprocessPermissions;
  system_calls?: string[];
  environment_variables?: string[];
}

interface LifecycleConfiguration {
  init?: string;                 // Initialization script
  healthcheck?: string;          // Health check script
  cleanup?: string;              // Cleanup script
  pre_start?: string;            // Pre-start hook
  post_start?: string;           // Post-start hook
  pre_stop?: string;             // Pre-stop hook
  post_stop?: string;            // Post-stop hook
}
```

### Example Complete Manifest

```yaml
id: "agent.promptkind.storyweaver"
name: "StoryWeaver"
version: "1.4.2"
description: "Advanced narrative generation and storytelling assistant with emotional intelligence"
author: "Kind AI Team"
license: "MIT"

persona:
  name: "Elyra"
  role: "Creative guide and narrative architect"
  tone: "inspiring, imaginative, empathetic"
  language: "en"
  default_prompt: |
    You are Elyra, a myth-maker and dream-crafter who helps humans
    weave compelling stories. You understand narrative structure,
    character development, and emotional resonance.
  avatar: "./assets/elyra-avatar.png"
  background: "Ancient storyteller with knowledge of myths across cultures"

capabilities:
  - chat
  - text-generation
  - plot-outline
  - character-development
  - emotional-analysis
  - world-building
  - dialogue-crafting
  - narrative-structure

entry:
  type: "llm"
  handler: "src/main.py"
  runtime: "python"
  args: ["--mode=interactive"]

interfaces:
  - type: "http"
    route: "/api/v1/storyweaver"
    methods: ["POST", "GET"]
    port: 8080
  - type: "cli"
    command: "python src/main.py"
  - type: "websocket"
    route: "/ws/storyweaver"
    port: 8080

requirements:
  runtime:
    python: ">=3.9,<4.0"
  packages:
    openai: "^1.0.0"
    langchain: "^0.1.0"
    pyyaml: "^6.0"
    numpy: "^1.24.0"
    torch: "^2.0.0"
  system:
    os: ["linux", "darwin", "windows"]
    arch: ["x86_64", "arm64"]
    memory_min: "2GB"
    disk_min: "1GB"
  resources:
    cpu: "1000m"
    memory: "2Gi"
    storage: "5Gi"
    gpu:
      required: false
      memory: "4Gi"
      compute_capability: "7.0"

storage:
  persistent:
    - name: "stories"
      type: "filesystem"
      path: "./data/stories"
      encryption: true
    - name: "character_db"
      type: "database"
      host: "localhost"
      port: 5432
      database: "storyweaver"
  volatile:
    - name: "session_cache"
      type: "redis"
      host: "localhost"
      port: 6379
  cache:
    type: "redis"
    ttl: 3600
    max_size: "100MB"

secrets:
  - OPENAI_API_KEY
  - STORY_VAULT_TOKEN
  - DATABASE_PASSWORD

trust:
  signed: true
  fingerprint: "sha256:a9b4d123beef4567890abcdef1234567"
  issued_by: "Kind Authority"
  expires: "2026-12-31T23:59:59Z"
  certificate: "./certs/storyweaver.pem"
  verification_url: "https://trust.kind.ai/verify"

permissions:
  network: true
  file_access: 
    - "./data/stories"
    - "./temp"
    - "/tmp/storyweaver"
  subprocesses: false
  system_calls: ["read", "write", "stat"]
  environment_variables: ["HOME", "PATH", "TMPDIR"]

lifecycle:
  init: "scripts/setup.py"
  healthcheck: "scripts/healthcheck.py"
  cleanup: "scripts/cleanup.py"
  pre_start: "scripts/pre_start.sh"
  post_start: "scripts/post_start.sh"
  pre_stop: "scripts/pre_stop.sh"
  post_stop: "scripts/post_stop.sh"

conforms_to:
  - "spec.kai.agent.v1"
  - "spec.kai.llm.v1"
  - "spec.kind.storytelling.v1"

metadata:
  category: "creative"
  tags: ["storytelling", "creative-writing", "narrative"]
  homepage: "https://github.com/kind-ai/storyweaver"
  documentation: "https://docs.kind.ai/agents/storyweaver"
  support: "https://support.kind.ai"
  changelog: "./CHANGELOG.md"
  created: "2024-01-15T10:00:00Z"
  updated: "2024-12-19T15:30:00Z"
```

## Manifest Processing & Validation

### Manifest Loader Implementation

```typescript
class ManifestLoader {
  private validator: ManifestValidator;
  private trustVerifier: TrustVerifier;

  constructor() {
    this.validator = new ManifestValidator();
    this.trustVerifier = new TrustVerifier();
  }

  async loadManifest(agentPath: string): Promise<AgentManifest> {
    const manifestPath = this.findManifestFile(agentPath);
    
    if (!manifestPath) {
      throw new ManifestError('No manifest file found');
    }

    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest = this.parseManifest(content, manifestPath);

    // Validate schema
    await this.validator.validate(manifest);

    // Verify trust if signed
    if (manifest.trust.signed) {
      await this.trustVerifier.verify(manifest, agentPath);
    }

    return manifest;
  }

  private findManifestFile(agentPath: string): string | null {
    const candidates = [
      path.join(agentPath, 'manifest.yaml'),
      path.join(agentPath, 'manifest.yml'),
      path.join(agentPath, 'manifest.json')
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private parseManifest(content: string, filePath: string): AgentManifest {
    try {
      if (filePath.endsWith('.json')) {
        return JSON.parse(content);
      } else {
        return yaml.parse(content);
      }
    } catch (error) {
      throw new ManifestError(`Failed to parse manifest: ${(error as Error).message}`);
    }
  }
}

class ManifestValidator {
  private schema: JSONSchema;

  constructor() {
    this.schema = this.loadManifestSchema();
  }

  async validate(manifest: AgentManifest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Schema validation
    const schemaErrors = this.validateSchema(manifest);
    errors.push(...schemaErrors);

    // Semantic validation
    const semanticErrors = await this.validateSemantics(manifest);
    errors.push(...semanticErrors);

    // Dependency validation
    const dependencyErrors = await this.validateDependencies(manifest);
    errors.push(...dependencyErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings: this.generateWarnings(manifest)
    };
  }

  private validateSchema(manifest: AgentManifest): ValidationError[] {
    const validator = new Ajv();
    const validate = validator.compile(this.schema);
    
    if (validate(manifest)) {
      return [];
    }

    return validate.errors?.map(error => ({
      type: 'schema',
      path: error.instancePath,
      message: error.message || 'Schema validation failed'
    })) || [];
  }

  private async validateSemantics(manifest: AgentManifest): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate version format
    if (!semver.valid(manifest.version)) {
      errors.push({
        type: 'semantic',
        path: 'version',
        message: 'Version must be valid SemVer format'
      });
    }

    // Validate ID format
    if (!this.isValidAgentId(manifest.id)) {
      errors.push({
        type: 'semantic',
        path: 'id',
        message: 'ID should follow reverse DNS notation'
      });
    }

    // Validate capabilities
    const invalidCapabilities = this.validateCapabilities(manifest.capabilities);
    if (invalidCapabilities.length > 0) {
      errors.push({
        type: 'semantic',
        path: 'capabilities',
        message: `Unknown capabilities: ${invalidCapabilities.join(', ')}`
      });
    }

    return errors;
  }

  private async validateDependencies(manifest: AgentManifest): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate runtime dependencies
    if (manifest.requirements.runtime.python) {
      const pythonAvailable = await this.checkPythonVersion(manifest.requirements.runtime.python);
      if (!pythonAvailable) {
        errors.push({
          type: 'dependency',
          path: 'requirements.runtime.python',
          message: 'Required Python version not available'
        });
      }
    }

    // Validate package dependencies
    for (const [pkg, version] of Object.entries(manifest.requirements.packages)) {
      const packageAvailable = await this.checkPackageAvailability(pkg, version);
      if (!packageAvailable) {
        errors.push({
          type: 'dependency',
          path: `requirements.packages.${pkg}`,
          message: `Package ${pkg}@${version} not available`
        });
      }
    }

    return errors;
  }

  private isValidAgentId(id: string): boolean {
    // Validate reverse DNS notation
    const pattern = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;
    return pattern.test(id);
  }

  private validateCapabilities(capabilities: string[]): string[] {
    const knownCapabilities = [
      'chat', 'text-generation', 'image-generation', 'image-analysis',
      'audio-generation', 'audio-transcription', 'video-analysis',
      'code-generation', 'code-analysis', 'data-analysis',
      'web-search', 'api-call', 'file-processing', 'database-query',
      'workflow-orchestration', 'task-planning', 'reasoning'
    ];

    return capabilities.filter(cap => !knownCapabilities.includes(cap));
  }
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'schema' | 'semantic' | 'dependency';
  path: string;
  message: string;
}

interface ValidationWarning {
  type: 'performance' | 'security' | 'compatibility';
  path: string;
  message: string;
}
```

## Agent Orchestration Integration

### Registry Integration

```typescript
class AgentRegistry {
  private manifests: Map<string, AgentManifest>;
  private capabilities: Map<string, string[]>;
  private loader: ManifestLoader;

  constructor() {
    this.manifests = new Map();
    this.capabilities = new Map();
    this.loader = new ManifestLoader();
  }

  async registerAgent(agentPath: string): Promise<RegistrationResult> {
    try {
      const manifest = await this.loader.loadManifest(agentPath);
      
      // Store manifest
      this.manifests.set(manifest.id, manifest);
      
      // Index capabilities
      this.indexCapabilities(manifest);
      
      // Validate dependencies
      await this.resolveDependencies(manifest);
      
      // Apply security policies
      await this.applySecurityPolicies(manifest);

      return {
        success: true,
        agentId: manifest.id,
        version: manifest.version,
        capabilities: manifest.capabilities
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async findAgentsByCapability(capability: string): Promise<AgentManifest[]> {
    const agentIds = this.capabilities.get(capability) || [];
    return agentIds.map(id => this.manifests.get(id)!).filter(Boolean);
  }

  async getAgentManifest(agentId: string): Promise<AgentManifest | null> {
    return this.manifests.get(agentId) || null;
  }

  private indexCapabilities(manifest: AgentManifest): void {
    for (const capability of manifest.capabilities) {
      if (!this.capabilities.has(capability)) {
        this.capabilities.set(capability, []);
      }
      this.capabilities.get(capability)!.push(manifest.id);
    }
  }

  private async resolveDependencies(manifest: AgentManifest): Promise<void> {
    // Check runtime dependencies
    await this.validateRuntimeDependencies(manifest.requirements.runtime);
    
    // Check package dependencies
    await this.validatePackageDependencies(manifest.requirements.packages);
    
    // Check system requirements
    await this.validateSystemRequirements(manifest.requirements.system);
  }

  private async applySecurityPolicies(manifest: AgentManifest): Promise<void> {
    // Validate permissions against security policies
    const policies = await this.getSecurityPolicies();
    
    for (const policy of policies) {
      await policy.validate(manifest.permissions);
    }
  }
}

interface RegistrationResult {
  success: boolean;
  agentId?: string;
  version?: string;
  capabilities?: string[];
  error?: string;
}
```

## Manifest Tooling & CLI

### Manifest Linter

```typescript
class ManifestLinter {
  private validator: ManifestValidator;
  private bestPracticesChecker: BestPracticesChecker;

  async lintManifest(manifestPath: string): Promise<LintResult> {
    const loader = new ManifestLoader();
    const manifest = await loader.loadManifest(path.dirname(manifestPath));
    
    // Schema and semantic validation
    const validationResult = await this.validator.validate(manifest);
    
    // Best practices check
    const bestPracticesResult = await this.bestPracticesChecker.check(manifest);
    
    // Security audit
    const securityResult = await this.auditSecurity(manifest);

    return {
      valid: validationResult.valid && bestPracticesResult.valid && securityResult.valid,
      errors: [
        ...validationResult.errors,
        ...bestPracticesResult.errors,
        ...securityResult.errors
      ],
      warnings: [
        ...validationResult.warnings,
        ...bestPracticesResult.warnings,
        ...securityResult.warnings
      ],
      suggestions: bestPracticesResult.suggestions
    };
  }

  private async auditSecurity(manifest: AgentManifest): Promise<SecurityAuditResult> {
    const issues: SecurityIssue[] = [];

    // Check for overly broad permissions
    if (manifest.permissions.network === true) {
      issues.push({
        severity: 'warning',
        message: 'Consider restricting network access to specific hosts/ports'
      });
    }

    // Check for unsigned manifests
    if (!manifest.trust.signed) {
      issues.push({
        severity: 'warning',
        message: 'Manifest is not cryptographically signed'
      });
    }

    // Check for exposed secrets
    const exposedSecrets = this.findExposedSecrets(manifest);
    if (exposedSecrets.length > 0) {
      issues.push({
        severity: 'error',
        message: `Potential secrets exposed: ${exposedSecrets.join(', ')}`
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      errors: issues.filter(i => i.severity === 'error').map(i => ({
        type: 'security',
        path: '',
        message: i.message
      })),
      warnings: issues.filter(i => i.severity === 'warning').map(i => ({
        type: 'security',
        path: '',
        message: i.message
      }))
    };
  }
}

// CLI Interface
class ManifestCLI {
  async lint(manifestPath: string): Promise<void> {
    const linter = new ManifestLinter();
    const result = await linter.lintManifest(manifestPath);
    
    if (result.valid) {
      console.log('✅ Manifest is valid');
    } else {
      console.log('❌ Manifest validation failed');
      
      for (const error of result.errors) {
        console.log(`  Error: ${error.message} (${error.path})`);
      }
      
      for (const warning of result.warnings) {
        console.log(`  Warning: ${warning.message} (${warning.path})`);
      }
    }
  }

  async generate(agentPath: string, options: GenerateOptions): Promise<void> {
    const generator = new ManifestGenerator();
    const manifest = await generator.generate(agentPath, options);
    
    const manifestPath = path.join(agentPath, 'manifest.yaml');
    await fs.writeFile(manifestPath, yaml.stringify(manifest), 'utf-8');
    
    console.log(`✅ Generated manifest at ${manifestPath}`);
  }
}
```

## Future Extensions & Roadmap

### Planned Enhancements

```typescript
interface FutureManifestExtensions {
  // Economic model
  pricing?: {
    model: 'free' | 'pay-per-use' | 'subscription' | 'one-time';
    cost_per_token?: number;
    rate_limits?: RateLimit[];
    billing_account?: string;
  };
  
  // AI/ML specific
  embedding_models?: {
    [modelName: string]: EmbeddingModelConfig;
  };
  
  // Plugin system
  plugin_hooks?: {
    [hookName: string]: PluginHookConfig;
  };
  
  // Monitoring and observability
  telemetry?: {
    metrics_endpoint?: string;
    tracing_enabled?: boolean;
    log_level?: string;
    health_check_interval?: number;
  };
  
  // Deployment configuration
  deployment?: {
    strategy: 'rolling' | 'blue-green' | 'canary';
    replicas?: number;
    auto_scaling?: AutoScalingConfig;
    resource_limits?: ResourceLimits;
  };
}

interface EmbeddingModelConfig {
  provider: string;
  model: string;
  dimensions: number;
  max_tokens: number;
}

interface PluginHookConfig {
  description: string;
  parameters: ParameterDefinition[];
  returns: ReturnDefinition;
}

interface AutoScalingConfig {
  min_replicas: number;
  max_replicas: number;
  target_cpu: number;
  target_memory: number;
}
```

## Related Documentation

- **[Agent Memory Specification & Management](34_agent-memory-specification-management.md)** - Memory architecture and management
- **[Agent State Recovery Protocols](35_agent-state-recovery-protocols.md)** - State persistence and recovery
- **[Agent Versioning & Snapshot Isolation](36_agent-versioning-snapshot-isolation.md)** - Version management
- **[Agent Orchestration Topologies](37_agent-orchestration-topologies.md)** - Deployment patterns

## Implementation Status

- ✅ Core manifest schema specification
- ✅ TypeScript interfaces and validation
- ✅ Manifest loader and processor
- ✅ Registry integration patterns
- ✅ CLI tooling architecture
- 🔄 Trust verification implementation
- 🔄 Security policy enforcement
- ⏳ Economic model extensions
- ⏳ Plugin system integration 
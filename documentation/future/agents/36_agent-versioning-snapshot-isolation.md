---
title: "Agent Versioning & Snapshot Isolation"
version: "1.0.0"
last_updated: "2024-12-19"
status: "Specification"
type: "Agent Infrastructure"
tags: ["versioning", "rollback", "isolation", "snapshots", "reproducibility"]
related_files: 
  - "33_agent-manifest-metadata-specification.md"
  - "34_agent-memory-specification-management.md"
  - "35_agent-state-recovery-protocols.md"
  - "37_agent-orchestration-topologies.md"
---

# Agent Versioning & Snapshot Isolation

## Agent Context

**Primary Function**: Architecture and implementation for maintaining robust versioning, rollback safety, and snapshot isolation for all agents operating within the kAI/kOS system.

**Integration Points**: 
- Agent lifecycle management and deployment
- State persistence and recovery systems
- Development and testing workflows
- Production rollback and safety mechanisms
- Deterministic reproducibility validation

**Dependencies**: Semantic versioning, cryptographic hashing, container isolation, file system management, state validation

## Overview

This specification defines comprehensive versioning, rollback, and snapshot isolation mechanisms ensuring agents can be independently versioned, safely reverted to known working states, and operated in isolated environments for testing and rollback scenarios.

## Key Concepts & Architecture

### Agent Versioning System

```typescript
interface AgentVersion {
  version: string;              // Semantic version (major.minor.patch)
  hash: string;                 // SHA-256 hash of core logic and config
  parent?: string;              // Parent version for lineage tracking
  metadata: VersionMetadata;
  files: VersionedFile[];
  dependencies: VersionDependency[];
}

interface VersionMetadata {
  created: Date;
  author: string;
  commitHash: string;
  snapshotType: 'auto' | 'manual' | 'rollback' | 'release';
  notes: string;
  agentStateChecksum: string;
  configChecksum: string;
  tags: string[];
}

interface VersionedFile {
  path: string;
  hash: string;
  size: number;
  permissions: string;
}

class AgentVersionManager {
  private versionsPath: string;
  private currentSymlink: string;

  constructor(agentName: string, basePath: string) {
    this.versionsPath = path.join(basePath, agentName, 'versions');
    this.currentSymlink = path.join(basePath, agentName, 'current');
  }

  async createVersion(sourceVersion: string, newVersion: string, metadata: Partial<VersionMetadata>): Promise<AgentVersion> {
    const versionPath = path.join(this.versionsPath, newVersion);
    
    // Create version directory
    await fs.mkdir(versionPath, { recursive: true });
    
    // Copy files from source version
    const sourceFiles = await this.copyVersionFiles(sourceVersion, versionPath);
    
    // Generate checksums
    const agentStateChecksum = await this.calculateAgentStateChecksum(versionPath);
    const configChecksum = await this.calculateConfigChecksum(versionPath);
    
    // Create version metadata
    const version: AgentVersion = {
      version: newVersion,
      hash: await this.calculateVersionHash(versionPath),
      parent: sourceVersion,
      metadata: {
        created: new Date(),
        author: metadata.author || 'system',
        commitHash: metadata.commitHash || '',
        snapshotType: metadata.snapshotType || 'manual',
        notes: metadata.notes || '',
        agentStateChecksum,
        configChecksum,
        tags: metadata.tags || []
      },
      files: sourceFiles,
      dependencies: await this.extractDependencies(versionPath)
    };
    
    // Save metadata
    await this.saveVersionMetadata(versionPath, version);
    
    return version;
  }

  async rollbackToVersion(targetVersion: string): Promise<RollbackResult> {
    const rollbackLog: RollbackStep[] = [];
    
    try {
      // Validate target version exists
      const versionExists = await this.versionExists(targetVersion);
      if (!versionExists) {
        throw new Error(`Version ${targetVersion} does not exist`);
      }
      
      // Backup current version
      const currentVersion = await this.getCurrentVersion();
      if (currentVersion) {
        const backupResult = await this.backupCurrentVersion();
        rollbackLog.push({
          step: 'backup_current',
          success: true,
          details: backupResult
        });
      }
      
      // Update symbolic link
      const targetPath = path.join(this.versionsPath, targetVersion);
      await fs.unlink(this.currentSymlink);
      await fs.symlink(targetPath, this.currentSymlink);
      
      rollbackLog.push({
        step: 'update_symlink',
        success: true,
        details: { targetVersion, targetPath }
      });
      
      // Validate rollback
      const validation = await this.validateRollback(targetVersion);
      rollbackLog.push({
        step: 'validate_rollback',
        success: validation.valid,
        details: validation
      });
      
      return {
        success: true,
        targetVersion,
        previousVersion: currentVersion?.version,
        steps: rollbackLog,
        timestamp: new Date()
      };
      
    } catch (error) {
      rollbackLog.push({
        step: 'rollback_failed',
        success: false,
        error: (error as Error).message
      });
      
      return {
        success: false,
        targetVersion,
        error: (error as Error).message,
        steps: rollbackLog,
        timestamp: new Date()
      };
    }
  }

  async listVersions(): Promise<VersionInfo[]> {
    const versionDirs = await fs.readdir(this.versionsPath);
    const versions: VersionInfo[] = [];
    
    for (const versionDir of versionDirs) {
      const versionPath = path.join(this.versionsPath, versionDir);
      const metadataPath = path.join(versionPath, 'version_meta.json');
      
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);
        versions.push({
          version: versionDir,
          metadata,
          isCurrent: await this.isCurrentVersion(versionDir),
          size: await this.calculateVersionSize(versionPath)
        });
      }
    }
    
    return versions.sort((a, b) => semver.compare(b.version, a.version));
  }
}

interface RollbackResult {
  success: boolean;
  targetVersion: string;
  previousVersion?: string;
  error?: string;
  steps: RollbackStep[];
  timestamp: Date;
}

interface RollbackStep {
  step: string;
  success: boolean;
  details?: unknown;
  error?: string;
}
```

### Snapshot Isolation System

```typescript
class SnapshotIsolationManager {
  private sandboxPath: string;
  private containerManager: ContainerManager;

  constructor(config: IsolationConfig) {
    this.sandboxPath = config.sandboxPath;
    this.containerManager = new ContainerManager(config.containerConfig);
  }

  async createIsolatedSnapshot(agentId: string, version: string, options: SnapshotOptions): Promise<IsolatedSnapshot> {
    const snapshotId = this.generateSnapshotId();
    const snapshotPath = path.join(this.sandboxPath, snapshotId);
    
    // Create isolated environment
    await fs.mkdir(snapshotPath, { recursive: true });
    
    // Copy agent version to snapshot
    const versionPath = this.getVersionPath(agentId, version);
    await this.copyToSnapshot(versionPath, snapshotPath);
    
    // Set up isolation constraints
    const isolationConfig = await this.createIsolationConfig(options);
    
    // Create container if needed
    let containerId: string | undefined;
    if (options.useContainer) {
      containerId = await this.containerManager.createContainer({
        image: options.containerImage || 'kai-agent-runtime',
        volumes: [`${snapshotPath}:/agent`],
        environment: isolationConfig.environment,
        networkMode: isolationConfig.networkMode,
        resourceLimits: isolationConfig.resources
      });
    }
    
    const snapshot: IsolatedSnapshot = {
      id: snapshotId,
      agentId,
      version,
      path: snapshotPath,
      containerId,
      isolation: isolationConfig,
      created: new Date(),
      status: 'ready'
    };
    
    // Save snapshot metadata
    await this.saveSnapshotMetadata(snapshot);
    
    return snapshot;
  }

  async testInSnapshot(snapshotId: string, testSuite: TestSuite): Promise<TestResult> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    
    const testRunner = new SnapshotTestRunner(snapshot);
    
    try {
      snapshot.status = 'testing';
      await this.updateSnapshotStatus(snapshot);
      
      const results = await testRunner.runTests(testSuite);
      
      snapshot.status = results.success ? 'test_passed' : 'test_failed';
      await this.updateSnapshotStatus(snapshot);
      
      return results;
      
    } catch (error) {
      snapshot.status = 'test_error';
      await this.updateSnapshotStatus(snapshot);
      throw error;
    }
  }

  async commitSnapshot(snapshotId: string): Promise<CommitResult> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    
    if (snapshot.status !== 'test_passed') {
      throw new Error(`Cannot commit snapshot with status: ${snapshot.status}`);
    }
    
    // Copy changes back to main version
    const targetPath = this.getVersionPath(snapshot.agentId, snapshot.version);
    await this.copyFromSnapshot(snapshot.path, targetPath);
    
    // Update version metadata
    await this.updateVersionFromSnapshot(snapshot);
    
    // Clean up snapshot
    await this.cleanupSnapshot(snapshotId);
    
    return {
      success: true,
      snapshotId,
      agentId: snapshot.agentId,
      version: snapshot.version,
      timestamp: new Date()
    };
  }

  async rollbackSnapshot(snapshotId: string): Promise<void> {
    const snapshot = await this.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    
    // Stop container if running
    if (snapshot.containerId) {
      await this.containerManager.stopContainer(snapshot.containerId);
    }
    
    // Clean up snapshot
    await this.cleanupSnapshot(snapshotId);
  }

  private async createIsolationConfig(options: SnapshotOptions): Promise<IsolationConfig> {
    return {
      environment: {
        NODE_ENV: 'sandbox',
        KAI_ISOLATION_MODE: 'true',
        ...options.environment
      },
      networkMode: options.networkAccess ? 'bridge' : 'none',
      resources: {
        memory: options.memoryLimit || '512m',
        cpu: options.cpuLimit || '0.5',
        storage: options.storageLimit || '1g'
      },
      permissions: {
        readOnly: options.readOnly || false,
        allowedPaths: options.allowedPaths || ['/agent'],
        blockedSyscalls: options.blockedSyscalls || []
      }
    };
  }
}

interface IsolatedSnapshot {
  id: string;
  agentId: string;
  version: string;
  path: string;
  containerId?: string;
  isolation: IsolationConfig;
  created: Date;
  status: 'ready' | 'testing' | 'test_passed' | 'test_failed' | 'test_error';
}

interface SnapshotOptions {
  useContainer?: boolean;
  containerImage?: string;
  networkAccess?: boolean;
  memoryLimit?: string;
  cpuLimit?: string;
  storageLimit?: string;
  environment?: Record<string, string>;
  readOnly?: boolean;
  allowedPaths?: string[];
  blockedSyscalls?: string[];
}
```

### CLI Interface & Tools

```typescript
class AgentVersionCLI {
  private versionManager: AgentVersionManager;
  private snapshotManager: SnapshotIsolationManager;

  async rollback(agentName: string, targetVersion: string): Promise<void> {
    console.log(`Rolling back ${agentName} to version ${targetVersion}...`);
    
    const result = await this.versionManager.rollbackToVersion(targetVersion);
    
    if (result.success) {
      console.log(`✅ Successfully rolled back to ${targetVersion}`);
      console.log(`Previous version: ${result.previousVersion}`);
    } else {
      console.error(`❌ Rollback failed: ${result.error}`);
      
      // Show rollback steps for debugging
      for (const step of result.steps) {
        const status = step.success ? '✅' : '❌';
        console.log(`  ${status} ${step.step}`);
        if (step.error) {
          console.log(`    Error: ${step.error}`);
        }
      }
    }
  }

  async createSnapshot(agentName: string, version: string, options: CLISnapshotOptions): Promise<void> {
    console.log(`Creating isolated snapshot for ${agentName}@${version}...`);
    
    const snapshot = await this.snapshotManager.createIsolatedSnapshot(agentName, version, {
      useContainer: options.container,
      networkAccess: options.network,
      memoryLimit: options.memory,
      readOnly: !options.writable
    });
    
    console.log(`✅ Snapshot created: ${snapshot.id}`);
    console.log(`Path: ${snapshot.path}`);
    
    if (options.test) {
      await this.runSnapshotTests(snapshot.id, options.testSuite);
    }
  }

  async listVersions(agentName: string): Promise<void> {
    const versions = await this.versionManager.listVersions();
    
    console.log(`\nVersions for ${agentName}:\n`);
    
    for (const version of versions) {
      const current = version.isCurrent ? ' (current)' : '';
      const size = this.formatSize(version.size);
      const date = version.metadata.created.toLocaleDateString();
      
      console.log(`  ${version.version}${current}`);
      console.log(`    Created: ${date} by ${version.metadata.author}`);
      console.log(`    Size: ${size}`);
      if (version.metadata.notes) {
        console.log(`    Notes: ${version.metadata.notes}`);
      }
      console.log();
    }
  }

  private async runSnapshotTests(snapshotId: string, testSuitePath?: string): Promise<void> {
    console.log(`Running tests in snapshot ${snapshotId}...`);
    
    const testSuite = testSuitePath ? 
      await this.loadTestSuite(testSuitePath) : 
      await this.getDefaultTestSuite();
    
    const result = await this.snapshotManager.testInSnapshot(snapshotId, testSuite);
    
    if (result.success) {
      console.log(`✅ All tests passed (${result.passedTests}/${result.totalTests})`);
    } else {
      console.log(`❌ Tests failed (${result.passedTests}/${result.totalTests})`);
      
      for (const failure of result.failures) {
        console.log(`  ❌ ${failure.test}: ${failure.error}`);
      }
    }
  }
}

interface CLISnapshotOptions {
  container?: boolean;
  network?: boolean;
  memory?: string;
  writable?: boolean;
  test?: boolean;
  testSuite?: string;
}
```

## Error Handling & Security

### Validation & Security

```typescript
class VersionSecurityManager {
  private signatureValidator: SignatureValidator;
  private integrityChecker: IntegrityChecker;

  async validateVersionIntegrity(agentName: string, version: string): Promise<ValidationResult> {
    const versionPath = this.getVersionPath(agentName, version);
    const metadata = await this.loadVersionMetadata(versionPath);
    
    const checks = await Promise.all([
      this.validateSignatures(versionPath),
      this.validateChecksums(versionPath, metadata),
      this.validateDependencies(versionPath),
      this.validatePermissions(versionPath)
    ]);
    
    const allValid = checks.every(check => check.valid);
    const errors = checks.flatMap(check => check.errors);
    
    return {
      valid: allValid,
      errors,
      warnings: checks.flatMap(check => check.warnings)
    };
  }

  async quarantineCorruptedVersion(agentName: string, version: string, reason: string): Promise<void> {
    const versionPath = this.getVersionPath(agentName, version);
    const quarantinePath = this.getQuarantinePath(agentName, version);
    
    // Move to quarantine
    await fs.move(versionPath, quarantinePath);
    
    // Create quarantine metadata
    await fs.writeJSON(path.join(quarantinePath, 'quarantine.json'), {
      reason,
      quarantinedAt: new Date(),
      originalPath: versionPath
    });
    
    // Alert administrators
    await this.alertCorruption(agentName, version, reason);
  }
}

// Error codes and handling
enum VersionErrorCode {
  INVALID_VERSION = 'E101',
  CHECKSUM_MISMATCH = 'E102',
  SNAPSHOT_ISOLATION_FAILED = 'E103',
  ROLLBACK_VALIDATION_FAILED = 'E104',
  PERMISSION_DENIED = 'E105'
}

const ERROR_MESSAGES = {
  [VersionErrorCode.INVALID_VERSION]: 'Invalid rollback version - version does not exist or is corrupted',
  [VersionErrorCode.CHECKSUM_MISMATCH]: 'Checksum mismatch detected - files may have been modified outside version control',
  [VersionErrorCode.SNAPSHOT_ISOLATION_FAILED]: 'Failed to create isolated snapshot - check sandbox directory permissions',
  [VersionErrorCode.ROLLBACK_VALIDATION_FAILED]: 'Rollback validation failed - target version may be incompatible',
  [VersionErrorCode.PERMISSION_DENIED]: 'Insufficient permissions for version operation'
};
```

## Related Documentation

- **[Agent Manifest & Metadata Specification](33_agent-manifest-metadata-specification.md)** - Agent configuration and metadata
- **[Agent Memory Specification & Management](34_agent-memory-specification-management.md)** - Memory architecture
- **[Agent State Recovery Protocols](35_agent-state-recovery-protocols.md)** - State persistence and recovery
- **[Agent Orchestration Topologies](37_agent-orchestration-topologies.md)** - Deployment patterns

## Implementation Status

- ✅ Versioning system architecture and interfaces
- ✅ Snapshot isolation and container management
- ✅ Rollback protocols and validation
- ✅ CLI tools and user interfaces
- ✅ Security validation and error handling
- 🔄 Automated testing integration
- 🔄 Performance optimization for large versions
- ⏳ Blockchain-anchored version hashes
- ⏳ Time-travel debugging capabilities 
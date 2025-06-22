---
title: "Agent Versioning & Snapshot Isolation"
description: "Architecture for agent versioning, rollback safety, and snapshot isolation with deterministic reproducibility"
version: "1.0.0"
last_updated: "2025-01-27"
author: "kAI Development Team"
tags: ["agents", "versioning", "rollback", "isolation", "snapshots"]
related_docs: 
  - "28_agent-manifest-metadata-system.md"
  - "29_agent-memory-specification-system.md"
  - "30_agent-state-recovery-protocols.md"
status: "active"
---

# Agent Versioning & Snapshot Isolation

## Agent Context

### Integration Points
- **Agent State Recovery System**: Checkpoint creation and rollback mechanisms
- **Agent Manifest System**: Version metadata and compatibility tracking
- **Container Orchestration**: Isolated execution environments for snapshots
- **Configuration Management**: Version-specific settings and dependencies
- **Deployment Pipeline**: Automated versioning and rollback workflows

### Dependencies
- **Version Control System**: Git-based version tracking with semantic versioning
- **Container Runtime**: Docker/Podman for isolated snapshot execution
- **Storage Backend**: Versioned storage with copy-on-write capabilities
- **Cryptographic Services**: Hash generation for deterministic version identification
- **Event System**: Version change notifications and rollback triggers

---

## Overview

The Agent Versioning & Snapshot Isolation system provides robust mechanisms for maintaining agent versions, enabling safe rollbacks, and operating agents in isolated environments. This architecture ensures agents can be independently versioned, reverted to known working states, and tested in isolation without affecting production systems.

## Core Versioning Architecture

### Version Management Framework

```typescript
interface AgentVersion {
  version: string;                    // Semantic version (major.minor.patch)
  commitHash: string;                 // Git commit hash for reproducibility
  parentVersion?: string;             // Previous version for lineage tracking
  createdAt: string;                  // Version creation timestamp
  createdBy: string;                  // Version creator (user/system)
  
  metadata: VersionMetadata;
  artifacts: VersionArtifacts;
  compatibility: CompatibilityInfo;
  rollbackInfo: RollbackInfo;
}

interface VersionMetadata {
  snapshotType: 'auto' | 'manual' | 'rollback' | 'release';
  description: string;
  changelog: ChangelogEntry[];
  tags: string[];
  deprecated: boolean;
  deprecationReason?: string;
}

interface VersionArtifacts {
  agentLogic: ArtifactInfo;          // Core agent logic/code
  configuration: ArtifactInfo;       // Agent configuration
  dependencies: DependencyInfo[];    // Runtime dependencies
  assets: AssetInfo[];               // Additional assets
  state: StateSnapshot;              // Agent state at version creation
}

interface CompatibilityInfo {
  backwardCompatible: string[];      // Compatible previous versions
  forwardCompatible: string[];       // Compatible future versions
  breakingChanges: BreakingChange[]; // Breaking changes from previous version
  migrationRequired: boolean;        // Whether migration is needed
  migrationScript?: string;          // Migration script path
}
```

### Version Manager Implementation

```typescript
class AgentVersionManager {
  private storage: VersionStorage;
  private isolation: SnapshotIsolation;
  private validator: VersionValidator;
  private eventBus: EventBus;

  async createVersion(
    agentId: string, 
    versionType: 'auto' | 'manual' | 'release',
    metadata: Partial<VersionMetadata>
  ): Promise<AgentVersion> {
    
    const currentVersion = await this.getCurrentVersion(agentId);
    const newVersion = await this.generateNextVersion(currentVersion, versionType);
    
    // Create version artifacts
    const artifacts = await this.captureArtifacts(agentId);
    
    // Analyze compatibility
    const compatibility = await this.analyzeCompatibility(currentVersion, artifacts);
    
    const version: AgentVersion = {
      version: newVersion,
      commitHash: await this.generateCommitHash(artifacts),
      parentVersion: currentVersion?.version,
      createdAt: new Date().toISOString(),
      createdBy: metadata.createdBy || 'system',
      
      metadata: {
        snapshotType: versionType,
        description: metadata.description || `${versionType} version ${newVersion}`,
        changelog: metadata.changelog || [],
        tags: metadata.tags || [],
        deprecated: false
      },
      
      artifacts: {
        agentLogic: artifacts.logic,
        configuration: artifacts.config,
        dependencies: artifacts.dependencies,
        assets: artifacts.assets,
        state: artifacts.state
      },
      
      compatibility,
      
      rollbackInfo: {
        canRollback: true,
        rollbackTarget: currentVersion?.version,
        rollbackRisks: [],
        rollbackProcedure: 'standard'
      }
    };

    // Store version
    await this.storage.storeVersion(agentId, version);
    
    // Update current version pointer
    await this.storage.setCurrentVersion(agentId, newVersion);
    
    // Emit version created event
    await this.eventBus.emit('agent.version.created', {
      agentId,
      version: newVersion,
      type: versionType,
      timestamp: new Date().toISOString()
    });

    return version;
  }

  async rollbackToVersion(agentId: string, targetVersion: string, force: boolean = false): Promise<void> {
    const currentVersion = await this.getCurrentVersion(agentId);
    const targetVersionInfo = await this.storage.getVersion(agentId, targetVersion);
    
    if (!targetVersionInfo) {
      throw new Error(`Target version ${targetVersion} not found`);
    }

    if (!targetVersionInfo.rollbackInfo.canRollback && !force) {
      throw new Error(`Rollback to version ${targetVersion} is not allowed`);
    }

    try {
      // Create backup of current version
      await this.createVersion(agentId, 'auto', {
        description: `Backup before rollback to ${targetVersion}`,
        createdBy: 'rollback_system'
      });

      // Restore artifacts from target version
      await this.restoreArtifacts(agentId, targetVersionInfo);
      
      // Update current version pointer
      await this.storage.setCurrentVersion(agentId, targetVersion);
      
      // Emit rollback event
      await this.eventBus.emit('agent.version.rollback', {
        agentId,
        fromVersion: currentVersion?.version,
        toVersion: targetVersion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await this.handleRollbackFailure(agentId, currentVersion, error);
      throw error;
    }
  }

  async compareVersions(agentId: string, version1: string, version2: string): Promise<VersionComparison> {
    const v1 = await this.storage.getVersion(agentId, version1);
    const v2 = await this.storage.getVersion(agentId, version2);
    
    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return {
      version1: v1.version,
      version2: v2.version,
      differences: await this.calculateDifferences(v1, v2),
      compatibility: await this.checkVersionCompatibility(v1, v2),
      migrationRequired: this.requiresMigration(v1, v2),
      rollbackPossible: this.canRollbackBetween(v1, v2)
    };
  }

  private async generateNextVersion(currentVersion: AgentVersion | null, type: string): Promise<string> {
    if (!currentVersion) {
      return '1.0.0';
    }

    const [major, minor, patch] = currentVersion.version.split('.').map(Number);
    
    switch (type) {
      case 'auto':
        return `${major}.${minor}.${patch + 1}`;
      case 'manual':
        return `${major}.${minor + 1}.0`;
      case 'release':
        return `${major + 1}.0.0`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  private async generateCommitHash(artifacts: any): Promise<string> {
    const artifactString = JSON.stringify(artifacts, Object.keys(artifacts).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(artifactString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
```

## Snapshot Isolation System

### Isolation Manager Implementation

```typescript
class SnapshotIsolation {
  private containerRuntime: ContainerRuntime;
  private networkManager: NetworkManager;
  private storageManager: StorageManager;

  async createIsolatedSnapshot(
    agentId: string, 
    version: string, 
    options: SnapshotOptions
  ): Promise<SnapshotEnvironment> {
    
    const snapshotId = this.generateSnapshotId(agentId, version);
    
    // Create isolated container
    const container = await this.containerRuntime.create({
      name: snapshotId,
      image: await this.buildSnapshotImage(agentId, version),
      isolation: {
        network: options.networkIsolation || 'bridge',
        filesystem: options.filesystemIsolation || 'overlay',
        process: options.processIsolation || 'container'
      },
      resources: {
        memory: options.memoryLimit || '1GB',
        cpu: options.cpuLimit || '1.0',
        storage: options.storageLimit || '10GB'
      },
      environment: await this.prepareEnvironment(agentId, version, options)
    });

    // Set up isolated networking
    const network = await this.networkManager.createIsolatedNetwork(snapshotId, {
      subnet: options.subnet,
      allowInternet: options.allowInternet || false,
      allowedHosts: options.allowedHosts || []
    });

    // Mount isolated storage
    const storage = await this.storageManager.createIsolatedStorage(snapshotId, {
      baseSnapshot: version,
      copyOnWrite: true,
      size: options.storageLimit || '10GB'
    });

    const snapshot: SnapshotEnvironment = {
      snapshotId,
      agentId,
      version,
      container,
      network,
      storage,
      createdAt: new Date().toISOString(),
      status: 'created',
      options
    };

    return snapshot;
  }

  async executeInSnapshot(
    snapshotId: string, 
    command: string, 
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    
    const snapshot = await this.getSnapshot(snapshotId);
    
    if (snapshot.status !== 'running') {
      throw new Error(`Snapshot ${snapshotId} is not running`);
    }

    const result = await this.containerRuntime.exec(snapshot.container.id, {
      command,
      workingDir: options?.workingDir || '/app',
      environment: options?.environment || {},
      timeout: options?.timeout || 300,
      user: options?.user || 'agent'
    });

    return {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      duration: result.duration,
      timestamp: new Date().toISOString()
    };
  }

  async destroySnapshot(snapshotId: string): Promise<void> {
    const snapshot = await this.getSnapshot(snapshotId);
    
    // Ensure snapshot is stopped
    if (snapshot.status === 'running') {
      await this.stopSnapshot(snapshotId, { force: true });
    }
    
    // Clean up resources
    await this.containerRuntime.remove(snapshot.container.id);
    await this.networkManager.removeNetwork(snapshot.network.id);
    await this.storageManager.removeStorage(snapshot.storage.id);
    
    // Remove snapshot record
    await this.removeSnapshot(snapshotId);
  }

  private generateSnapshotId(agentId: string, version: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `snapshot_${agentId}_${version}_${timestamp}_${random}`;
  }

  private async buildSnapshotImage(agentId: string, version: string): Promise<string> {
    const baseImage = 'kai-agent-runtime:latest';
    const versionArtifacts = await this.getVersionArtifacts(agentId, version);
    
    const dockerfile = this.generateDockerfile(baseImage, versionArtifacts);
    const imageName = `kai-agent-${agentId}:${version}`;
    
    await this.containerRuntime.build({
      dockerfile,
      imageName,
      context: versionArtifacts.path
    });

    return imageName;
  }
}

interface SnapshotOptions {
  networkIsolation?: 'none' | 'bridge' | 'isolated';
  filesystemIsolation?: 'none' | 'overlay' | 'tmpfs';
  processIsolation?: 'none' | 'container' | 'vm';
  memoryLimit?: string;
  cpuLimit?: string;
  storageLimit?: string;
  allowInternet?: boolean;
  allowedHosts?: string[];
  timeout?: number;
}

interface SnapshotEnvironment {
  snapshotId: string;
  agentId: string;
  version: string;
  container: ContainerInfo;
  network: NetworkInfo;
  storage: StorageInfo;
  createdAt: string;
  status: 'created' | 'running' | 'stopped' | 'error';
  options: SnapshotOptions;
}
```

## Version Storage System

### Version Storage Implementation

```typescript
class VersionStorage {
  private db: Database;
  private fileStorage: FileStorage;
  private encryption: EncryptionService;

  async storeVersion(agentId: string, version: AgentVersion): Promise<void> {
    const transaction = await this.db.beginTransaction();
    
    try {
      // Store version metadata
      await this.db.run(`
        INSERT INTO agent_versions (
          agent_id, version, commit_hash, parent_version, created_at, created_by,
          snapshot_type, description, deprecated, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        agentId,
        version.version,
        version.commitHash,
        version.parentVersion,
        version.createdAt,
        version.createdBy,
        version.metadata.snapshotType,
        version.metadata.description,
        version.metadata.deprecated ? 1 : 0,
        JSON.stringify(version.metadata)
      ]);

      // Store artifacts
      for (const [artifactType, artifact] of Object.entries(version.artifacts)) {
        if (artifactType !== 'state') {
          await this.storeArtifact(agentId, version.version, artifactType, artifact);
        }
      }

      // Store state snapshot separately
      if (version.artifacts.state) {
        await this.storeStateSnapshot(agentId, version.version, version.artifacts.state);
      }

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getVersion(agentId: string, version: string): Promise<AgentVersion | null> {
    const row = await this.db.get(`
      SELECT * FROM agent_versions 
      WHERE agent_id = ? AND version = ?
    `, [agentId, version]);

    if (!row) {
      return null;
    }

    // Load artifacts
    const artifacts = await this.loadArtifacts(agentId, version);
    
    return {
      version: row.version,
      commitHash: row.commit_hash,
      parentVersion: row.parent_version,
      createdAt: row.created_at,
      createdBy: row.created_by,
      
      metadata: {
        ...JSON.parse(row.metadata_json),
        snapshotType: row.snapshot_type,
        description: row.description,
        deprecated: row.deprecated === 1
      },
      
      artifacts,
      
      compatibility: {
        backwardCompatible: [],
        forwardCompatible: [],
        breakingChanges: [],
        migrationRequired: false
      },
      
      rollbackInfo: {
        canRollback: true,
        rollbackTarget: row.parent_version,
        rollbackRisks: [],
        rollbackProcedure: 'standard'
      }
    };
  }

  async setCurrentVersion(agentId: string, version: string): Promise<void> {
    await this.db.run(`
      INSERT OR REPLACE INTO current_versions (agent_id, current_version, updated_at)
      VALUES (?, ?, ?)
    `, [agentId, version, new Date().toISOString()]);
  }

  private async storeArtifact(
    agentId: string, 
    version: string, 
    artifactType: string, 
    artifact: any
  ): Promise<void> {
    const artifactPath = `versions/${agentId}/${version}/${artifactType}`;
    
    // Store artifact file
    await this.fileStorage.store(artifactPath, artifact.data);
    
    // Store artifact metadata
    await this.db.run(`
      INSERT INTO version_artifacts (
        agent_id, version, artifact_type, path, checksum, size
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      agentId,
      version,
      artifactType,
      artifactPath,
      artifact.checksum,
      artifact.size
    ]);
  }
}
```

## Configuration & Best Practices

### Version Management Configuration

```yaml
agent_versioning:
  versioning:
    scheme: "semantic"
    auto_increment: "patch"
    tag_format: "v{version}"
    
  snapshots:
    default_isolation: "container"
    max_concurrent: 10
    cleanup_after: "24h"
    resource_limits:
      memory: "2GB"
      cpu: "2.0"
      storage: "10GB"
      
  rollback:
    safety_checks: true
    backup_before_rollback: true
    max_rollback_depth: 10
    rollback_timeout: "5m"
```

### Versioning Best Practices

1. **Semantic Versioning**: Use semantic versioning for clear compatibility signaling
2. **Automated Snapshots**: Create snapshots before major operations
3. **Isolation Testing**: Test changes in isolated snapshots before deployment
4. **Rollback Preparation**: Always verify rollback procedures work
5. **Documentation**: Maintain clear changelogs and migration guides

## Future Enhancements

### Planned Features

1. **Distributed Versioning**: Cross-cluster version synchronization
2. **Smart Rollbacks**: AI-assisted rollback decision making
3. **Version Analytics**: Usage and performance analytics per version
4. **Blue-Green Deployments**: Zero-downtime version transitions

---

## Related Documentation

- [Agent Manifest & Metadata System](28_agent-manifest-metadata-system.md)
- [Agent Memory Specification System](29_agent-memory-specification-system.md)
- [Agent State Recovery Protocols](30_agent-state-recovery-protocols.md)

---

*This document provides comprehensive architecture for agent versioning and snapshot isolation within the kAI ecosystem.* 
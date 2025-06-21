# 204: Agent Versioning, Rollback, and Snapshot Isolation

## Overview

This document defines the architecture, procedures, and implementation details for maintaining robust versioning, rollback safety, and snapshot isolation for all agents operating within the kAI/kOS system.

These mechanisms ensure that agents can:
- Be independently versioned.
- Be reverted to a known working state.
- Operate in isolated environments for testing and rollback.
- Avoid accidental state corruption.

---

## Key Concepts

### 🔁 Agent Versioning
Each agent is uniquely versioned with semantic versioning (`major.minor.patch`) and linked to a hash of its core logic and configuration.

### 🔄 Rollback
Users and system processes can request rollback to any valid previous version. Configs, state, and dependencies are restored as part of the rollback.

### 📦 Snapshot Isolation
Agents operate in snapshot-isolated containers or sandboxes. Changes made in one snapshot do not affect others unless committed.

### 🔐 Deterministic Reproducibility
Every version must be fully reproducible based on its version hash and metadata.

---

## Directory Structure

```plaintext
/agents/
  /agent_name/
    /versions/
      /v1.0.0/
        logic.py
        config.yaml
        state.json
        snapshot_meta.json
      /v1.1.0/
        ...
    current -> versions/v1.1.0/
    rollback.log
    snapshot_temp/  # Used for isolation
```

---

## Version Metadata Format (`snapshot_meta.json`)

```json
{
  "version": "1.1.0",
  "created": "2025-06-21T14:12:00Z",
  "commit_hash": "b1e4f...",
  "parent": "1.0.0",
  "snapshot_type": "auto | manual | rollback",
  "notes": "Added new retrieval logic for document summarization.",
  "agent_state_checksum": "abc123...",
  "config_checksum": "def456..."
}
```

---

## Workflow: Creating a New Version

1. Agent update triggered via:
   - Manual user action
   - Auto-update system
   - System-wide dependency change

2. New version folder created:
   ```
   /agent_name/versions/v1.1.0/
   ```

3. Files copied from current version
   - `logic.py`, `config.yaml`, `state.json`

4. Snapshot metadata file generated

5. New version becomes `current`

6. Old version remains untouched

---

## Workflow: Rollback

1. User selects version from rollback UI or CLI:
   ```bash
   kai rollback agent_name --to v1.0.0
   ```

2. Current version folder moved to backup
   - Appended to `rollback.log`

3. Symbolic link `current` updated to point to selected version

4. System reloads agent from rollback version

---

## Snapshot Isolation (Temp Sandbox Mode)

Temporary container launched for testing or dry-run:

```bash
kai snapshot agent_name --test v1.2.0
```

- Environment variables and dependencies isolated
- No changes committed unless `--commit` flag used

### Configurable Options
```yaml
isolation:
  enable: true
  temp_dir: /tmp/kai_snapshots
  commit_changes: false
  rollback_on_error: true
```

---

## Error Handling

| Code | Message                         | Cause                         | Action                           |
|------|----------------------------------|-------------------------------|----------------------------------|
| E101 | Invalid rollback version         | Non-existent or corrupted ver | Abort + user prompt              |
| E102 | Checksum mismatch                | Modified logic/config outside | Reject + force rollback required |
| E103 | Snapshot failed to isolate       | Sandbox dir permission issues | Log error, prompt admin          |

---

## Security Considerations

- Rollback versions and snapshots are read-only by default.
- Configs and state files are checksum-validated on every load.
- Snapshots operate under reduced permission profiles.
- User role permissions determine rollback/snapshot capabilities.

---

## Best Practices

1. Tag meaningful versions with notes.
2. Use snapshot mode before enabling critical agent features.
3. Schedule automated rollbacks in CI environments.
4. Do not hot-patch agents in production; always version properly.

---

## Future Enhancements

- Blockchain-anchored versioning hashes.
- Visual diff tool for comparing agent versions.
- Automatic compatibility check for rollback.
- Time-travel debugging sandbox.

---

### Changelog
– 2025-06-21 • Initial draft for version management architecture (AI agent)


# 157: Vault Manager System & Configuration Protocols

This document defines the full system architecture, interaction protocols, CLI and UI layers, file system structure, encryption details, and configuration mechanisms for the `VaultManager` component in the `kAI` and `kOS` ecosystem.

---

## I. Purpose

VaultManager securely stores and manages sensitive data, including:

- Service credentials and tokens
- API keys and secrets
- Secure configurations and encrypted files
- Optional local user data for offline operation

It provides:

- CLI, API, and UI access
- Local + remote syncing capability
- Modular backends (local file, SQL, Vault, KMS)
- Per-object encryption and schema versioning

---

## II. Core Architecture

### A. Storage Drivers

```txt
src/core/vault/drivers/
├── base.ts          # Abstract vault driver interface
├── local.ts         # Encrypted local JSON file driver
├── sql.ts           # SQL-based encrypted store
├── vault.ts         # HashiCorp Vault integration
├── kms_aws.ts       # AWS KMS backend
└── kms_gcloud.ts    # GCP KMS backend
```

### B. Data Format (Vault Schema v2)

```json
{
  "version": 2,
  "objects": [
    {
      "id": "openai-token",
      "type": "api_key",
      "tags": ["llm", "openai"],
      "metadata": {
        "created_at": "2025-06-22T12:00:00Z"
      },
      "encrypted": "base64:AES-GCM:..."
    }
  ]
}
```

### C. Encryption Layer

- **AES-256-GCM** per-object
- **PBKDF2-SHA512** with 200,000 iterations
- Optional master password
- Derived KEK (Key Encryption Key) stored in memory only

---

## III. Directory Structure

```txt
src/core/vault/
├── index.ts               # Exports main interface
├── drivers/               # Modular backend storage layers
├── crypto.ts              # Encryption utilities
├── schema.ts              # Validation + migration logic
├── vaultManager.ts        # Orchestration logic
├── vaultHooks.ts          # React and service integration
├── config.ts              # Load/save vault config
└── cli.ts                 # CLI integration
```

---

## IV. Configuration Files

### A. Global Config: `.kconfig/vault.json`

```json
{
  "default_driver": "local",
  "master_key_prompt": true,
  "auto_lock_timeout": 900,
  "sync_enabled": true
}
```

### B. Vault Object Schema

Each vault object has:

- `id` (string, required)
- `type` (e.g. `api_key`, `token`, `file`, `json`, `cert`)
- `tags` (array of labels)
- `encrypted` (AES-encrypted payload)

---

## V. CLI Usage

```sh
kai vault init              # Create new vault
kai vault add <id>          # Add new secret interactively
kai vault list              # List stored credentials
kai vault get <id>          # Decrypt and show value
kai vault remove <id>       # Delete object
kai vault export <file>     # Export encrypted vault
kai vault import <file>     # Import encrypted vault
```

---

## VI. UI Panel

- Route: `/vault`
- Accessed via sidebar lock icon (🔒)

### Features:

- List, search, filter secrets
- Add/edit/remove
- Import/export
- Auto-lock UI with timeout
- Quick-insert into service config forms

### Components

```txt
components/ui/Vault/
├── VaultPage.tsx
├── VaultList.tsx
├── VaultEditor.tsx
├── VaultSearch.tsx
├── VaultLockScreen.tsx
└── VaultInsertButton.tsx
```

---

## VII. Service Integration

- UI Credential Picker auto-populates from vault
- CLI & service loader automatically resolves `vault:`-prefixed secrets

```json
{
  "auth": {
    "type": "bearer_token",
    "token": "vault:openai-token"
  }
}
```

---

## VIII. Syncing & Replication (Future)

- Optional federation via KLP trust sync
- Cloud sync via S3, GCS, or remote Vault
- Versioned conflict resolution

---

## IX. Security Policies

- All vault operations require active session key
- Lock after 5 failed attempts
- Auto-backup encrypted snapshot
- Keystrokes in vault UI are never logged
- Prompts scrubbed from memory after use

---

### Changelog

– 2025-06-22 • Initial full implementation draft


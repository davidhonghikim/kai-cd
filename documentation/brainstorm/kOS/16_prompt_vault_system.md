# 16: Prompt Vault System

This document defines the Prompt Vault System architecture, directory structure, APIs, encryption model, access controls, and integrations for secure, persistent prompt and conversation history management in kAI and kOS.

---

## I. Purpose

The Prompt Vault is a secure, local-first, encrypted vault used to:
- Persist and manage user prompts, completions, and conversations.
- Store reusable prompt templates with tags, metadata, and versioning.
- Enable import/export, auditing, and backup of conversational history.
- Support fast querying, indexing, and retrieval of prompts for context injection.

---

## II. Directory Structure

```text
src/
└── core/
    └── vault/
        ├── PromptVaultManager.ts         # Entry point for vault operations
        ├── PromptIndexEngine.ts         # Manages search & indexing
        ├── EncryptionHandler.ts         # AES-256 encryption, password & vault key
        ├── PromptImporter.ts            # Import prompts from files or URLs
        ├── PromptExporter.ts            # Export prompts in .json, .md, .csv formats
        ├── vault_configs/
        │   ├── default.yaml              # Default settings, paths, limits
        │   ├── backup.yaml               # Backup schedules, encryption, remote
        │   └── access_policies.yaml      # RBAC, tag restrictions, visibility levels
        └── db/
            ├── prompt.sqlite            # Local encrypted SQLite DB
            ├── prompt_index.db          # Optional vector DB index (e.g., Qdrant)
            └── keyvault.sealed          # Encrypted key vault blob
```

---

## III. Data Schema (prompt.sqlite)

### A. Prompts Table
```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  title TEXT,
  body TEXT,
  tags TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  persona TEXT,
  lang TEXT,
  is_template BOOLEAN DEFAULT false
);
```

### B. Conversations Table
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT,
  title TEXT,
  started_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_starred BOOLEAN DEFAULT false
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  role TEXT, -- 'user' | 'assistant' | 'system'
  content TEXT,
  created_at TIMESTAMP
);
```

---

## IV. Features

### A. Vault Encryption & Security
- Vault protected by a master password-derived AES-256 key (PBKDF2-HMAC-SHA512)
- All prompt data encrypted at rest
- `keyvault.sealed` contains encrypted per-user vault key with vault unlock policy

### B. Prompt Management
- Create, tag, and update prompts inline
- Favorite/starred prompts for quick access
- Version history of prompt modifications
- Shareable via secure token or export file

### C. Template System
- Mark any prompt as a reusable template
- Support for dynamic variable replacement: `{{name}}`, `{{date}}`
- Prompt render preview engine

### D. Vault Search & Retrieval
- Full-text search via SQLite FTS5
- Optional vector search via Qdrant/Weaviate backend
- Semantic tag clustering (future)

### E. Backup & Sync
- Local backup scheduler (zip + encrypt + rotate)
- Optional remote sync: Dropbox, S3, IPFS
- Export/import to/from other vaults or users

---

## V. API Interface

### A. Save Prompt
```ts
await promptVault.savePrompt({
  title: 'Creative Writer',
  body: 'You are a poet AI...',
  tags: ['creative', 'poetry'],
  persona: 'child',
  lang: 'en'
});
```

### B. Search Prompt
```ts
const results = await promptVault.search({
  query: 'marketing email',
  tags: ['email'],
  sortBy: 'updated_at',
  vectorize: true // optional
});
```

### C. Export Vault
```ts
await promptExporter.exportToFile('vault_2025_06.json', 'json', {
  encrypted: true,
  password: 'vaultpass123'
});
```

---

## VI. Access Controls

### A. Role-Based Access (RBAC)
```yaml
roles:
  admin:
    access: [read, write, export, delete]
  user:
    access: [read, write, export]
  readonly:
    access: [read]
```

### B. Tag Restrictions
```yaml
restrictions:
  medical:
    roles: [admin]
  financial:
    roles: [admin, user]
```

---

## VII. UI Features
- Vault Dashboard with filters, tags, search, and templates
- Conversation Timeline View
- Prompt Editor with preview and test
- Secure Prompt Sharing via QR or token

---

## VIII. Future Enhancements
| Feature                         | Target Version |
|----------------------------------|----------------|
| Semantic Prompt Clustering       | v1.2           |
| Collaborative Vaults             | v1.3           |
| In-Vault Prompt Evaluator        | v1.4           |
| Prompt Chain Graphs              | v2.0           |

---
### Changelog
- 2025-06-20: Initial full draft of secure Prompt Vault system


# 33: System Configuration Architecture – User, Agent, and Infrastructure Layers

This document defines the full configuration architecture for kAI and kOS, covering user-level preferences, agent-specific runtime settings, and infrastructure deployment parameters. The system supports centralized management with modular override options at each level.

---

## I. Configuration Philosophy

- **Three-Tier Override Model:**

  1. **Global Defaults** (checked into source)
  2. **System Profiles** (environment-specific: dev/staging/prod)
  3. **User Overrides** (per-device, per-profile, per-session)

- **Hot-Reloadable:** All configs support live updates via file watchers or API reload hooks.

- **Secure & Declarative:** All config files are JSON5 / TOML / YAML with strong schema validation via Zod.

- **Cryptographic Signing (Optional):** Trusted config bundles (e.g., from enterprise admins) can be signed and verified.

---

## II. Directory Layout (Config Files)

```text
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

---

## III. Configuration Schemas (Examples)

### A. User Preferences (`prefs.json5`)

```json5
{
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
}
```

### B. Service Definitions (`services.yaml`)

```yaml
ollama:
  type: local
  baseUrl: "http://localhost:11434"
  capabilities: [llm_chat, embeddings]
openai:
  type: cloud
  baseUrl: "https://api.openai.com/v1"
  auth:
    type: bearer_token
    tokenEnv: OPENAI_API_KEY
```

### C. Agent Runtime (`scheduler.yaml`)

```yaml
scheduler:
  maxConcurrentTasks: 5
  retryPolicy:
    retries: 3
    backoff: 2000
  allowedHours:
    start: "07:00"
    end: "23:00"
```

### D. Infrastructure Environment (`prod.yaml`)

```yaml
telemetry: true
secureMode: true
auth:
  require2FA: true
  allowFallback: false
postgres:
  uri: "postgresql://kuser:pass@db.internal:5432/kind"
vectorDb:
  provider: qdrant
  host: "qdrant.internal"
  port: 6333
```

---

## IV. Configuration Access API

Accessible via internal utility:

```ts
import { getConfig, setConfig } from '@/utils/configManager';

const theme = await getConfig('user.prefs.theme');
await setConfig('user.prefs.theme', 'light');
```

### Features:

- `getConfig(path: string)`: Deep path reader
- `setConfig(path, value)`: Runtime patch + persistent save
- `watchConfig(callback)`: Subscribes to config changes
- `reloadConfig()`: Manual trigger

---

## V. Security Considerations

- Secrets stored in `secrets/` are NEVER committed to version control
- `vault.json` is AES-256-GCM encrypted with optional biometric unlock
- Signing/Verification via Ed25519 for admin configs
- Config tamper detection enabled with file hash checksums

---

## VI. Centralized Config Management (Enterprise / Multi-Node)

Supports:

- Config sync across distributed nodes (kOS clusters)
- Remote overrides from admin panel
- Environment drift detection & alerting

Tools:

- `k-syncd`: Config sync daemon
- `kctl configs push|pull`
- Optional webhook: `/config/update`

---

## VII. Related Docs

- `04_PromptManager.md`
- `13_UserPreferences.md`
- `32_ServiceManager.md`
- `21_Crypto_Storage.md`
- `34_Installer_and_Init.md`


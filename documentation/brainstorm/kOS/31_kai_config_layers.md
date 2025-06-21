# 31: kAI / kOS Configuration Layers and Control Planes

This document defines the configuration and control layer architecture of Kind AI (kAI) and Kind OS (kOS). The system is designed with maximum modularity and override flexibility across device-local, user-managed, system-wide, and policy-based configurations.

---

## I. Overview of Configuration Scope

```text
┌────────────────────────────┐
|        System-Wide         | <-- Immutable defaults, org policies, OS-level settings
├────────────────────────────┤
|      User Configuration     | <-- Preferences, integrations, credentials, UI settings
├────────────────────────────┤
|   Session / Runtime Cache   | <-- Temporary overrides, dynamic agent state
├────────────────────────────┤
|       Agent-Specific        | <-- Local per-agent config, personas, role behaviors
└────────────────────────────┘
```

---

## II. Directory Layout

```text
configs/
├── system/
│   ├── defaults.json          # Immutable or locked defaults
│   ├── org_policy.json        # Global rules for managed deployments
│   ├── klp_policy.toml        # Federation participation rules
├── user/
│   ├── preferences.json       # UI themes, sound, accessibility
│   ├── integrations.json      # Service keys, sync preferences
│   ├── vault.enc              # Encrypted user secrets (AES-256)
├── agents/
│   ├── agent-[ID]/
│   │   ├── persona.json       # Prompt, style, capabilities
│   │   └── overrides.json     # Per-agent config changes
├── runtime/
│   ├── cache.json             # In-memory session state
│   └── auth-tokens/           # Short-lived service tokens
└── templates/
    ├── default-theme.json     # Default light/dark themes
    └── default-persona.json   # Baseline persona settings
```

---

## III. Configuration Precedence and Merging

```text
Precedence (highest to lowest):
 1. Runtime/session (`runtime/`)
 2. Agent-specific (`agents/[ID]/`)
 3. User preferences (`user/`)
 4. System policies (`system/`)
```

- Deep-merge applied to all JSON objects
- `@locked` annotations in system config prevent override
- `@env` annotations allow referencing environment variables

---

## IV. Config Loader Module

File: `src/core/config/ConfigLoader.ts`

```ts
class ConfigLoader {
  static loadEffectiveConfig(agentId?: string): Config {
    const systemDefaults = loadJson('configs/system/defaults.json');
    const orgPolicy = loadJson('configs/system/org_policy.json');
    const userPrefs = loadJson('configs/user/preferences.json');
    const agentOverrides = agentId ? loadJson(`configs/agents/${agentId}/overrides.json`) : {};
    const sessionState = loadJson('configs/runtime/cache.json');

    return deepMerge(systemDefaults, orgPolicy, userPrefs, agentOverrides, sessionState);
  }
}
```

---

## V. Vault Access (Encrypted Secrets)

- Vault encrypted with AES-256-GCM using user password-derived key
- PBKDF2 with 150,000 iterations, salt rotation monthly
- Vault schema:

```json
{
  "version": 2,
  "entries": [
    {
      "id": "openai-api",
      "type": "api_key",
      "value": "ENCRYPTED",
      "created": "2025-06-01T12:00:00Z"
    },
    ...
  ]
}
```

Decryption service: `src/core/security/VaultService.ts`

---

## VI. Persona and Behavior Injection

Each agent has an isolated persona profile:

```json
{
  "id": "helper-agent",
  "tone": "kind, empathetic, warm",
  "capabilities": ["summarize", "answer_questions"],
  "default_prompt": "You are a helpful assistant who never gives up on a user."
}
```

Injected at load time by:
- `AgentBootstrapper.ts`
- `PersonaLoader.ts`

---

## VII. Governance and Central Control

For multi-device sync or enterprise deployment, `kControlPlane` enables remote management:

```text
kControlPlane/
├── endpoints/
│   ├── sync/
│   ├── audit/
│   ├── revoke/
│   └── federation/
├── agents/
│   ├── active_list.json
│   └── trust_scores.json
├── policies/
│   └── klp_access_policies.json
```

- Policies enforced on load
- Sync encrypted via TLS and mutual certs
- Audit log pushed to kLog

---

## VIII. Themes and Accessibility

```json
{
  "theme": "solarized-dark",
  "fontSize": 16,
  "lineHeight": 1.6,
  "contrastMode": "high",
  "animations": false,
  "cursor": "large"
}
```

- Rendered dynamically using Tailwind plugin
- Supports prefers-color-scheme media query
- Fallback to safe defaults on error

---

## IX. Change Log and Audit

- Every config change triggers a `config_change` event
- Logged via `src/core/logging/AuditLogger.ts`
- Events stored in kLog (append-only)
- Snapshot diffing for forensic comparison

---

## X. CLI Overrides

```bash
kctl config set theme solarized-light
kctl config get vault-status
kctl agent reload persona --agent=calendarAgent
```

Supports scripting, agent reconfiguration, vault inspection.

---

This config layer blueprint provides the backbone of stability and extensibility in the Kind AI ecosystem.


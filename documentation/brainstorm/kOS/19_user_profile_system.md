# 19: User Profile System (kAI/kOS)

This document outlines the architecture, implementation, and configuration for the user profile system used in Kind AI (kAI) and Kind OS (kOS). This system stores, secures, and dynamically applies user-specific preferences, capabilities, roles, personas, and settings across all agents and subsystems.

---

## I. Purpose

The User Profile System ensures a persistent and context-aware personalization layer, enabling agents and interfaces to respond intelligently to the user's:

- Preferences
- History
- Roles and identity
- Accessibility and localization needs
- Behavior, constraints, and capabilities

It is the **source of truth** for per-user context and governs the adaptive behavior of all modules.

---

## II. Directory Structure

```text
src/
└── core/
    └── user/
        ├── profiles/
        │   ├── userProfile.ts           # Runtime logic and loading
        │   ├── defaultProfile.json      # Fallback template
        │   ├── schema.ts                # Zod schema for validation
        │   └── profileLoader.ts         # From local, cloud, or vault
        ├── contexts/
        │   └── UserProfileContext.tsx   # React context provider
        ├── middleware/
        │   └── injectUserProfile.ts     # Injects profile into request chain
        └── config/
            └── profileSettings.yaml     # Global defaults & allowed overrides
```

---

## III. Data Model & Schema

`schema.ts`

```ts
export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  roles: z.array(z.string()),
  preferredAgents: z.array(z.string()).optional(),
  persona: z.string().default('neutral'),
  accessibility: z.object({
    simplifyLanguage: z.boolean().default(false),
    textToSpeech: z.boolean().default(false),
    highContrastUI: z.boolean().default(false)
  }),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  authLevel: z.enum(['guest', 'user', 'admin']).default('user'),
  memoryRetention: z.enum(['session', 'persistent']).default('persistent'),
  consentToTrain: z.boolean().default(false),
  customSettings: z.record(z.any()).optional(),
});
```

---

## IV. Profile Lifecycle

### 1. Loading Sequence

- Checks vault/local storage/cloud in order
- Fallback to `defaultProfile.json`
- Validates against schema
- Injected into `UserProfileContext`

### 2. Update Flow

- UI or agent triggers `updateUserProfile()`
- Validated + merged into current profile
- Persisted to selected backend (local/vault/cloud)
- Broadcast via event bus to notify listeners

### 3. Usage Examples

```tsx
const profile = useUserProfile();
if (profile.accessibility.simplifyLanguage) {
  applySimpleMode();
}
```

---

## V. Configuration: `profileSettings.yaml`

```yaml
defaultPersona: neutral
allowedRoles:
  - user
  - admin
  - guest
  - developer
defaultRetention: persistent
allowUserOverrides:
  persona: true
  language: true
  accessibility: true
  timezone: true
  memoryRetention: false
```

---

## VI. Integration Points

- **Prompt Transformer Engine**: PersonaFormatter and LanguageTranslator
- **Security Middleware**: Access control by `authLevel`
- **Agent Selector**: Uses `preferredAgents`
- **Voice Interface**: Uses `textToSpeech` setting
- **System Configurator**: Pulls in `customSettings`

---

## VII. Storage Backends

- LocalStorage (Browser)
- Secure Vault (AES-256)
- Cloud Sync (optional: S3, Firebase, Supabase)

---

## VIII. Security & Privacy

- All profiles encrypted at rest (AES-256)
- Fields like `consentToTrain` and `authLevel` are non-editable by UI
- No external transmission without explicit consent
- Encrypted backup supported

---

## IX. Future Enhancements

| Feature                                                   | Status |
| --------------------------------------------------------- | ------ |
| Federated identity sync across devices                    | ⬜      |
| Profiles with scoped context (work/home/dev)              | ⬜      |
| Role-based persona inheritance                            | 🟦     |
| Event-driven reactive profiles (based on time/mood/input) | ⬜      |

---

### Changelog

- 2025-06-20: Initial implementation with detailed directory breakdown and security model.


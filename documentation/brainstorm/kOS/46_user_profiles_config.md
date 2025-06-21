# 46: User Profiles, Role Configurations, and Consent Governance (kAI + kOS)

This document defines how user profiles are structured, how role permissions are assigned and governed, and how personal preferences and explicit user consent are embedded throughout Kind AI (kAI) and kindOS (kOS).

---

## I. Purpose

Ensure all user interactions are:
- Personal, flexible, and consent-driven
- Transparent and governable
- Secure and decentralized
- Configurable through local and synced profiles

---

## II. Directory Structure

```text
src/
└── user/
    ├── profiles/
    │   ├── UserProfileManager.ts         # Load/save/sync user preferences
    │   ├── ConsentLedger.ts              # Logs all consent grants/revocations
    │   └── PersonaEngine.ts              # Contextual persona switching logic
    ├── roles/
    │   ├── RoleDefinitions.ts            # Static and dynamic role schema
    │   └── RolePolicyEngine.ts           # Enforces what roles can/cannot do
    └── permissions/
        ├── AccessControlMatrix.ts       # Fine-grained access rules
        └── RoleBindingResolver.ts       # Runtime role resolution for agents/tasks
```

---

## III. User Profile Schema

```ts
interface UserProfile {
  id: string;                        // UUID
  name: string;
  avatar?: string;                  // Base64 or file path
  preferences: Record<string, any>; // e.g., language, time zone, voice
  enabledPersonas: string[];        // Allowed persona overlays
  defaultRole: string;              // e.g., 'owner', 'admin', 'guest'
  permissionsOverride?: string[];   // For fine-grained tweaks
  consentHistory: ConsentRecord[];
  createdAt: string;
  updatedAt: string;
}

interface ConsentRecord {
  action: string;                    // e.g., "use voice input"
  granted: boolean;
  timestamp: string;
  source: 'user' | 'agent' | 'external';
  note?: string;
}
```

---

## IV. Roles & Persona System

Roles determine access rights. Personas control how an agent acts on your behalf.

### A. Default Roles
| Role    | Permissions                            |
|---------|----------------------------------------|
| owner   | All rights                             |
| admin   | Manage services, agents, users         |
| user    | Use system, no config control          |
| guest   | Temporary access, sandboxed            |

### B. Persona Overlay Examples
| Persona    | Behavior Pattern                     |
|------------|--------------------------------------|
| guardian   | Prioritize safety, parental mode     |
| assistant  | Passive, context-aware help          |
| hacker     | Developer mode, deep system access   |
| clown      | Entertaining, whimsical behavior     |

---

## V. Role Policy Engine

Dynamically enforces access:
```ts
interface RolePolicy {
  role: string;
  canAccess: string[];           // Paths or features
  canDelegateTo?: string[];      // Which roles they can assign
  sandboxed?: boolean;
  requiresConsent?: string[];    // Tasks needing user opt-in
}
```

Includes policy-driven overrides:
- System lockdown (emergency mode)
- Parental control mode
- Memory isolation per role

---

## VI. Consent Ledger

- All sensitive actions must be logged.
- Supports revocation history.
- Ledger stored locally and optionally synced.

### Example
```ts
{
  action: 'upload file to cloud',
  granted: true,
  source: 'user',
  timestamp: '2025-06-21T19:12:00Z',
  note: 'Dropbox configured during onboarding'
}
```

---

## VII. Persona Engine

Switches agent personality, tone, behavior dynamically:
- Configurable via voice, GUI, API, or schedule
- Integrates with agent memory for contextual behavior
- Consent required for risky personas (e.g., hacker)

### Control Flow
```text
User triggers switch → PersonaEngine loads config → AI adapts tone & constraints
```

---

## VIII. Privacy Presets

| Mode     | Description                                |
|----------|--------------------------------------------|
| private  | Local only, no sync, offline only          |
| trusted  | Local + cloud services explicitly trusted  |
| hybrid   | Local-first with selective cloud fallback  |
| cloud    | Cloud-first with encryption guarantees     |

---

## IX. Export / Import

```ts
// Exported as encrypted .kprof file
function exportUserProfile(profile: UserProfile, passphrase: string): string;

// Import & decrypt
function importUserProfile(filePath: string, passphrase: string): UserProfile;
```

---

## X. Future Enhancements

| Feature                                 | Version |
|----------------------------------------|---------|
| Multi-user profiles w/ quick switching | v1.1    |
| zkConsent receipts                     | v1.2    |
| Persona training via user feedback     | v1.3    |
| AI behavior logs per persona           | v1.4    |

---

All user profile data must be handled securely, transparently, and with full user control. This layer is the cornerstone of kAI's alignment to individual human needs and boundaries.


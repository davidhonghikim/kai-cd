# 176: Identity Profiles and Access Scope System for kAI/kOS

This document defines the identity modeling, session scoping, and dynamic access resolution logic for user profiles, roles, agents, and AI personas across the Kind AI (kAI) and Kind OS (kOS) ecosystem.

---

## I. Identity Profile Model

Each actor (human, agent, org, service) in the system is represented by an `IdentityProfile` object with a full history of interactions, access policies, and context-specific capabilities.

### Identity Types:

- **HumanUser**: A registered user with verified credentials and optionally connected wallets, keys, and biometric data.
- **Agent**: An AI worker or autonomous process operating on behalf of a HumanUser or organization.
- **OrgNode**: Legal or cooperative entity with nested roles and delegated agents.
- **Service**: Integrated external system with its own auth/token profile.

### IdentityProfile Fields:

```ts
interface IdentityProfile {
  id: string
  kind: 'human' | 'agent' | 'org' | 'service'
  label: string
  aliases: string[]
  parent?: string
  created_at: ISODate
  verified: boolean
  keys: {
    pgp?: string
    jwt_signing?: string
    wallet_addr?: string
  }
  permissions: string[]
  persona_overlays?: PersonaOverlay[]
  trust_score: number
  audit_log_refs: string[]
}
```

### PersonaOverlay (Optional)

Allows temporary or specialized personality, tone, and behavior encoding for context-specific interactions.

```ts
interface PersonaOverlay {
  id: string
  traits: Record<string, any>
  style_prompt: string
  time_bound: boolean
  expires_at?: ISODate
}
```

---

## II. Session Scoping & Role Resolution

Each live user session evaluates a **ScopeToken** that defines current permissions, delegated roles, and persona overlays in effect.

### ScopeToken:

```ts
interface ScopeToken {
  identity_id: string
  session_id: string
  role: string
  inherited_roles?: string[]
  permissions: string[]
  active_persona?: string
  expires_at: ISODate
  issued_by: string
}
```

### Role Hierarchy System

- Roles are hierarchical with optional delegation limits.
- Policies are enforced via `RBACPolicyEngine` using Zod + TypeScript policy guards.
- Supported structures: Flat, tree, DAG.

Example:

```
HumanUser (Owner)
├── Agent (Assistant) [inherits: Owner.read]
└── OrgNode (Team)
     └── Agent (SchedulerBot) [role: Org.scheduler]
```

---

## III. Access Scoping Engine

All sensitive actions are filtered through the Access Scoping Engine (ASE), implemented as middleware across both frontend and backend layers.

### ASE Functions:

- Validate active `ScopeToken` against the current route/tool.
- Redact UI elements dynamically for unauthorized scopes.
- Fallback to consent prompt if overrideable.
- Emit audit log entries for each access decision.

### ASE Configuration

```yaml
ase:
  enabled: true
  default_policy: deny
  redact_ui_elements: true
  on_violation: consent_prompt
  audit_log: true
  persona_awareness: true
```

---

## IV. Authentication + Federation

### Login & Key Types

- Password + 2FA (TOTP)
- WebAuthn / Passkeys
- Wallet signature (EIP-4361, Solana, Cosmos)
- PGP challenge

### Federation Protocols (Future)

- KLP Identity Sync (`klp-id-sync`)
- SIOP/OpenID Connect
- DIDComm v2
- ZK Identity Proofs

---

## V. UI Integration

### Identity Switcher

- Switch between identities (user vs agent vs org) from top nav
- Show active role, persona, and trust level
- Icon indicators for auth type & federation status

### Access Preview Modal

- Show what a given role/agent can/cannot do
- Export role config for review
- Optional override request button (logs ticket to `Consent Ledger`)

---

## VI. Security and Governance

- Signed ScopeToken with JWT or Ed25519 (via KLP)
- All `identity_id -> scope_id` bindings are auditable
- Persona overlays require user confirmation if outside of automation profile
- Key rotation system via `identity.rotateKey()`

---

### Changelog

– 2025-06-21 • Initial spec for dynamic identity and scope resolution across kAI and kOS


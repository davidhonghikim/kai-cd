# 184: Permission Token System – Fine-Grained Access Control for Agents and Services

## Overview

The Permission Token System (PTS) enables a secure, cryptographically verifiable model for managing fine-grained access rights for all components in the kAI/kOS ecosystem. It governs what each agent, user, or service is allowed to do—down to specific function calls, time constraints, or contexts.

## Goals

- Prevent unauthorized actions
- Enable scoped delegation of authority
- Provide time-bound, revocable permissions
- Ensure auditability of access grants and usage

---

## Token Structure

Each permission token is a signed JSON Web Token (JWT) or binary token (CBOR, MsgPack) that includes:

```json
{
  "sub": "agent-429x",             // Subject receiving the permission
  "iss": "permission.kos",          // Issuer authority
  "aud": "registry.kos",            // Audience (what system should accept it)
  "scope": [                         // Explicit action or resource permissions
    "read:vector:index",
    "write:prompt:agent-429x",
    "execute:chat:service.megachat"
  ],
  "exp": 1727000000,                // Expiry timestamp (UTC epoch)
  "nbf": 1726000000,                // Not before time
  "iat": 1726000100,                // Issued at
  "delegable": true,                // Can this token be delegated by the agent?
  "sig": "base64(sig)"              // Signature
}
```

## Key Features

- **Delegable Permissions**: Allows a trusted agent to grant *part* of its scope to a child agent.
- **Time-Bound Access**: Every token has `iat`, `nbf`, `exp` fields to enforce time windows.
- **Contextual Use**: Tokens may include constraints like IP address, user ID, device fingerprint.
- **Minimal Authority**: Tokens are always scoped to the smallest necessary capability.

---

## Use Cases

| Role          | Example                                                | Token Scope                                     |
| ------------- | ------------------------------------------------------ | ----------------------------------------------- |
| Human User    | Grant UI permission to create a new service            | `write:service:*`                               |
| Orchestrator  | Allow Agent 102 to call chat function on MegaChat only | `execute:chat:service.megachat`                 |
| Prompt Agent  | Allow modification of its own prompt file              | `write:prompt:agent-###`                        |
| Builder Agent | Read/write to its assigned workspace only              | `read:fs:/agents/102/`, `write:fs:/agents/102/` |

---

## Storage

- Tokens are stored in encrypted `VaultStore` objects
- Active tokens can be cached in memory with TTL
- Revoked tokens are indexed in `revocation_registry` (e.g. Redis or PostgreSQL table)

---

## Validation

Token validation steps (via `PermissionGuard`):

1. Validate signature
2. Check time constraints (`exp`, `nbf`, `iat`)
3. Verify `aud` is correct for current service
4. Confirm `scope` includes requested action
5. Check revocation list

```python
PermissionGuard.verify(token, action="write:prompt:agent-102")
```

---

## Revocation

Tokens may be revoked:

- Automatically upon expiry
- By inserting token hash into a revocation registry
- Upon agent termination or task failure

---

## Delegation Mechanism

A parent agent may call:

```ts
issueScopedToken(childAgentId, scope, ttl)
```

This returns a new token with reduced or equal authority.

All delegation is logged in the audit chain:

```json
{
  "delegator": "agent-001",
  "delegatee": "agent-102",
  "scope": ["read:fs:/..."],
  "timestamp": 1726100010,
  "reason": "subtask #392"
}
```

---

## Implementation Plan

-

---

## Future Extensions

- Graph-based permission modeling
- Cross-chain signature compatibility (e.g. Ethereum signatures)
- UI drag-drop delegation builder
- Token wallet + ledger

---

## File Path

`/core/security/permissions/PermissionToken.ts` `/core/security/PermissionGuard.ts` `/cli/kai-token.ts` `/ui/registry/PermissionViewer.tsx`


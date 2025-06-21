# 24: kAI Agent Registry and Identity Management

This document defines the architecture, components, and protocols used by the kAI Agent Registry. It ensures secure, decentralized identity creation, agent discovery, authorization, and reputation tracking across the Kind OS (kOS) and Kind AI (kAI) ecosystem.

---

## I. Purpose

The Agent Registry provides a unified interface and database for all agents within the kOS ecosystem. Each agent—whether local, cloud-based, external, or embedded—has a cryptographically verifiable identity and metadata profile. The registry acts as a control surface for permissions, lifecycle, history, and interactions.

---

## II. Directory Structure

```text
src/
└── core/
    └── registry/
        ├── AgentRegistry.ts               # Core agent metadata store & lookup
        ├── IdentityManager.ts             # Cryptographic identity creation & resolution
        ├── AuthManager.ts                 # Permission scoping & role assignment
        ├── TrustScoreCalculator.ts        # Algorithm for computing agent reputation
        ├── schemas/
        │   ├── agent.yaml                 # Agent definition schema
        │   ├── identity.yaml              # Decentralized ID schema (DID)
        │   └── trust.yaml                 # Trust profile format
        └── registry_configs/
            ├── roles.yaml
            ├── scopes.yaml
            └── auth_policies.yaml
```

---

## III. Identity and Trust Model

### A. Agent Identity (DID-based)

- Each agent is assigned a **Decentralized Identifier (DID)** using the `did:key` or `did:pkh` method.
- Key types: `ed25519`, `secp256k1`, `x25519`
- Public keys stored in DID Document

### B. Metadata Profile

```yaml
id: did:key:z6Mk...abc
name: PromptFormatter
type: persona_transformer
created: 2025-06-20T10:33:00Z
owner: did:key:z6Mkh...xyz
capabilities:
  - transform.prompt
  - format.output
trust:
  score: 0.92
  endorsements:
    - by: did:key:z6Mk...owner
      sig: "..."
```

### C. Trust Score Components

- Signed endorsements (by other agents or humans)
- Consistency across outputs
- Responsiveness and uptime
- User reviews (verified via identity)
- Security scan results (sandbox behavior)

---

## IV. Registry Operations

### A. Registration

```ts
await registry.registerAgent({
  identity: DIDDocument,
  metadata: { name, capabilities, owner },
});
```

### B. Lookup

```ts
const agent = await registry.findAgentByDID("did:key:...");
```

### C. Verification

```ts
const isTrusted = await trust.verify(agentDID);
```

### D. Role Assignment

```yaml
roles:
  - name: formatter
    scopes:
      - transform:prompt
      - filter:output
```

### E. Policy Enforcement

```yaml
auth_policies:
  allow:
    - agent_type: prompt_transformer
      scope: transform.prompt
  deny:
    - agent_name: SuspiciousAgentX
```

---

## V. Use Cases

- **Agent Discovery:** Query agents with specific capabilities or trust thresholds
- **Trust-Based Scheduling:** Prioritize agents with higher reputation for critical tasks
- **Behavior Auditing:** Trace past actions and outputs for any agent
- **Decentralized Federation:** Synchronize registry data between kOS instances via gossip

---

## VI. Future Enhancements

| Feature                      | Target Version |
| ---------------------------- | -------------- |
| Inter-agent Endorsements     | v1.1           |
| Reputation Mining via Graph  | v1.2           |
| DIDComm Integration          | v1.3           |
| zkCred Reputation Proofs     | v2.0           |
| Cross-kOS Federation Support | v2.1           |

---

### Changelog

- 2025-06-20: Initial full architecture spec written for DID-based Agent Registry.


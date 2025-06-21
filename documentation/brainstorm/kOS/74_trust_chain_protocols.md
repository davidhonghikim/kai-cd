# 74: Trust Chain Protocols & Agent Validation

This document outlines the protocols, schemas, and systems used to establish trust, verify identities, and ensure secure agent interaction in the `kAI` / `kOS` ecosystem.

---

## I. Purpose & Philosophy

Trust in a modular, distributed AI ecosystem must be:

- **Verifiable**: Proven cryptographically or via protocol
- **Transparent**: Chain-of-trust auditable at any point
- **Flexible**: Adaptable to different authorities and sandboxing
- **Private**: Compliant with user-controlled disclosure

---

## II. Core Concepts

### 1. Agent Identity (`agent.id`)

Every agent must possess a globally unique ID that includes:

```ts
k:aid:domain:role:hash
// Example: k:aid:education:tutor:f83da92b
```

- `domain`: Domain specialization (e.g., finance, legal)
- `role`: Agent class (e.g., user.personal, system.core)
- `hash`: Public key hash or fingerprint

### 2. Public Key Infrastructure (PKI)

Each agent owns a public/private keypair.

- All communication must be signed.
- Fingerprints are used in `agent.id`.
- Trusted agents are stored in a local `trustring.json` file.

```json
{
  "k:aid:health:coach:abc123": {
    "public_key": "...",
    "trust_level": "linked.trust",
    "source": "qr-import",
    "verified": true
  }
}
```

### 3. Chain-of-Trust Protocol (CoT)

Each agent message must include a signed trust chain:

```json
{
  "agent": "k:aid:edu:planner:xy123",
  "signature": "...",
  "parent": "k:aid:orchestrator:kernel:ab99",
  "chain": [
    {
      "agent": "k:aid:orchestrator:kernel:ab99",
      "signature": "..."
    },
    {
      "agent": "k:aid:system:core:root000",
      "signature": "..."
    }
  ]
}
```

- Enables full traceability back to a trusted authority.
- Can be audited post-execution or streamed in real time.

### 4. Trust Scores & Behavior Tracking

Agents accrue a reputation profile over time:

- **Behavioral Audits**: How often do they fail tasks?
- **Peer Reports**: Do other agents report inconsistencies?
- **User Feedback**: Manual scoring or review

Trust score is calculated as a weighted composite and can trigger quarantine, demotion, or privilege changes.

---

## III. Trust Authority Modes

| Mode         | Description                                 |
| ------------ | ------------------------------------------- |
| `local`      | Only local trustring.json is consulted      |
| `federated`  | Uses signed trust maps from linked agents   |
| `blockchain` | Anchored chain on decentralized ledger      |
| `hybrid`     | Local + federated fallback w/ quorum voting |

System core agents may enforce trust mode policy globally.

---

## IV. Attestation Protocol

Agents may request a **Trust Attestation Token (TAT)**:

```json
{
  "attestation": {
    "agent_id": "k:aid:devops:deploy:x87",
    "generated": "2025-06-20T13:00:00Z",
    "valid_until": "2025-06-21T13:00:00Z",
    "signed_by": "k:aid:root:kernel:0001",
    "signature": "..."
  }
}
```

Tokens can be:

- Stored in `~/.kai/attestations/`
- Attached to service calls
- Verified by external trust validators

---

## V. Tamper Detection

All trust chains and tokens must:

- Include a `nonce` and timestamp
- Be signed with ECDSA or equivalent curve
- Be stored with integrity hash

Core agents must run background integrity checks. Failed checks are reported to the system log and quarantined.

---

## VI. Trust Verification API

### Endpoint: `POST /api/trust/verify`

```json
{
  "agent_id": "k:aid:planner:goal:z9",
  "chain": [...],
  "token": {...}
}
```

Response:

```json
{
  "verified": true,
  "trust_level": "linked.trust",
  "reputation_score": 89,
  "warnings": []
}
```

---

## VII. CLI Tooling

- `kai-trust verify <agent_id>`
- `kai-trust export <agent_id>`
- `kai-trust audit --all`
- `kai-trust import trustmap.json`

---

## VIII. Future

- Proof-of-Human Co-signer Mode
- Multi-Sig Trust Voting
- Embedded Trust via TPM or Secure Element
- Anonymous Delegation Chains for Privacy

---

### Changelog

– 2025-06-20 • Initial trust protocol schema and audit trail definitions


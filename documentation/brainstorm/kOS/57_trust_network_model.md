# 57: Trust Network Model – Decentralized Confidence Framework for kAI/kOS

This document defines the full technical model for the decentralized trust graph used across all agents, users, and services in the kAI/kOS ecosystem. The goal is to model, propagate, and evaluate trust and reputation across a permissioned-but-open agent mesh.

---

## I. Purpose

To enable:

- Agent-level trust scoring and weight propagation
- Federation of trust across nodes and subnets
- Transparent, inspectable trust path resolution
- Support for governance, moderation, and access control

---

## II. Core Concepts

### A. Trust Nodes
- All DIDs (agents, users, services, devices) are represented as nodes
- Each node has:
  - `trustScore: float` (0.0 to 1.0)
  - `decayRate: float` (default 0.01/day)
  - `reputationTags: string[]` (e.g. "reliable", "experimental", "malicious")

### B. Trust Edges
- Directed edges representing belief from A to B:

```ts
interface TrustEdge {
  from: DID;
  to: DID;
  weight: float; // e.g., 0.85
  reason: string;
  createdAt: timestamp;
  expiresAt?: timestamp;
  tags: string[];
  signatures: string[]; // array of signed attestations
}
```

- Signatures allow endorsement by third parties
- Optional multi-source aggregate edges

### C. Delegation Paths
- Chains of trust:
  - `A trusts B to delegate memory access`
  - `B trusts C to use that memory`

- Chains are validated using tag + scope + TTL matching

---

## III. Protocol Layer

- Sync messages defined in `KLPStateUpdate`
- Signature-verifiable `TrustEdge` export bundles
- DAG-merge strategy with edge conflict resolution
- Local replay cache to prevent spam or poisoning

### Trust Update Message:
```ts
interface TrustUpdateEnvelope {
  from: DID;
  to: DID;
  updates: TrustEdge[];
  signature: string;
  timestamp: string;
}
```

### Conflict Resolution:
- Highest-weight signed edge wins
- More recent timestamp preferred
- Expired edges pruned

---

## IV. Trust Scoring Engine

- Periodic recomputation of trust scores
- Localized PageRank-like propagation
- Custom weighting based on:
  - Explicit tags
  - Capability class
  - Scope-specific confidence factors

### Computation:

```ts
function computeTrustScore(did: DID): float {
  // Weighted sum of inbound edges * decay
  let sum = 0;
  for (edge of inboundEdges(did)) {
    const age = now() - edge.createdAt;
    const decay = exp(-edge.decayRate * age);
    sum += edge.weight * decay;
  }
  return clamp(sum / normalizationFactor, 0, 1);
}
```

---

## V. Local & Federated Modes

### Local
- Trust graphs reside on disk or embedded DB (e.g., sqlite, leveldb)
- Used for:
  - Runtime agent auth
  - UI filtering / display ranking
  - Workflow access scoping

### Federated
- Trust bundles periodically gossiped
- Signed bundle manifests
- Optional upload to hub (e.g., `trust.kos.local`)
- `TrustBundle.ts`:

```ts
interface TrustBundle {
  source: DID;
  edges: TrustEdge[];
  lastUpdated: timestamp;
  signature: string;
}
```

---

## VI. Audit & Moderation

- Signed audit logs stored in `/data/trust_log/`
- Moderation tooling supports:
  - Edge revocation
  - Edge justification threads
  - Identity banlists
  - Trust burn tokens

### Tools:
- CLI: `kai-trust inspect`, `kai-trust ban`, `kai-trust reweight`
- UI: Trust graph explorer + moderation dashboard

---

## VII. Integration Points

| Component         | Trust Usage                         |
|------------------|-------------------------------------|
| kAI Agents        | Trust-weighted service selection     |
| Memory Layer      | Write access based on trust threshold|
| Workflows         | Delegation requires trust chain      |
| Prompt Manager    | Prompt authority per-trust level     |
| Vector DB         | Access tags gated by trust           |
| Security Vault    | Secret exposure based on confidence  |

---

## VIII. Roadmap

| Feature                         | Version |
|---------------------------------|---------|
| Edge expiration                 | v1.0    |
| Tag-weighted propagation        | v1.1    |
| Visualization UI                | v1.2    |
| Signed revocation proof         | v1.4    |
| zkProofs for trust derivation   | v2.0    |


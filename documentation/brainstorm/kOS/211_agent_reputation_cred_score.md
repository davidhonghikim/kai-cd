# 211: Agent Reputation and CredScore

This document defines the specification, algorithms, trust assumptions, storage strategies, and interoperability of the kAI Agent Reputation System, codified under the `CredScore` protocol. This system is essential to any permissioned, collaborative, or decentralized function within kOS and kAI.

---

## Overview

Agents (human or artificial) accrue a decentralized reputation score called `CredScore`. This score governs:

- Access to elevated system privileges.
- Resource allocation (compute, data access, bandwidth).
- Participation in governance.
- Reputation-based routing (e.g. prefer high-cred agents in critical decisions).

`CredScore` combines:

- Action history (logs, task completions).
- Peer validation (manual and automated).
- Contextual trust weighting (based on task, domain, or zone).
- Stake-weighted and cryptographic proofs (optional).

---

## 1. Trust Scoring Architecture

### 1.1 Score Components

```text
CredScore = BaseScore + PeerTrust + TaskPerf + StakeBoost - Penalties
```

- **BaseScore**: Initial value (typically 1000), decays slowly without activity.
- **PeerTrust**: Endorsements, votes, and validations from trusted peers.
- **TaskPerf**: Weighted score from completed task logs (includes quality, timeliness, and impact).
- **StakeBoost**: Optional. Boosted by cryptographic staking (kOS tokens).
- **Penalties**: Malicious behavior, timeouts, rejections, and user blacklists.

### 1.2 Decay Functions

- All scores decay exponentially over time if not maintained.
- Scores are re-weighted per context (e.g. dev-agent scores vs. finance-agent scores).

---

## 2. Reputation Log Schema

All actions are logged to immutable signed logs:

```json
{
  "agent_id": "kai://node123/agent789",
  "action": "task_completed",
  "task_id": "kai://task/56fded...",
  "timestamp": 1720192011,
  "rating": 0.92,
  "validators": ["agent002", "agent051"],
  "proof": "ed25519:abcdef...",
  "context": "code_review"
}
```

Logs are periodically compacted and checkpointed to swarm or blockchain storage.

---

## 3. Peer Review Protocol

- **Endorsement**: Agents can endorse others for specific domains. These require:

  - Proof of task co-participation or resource sharing.
  - Optional digital signature from endorsing agent.

- **Challenge-Response Audits**:

  - Random audits of critical actions (e.g. code merge, system update).
  - Auditors must be from an unrelated agent cluster.
  - If response fails verification, penalties apply.

---

## 4. CredScore Storage & Resolution

### 4.1 Distributed Storage

- **Primary**: Agent's local kVault.
- **Consensus-Verified**: Pinned to kOS swarm, IPFS, or kBlock.
- **Compact Index**: Periodic snapshots used for fast lookup.

### 4.2 Resolution API

```http
GET /api/credscore/{agent_id}
```

Returns:

```json
{
  "agent_id": "kai://node123/agent789",
  "credscore": 1184,
  "history_hash": "b0x56e...",
  "last_updated": 1720911922
}
```

---

## 5. Use Cases

- **Governance**: Weighted voting power in community or swarm decisions.
- **Access Control**: Required credscore thresholds to manage services.
- **Reputation Routing**: Query chains prioritize high-rep agents.
- **Marketplace Trust**: Task bidding ranks sorted by reputation tiers.

---

## 6. Governance and Penalty Framework

- **Penalty Triggers**:

  - Proven malicious behavior.
  - Non-response to audit.
  - Misinformation or sabotage detection.

- **Review Board**:

  - Agents with highest CredScore form a rotating review quorum.
  - Quorum must cryptographically sign judgment decisions.

- **Appeals**:

  - Agents may submit cryptographically signed appeals.
  - Appealed judgments are logged with full transparency.

---

## 7. Privacy and Anonymity Options

- **Pseudonymous IDs**: Agents may operate under rotating pseudonyms.
- **ZK Proofs**: Optional integration with zk-SNARKs to verify actions without revealing specifics.
- **Selective Disclosure**: User defines visibility of their CredScore and history.

---

## 8. Interoperability

- **Export Format**:
  - All scores can be exported in signed JSON or CBOR for external agents.
- **Bridge Modules**:
  - Convert CredScore to other reputation systems (e.g. GitHub, Reddit karma, DAO scores).

---

## 9. Future Extensions

- **ML-Enhanced Trust Signals**: Train trust models based on behavioral logs.
- **Dynamic Trust Graphs**: Use real-time relationship topology to influence weight.
- **Game-Theoretic Resilience**: Add simulations to detect collusion or Sybil strategies.

---

**Next Document:** `212_Agent_Trust_Framework.md` – Defines trust contracts, assertion schemas, and reputation-linked permissions.


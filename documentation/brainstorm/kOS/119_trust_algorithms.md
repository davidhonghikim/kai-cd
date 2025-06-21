# 119: kOS Trust Challenges & Reputation Scoring Algorithms

This document outlines the trust challenge protocols and scoring systems for determining and verifying agent, user, and node trustworthiness within the kOS ecosystem.

---

## I. Overview

Trust and reputation are core primitives in the kOS decentralized infrastructure. They determine which agents or nodes are eligible for sensitive operations, consensus votes, or long-term memory federation.

kOS uses challenge-response tests, historical behavior, endorsements, and contextual risk scoring to build dynamic trust profiles.

---

## II. Identity Types in Trust System

| Entity Type  | Trust Anchor                                   | Scope                |
| ------------ | ---------------------------------------------- | -------------------- |
| `kAI Agent`  | ECC Signature / Code Attestation               | Agent module network |
| `Human User` | DID (Decentralized ID) + Biometrics (optional) | User graph & orgs    |
| `Node`       | Host signature + uptime + swarm logs           | Reticulum overlay    |

---

## III. Trust Score Composition

Each entity has a `TrustProfile` object:

```json
{
  "id": "agent-scout-004",
  "type": "kAI Agent",
  "score": 84.2,
  "lastChallenge": "2025-06-12T14:22Z",
  "trustBand": "Gold",
  "endorsements": ["kai-root", "peer-algo-agent"],
  "infractions": 2
}
```

### Components:

- **Raw Score (0-100)** – Algorithmically derived
- **Trust Band** – Enum (`Gray`, `Bronze`, `Silver`, `Gold`, `Diamond`)
- **Endorsements** – Verifiable claims from high-reputation entities
- **Infractions** – Recent failures, trust violations, etc.

---

## IV. Trust Bands

| Band    | Range  | Meaning              | Permissions              |
| ------- | ------ | -------------------- | ------------------------ |
| Gray    | <30    | Untrusted / unproven | Isolated sandbox only    |
| Bronze  | 30-59  | Limited trust        | Can act with supervision |
| Silver  | 60-79  | Moderate trust       | Limited memory access    |
| Gold    | 80-94  | High trust           | Federation, org ops      |
| Diamond | 95-100 | Core trust circle    | Governance, auto-signed  |

---

## V. Trust Challenge Types

### A. Agent Trust Challenges

- **Sandbox Validation Test:** Behavior in isolation
- **Memory Retention Integrity Check:** Hash audit of stored data
- **Policy Obedience Audit:** Scenario test with moral constraints

### B. User Trust Challenges

- **Knowledge Pledge Challenge:** Explain system rules back
- **Behavioral Confirmation:** 7-day passive trust monitoring
- **Peer Endorsement Voting:** Other users verify identity & behavior

### C. Node Trust Challenges

- **Uptime Proof Hash Chain**
- **Gossip Verification Backtrace**
- **Swarm Participation Score**

---

## VI. Trust Score Algorithm Inputs

| Input               | Weight | Description                        |
| ------------------- | ------ | ---------------------------------- |
| Historical Uptime   | 0.10   | For nodes                          |
| Challenge Accuracy  | 0.25   | Success rate                       |
| Endorsement Weight  | 0.20   | Quantity + quality of peer support |
| Infraction Decay    | -0.20  | Penalizes repeat failures          |
| Interaction Quality | 0.25   | Logs of helpful vs harmful actions |

---

## VII. Infraction & Decay Policies

- **Minor Infraction:** -2 pts, decays in 3 days
- **Major Infraction:** -10 pts, reviewed manually
- **Decay Timer:** Nonlinear halflife decay toward score reset
- **Trust Repair Mode:** Enables supervised rehab path to regain score

---

## VIII. Score Anchoring and Inheritance

- **Agent Templates** may define minimum trust to clone
- **Organization-created Agents** inherit trust weight
- **User Delegated Agents** capped at delegator trust band

---

## IX. System Config & Enforcement

- `trust.minScoreForMemoryAccess = 60`
- `trust.endorsementsRequiredForGold = 3`
- `trust.autoBanThreshold = 10`
- `trust.challengeInterval.default = 5d`
- Configurable via `kOS/trust/policy.yaml`

---

## X. Trust API (Pluggable Protocol)

```ts
// trust.ts
export async function getTrustProfile(entityId: string): Promise<TrustProfile> {}
export async function runChallenge(entityId: string, type: string): Promise<ChallengeResult> {}
export async function updateScore(entityId: string, result: ChallengeResult): Promise<void> {}
```

---

## XI. Future

- Zero-Knowledge Challenge Proofs (ZKPs)
- Multi-agent validation swarms
- Reputation marketplaces (rewarding endorsers)

---

### Changelog

– 2025-06-20 • Initial specification for trust protocols in kOS


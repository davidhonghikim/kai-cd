# 139: Agent Societies & Social Graphs in Kind AI

This document defines the structures, protocols, and behavioral layers for organizing and managing agent collectives in Kind AI (kAI), along with their integration into broader social graphs in the Kind OS (kOS) ecosystem.

---

## I. Purpose & Scope

Agent societies allow:

- Specialized agent teams (e.g. research squad, media crew, security monitors)
- Grouped governance (voting, consensus, delegation)
- Inter-agent trust building
- Distributed swarm behaviors

Social graphs connect:

- Agents ↔ Humans
- Agents ↔ Agents
- Humans ↔ Organizations

---

## II. Agent Society Types

### 1. Static Societies

- Defined manually
- Fixed roles and membership
- Use cases: security agents, home systems, mission-specific clusters

### 2. Dynamic Swarms

- Created temporarily for a task
- Self-forming via tags, needs, expertise
- Disband after task completion

### 3. Federated Guilds

- Persistent agent networks
- Shared training, protocols, and knowledge
- Publish capabilities and accept tasks

---

## III. Social Graph Protocols (KSGP)

KSGP: Kind Social Graph Protocol

### Core Entities

- `human_id` (KID)
- `agent_id` (KID)
- `org_id` (KID)
- `relationship` object (trust, role, context, rating)

### Example:

```json
{
  "source": "agent:kai.research.003",
  "target": "human:alice.002",
  "relationship": {
    "type": "assistant",
    "trust_score": 0.92,
    "context": "project:neurograph"
  }
}
```

### Graph Storage

- Local Graph DB (e.g. Dgraph, Cayley)
- Federated Sync (kNet overlay)
- Signed Relationship Entries

---

## IV. Trust and Reputation

Each agent has:

- **Base trust score**
- **Task credibility vectors** (per domain)
- **Voting influence** in group decisions

### Influencers of Trust:

- Feedback loops (AFIL reports)
- Successful vs failed task logs
- Peer votes
- Owner endorsements

### Revocation

- Agents can be demoted, sandboxed, or banned based on:
  - Repeated errors
  - Malicious behavior
  - Governance decisions

---

## V. Group Collaboration Protocols

### Multi-Agent Dialogue

- Conversational turn-taking
- Role-tagged utterances
- Arbitration mechanisms

### Consensus Methods

- Weighted voting
- Reputation-based quorum
- Randomized rotation (anti-capture)

### Decision Logging

- All group decisions are logged to:
  - Local logs
  - Group Vault
  - Optional KLP broadcast

---

## VI. Governance Models

1. **Sovereign**: Human-led agent collectives
2. **Council**: Selected agent sub-group manages others
3. **Democratic**: Voting-based behavior triggers
4. **Autonomic**: Entirely self-managed by agents with fallbacks

---

## VII. Interfaces

### Agent HUD

- Shows group membership
- Recent consensus history
- Trust/role summaries

### Social Graph Visualizer

- Webview module for human users
- Graph traversal tools and filters

---

## VIII. Compatibility

- **KLP**: All entries signed & publishable via Kind Link Protocol
- **AP**: ActivityPub bridge for federated networks
- **Matrix**: Optional room sync for consensus snapshots

---

### Changelog

– 2025-06-22 • Initial structure for agent collectives and social systems


# 70: Agent Types & Classification System

This document defines the full taxonomy of agents in the Kind ecosystem, detailing core types, behavioral classes, modular capabilities, and interoperability requirements for constructing, identifying, and evolving agents in both `kAI` and `kOS` environments.

---

## I. Purpose

To standardize how agents are categorized, declared, deployed, and evolved across the ecosystem:

- Provide semantic clarity between types of agents
- Enable programmatic filtering, access control, and routing
- Encourage modular reuse and composability
- Support autonomy, safety, and chain-of-trust guarantees

---

## II. Primary Classification Tiers

Each agent must declare:

- **Agent Class** — Role in the system
- **Specialization** — Field or domain of expertise
- **Authority Type** — Trust level and permissions
- **Modular Capabilities** — Loadable behaviors

---

## III. Core Agent Classes

### 1. `system.core`

- Responsible for platform integrity
- Examples: SchedulerAgent, ConfigManager, KernelSupervisor

### 2. `user.personal`

- Dedicated to a specific user
- Private, memory-retentive, long-running
- Examples: DailyAssistant, GoalPlanner, SchedulerAgent

### 3. `network.linker`

- Broker between multiple agents
- Handles routing, delegation, interoperability
- Examples: TrustBridge, MeshRouter, ProxyExecutor

### 4. `domain.specialist`

- Expert in a narrow field
- Activated per-query or by scheduler
- Examples: FinancialAdvisor, LegalParser, WellnessCoach

### 5. `orchestrator`

- Coordinates other agents
- Maintains workflow state and dependencies
- Examples: CreativeStudioCoordinator, CareNetworkManager

### 6. `utility.service`

- Stateless or fast-spawning tasks
- Examples: Transcoder, Notifier, Cleaner, Indexer

---

## IV. Authority Types

| Authority Level | Description                               |
| --------------- | ----------------------------------------- |
| `root.kernel`   | Full system access                        |
| `trusted.user`  | Verified personal assistant               |
| `linked.trust`  | Federated agent with chain-of-trust proof |
| `restricted`    | Untrusted or sandboxed task agent         |
| `external`      | Third-party or open network agent         |

---

## V. Specializations (Domain Tags)

Each agent may declare 1 or more domain tags:

```ts
['finance', 'legal', 'medical', 'ai.devops', 'education', 'memory', 'mobility']
```

These determine searchability, routing, and UI rendering.

---

## VI. Modular Capabilities

Agents are composed of optional, hot-swappable modules:

| Module Name      | Description                                 |
| ---------------- | ------------------------------------------- |
| `MemoryCore`     | Long- and short-term semantic memory        |
| `SpeechIO`       | TTS + STT integration                       |
| `PersonaLayer`   | Emotion/personality modeling and tone       |
| `LangChainTools` | Tool abstraction for external APIs          |
| `SecurePrompt`   | Safe prompt template enforcement            |
| `PromptKindSync` | Agent-to-agent protocol manager             |
| `SchedulerUnit`  | Task and reminder tracking                  |
| `AgentShell`     | Terminal access via command wrapper         |
| `VisualMindMap`  | UI rendering of memory and intent graph     |
| `MicroOrch`      | Micro-task decomposition and agent spawning |

---

## VII. Agent Declaration Format

Agents must define themselves in a `agent.meta.json`:

```json
{
  "id": "agent-finance-007",
  "class": "domain.specialist",
  "specializations": ["finance"],
  "authority": "linked.trust",
  "modules": ["LangChainTools", "SecurePrompt", "MemoryCore"]
}
```

---

## VIII. Compatibility & Routing Rules

- `user.personal` agents may not invoke `external` without explicit user approval
- `system.core` may invoke any class, but only with logged audit trail
- Orchestrators must be able to deserialize all `agent.meta.json`
- `network.linker` agents must register in the TrustLinkGraph

---

## IX. Future Considerations

- Decentralized Agent Certification (DAC)
- Automatic Class Evolution (self-reflective growth)
- Simulated Swarm Behavior Agents
- Companion/Embodied Agent Markup Standards

---

### Changelog

– 2025-06-20 • Initial taxonomy draft by agent


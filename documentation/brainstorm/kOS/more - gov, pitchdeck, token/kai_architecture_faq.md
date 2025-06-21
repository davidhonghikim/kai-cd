# 🧠 Agent Stack Architecture FAQ — kAI

## What is the architecture of kAI?
kAI is built on a modular multi-agent framework with decentralized deployment in mind. Each agent is a self-contained service that can communicate with others through an orchestrator.

## How are agents structured?
- Each agent has its own:
  - Personality config
  - Memory store (local or remote)
  - Interface endpoints (chat, voice, terminal, etc.)
  - Trust protocol config

## What is the orchestrator?
The orchestrator is the central hub that manages:
- Message routing
- Context sharing
- Resource load balancing
- Plugin and API access
- Delegation and consensus among agents (voting, fallback, prioritization)

## What are the communication protocols?
kAI uses a combination of:
- WebSockets (agent-to-agent chat, real-time updates)
- gRPC/HTTP (plugin APIs and command routing)
- Optional LoRa mesh networking for air-gapped local clusters
- Custom DSL for agent instructions (planned)

## What is stored and where?
- Memory is stored per agent, using:
  - Vector DBs (Chroma, Weaviate, Qdrant)
  - Encrypted vaults (for sensitive data)
  - Structured metadata and logs
- Shared memory can be broadcasted through the orchestrator when permissions allow

## Can it scale across devices?
Yes. It supports:
- Local-first single device installs
- Multi-device sync via LAN
- Distributed cluster deployment with role-based agents

## What if I don’t want to run a full cluster?
You can run a minimal single-agent setup with optional cloud sync and plugins disabled. It’s fully customizable and resource-scalable.

## Can agents act on my behalf?
Yes. With user-approved scopes and audit logs, agents can:
- Send emails
- Schedule events
- Respond to queries
- Execute workflows and scripts

## Is it secure?
- All memory is encrypted by default
- Trust scopes are agent-isolated
- Logging is transparent and user-controllable
- No data leaves the device unless explicitly allowed

## Is this production-ready?
- Core framework is stable for prototyping
- Full production features in staged rollout (agent mesh, plugins, vault tools, orchestration dashboards)
- Extensive documentation and tests under way

---

> Want diagrams, specs, or dev API docs? Ask for the full Developer Docs or Orchestration Protocol Diagrams next.


# 26: Modular Agent Loaders and Dynamic Import System (kAI)

This document specifies the modular architecture for dynamically loading, activating, and unloading Kind AI (kAI) agents, including runtime constraints, context propagation, error isolation, and hot-reloading.

---

## I. Purpose

The Modular Agent Loader system enables on-demand, decoupled AI agents that can be added, upgraded, or replaced without restarting the core system. This supports pluggability, sandboxing, parallel agent operation, and dynamic memory injection.

---

## II. Directory Structure

```text
src/
└── agents/
    ├── core/
    │   ├── Loader.ts                      # Core agent loading/unloading logic
    │   ├── Registry.ts                    # Global registry of available agents
    │   └── AgentContextBridge.ts         # Propagates runtime context into agent scopes
    ├── dynamic/
    │   ├── index.ts                       # Entrypoint for dynamic imports
    │   └── remote/
    │       ├── AgentDownloader.ts         # Fetches remote agent packages securely
    │       └── Unpacker.ts                # Extracts and loads remote agents into memory
    └── sandbox/
        ├── IsolatedExecutor.ts           # Sandboxed function executor with timeout
        └── ErrorBoundaryAgentWrapper.ts  # Wraps agent logic with fault boundaries
```

---

## III. Agent Package Format (kAgentPack)

Each agent is packaged using the `kAgentPack` format:

```text
myagent.kagent/
├── manifest.yaml        # Required metadata (name, version, description, author, signature)
├── index.ts             # Entrypoint logic
├── config.yaml          # Runtime config (capabilities, memory use, auth requirements)
├── prompts/
│   └── persona.md       # Default persona prompt
└── modules/
    ├── tools.ts         # Tool declarations (e.g. search, calendar)
    └── skills.ts        # Skill logic definitions
```

### Example manifest.yaml
```yaml
name: "HomeAutomationAgent"
version: "1.0.3"
description: "Controls home devices via Matter and MQTT"
author: "kAI Team"
signature: "ed25519:..."
```

---

## IV. Agent Registry

All installed agents are listed in `agents/core/Registry.ts`, including:
- Metadata (name, version, location, capabilities)
- Auth scopes required
- Runtime isolation level
- Compatibility tags (kAI version, supported OS features)

At runtime, the Loader uses this registry to:
- Match available agents to a user request or skill
- Enforce sandboxing or shared context
- Load the agent into memory via dynamic import

---

## V. AgentContextBridge

This bridge passes context from the main application into the agent at runtime, including:
- User identity and preferences
- Current conversation context
- Active environment sensors (e.g. time, location, weather)
- Memory access (restricted)

Accessible as a singleton injected at load time:
```ts
agentContext.user.language  // 'en'
agentContext.conversation.lastPrompt
agentContext.env.time.local
```

---

## VI. IsolatedExecutor

This engine runs agent methods in a sandbox using the following protections:
- Timeout limit (default: 10s)
- Memory cap (optional, in MB)
- Restricted globals (no `eval`, no `fs` in browser)
- Error trace logging to audit system

Useful for community-submitted or experimental agents.

---

## VII. Remote Agent Support

Agents may be loaded at runtime from:
- A public kAI agent registry
- Private self-hosted registry
- Direct secure download URLs

### Steps:
1. `AgentDownloader.ts` fetches `.kagent` file
2. `Unpacker.ts` extracts it to `indexedDB` or secure temp FS
3. Validates `manifest.yaml` against signature
4. Registers it in the dynamic registry
5. Dynamically imports the entrypoint

---

## VIII. Agent Lifecycle Hooks

Agents can optionally export the following:
```ts
export function onLoad(context: AgentContext): void {}
export function onUnload(): void {}
export function onError(err: Error): void {}
```

Useful for logging, metrics, or cleanup routines.

---

## IX. Future Enhancements

| Feature                             | Target Version |
|-------------------------------------|----------------|
| Remote agent marketplace (registry) | v1.2           |
| Hot upgrade support                 | v1.3           |
| Cryptographic signing (kSig)        | v1.4           |
| Agent capability negotiation        | v1.5           |


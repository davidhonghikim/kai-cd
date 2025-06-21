# 25: AI Agent Framework and Capabilities (kAI)

This document defines the internal agent architecture, protocols, capabilities, directory layout, agent types, and decision-making mechanisms that power Kind AI (kAI). It outlines a blueprint-level structure intended for modularity, traceability, and multi-agent orchestration.

---

## I. Directory Structure

```text
src/
└── agents/
    ├── base/
    │   ├── AgentBase.ts                # Abstract base class
    │   ├── CapabilityBase.ts           # Capability interface
    │   ├── AgentExecutor.ts            # Task orchestration & lifecycle management
    │   └── AgentRegistry.ts            # Central registry of known agents
    ├── profiles/
    │   ├── assistant.config.yaml       # Assistant-type profile and rules
    │   ├── planner.config.yaml         # Planning-type profile
    │   └── researcher.config.yaml      # Specialized researcher profile
    ├── capabilities/
    │   ├── Plan.ts                     # Planning tasks
    │   ├── Execute.ts                  # Executing action sequences
    │   ├── Retrieve.ts                 # Vector-based memory and doc search
    │   ├── Evaluate.ts                 # Evaluate task success, content quality
    │   ├── Generate.ts                 # Generate text, code, images, media
    │   └── Route.ts                    # Route tasks to other agents or systems
    ├── memory/
    │   ├── StateManager.ts             # Local state storage per agent
    │   ├── AgentMemory.ts              # Integration with vector and temporal memory
    │   └── MemoryConfig.yaml           # Limits, TTLs, embeddings settings
    ├── protocols/
    │   ├── klp/
    │   │   ├── AgentProtocol.ts        # Core Kind Link Protocol for agent communication
    │   │   ├── MessageSchema.ts        # KLP message format
    │   │   └── Negotiation.ts          # Inter-agent capability negotiation
    │   └── local/
    │       ├── AgentLifecycle.ts       # Init, execution, teardown
    │       └── ContextInjection.ts     # Injects task data into new agent instances
    ├── runtime/
    │   ├── AgentRuntime.ts             # Master agent controller
    │   ├── WorkerPool.ts              # Thread/task runner for local agents
    │   └── AgentSandbox.ts             # Enforced sandboxing / nsjail
    └── utils/
        ├── scoring.ts                  # Heuristics and evaluation scores
        └── trace.ts                    # Logging, debugging, time tracking
```

---

## II. Agent Types

### A. Assistant
- Default UI-interactive agent
- Has access to memory, persona, and context stack
- Can invoke tools but not delegate to other agents

### B. Planner
- Specialized in decomposing goals into tasks
- Can spawn new agent threads and allocate subgoals

### C. Researcher
- Focused on fact gathering and evidence-based generation
- Prioritizes citations, quality evaluation, and source diversity

### D. Synthesizer
- Aggregates results from multiple agents into unified outputs
- Handles merging of contradictory content

### E. System Agents
- Used for meta-tasks like indexing memory, summarizing documents, detecting anomalies

---

## III. Capabilities

| Capability   | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| Plan         | Converts goals into structured task lists or agent flows                   |
| Execute      | Runs a series of tool invocations, API calls, or prompts                   |
| Retrieve     | Pulls from memory, vector DBs, RAG systems                                 |
| Evaluate     | Grades outputs, detects hallucinations, rates usefulness                   |
| Generate     | Text, code, visual, audio, mixed modal generation                          |
| Route        | Redirects input/output to other agents, subsystems, or external services   |

---

## IV. Execution Flow

### A. Task Intake
- Incoming tasks are received via the KLP `TaskRequest` schema
- Routed to the appropriate agent profile based on intent, context, and user preferences

### B. Planning
- Planner agent converts abstract goals into actionable plans
- Each step optionally assigned to a new or existing agent thread

### C. Execution
- Steps are processed in a lifecycle (`init > execute > post-process > teardown`)
- Logging, traces, error-handling handled per agent

### D. Memory & Feedback
- All input/output pairs logged to long-term vector and timeline memory
- Each agent annotates its own memory with success/failure/self-reflection

---

## V. Agent Instantiation & Configuration

### Agent Profile Example (YAML)
```yaml
id: assistant
name: Default Assistant
persona:
  tone: neutral
  role: explainer
  constraints:
    - avoid_harmful
    - be_precise
capabilities:
  - Generate
  - Retrieve
  - Evaluate
config:
  memory:
    use_memory: true
    context_window: 4096
  sandbox: true
```

---

## VI. KLP – Kind Link Protocol

### Message Example:
```json
{
  "type": "task_request",
  "agent_id": "planner",
  "content": {
    "goal": "Summarize recent files in my workspace",
    "deadline": "2025-06-25T12:00:00Z"
  },
  "metadata": {
    "priority": 2,
    "requires_confirmation": false
  }
}
```

### Supported Message Types:
- `task_request`, `task_status`, `capability_query`, `agent_heartbeat`, `result_transfer`

---

## VII. Security & Sandboxing

| Feature                  | Implementation                     |
|--------------------------|-------------------------------------|
| Sandboxing               | nsjail, resource limits             |
| Capability Scoping       | YAML-defined white/blacklists       |
| Memory Access Filtering  | Persona-bound memory domains        |
| Inter-Agent Isolation    | Thread isolation, signature checks  |
| Network Guardrails       | Localhost-only mode, firewall rules |

---

## VIII. Agent Debug & Tracing

### Trace Format
```json
{
  "agent_id": "planner",
  "timestamp": "2025-06-20T10:05:00Z",
  "input": "I want to build a garden planner",
  "plan": ["Identify required sensors", "Fetch weather data API", ...],
  "errors": [],
  "duration_ms": 412,
  "score": 0.92
}
```

### Logs
- Saved to `logs/agents/YYYY-MM-DD/agent_id.log`
- Can be streamed live from dev console or agent monitor

---

## IX. Future Expansions

| Feature                          | Target Release |
|----------------------------------|----------------|
| Self-updating profiles           | v1.2           |
| Learning-based evaluation agent  | v1.3           |
| Real-time collaboration protocol | v2.0           |
| Federated multi-node orchestration | v2.5         |


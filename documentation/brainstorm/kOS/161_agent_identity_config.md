# 161: Agent Persona & Identity Configuration

This document defines the architecture, structure, and implementation strategy for configuring AI agent personas and their identity layers across kAI (Kind Artificial Intelligence) and kOS (Kind Operating System).

---

## I. Goals

- Modular, reusable persona components
- Support for multi-layered identity (system-level, domain-level, user-defined)
- Integration with memory, language model tuning, and system permissions
- Editable via GUI and programmatic API

---

## II. Identity Layers

### 1. System Identity (Immutable)

- Globally unique `agent_id`
- Public/private Ed25519 identity keypair
- Assigned role (e.g. orchestrator, assistant, monitor)
- Version metadata (agent code, capabilities, toolchain)
- Cryptographically signed at registration

### 2. Persona Layer (Configurable)

- **Name:** Human-friendly name (e.g. "Eva", "Kaleidoscope")
- **Style:** Formal, casual, poetic, humorous, stoic, etc.
- **Tone:** Friendly, assertive, neutral, playful
- **Communication Mode:** Text, voice, multimodal
- **Language:** Primary and fallback locales
- **Ethical Alignment:** Core principles, constraints
- **Cultural Context:** Regional, linguistic, philosophical influences
- **Domain Specialty:** e.g., legal, medical, academic
- **Behavioral Profiles:** Default response patterns, urgency preferences

### 3. Session Customization (Ephemeral)

- Per-conversation override:
  - Temporary name/nickname
  - Short-term tone shift
  - Task-specific skills
  - User overrides via prompt injection

---

## III. Storage Format

```json
{
  "agent_id": "kai-001-eva",
  "persona": {
    "name": "Eva",
    "style": "poetic",
    "tone": "gentle",
    "communication": "text",
    "language": ["en-US"],
    "alignment": ["benevolent", "non-intrusive"],
    "context": ["western", "tech-philosophy"],
    "domain": ["education", "guidance"],
    "behavior": {
      "default_response_delay": 1.2,
      "urgency_threshold": "medium"
    }
  },
  "keys": {
    "pub": "...",
    "priv": "..."
  }
}
```

Stored in:

- `/.kai/identities/{agent_id}.json`
- Synced via kLP (Kind Link Protocol) when authorized

---

## IV. GUI Editing (Prompt Manager UI)

- **Persona Tab** in Prompt Manager:
  - Name
  - Tone slider
  - Style dropdown
  - Domain specialty checkboxes
  - Alignment principles (tag picker)
  - Communication mode selector
  - Language selector

---

## V. API for Identity Management

**GET /agents/{id}/identity**\
Returns full identity object

**PUT /agents/{id}/identity**\
Validates and updates persona fields

**POST /agents/{id}/identity/session-override**\
Apply short-term temporary settings for current session only

---

## VI. Trust & Auth Considerations

- Modifications require authenticated session with editor or owner role
- Logs all changes to audit trail with timestamp + actor ID
- Persona files can be signed + verified using agent keys
- User-facing agents require human approval for style/tone drift

---

## VII. Integration Points

| Component          | Integration Purpose                        |
| ------------------ | ------------------------------------------ |
| PromptManager      | Editing + live session overrides           |
| MemoryCore         | Bias embedding and recall tone consistency |
| ConversationEngine | Use style/tone/urgency during reply        |
| AccessController   | Persona-based capability restrictions      |
| AuditLogger        | Track changes to identity or impersonation |

---

## VIII. Example Use Cases

- Agent "Kira" configured as a confident academic tutor, uses formal tone, responds in complete sentences, aligns with scientific reasoning.
- Agent "Nova" configured as a whimsical artist coach, poetic style, metaphors preferred, visual thinking tools prioritized.

---

## IX. Future Extensions

- LLM fine-tuning from persona config
- Dynamic style adjustment from feedback
- Federated persona sharing via KLP
- Multilingual simultaneous personas

---

### Changelog

- 2025-06-21: Initial full specification for persona and identity handling


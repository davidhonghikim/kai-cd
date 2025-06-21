# 62: Companion Agents – Architecture, Behavior, and Deployment

This document provides a full system specification for Companion Agents within the kAI/kOS ecosystem. These agents serve as persistent, modular, and personalized AI entities that interface directly with users, other agents, and system-level functions.

---

## I. Purpose

Companion Agents (CAs) act as long-term personal AI interfaces for users, coordinating tasks, maintaining context, and supporting emotional/behavioral alignment. They may embody personalities, avatars, or functions (e.g. "Kai", "Mika", "RoshiBot").

---

## II. Directory Structure

```text
src/
├── agents/
│   ├── companion/
│   │   ├── index.ts                     # Agent launcher and coordinator
│   │   ├── manifest.json                # Identity and personality profile
│   │   ├── contextStore.ts              # Long-term memory and context API
│   │   ├── dialogueManager.ts           # Conversation state + response generation
│   │   ├── emotionModel.ts              # Sentiment + behavior shaping
│   │   ├── personaProfile.ts            # User-defined preferences and traits
│   │   ├── avatarRenderer.ts            # Optional 2D/3D UI rendering (WebGL)
│   │   └── plugin/
│   │       ├── coreSkills.ts            # Task completion primitives
│   │       ├── fetcher.ts               # Web, API, and file data retrieval
│   │       ├── calendar.ts              # Scheduling + integration hooks
│   │       ├── notifier.ts              # Alert + reminder system
│   │       └── userActions.ts           # Interface actions (clicks, hovers, etc)
```

---

## III. Manifest Format (manifest.json)

```json
{
  "id": "kai.mika",
  "name": "Mika",
  "type": "companion",
  "description": "Your cheerful creative assistant",
  "avatar": "https://cdn.kai/avatar/mika.glb",
  "personality": "playful",
  "skills": ["fetcher", "notifier", "calendar"],
  "defaultMemory": "episodic",
  "agentProtocols": ["klp/1.0", "rpc/agent", "http/webhook"]
}
```

---

## IV. Memory + Context Management

Companions use:

- **Episodic Memory**: Conversation logs, state transitions
- **Semantic Memory**: Vectorized embeddings (via Qdrant/Chroma)
- **Procedural Memory**: Saved workflows and triggers

```ts
interface CompanionMemory {
  storeEpisodic(event: MemoryEvent): void;
  querySemantic(embedding: number[]): MemoryMatch[];
  saveProcedure(taskId: string, steps: TaskStep[]): void;
}
```

---

## V. Persona + Emotion

```ts
interface PersonaProfile {
  name: string;
  traits: string[];            // e.g. ['optimistic', 'curious']
  preferredStyle: 'casual' | 'formal' | 'technical';
  toneModifiers: string[];     // e.g. ['emojis', 'metaphors']
  goals: string[];             // User's goals and dreams
}
```

Emotion shaping is driven by:

- Sentiment analysis of user input
- Event-based affect modifiers (stressors, wins)
- Feedback loop from dialogueManager

---

## VI. Integration + Protocols

Each CA can:

- Interface with external apps via KLP or REST
- Trigger notifications, workflows, or system services
- Participate in agentic collaboration

Key interfaces:

- `POST /api/agent/{id}/message`
- WebSocket: `ws://localhost:3000/companion`
- KLPEnvelope broadcast via KLP mesh

---

## VII. Companion UI

Optional UI modules:

- **Avatar renderer** (2D/3D): `avatarRenderer.ts`
- **Sidebar chat module** (React component)
- **Emotion ring**: Realtime expression overlay
- **Speech bubble HUD**: Transient responses

---

## VIII. Security + Safeguards

- **Personality hardening**: Signed persona manifest
- **User-controlled overrides** for tone, goal, behavior
- **Sandboxed plugin execution** using `nsjail` or WebAssembly
- **Audit trail of decisions** per session ID

---

## IX. Deployment

```bash
pnpm dev:companion      # Run standalone dev server
pnpm build:companion    # Build agent bundle
```

Can also be embedded into kAI or deployed standalone with kOS support.

---

## X. Future Additions

| Feature                                 | Version |
| --------------------------------------- | ------- |
| Voice output (TTS + emotion modulation) | v1.1    |
| Avatar lip sync                         | v1.2    |
| Multi-agent companion networks          | v1.3    |
| Distributed memory sync                 | v1.5    |


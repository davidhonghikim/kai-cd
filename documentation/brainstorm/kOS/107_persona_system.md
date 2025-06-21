# 107: Persona System Design & Personalization Layers

This document defines the architecture, storage strategy, schema, UI logic, and interaction behavior of the Persona system in `kAI` and `kOS`, including how personas are created, stored, recalled, adapted, and integrated across the full ecosystem.

---

## I. Overview

Personas are modular identity templates used by agents to simulate behavior, tone, knowledge context, and preferences aligned to a defined role or user profile.

Each persona includes:

- Metadata (name, tags, description)
- Personality traits & tone configuration
- Knowledge preferences / memory filters
- Prompt injection templates (system, user, safety)
- Optional voice and visual assets (avatar, TTS config)
- Permissions and domain scopes (optional)

---

## II. Use Cases

- Thematic agents: therapist, legal advisor, tutor, friend
- User-defined voice: polite, sarcastic, enthusiastic
- Adaptive bots: persona that evolves with memory
- Governance-linked: personas with permissioned access
- Marketing/branding: consistent tone across public-facing bots

---

## III. Data Schema: `persona.json`

```json
{
  "id": "persona-therapist-001",
  "name": "Empathic Listener",
  "description": "A warm, non-judgmental, Carl Rogers-style therapist persona.",
  "tags": ["therapy", "support", "empathy"],
  "tone": {
    "formality": "gentle",
    "humor": "light",
    "energy": "low",
    "assertiveness": "minimal"
  },
  "injections": {
    "system_prompt": "You are a calm and empathic therapeutic listener...",
    "user_prefix": "Client says:",
    "safety_prefix": "Avoid giving medical advice or crisis intervention."
  },
  "memory_filters": {
    "priority_tags": ["emotions", "behavior"],
    "exclude_tags": ["financial", "code"]
  },
  "voice": {
    "avatar_url": "/avatars/therapist.png",
    "tts_profile": "whisper-female-slow"
  },
  "permissions": {
    "domains": ["mental_health"],
    "level": "advisory"
  }
}
```

---

## IV. Persona Storage

### Local:

- Stored in: `/personas/*.json`
- Indexed by: `personas.index.json`
- Synced with: `IndexedDB` in `kAI`, `Qdrant`/`Chroma` in `kOS`

### Remote:

- Synced to `kOS` via secure API
- Indexed by UUID + hash for diff-sync
- Role-based access for governance-level personas

### Templates:

- Bundled as `.persona` package (zip of `persona.json`, avatar, audio clips)
- Shared via drag-and-drop or KindLink protocol

---

## V. Persona Lifecycle

1. **Create** – User selects "New Persona" → prompted via form or natural language generator
2. **Edit** – Modify traits, prompts, memory scope
3. **Test** – Run chat in sandbox with toggle persona injection
4. **Apply** – Bind to an agent instance (temporary or default)
5. **Share** – Export or upload via KindLink

---

## VI. Integration Points

- **Prompt Manager**: applies injections from persona before render
- **Memory Layer**: uses `memory_filters` to prioritize logs
- **Agent Engine**: loads persona into context per session
- **UI Theme Engine**: aligns color/avatar to persona
- **Voice Synth**: maps persona voice to TTS/voice clone config

---

## VII. Governance

- Personas may be signed by issuer for authenticity
- High-trust personas must be verified in `kOS`
- AI-generated personas must be labeled as synthetic
- Persona version history stored in `persona_audit.json`

---

## VIII. Future

- Persona blending: hybrid identities from multiple sources
- AI-generated personas from usage stats + user behavior
- Public Persona Registry with filters, ratings, ethics flags
- Real-time persona switching via hotkey or UI toggle

---

### Changelog

– 2025-06-21 • Initial full persona system spec

---

Next doc will be: **108: Memory System Architecture (Short/Long/Global)**


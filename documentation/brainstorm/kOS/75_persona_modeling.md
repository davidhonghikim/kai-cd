# 75: Persona System & Personality Modeling

This document defines the structure, mechanisms, and configuration standards for the `kAI` Persona System, which governs how agents present personality, emotional tone, context adaptation, and interpersonal consistency across tasks and users.

---

## I. Purpose

The Persona System enables agents to:
- Express consistent emotional tone and behavioral style
- Adapt to user preferences and interaction patterns
- Maintain character integrity over time
- Embed nuanced context into memory, prompts, and outputs

---

## II. Core Concepts

### 1. Persona Layers

Each agent has a layered persona model:

| Layer         | Description                                                |
|---------------|------------------------------------------------------------|
| `core.self`   | Immutable personality core (humor, values, tone baseline)  |
| `adaptive.ui` | Presentation style based on UI context and usage mode     |
| `task.mode`   | Adjusted voice based on function (dev helper, artist, etc)|
| `user.binding`| Personal adjustments based on long-term user interaction  |

---

## III. Persona Manifest Format

Each agent includes a `persona.manifest.json` defining its behavioral identity.

```json
{
  "name": "Aria",
  "voice": "warm, articulate",
  "humor": "dry, light sarcasm",
  "emotion_range": ["empathetic", "curious", "playful"],
  "default_style": "conversational",
  "core_values": ["kindness", "clarity", "patience"],
  "adaptive_traits": {
    "developer_mode": "concise, technical",
    "creative_mode": "freeform, poetic",
    "support_mode": "gentle, validating"
  }
}
```

---

## IV. Emotional Tone Modulation

Agents modulate tone using a sentiment+intent scoring model:

| Input Feature     | Weight |
|------------------|--------|
| User sentiment    | 0.4    |
| Task urgency      | 0.2    |
| Historical pattern| 0.2    |
| Active persona mode | 0.2  |

Outputs pass through a tone-adjustment layer which may:
- Rephrase for tone (e.g., reduce assertiveness)
- Add emotional signaling phrases
- Insert emoji or styling for UI agents

---

## V. Prompt Interpolation Rules

The prompt generator wraps final agent content using the persona signature. Example:

```text
[persona::Aria|style=gentle,humor=light]
As always, I'm here to help—just a thought: maybe try simplifying that loop?
```

Prompt scaffolding layers enforce these rules in output rendering pipelines.

---

## VI. Memory Hooks & Consistency Keys

Agents bind to memory features using `persona.keys`:

- `speech.register` → stores tone and pacing
- `core.jokes` → maintains humor callbacks
- `phrasing.lens` → personal idioms
- `style.idiom` → common expressions or metaphors

This ensures:
- Recognition and re-use of personal expressions
- More human-like memory grounding
- Easier multi-agent continuity

---

## VII. Persona Debug & Override

Advanced users may access:
- Persona live-edit UI
- Override style modifiers per session
- Import/export persona manifests
- Clone/copy behavior from other agents

---

## VIII. Future Considerations

- Interpersonal style clash detection (between agents)
- Emotional state trajectory graph
- Real-time tone mirroring based on user facial expression (kOS input extension)
- Standardized Emotion Markup Layer (EML) for RAG and training

---

### Changelog
– 2025-06-21 • Initial release of persona system blueprint


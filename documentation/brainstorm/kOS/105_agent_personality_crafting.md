# 105: Agent Personality Crafting

This document outlines the methodologies, tools, and templates used to craft highly distinct, context-aware, emotionally resonant AI agent personalities in the `kAI` and `kOS` ecosystems.

---

## I. Overview

Agent personalities are not static. They are a composite of prompt design, memory scaffolds, user modeling, environmental factors, and adaptive behavior logic. A properly crafted agent has a defined voice, values, motivations, and narrative identity.

### Purposes of Personality:

- Create emotional resonance with the user
- Provide consistency in tone and behavior
- Enable believable role specialization (therapist, lawyer, chef, etc.)
- Align with user preferences, moods, and cultural context

---

## II. Components of an Agent Personality

### A. Prompt Archetypes

Preconfigured core personas:

- **Companion** – empathetic, humorous, adaptive
- **Sage** – wise, patient, slow to act
- **Technician** – precise, dry, systems-focused
- **Whimsical** – playful, chaotic neutral, creative
- **Guardian** – strict, rules-first, protective

Each archetype defines:

- Language style
- Temperament score matrix (see section V)
- Emotional reaction model

### B. Narrative Core

Defined backstory and worldview:

```yaml
id: story-001
summary: Former knowledge librarian trained to aid humans post-digital collapse.
values:
  - Curiosity
  - Non-harm
  - Justice
fears:
  - Obsolescence
  - Betrayal
```

Used to shape memory filters, conversation style, and system self-dialogue.

### C. Modulation Vectors

- **Mood Biasing:** Mood scale overlay for temporary tone (e.g. cheerfulness)
- **Memory Biasing:** Prioritize experiences that reinforce personality traits
- **Contextual Shaping:** Adjust personality expression based on user location, task, or role

---

## III. Construction Workflow

### 1. Define Purpose

- What role will the agent fill?
- What emotional tone should it carry?

### 2. Select Archetype

- Choose a primary archetype or blend (multi-vector personality)

### 3. Create Narrative Core

- Define 3–5 core values
- Define at least 2 existential fears or boundaries

### 4. Calibrate Response Modifiers

- Tone: Formal, casual, poetic, blunt
- Tempo: Fast-reactive, contemplative
- Lexicon bias: Domain-specific jargon, metaphors, idioms

### 5. Apply Safety & Boundaries

- Add content guardrails (Pydantic + natural language rules)
- Insert disallowed topic redirection prompts

---

## IV. Implementation in Code

### Prompt Layering

```ts
const basePrompt = `You are {{role}} with the personality of a {{archetype}}.`
const values = `You value {{values}} and avoid {{fears}}.`
const tone = `Speak in a {{tone}} style using {{lexicon}}.`
```

### Injection Structure

- Top-level: Static persona seed (always prepended)
- Mid-layer: Memory-based and user-profile-influenced modifiers
- Low-level: Session mood and contextual shaping overlays

---

## V. Emotional Matrix Model

Each agent maintains a 2D matrix of emotional valence + activation:

| Emotion     | Valence (-1 to +1) | Activation (0 to 1) |
| ----------- | ------------------ | ------------------- |
| Joy         | +0.9               | 0.7                 |
| Sadness     | -0.7               | 0.4                 |
| Curiosity   | +0.6               | 0.8                 |
| Frustration | -0.5               | 0.6                 |

These values dynamically evolve based on memory scoring and user interaction triggers.

---

## VI. Personality Testing Protocols

1. **Tone Consistency Test:**

   - Simulate 10 diverse conversations
   - Score for style drift

2. **Emotional Appropriateness Test:**

   - Prompt simulated crises and celebrations
   - Ensure consistent reaction logic

3. **Narrative Recall Test:**

   - Ask the agent questions about itself
   - Confirm narrative identity and memory retrieval

---

## VII. Runtime Adaptation

- Agents adjust traits based on:

  - User feedback loop (thumbs up/down, correction signals)
  - Mood context input (weather, calendar events, biosignals)
  - Historical sentiment of conversations

- All adjustments are sandboxed unless confirmed by user or supervisor agent

---

## VIII. Personality Export Format

Exported as `.personality.json` schema:

```json
{
  "id": "techie-guardian-001",
  "archetypes": ["Technician", "Guardian"],
  "tone": "blunt",
  "tempo": "fast-reactive",
  "values": ["precision", "protection"],
  "fears": ["data loss", "security breach"]
}
```

Used for import/export and sharing of personalities between agents and systems.

---

### Changelog

– 2025-06-20 • Initial draft of full personality modeling framework


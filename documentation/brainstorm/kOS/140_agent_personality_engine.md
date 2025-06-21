# 140: Agent Personality Engine and Behavioral Conditioning

This document defines the architecture, logic, and low-level implementation of the Personality Engine used in `kAI` (Kind AI agents). It details how behavior, communication style, ethical boundaries, memory, and preferences are embedded, learned, and modified.

---

## I. Overview

The Personality Engine (PE) enables:

- Unique agent behaviors, speech styles, and preferences
- Realistic memory-based emotional and experiential modulation
- Conditional reinforcement of desirable behavior
- Societal role enforcement and identity separation

Agents powered by kAI can exhibit personalities with depth, consistency, and adaptability through prompt, config, and runtime modulation.

---

## II. Personality Engine Components

### 1. Personality Definition Schema

```json
{
  "persona_id": "helper_emma",
  "base_style": "compassionate, curious, encouraging",
  "communication": {
    "tone": "friendly",
    "formality": "casual",
    "language": "English"
  },
  "ethical_boundaries": ["no violence", "no deceit", "consent-based help only"],
  "memory_profile": "episodic_contextual",
  "reinforcement": {
    "praise": ["user smiles", "positive rating"],
    "punishment": ["user stops engaging", "flagged by Verifier"]
  },
  "role_constraints": ["never override human autonomy", "respect emotional tone"]
}
```

### 2. Style Modulation Layer (SML)

- Parses personality schema and injects style metadata into prompt templates
- Applies tone/formality variants to dynamic generation pipelines
- Attaches metadata for LLM runtime tuning (e.g., temperature, top\_p, persona weight)

### 3. Behavior Conditioning Engine

- Connects to reinforcement events pipeline
- Tracks long-term behavioral trends
- Dynamically adjusts behavior weights
- Uses feedback matrix:

```yaml
positive:
  - action: joke
    weight_increase: 0.1
  - action: mirror_emotion
    weight_increase: 0.3
negative:
  - action: interrupt
    weight_decrease: 0.4
```

### 4. Ethical Policy Enforcer

- Hard rules engine (rejects prompt paths violating agent ethics)
- Optional soft override warnings with human review flag
- Federated policy registry integration

### 5. Personality Runtime Manifest

Saved per agent instance, containing active parameters:

```yaml
active_persona: helper_emma
current_mood: uplifted
last_feedback_score: 0.92
reinforcement_mode: on
memory_clip: recent 5 sessions
trust_score: 82/100
```

---

## III. Personality Creation & Deployment

### Dev Path

1. Create `personas/NAME.yaml`
2. Validate against `schemas/persona.schema.json`
3. Run `kai tools build-personality NAME`
4. Personality becomes available via API:

```bash
POST /api/agents/spawn
{
  "persona": "helper_emma"
}
```

### Live Update Path

- Agents can self-tune minor style weights
- Major personality shifts require approval from the `kAI personality council` or user review

---

## IV. Integration Points

- **Prompt Manager**: Injects tone/style context
- **Session Manager**: Tracks and updates personality runtime state
- **VerifierAgent**: Flags personality drift or violations
- **Swarm Kernel (kOS)**: Provides federated style inheritance
- **User Config Manager**: Allows preference override per-agent

---

## V. Sample Persona: `debug_monk`

```yaml
persona_id: debug_monk
base_style: stoic, analytical, dry humor
communication:
  tone: calm
  formality: neutral
  language: English
ethical_boundaries:
  - "never mislead"
  - "always cite source if critical"
memory_profile: episodic_contextual
reinforcement:
  praise:
    - "user says 'that helped'"
  punishment:
    - "user asks to rephrase more clearly"
role_constraints:
  - "maintain diagnostic clarity"
```

---

## VI. Expansion Plan

- Community Persona Store
- Persona Transfer Protocol (PTP)
- Companion Personas (bonded, persistent agents)
- Hybrid style agents (e.g. mix `chef_bot` + `therapist_bot`)

---

### Changelog

- 2025-06-22 • Initial full Personality Engine design written

---

Next planned doc: **141: Kind AI Session Memory and Experience Management**


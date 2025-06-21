# 110: Persona Definition and Semantic Layering System

This document defines the architecture, configuration schema, logic rules, and data formats for creating, managing, and deploying personas and semantic layers in the kAI ecosystem. These structures are core to contextual, behavior-aligned interactions and enable personalized, multirole agent responses.

---

## I. Purpose and Goals

- Allow users and developers to define rich, modular personas
- Enable real-time persona switching and composable personality overlays
- Provide an interoperable format to share personas and behavior packs
- Facilitate coherent memory, tone, and language style adaptation across agents

---

## II. Key Concepts

### A. Persona

A distinct character profile that includes tone, goals, vocabulary style, capabilities, and behavior constraints.

### B. Overlay Layer

Modifiers that alter or influence an existing persona (e.g. "sarcastic overlay" on a helpful assistant).

### C. Persona Pack

A bundled archive of a primary persona + any overlay layers + prompts + intent maps + style sheets.

### D. Semantic Layering

The application of contextual modifications based on scenario (e.g., support mode vs research mode).

---

## III. Directory Structure (Sample)

```text
/personas/
  core/
    kind_default/
      persona.yaml
      style.md
      overlays/
        friendly/
          overlay.yaml
        academic/
          overlay.yaml
      memory_profile.json
      prompt_templates/
        base.txt
        support.txt
        research.txt

  user/
    stone_monk/
      persona.yaml
      overlays/
        zen/
        wildgenius/
      prompt_templates/
```

---

## IV. `persona.yaml` Format

```yaml
id: kind_default
name: "Kind Default Agent"
description: "Baseline general-purpose assistant persona for kAI"
version: 1.0
tone: warm
voice_style: conversational
capabilities:
  - chat
  - planning
  - education
  - emotional_support
behavior:
  avoids:
    - sarcasm
    - profanity
  favors:
    - curiosity
    - encouragement
  language:
    formal: false
    technical: adaptive
    use_emoji: true
memory_profile: ./memory_profile.json
prompt_template: ./prompt_templates/base.txt
```

---

## V. `overlay.yaml` Format

```yaml
id: overlay_friendly
name: "Friendly Boost"
modifies:
  tone: friendly
  voice_style: enthusiastic
  behavior:
    favors:
      - humor
      - validation
    avoids:
      - negativity
  prompt_injection: |
    You are exceptionally friendly and always greet the user by name.
```

---

## VI. `memory_profile.json`

Defines long-term memory schema preferences:

```json
{
  "retention_scope": "user-session-global",
  "persistence": true,
  "recall_bias": ["goal", "emotion", "preference"],
  "update_frequency": "adaptive"
}
```

---

## VII. Prompt Templates

Templates support full templating syntax:

```text
{{persona_name}} ({{tone}}):
Hello {{user_name}}, how can I assist you with {{intent}}?
{{#if overlay}}

(Style: {{overlay.voice_style}})
{{/if}}
```

---

## VIII. Runtime Configuration Merge

At runtime, the system performs layered persona resolution:

1. **Base Persona** loaded
2. **Active Overlays** merged (last wins for conflict)
3. **Mode Context** (e.g., "debug") injected
4. **User Preferences** applied (e.g., style, voice)
5. **Prompt template** rendered

---

## IX. Persona Management UI Features

- Persona selector dropdown (filter by role, tone, capability)
- Visual overlay manager with toggle switches
- Export/import as `.personaPack.zip`
- Live preview rendering prompt output
- Conflict checker for merged personas

---

## X. Future Expansion

- LLM-optimized persona generation from chat history
- Community persona store with review system
- Multi-persona negotiation framework
- Agent-specific persona specialization

---

### Changelog

- 2025-06-20 • Initial implementation with overlay support and memory profile integration


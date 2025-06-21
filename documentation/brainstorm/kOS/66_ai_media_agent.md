# 66: AI Media Agent Specification – kindAI Media

This document defines the architecture, roles, and system interactions of the `kindAI Media` agent — a dedicated generative media and content creation agent in the `kAI/kOS` ecosystem. It enables multimodal creativity, automated production pipelines, and deep integration with other agents, workflows, and personal assistant features.

---

## I. Purpose

The kindAI Media agent provides a full creative suite of generative tools:

- AI-assisted media generation (images, audio, video, 3D, animation)
- Real-time, prompt-driven composition
- Multi-agent collaboration with writers, narrators, editors, and designers
- Project asset management
- Rendering pipelines with preview and publish hooks

---

## II. Core Capabilities

| Capability                         | Description |
| --------------------------------- | ----------- |
| Image Generation                  | Uses Stable Diffusion / ComfyUI with style control and prompt mixins |
| Audio Generation                  | Text-to-speech, music generation, audio effects, remix pipelines |
| Video Synthesis                   | Prompt-to-video (Gen2), storyboard-to-video, upscaling, slow-mo |
| Scripted Composition              | Prompt + script + timeline JSON to renderable video or animation |
| Avatar & Voice Puppetry           | Lip-sync avatars, speech animation using Tortoise / Wav2Lip |
| Project Management                | Save, version, and tag assets in named folders with metadata |
| Collaboration                     | Listen/respond to other agents via workflows or task delegation |
| Publication & Export              | Render outputs to file, export to blog, social media, or kOS hub |

---

## III. Agent Directory Structure

```text
agents/
├─ media/
│   ├─ __init__.py
│   ├─ agent_config.yaml
│   ├─ prompts/
│   │   ├─ creative_prompt_mixins.md
│   │   └─ storytelling_styles.md
│   ├─ pipelines/
│   │   ├─ image_pipeline.py
│   │   ├─ video_pipeline.py
│   │   ├─ tts_pipeline.py
│   │   ├─ puppet_pipeline.py
│   │   └─ music_pipeline.py
│   ├─ studio/
│   │   ├─ timeline_editor.py
│   │   ├─ asset_browser.py
│   │   └─ publish_tools.py
│   └─ workflows/
│       ├─ create_trailer.workflow.json
│       └─ ai_music_collab.workflow.yaml
```

---

## IV. Prompt Templates

### A. Creative Prompt Mixins
- Style: vaporwave, anime, cyberpunk, ukiyo-e
- Mood: mysterious, upbeat, tragic, surreal
- Camera: wide shot, isometric, macro
- Modifiers: volumetric light, 32k render, cinematic bloom

### B. Scripted Media Prompts

```json
{
  "scene": "cyberpunk skyline at night",
  "audio": "ambient music, slow tempo",
  "timeline": [
    {"start": 0, "duration": 5, "effect": "zoom in"},
    {"start": 5, "duration": 3, "transition": "fade to black"}
  ]
}
```

---

## V. Integrations

| System | Role |
|--------|------|
| Ollama / LM Studio | Local captioning, prompts, scripts |
| ComfyUI / A1111 | Image & animation rendering |
| Tortoise / Bark | Voice synthesis |
| MusicGen / Riffusion | Instrumental music creation |
| ffmpeg | Rendering, timeline editing, media encoding |
| Chroma / Qdrant | Vector tagging of assets for recall/search |
| PromptKind | Prompt logging, style presets, agent memory context |
| Vault | Secure storage of API keys, creative assets |

---

## VI. Security & Ethics

- Content watermarking toggle
- Logging for all generated assets (for traceability)
- Usage restrictions tagging (e.g. NSFW, copyright)
- Auto-blacklist unsafe or misleading prompt content

---

## VII. Future Extensions

- Interactive 3D asset generation (OpenBrush, Three.js integration)
- VR/AR scene export support (WebXR + Babylon.js)
- Real-time collaborative media rooms with avatar agents
- Multi-lingual dubbing & subtitle generation

---

## VIII. Example Use Cases

- Daily video podcast agent: composes intro/outro, voiceover, renders media
- AI music artist: generates mood-based loops for ambient playlists
- AI storyteller: renders stylized animations from children's stories
- Campaign creative team: multiple agents generate ad visuals, scripts, and audio

---

## IX. Project Configuration

`agent_config.yaml`:

```yaml
id: media
name: kindAI Media
role: Generative Media Agent
pipelines:
  image: enabled
  video: enabled
  audio: enabled
  puppet: enabled
  music: enabled
permissions:
  - use:comfyui
  - use:tts
  - access:vault:creative_assets
  - link:agent:storyteller
```

---

## X. Summary

kindAI Media is the multimedia imagination engine of the kAI/kOS system, allowing creators, users, and AI agents to collaborate in high-fidelity generative storytelling, design, and expression. It unifies media pipelines, prompt coordination, and intelligent tooling into a coherent, scriptable assistant-grade component.


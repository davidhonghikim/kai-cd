# 228: Multimodal Asset Manager

## Overview

The **Multimodal Asset Manager (MAM)** is a centralized service within the kOS/kAI ecosystem responsible for ingesting, tagging, managing, transforming, and serving multimedia assets. It handles structured and unstructured data like images, videos, audio clips, documents, and other media artifacts generated or used by kAI agents and users.

MAM integrates deeply with UI theming, the prompt manager, agent memory, document servers, the artifact store, and vector DBs to provide rich search, filtering, and generative remix capabilities.

---

## Features

- 📥 **Ingestion Pipelines** (manual, drag-and-drop, webhook, agent-capture, clipboard scraping)
- 🧠 **Auto-Tagging** (AI classification, captioning, transcription)
- 🔎 **Search & Filter** (tags, embeddings, time, usage context, format)
- 📁 **Hierarchical Storage** (by user, agent, project, workspace)
- 🔁 **Media Transformations** (resize, format convert, upscale, style transfer)
- 🎨 **UI Integration Hooks** (render preview, theme background source, prompt composition)
- 🔌 **API Access & Agent SDK** (standardized plugin contract for read/write access)
- 💬 **Multimodal Prompt Routing** (link to prompt manager, context composer, memory)

---

## Directory Structure

```
kOS/
└── core/
    └── asset_manager/
        ├── config/
        │   ├── storage.yaml
        │   ├── media_types.yaml
        │   └── ingestion_rules.yaml
        ├── ingestion/
        │   ├── pipelines/
        │   │   ├── webhook_ingest.py
        │   │   ├── clipboard_watcher.py
        │   │   └── agent_capture.py
        │   └── scheduler.py
        ├── tagging/
        │   ├── ai_captioner.py
        │   ├── whisper_transcriber.py
        │   └── clip_embedder.py
        ├── api/
        │   ├── routes.py
        │   └── auth_middleware.py
        ├── transformers/
        │   ├── image_resize.py
        │   ├── format_converter.py
        │   └── upscaler.py
        ├── ui/
        │   └── preview_hooks.js
        ├── indexer/
        │   ├── vector_store_writer.py
        │   └── index_manifest.json
        └── __init__.py
```

---

## Key Configurations

### `storage.yaml`

```yaml
root_path: /mnt/kos/media
hierarchy:
  - user_id
  - agent_id
  - project
  - media_type
storage_tiers:
  hot: /mnt/kos/media/hot
  archive: /mnt/kos/media/archive
  ephemeral: /mnt/kos/media/tmp
```

### `media_types.yaml`

```yaml
image:
  extensions: ["jpg", "jpeg", "png", "webp"]
  transformable: true
  preview: true

video:
  extensions: ["mp4", "webm", "mov"]
  transformable: false
  preview: true

audio:
  extensions: ["mp3", "wav", "ogg"]
  transformable: false
  preview: true

document:
  extensions: ["pdf", "docx", "txt"]
  transformable: true
  preview: false
```

---

## API Routes

- `POST /media/upload` – Upload a new media file
- `GET /media/{id}` – Fetch metadata or preview
- `GET /media/search?q=` – Search by tags or embedding
- `DELETE /media/{id}` – Delete a file
- `POST /media/transform` – Resize, convert format, or upscale

---

## Agent SDK Usage

```python
from kai.sdk.assets import upload_asset, search_assets

img_id = upload_asset("dog.png", tags=["pet", "animal"])

results = search_assets(query="animal in grass", top_k=3)
```

---

## Future Extensions

- 🎭 Real-time media remix by multimodal agents
- 🧩 Support for 3D formats (GLB, USDZ)
- 🖼️ Wallpaper + texture generation system-wide
- 🤖 Multimodal grounding for prompt enhancement
- 🧬 Agent fingerprint-based asset attribution


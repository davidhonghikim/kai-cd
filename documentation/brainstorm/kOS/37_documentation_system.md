# 37: Documentation System – Live, Embedded, and Contributor-Aware

This document outlines the integrated documentation system powering both the development and usage of the kAI and kOS platforms. The documentation system is designed to:

- Be embedded into the runtime itself.
- Be fully version-aware, context-sensitive, and agent-readable.
- Serve developer, user, admin, and AI agent audiences alike.

---

## I. Goals

- **Self-documenting system:** All services, APIs, agents, configs, and protocols include embedded documentation.
- **Dual-Mode Output:** Exportable as standalone Markdown, served in-app via React-based renderer.
- **Editable from GUI:** Inline editing interface for contributors and admins.
- **AI-Readable Metadata:** All docs emit structured metadata (JSON-LD / RDFa / schema.org / custom KLP-Doc).

---

## II. Directory Structure

```text
src/
└── documentation/
    ├── index.ts                     # Runtime doc registry + lookups
    ├── definitions/                 # Markdown + schema per service/module
    │   ├── agents/                  # Each agent has its own doc
    │   ├── protocols/               # Protocol docs
    │   ├── services/                # System and plugin service docs
    │   └── guides/                  # User and contributor guides
    ├── viewer/                      # In-app React viewer
    │   ├── DocExplorer.tsx
    │   ├── DocSidebar.tsx
    │   └── DocSearch.tsx
    └── editor/                      # Inline documentation editor
        ├── DocEditor.tsx
        ├── DocUploader.tsx
        └── MarkdownPreview.tsx
```

---

## III. File Format and Metadata

Each doc must:

- Begin with YAML frontmatter block (for search, filter, tagging)
- Be Markdown-compliant
- Include version number, authorship, and scope

### Example:

```markdown
---
id: agent_translate
title: Translate Agent
version: 1.0.3
scope: agent
status: stable
lastUpdated: 2025-06-21
tags: [agent, language, translation]
authors: [kind-dev-team]
---

# Translate Agent

This agent accepts language pairs and input text and returns translated output.
```

---

## IV. Context-Sensitive Display

Docs are pulled dynamically into UIs based on:

- **Route:** `/docs/agent/xyz` shows only agent-level docs.
- **Role:** Admins see service internals, users see safe usage.
- **Agent Prompts:** Agents fetch docs programmatically using `getDocumentation({ target, scope })`.
- **Search Engine:** Full-text + structured search with TanStack + metadata indexing.

---

## V. Live Editing & Contributions

- **Inline Editor:** Available in the app when authenticated as maintainer or agent operator.
- **Version-Aware:** Each save creates a new semantic version.
- **Auto PR Generator:** Optionally opens GitHub PR with doc changes.
- **Review Tools:** Diff viewer + comment threads per doc section.

---

## VI. AI & Agent Access

Docs must:

- Be queryable from any agent with `documentation.read` capability.
- Be answerable in natural language (via embedded RAG chain)
- Include semantic embedding index (Qdrant namespace `docs`)

---

## VII. API Reference Format

API specs are stored in OpenAPI 3.1 format in:

```text
src/documentation/definitions/apis/
```

And linked to interactive playgrounds in-app.

- Uses Redocly for advanced rendering.
- API versions aligned with software releases.

---

## VIII. Export & Synchronization

- `npm run export-docs` dumps all docs to `docs_export/` as Markdown.
- `POST /api/docs/upload` accepts `.md` uploads for new additions.
- GitHub Sync available via `sync_docs.sh` script.

---

## IX. Planned Enhancements

| Feature                         | Status         | Target |
| ------------------------------- | -------------- | ------ |
| Real-time collaborative editing | 🟦 In Progress | v1.1   |
| Semantic doc suggestions        | ⬜ Not Started  | v1.2   |
| Auto-generated flow diagrams    | ⬜ Not Started  | v1.2   |
| Plugin authoring guidebook      | 🟦 In Progress | v1.1   |
| Doc-to-agent intent compiler    | ⬜ Not Started  | v2.0   |

---

## X. Final Notes

The documentation system is not an afterthought — it is a live part of the system fabric. It teaches the humans, trains the agents, and enables onboarding at every layer. Every service, plugin, protocol, and agent should be treated as incomplete without a doc.


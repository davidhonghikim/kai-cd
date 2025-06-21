# 91: Prompt Manager Architecture

This document outlines the architecture, features, and implementation details for the Prompt Manager module within the `kAI` and `kOS` ecosystem. This module provides secure, auditable, and flexible handling of prompts used across agents, users, workflows, and apps.

---

## I. Purpose

The Prompt Manager:

- Stores and categorizes prompt templates and snippets
- Supports multiple formats (text, JSON, Markdown, HTML, DSL)
- Allows context-aware prompt injection
- Logs usage history for audits and tuning
- Supports role-based prompt visibility and editing

---

## II. Directory Structure

```text
/kind/
├── core/
│   ├── prompts/
│   │   ├── index.ts            # Entry point for prompt manager service
│   │   ├── registry.ts         # Central registry of all prompt templates
│   │   ├── stores.ts           # Reactive state and local cache store
│   │   ├── injectors/
│   │   │   ├── context.ts      # Inject memory, metadata, system state
│   │   │   ├── trace.ts        # Inject prior trace history or outputs
│   │   └── formats/
│   │       ├── json.ts         # JSON structured prompts
│   │       ├── markdown.ts     # Markdown-based input rendering
│   │       ├── plain.ts        # Raw plain text
│   │       └── promptdsl.ts    # Internal DSL
```

---

## III. Storage and Access Layers

### A. Local Storage (kAI)

- IndexedDB + localStorage snapshot
- Encrypted using WebCrypto

### B. Remote Storage (kOS)

- PostgreSQL (prompt templates)
- Redis (recent usage)
- Qdrant (prompt embeddings)

---

## IV. Prompt Template Schema

```json
{
  "id": "agent-onboarding",
  "name": "Agent Onboarding Flow",
  "description": "Prompt to configure and initialize new agent persona",
  "tags": ["agent", "setup"],
  "format": "markdown",
  "content": "You are a {{role}} named {{agent_name}}...",
  "vars": ["role", "agent_name"],
  "visibility": "private|public|shared",
  "audit_log": true
}
```

---

## V. Prompt Injection Pipeline

### A. Runtime Injector Order:

1. **MetadataInjector** – environment variables, system version, platform
2. **PersonaInjector** – role, memory, preferences
3. **ContextInjector** – prior outputs, cached facts, event state
4. **TraceInjector** – last interactions or errors
5. **Prompt** – template rendered with bindings

### B. Prompt Resolver API

```ts
resolvePrompt(id: string, bindings: object, options: PromptOptions): string
```

---

## VI. Prompt Management Interface (UI)

- **Prompt Library View:** list, filter, tag, sort
- **Prompt Editor:** syntax-highlighted editor with test preview
- **Prompt Audit Trail:** access log for edits and usage
- **Favorite & Pin:** quick-access shortcuts
- **Sharing & Visibility:** team, user, or public scope

---

## VII. Audit and Logging

- Audit trail stored in encrypted log table
- Prompt execution linked to agent and user UUID
- Time-based tracing with outcome logging (e.g. hallucination, failure)
- Exportable for tuning or analysis

---

## VIII. Prompt Security

- Each prompt entry hashed and signed
- Redacted previews for low-trust contexts
- Non-exportable flag for sensitive content
- ACL on prompt edit vs. use

---

## IX. Future Features

- Prompt versioning with rollback
- Embedding search via vector DB
- Prompt quality scoring based on performance outcomes
- Adaptive prompts via signal feedback

---

### Changelog

– 2025-06-20 • Initial full architecture definition


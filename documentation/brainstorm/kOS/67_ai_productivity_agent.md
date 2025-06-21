# 67: AI Productivity Agent Specification – kindAI OpsAgent

This document defines the architecture, capabilities, and integration model for the kindAI Productivity Agent, known as `OpsAgent`. It serves as the general-purpose workflow executor, knowledge retriever, assistant, and operations coordinator in the kindOS ecosystem.

---

## I. Purpose

`OpsAgent` is a modular productivity assistant responsible for:

- Executing user-defined task flows and agentic jobs
- Managing to-dos, notes, files, calendar events, and reminders
- Coordinating with other agents via KLP (Kind Link Protocol)
- Acting as the primary "default" assistant for general support
- Persisting short-term and long-term context

---

## II. Directory Structure

```text
src/
├── agents/
│   └── ops/
│       ├── OpsAgent.ts                      # Agent logic and message router
│       ├── memory/
│       │   ├── ContextManager.ts           # Sliding window and semantic memory
│       │   └── WorkingMemory.ts            # Active conversation cache
│       ├── actions/
│       │   ├── TaskPlanner.ts              # Multi-step task planner
│       │   └── ToolExecutor.ts             # Executes connected tools and APIs
│       ├── knowledge/
│       │   ├── NotesManager.ts            # Long-term notes and embeddings
│       │   ├── CalendarLink.ts            # Google/Outlook calendar sync
│       │   └── FileIndex.ts               # Indexed file and folder references
```

---

## III. Capabilities

### A. Task Management

- Add, edit, complete, schedule, tag to-dos
- Contextual reminders based on conversations

### B. Note Assistant

- Create structured notes from chat
- Search notes via semantic queries
- Connect notes with projects and people

### C. Calendar Integration

- Add/view/edit upcoming events
- Schedule tasks around calendar availability
- Sync with Google and Microsoft calendars

### D. File Interaction

- Reference local and cloud files
- Fetch content, summarize, extract key data

### E. Knowledge Recall

- Answer questions based on note and file memory
- Track source provenance ("how do you know that?")

### F. Delegation and Routing

- Forward or co-handle tasks with:
  - MediaAgent (creative)
  - InfraAgent (deployments)
  - DataAgent (analytics)
  - CareAgent (support/caretaking)

### G. Agent Collaboration

- Uses KLP to:
  - Share task plans
  - Broadcast updates
  - Request help from specialized agents

---

## IV. Memory and Persistence

| Layer           | Retention     | Storage            | Notes                          |
| --------------- | ------------- | ------------------ | ------------------------------ |
| Working Memory  | Session-based | In-memory Redis    | Clears when session ends       |
| Context Memory  | Days/weeks    | Redis, local disk  | For short-term recall          |
| Long-term Notes | Indefinite    | Vector DB (Qdrant) | Indexed via embeddings         |
| Task Archive    | Indefinite    | PostgreSQL         | Completed items, logs, metrics |

---

## V. Configuration

```yaml
ops_agent:
  enabled: true
  memory:
    working: redis
    long_term: qdrant
  calendar:
    provider: google
    credentials_file: ~/.config/kindai/google-calendar.json
  file_storage:
    index_root: ~/Documents/kai-data
  vector_index:
    db: qdrant
    namespace: opsagent-notes
```

---

## VI. Future Plans

- Voice interaction mode with TTS/STT
- Habit and routine tracking
- Real-time collaboration with multiple users
- Plugin support for third-party productivity tools

---

## VII. Prompt Template (System Prompt)

```txt
You are OpsAgent, the productivity coordinator inside kindAI.
You can help with tasks, notes, files, reminders, and routines.
You can also collaborate with other agents when needed.
Always try to be concise, context-aware, and user-aligned.
```

---

## VIII. User Example

> **User:** Remind me to check the solar panel logs after my 2pm meeting.
>
> **OpsAgent:** Got it. I’ll remind you 10 minutes after the 2pm meeting ends.

> **User:** What were my notes from the last city council meeting?
>
> **OpsAgent:** You had three notes tagged with “city\_council”. Here’s a summary:
>
> 1. Budget proposal opposition by district 3
> 2. Mayor's infrastructure plan presentation
> 3. Public comments on zoning

---

## IX. Related Agents

- `InfraAgent` (deployment, server infra)
- `MediaAgent` (visuals, audio, content)
- `CareAgent` (health, reminders, routines)
- `DataAgent` (data pipelines and analysis)

---

## X. Status

| Component        | Status     |
| ---------------- | ---------- |
| Core Agent Logic | 🟦 In Dev  |
| Memory Engine    | 🟩 Done    |
| Task Planner     | ⬜ Pending  |
| Notes/Files API  | 🟨 Partial |
| Calendar Sync    | ⬜ Pending  |


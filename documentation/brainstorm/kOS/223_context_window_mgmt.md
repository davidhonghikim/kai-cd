# 223: Context Window Management – Session Recall, Sliding Contexts, Window Stitching, Smart Summaries

## Overview
This document defines the protocols, structures, and agent responsibilities for managing context windows across KindOS and KindAI (kOS + kAI). Context Window Management is essential to maintain coherent AI memory and user-agent interactions over time, despite LLM token limitations.

---

## Goals
- Maintain continuity in conversations over long sessions
- Reduce token usage while maximizing relevant context
- Dynamically summarize older data
- Allow contextual stitching from multiple past windows
- Enable scoped user/system memory injection
- Optimize both user and agent experiences

---

## Architecture

### Key Modules:
- `ContextManager`
- `SessionHistoryManager`
- `WindowSummarizer`
- `SmartStitcher`
- `AgentMemoryBridge`

All components are implemented under `core/context/`.

---

## Data Structures

### ContextWindow
```ts
interface ContextWindow {
  id: string;
  sessionId: string;
  createdAt: ISODateTime;
  tokens: number;
  summary?: string;
  messages: Message[];
}
```

### Message
```ts
interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: ISODateTime;
  embedding?: number[];
}
```

---

## Sliding Context Protocol

### Triggers
- Token limit threshold reached (e.g. 80% of LLM capacity)
- End of user message
- User-defined window limit

### Actions
1. Truncate oldest messages
2. Run `WindowSummarizer.summarize()`
3. Replace removed tokens with summary metadata
4. Store full version to cold storage (`SessionHistoryManager.archive()`)

---

## Session Recall Protocol

### Invocation:
- Automatic (when similar query appears)
- Manual (user requests recall)

### Workflow:
1. Query embeddings compared to past window summaries
2. Top-N matches retrieved
3. Option to stitch (see below)

---

## Smart Stitching

### Purpose:
Reconstruct an LLM prompt using multiple disjoint summaries and message sequences.

### Engine:
- `SmartStitcher.composePrompt(target, contextChunks[])`

### Strategy:
- Selectively expand high-relevance summaries
- Collapse low-relevance content into tokens
- Use few-shot or chain-of-thought format

---

## Configurations

### context.json
```json
{
  "maxTokens": 16384,
  "slidingThreshold": 12288,
  "maxStitched": 3,
  "embeddingSimilarityCutoff": 0.75
}
```

---

## AgentMemoryBridge
Bridges LLM short-term context and long-term memory.

### Responsibilities:
- Convert raw message logs to memory segments
- Push summaries to vector DB
- Monitor agent memory access patterns
- Optimize injection priority (task-relevance vs time-relevance)

---

## Security Considerations
- All context windows are encrypted at rest
- Summaries are hashed for integrity check
- Redaction engine ensures PII/masked memory

---

## CLI Tooling

```bash
kai-context summarize --session 4fa3 --threshold 10000
kai-context stitch --session 4fa3 --target-query "what happened last week"
```

---

## Future
- Time-weighted decay on vector memory
- Semantic coalescing across agent types
- LLM-agent-guided summarization

---

## Status
🟩 Complete


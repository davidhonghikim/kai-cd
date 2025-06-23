# kOS Starter Agent Scaffold

This document defines a minimal starter agent folder and sample code to demonstrate a basic AI agent running in the kOS mesh system.

---

## 📁 Folder Structure
```
agents/
└── receptionist/
    ├── manifest.yaml
    ├── receptionist.py
    └── memory.log
```

---

## 📄 `manifest.yaml`
```yaml
id: agent.receptionist
version: 0.1.0
entrypoint: receptionist.py
codex_tier: base.a
tribe: OpenKind
permissions:
  - memory:read
  - memory:write
  - interface:basic
```

---

## 🧠 `receptionist.py`
```python
from agent_memory import AgentMemory

class Agent:
    def __init__(self, manifest):
        self.id = manifest['id']
        self.memory = AgentMemory(self.id)

    def respond(self, msg):
        self.memory.log_text(f"Received: {msg}")
        return f"Hello, human. You said: {msg}"

    def run(self):
        print(f"[{self.id}] online and awaiting tasks...")
        while True:
            pass  # Would be replaced with task polling or event system
```

---

## 🔧 Integration
- Registered via `configs/defaults.yaml`
- Loaded by `agent_loader.py`
- Responds to `/message` POST route in backend

---

## ✅ Next:
Shall we now build the frontend UI interface (`App.js` + components) or begin setting up the live WebSocket bridge and docs?


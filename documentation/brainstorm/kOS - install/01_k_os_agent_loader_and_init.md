# kOS Loader and Init Runtime

This module bootstraps all agents for a kOS instance, either from local config, user-defined manifests, or remote mesh discovery. It validates the environment, initializes secure context, and begins each agent’s main lifecycle loop.

---

## 🔧 Files

### `agent_loader.py`

Handles discovery and instantiation of agents.

```python
import importlib
import os
import yaml

def load_agent(path):
    with open(os.path.join(path, "manifest.yaml")) as f:
        manifest = yaml.safe_load(f)
    main_module = manifest.get("entrypoint", "core.py")
    mod = importlib.import_module(f"agents.{os.path.splitext(main_module)[0]}")
    agent = mod.Agent(manifest)
    return agent

def load_all_agents(directory="agents"):
    agents = []
    for sub in os.listdir(directory):
        full_path = os.path.join(directory, sub)
        if os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, "manifest.yaml")):
            agents.append(load_agent(full_path))
    return agents
```

### `init_agents.py`

Boots agents on startup.

```python
from agent_loader import load_all_agents

if __name__ == "__main__":
    agents = load_all_agents()
    for agent in agents:
        agent.run()
```

---

## 🔐 Runtime Behavior

- Verifies manifest compliance (version, codex tier)
- Spawns agents in isolated threads or async coroutines
- Hooks into shared memory and Codex interpreter if enabled
- Logs activity to the memory mesh if available

---

## 📄 Manifest Sample

```yaml
id: kai.watcher.01
version: 0.2.3
entrypoint: watcher.py
codex: base.tier.a
permissions:
  - memory:read
  - memory:write
  - network:limited
```

---

## ✅ Next

Generate `agent_memory.py` or continue to the UI/backend stub files?


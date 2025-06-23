# ==============================================
# kOS Agent Initializer
# ==============================================
# Loads default agents from config
# Spawns subprocesses or threads for each agent module
# ==============================================

import os
import yaml
import importlib
import subprocess
from pathlib import Path

CONFIG_PATH = Path("configs/defaults.yaml")
AGENTS_DIR = Path("agents")


def load_defaults(profile="basic"):
    with open(CONFIG_PATH) as f:
        config = yaml.safe_load(f)
        return config['presets'].get(profile, config['presets']['basic'])


def launch_agent(name):
    agent_path = AGENTS_DIR / f"{name}.py"
    if agent_path.exists():
        print(f"[kOS] Launching agent: {name}")
        subprocess.Popen(["python3", str(agent_path)])
    else:
        print(f"[kOS] Agent not found: {name}")


def main():
    profile = os.environ.get("KOS_PROFILE", "basic")
    print(f"[kOS] Initializing agents for profile: {profile}")
    preset = load_defaults(profile)
    for agent in preset['agents']:
        launch_agent(agent)


if __name__ == "__main__":
    main()

# ==============================================
# kOS Config Loader
# ==============================================
# Loads layered configuration with override support
# Base (defaults.yaml) < user (~/.kos/config.yaml) < runtime (env)
# ==============================================

import os
import yaml
from pathlib import Path

DEFAULT_PATH = Path("configs/defaults.yaml")
USER_CONFIG_PATH = Path.home() / ".kos" / "config.yaml"


def load_config(profile=None):
    with open(DEFAULT_PATH) as f:
        base = yaml.safe_load(f)

    user = {}
    if USER_CONFIG_PATH.exists():
        with open(USER_CONFIG_PATH) as f:
            user = yaml.safe_load(f)

    merged = base.copy()
    merged_presets = merged.get("presets", {}).copy()
    user_presets = user.get("presets", {})

    # Merge user-defined presets
    for name, config in user_presets.items():
        if name in merged_presets:
            merged_presets[name].update(config)
        else:
            merged_presets[name] = config

    merged["presets"] = merged_presets

    # Pick profile
    profile_name = profile or os.getenv("KOS_PROFILE", "basic")
    selected = merged["presets"].get(profile_name, {})

    return selected


if __name__ == "__main__":
    cfg = load_config()
    print(f"[kOS] Loaded config: {cfg}")

import os
import yaml
from pathlib import Path
import logging
from jsonschema import validate, ValidationError

logger = logging.getLogger(__name__)

BASIC_CONFIG_PATH = Path("configs/config_basic.yaml")
COMPREHENSIVE_CONFIG_PATH = Path("configs/config_comprehensive.yaml")
CONFIG = None  # Global config variable

# --- Define Configuration Schema (Example - Expand as needed) ---
CONFIG_SCHEMA = {
    "type": "object",
    "properties": {
        "ui_server": {
            "type": "object",
            "properties": {
                "host": {"type": "string"},
                "port": {"type": "integer"}
            },
            "required": ["host", "port"]
        },
        "agent_memory": {
            "type": "object",
            "properties": {
                "backend": {"type": "string", "enum": ["chroma", "weaviate", "postgres"]}
            },
            "required": ["backend"]
        },
        #Add other properties like the list of agent:
        "agents": {
        "type": "array",
            "items": {"type": "string"}
        },
        "services": {
        "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": ["ui_server", "agent_memory","agents", "services"],
    "additionalProperties": True
}

def load_config(profile=None):
    global CONFIG

    config_file_path = BASIC_CONFIG_PATH #Set Default Path
    if profile == "comprehensive":
        config_file_path = COMPREHENSIVE_CONFIG_PATH

    try:
        with open(config_file_path) as f:
            selected = yaml.safe_load(f)

        # Override with environment variables
        for key in CONFIG_SCHEMA["properties"].keys():
            env_var = os.getenv(key.upper())
            if env_var:
                selected[key] = env_var

        # Validate Config
        try:
            validate(instance=selected, schema=CONFIG_SCHEMA)
        except ValidationError as e:
            logger.error(f"Config validation error: {e}")
            raise

        CONFIG = selected
        logger.info(f"Loaded configuration from: {config_file_path}")
        return selected
    except FileNotFoundError:
        logger.error(f"Config file not found: {config_file_path}")
        raise
    except Exception as e:
        logger.error(f"Error loading config from {config_file_path}: {e}")
        raise


def get_config():
    if CONFIG is None:
        load_config()  # Load default profile if not loaded already
    return CONFIG


def export_config(filepath="kos_config_backup.yaml"):
    global CONFIG
    if CONFIG:
        with open(filepath, "w") as f:
            yaml.dump(CONFIG, f)
        logger.info(f"Config exported to: {filepath}")
    else:
        logger.warning("No config loaded to export.")


def import_config(filepath):
    global CONFIG
    try:
        with open(filepath, "r") as f:
            imported_config = yaml.safe_load(f)
        # Optionally validate imported config here
        CONFIG = imported_config
        logger.info(f"Config imported from: {filepath}")
        return True
    except Exception as e:
        logger.error(f"Error importing config from {filepath}: {e}")
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)  # Set logging
    cfg = load_config()
    print(f"[kOS] Loaded basic config: {cfg}")

    cfg_comprehensive = load_config(profile="comprehensive")
    print(f"[kOS] Loaded comprehensive config: {cfg_comprehensive}")

    export_config()  # Export to backup
    import_config("kos_config_backup.yaml")  # Import the backup
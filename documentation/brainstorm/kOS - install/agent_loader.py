# ==============================================
# kOS Agent Loader
# ==============================================
# Loads and validates agent modules based on the plugin manifest
# ==============================================

import importlib
import json
import logging
import os
from pathlib import Path
from config_loader import get_config

logger = logging.getLogger(__name__)

MANIFEST_PATH = "plugin_manifest.json"  # Configurable?

def load_manifest():
    try:
        with open(MANIFEST_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Plugin manifest not found: {MANIFEST_PATH}")
        return {"plugins": []}
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding plugin manifest: {e}")
        return {"plugins": []}

def is_dependency_met(dependencies, available_services):
    #Check the dependency
    return all(dep in available_services for dep in dependencies)

def sanitize_module_name(module_name):
  """Sanitizes a module name to prevent injection attacks."""
  # Only allow alphanumeric characters and underscores
  return "".join(c for c in module_name if c.isalnum() or c == "_" or c == ".")

def load_agent(agent_name):

    manifest = load_manifest()
    plugin_data = next((plugin for plugin in manifest["plugins"] if plugin["name"] == agent_name), None)

    if not plugin_data:
        raise ValueError(f"Agent '{agent_name}' not found in plugin manifest.")

    #Check for required dependency using config file loaded from configloader
    config = get_config()
    available_services = config.get("services", [])

    if not is_dependency_met(plugin_data.get("requires", []),available_services):
        raise ValueError(f"Dependencies not met for agent '{agent_name}'.")

    agent_path = plugin_data["entry"]
    try:
        #Dynamic Import:
        module_path = agent_path.replace(".py", "").replace("/", ".") # agent/agent_dev.py => agent.agent_dev
        module_path = sanitize_module_name(module_path) #Sanitize against module injection
        if module_path != agent_path.replace(".py", "").replace("/", "."): #Verify nothing malicious removed
            raise ImportError(f"Unsafe agent path: {agent_path}")
        module = importlib.import_module(module_path)

        agent_class_name = "".join(x.capitalize() or "_" for x in agent_name.split("_")) #Converts agent_dev to AgentDev

        agent_class = getattr(module, agent_class_name) #Load the class from agent module

        agent_instance = agent_class() #Create agent instance

        logger.info(f"Agent {agent_name} loaded successfully from {agent_path}")
        return agent_instance

    except ImportError as e:
        logger.error(f"Error loading agent module from {agent_path}: {e}")
        raise

    except AttributeError as e:
        logger.error(f"Agent Class {agent_class_name} not found in module : {e}")
        raise

    except Exception as e:
        logger.error(f"Unexpected error loading agent {agent_name}: {e}")
        raise
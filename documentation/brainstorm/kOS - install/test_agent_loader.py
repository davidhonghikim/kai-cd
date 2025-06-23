# ==============================================
# test_agent_loader.py
# ==============================================
# Unit test for the kOS agent_loader system
# ==============================================

import pytest
import json
from agent_loader import is_dependency_met

# --- Fixtures ---

@pytest.fixture
def mock_services():
    return {
        "ollama": True,
        "a1111": True,
        "docker_api_proxy": False
    }

# --- Tests ---

def test_is_dependency_met_all_true(mock_services, monkeypatch):
    monkeypatch.setattr("agent_loader.ACTIVE_SERVICES", mock_services)
    assert is_dependency_met(["ollama", "a1111"]) == True

def test_is_dependency_met_missing(mock_services, monkeypatch):
    monkeypatch.setattr("agent_loader.ACTIVE_SERVICES", mock_services)
    assert is_dependency_met(["ollama", "comfyui"]) == False

def test_is_dependency_met_empty():
    assert is_dependency_met([]) == True

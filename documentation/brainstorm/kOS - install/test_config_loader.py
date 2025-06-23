# ==============================================
# test_config_loader.py
# ==============================================
# Unit test for the kOS config_loader system
# ==============================================

import pytest
import yaml
import tempfile
from pathlib import Path
from config_loader import load_config


@pytest.fixture
def mock_defaults(tmp_path):
    defaults = {
        "presets": {
            "basic": {"agents": ["a"], "services": ["x"]},
            "dev": {"agents": ["b"], "services": ["y"]}
        }
    }
    defaults_path = tmp_path / "defaults.yaml"
    with open(defaults_path, "w") as f:
        yaml.dump(defaults, f)
    return defaults_path


@pytest.fixture
def mock_user_config(tmp_path):
    user_cfg = {
        "presets": {
            "dev": {"services": ["y", "z"]},
            "creator": {"agents": ["c"]}
        }
    }
    user_path = tmp_path / "config.yaml"
    with open(user_path, "w") as f:
        yaml.dump(user_cfg, f)
    return user_path


def test_load_basic_profile(monkeypatch, mock_defaults, mock_user_config):
    monkeypatch.setattr("config_loader.DEFAULT_PATH", mock_defaults)
    monkeypatch.setattr("config_loader.USER_CONFIG_PATH", mock_user_config)
    cfg = load_config("basic")
    assert cfg == {"agents": ["a"], "services": ["x"]}


def test_merge_user_profile(monkeypatch, mock_defaults, mock_user_config):
    monkeypatch.setattr("config_loader.DEFAULT_PATH", mock_defaults)
    monkeypatch.setattr("config_loader.USER_CONFIG_PATH", mock_user_config)
    cfg = load_config("dev")
    assert cfg == {"agents": ["b"], "services": ["y", "z"]}


def test_user_defined_new_profile(monkeypatch, mock_defaults, mock_user_config):
    monkeypatch.setattr("config_loader.DEFAULT_PATH", mock_defaults)
    monkeypatch.setattr("config_loader.USER_CONFIG_PATH", mock_user_config)
    cfg = load_config("creator")
    assert cfg == {"agents": ["c"]}

# 248: Agent Hardware Profiles & Capability Definitions (kOS)

## Overview
This document defines the structure, parameters, and usage of agent hardware profiles (AHPs) within the Kind Operating System (kOS). These profiles allow the system to identify, manage, and assign computational tasks optimally across a heterogeneous network of devices—from low-power sensors to GPU clusters.

---

## 📦 Directory Structure

```text
/core/agents/hardware/
├── profiles/
│   ├── default_profile.json
│   ├── edge_device.json
│   ├── mobile_unit.json
│   ├── gpu_rig.json
│   └── custom_templates/
│       ├── vr_headset.json
│       └── solar_node.json
├── capability_map.yaml
├── metrics_monitor.py
├── thermal_governor.py
└── agent_matcher.py
```

---

## 🔧 Profile Specification
Each hardware profile is defined as a JSON document with the following structure:

```json
{
  "id": "gpu_rig",
  "type": "gpu",
  "roles": ["training", "inference"],
  "specs": {
    "cpu": "Intel i9-12900K",
    "gpu": "NVIDIA RTX 4090",
    "ram_gb": 128,
    "storage_tb": 4,
    "network": "10GbE",
    "thermal_class": "high",
    "power_source": "AC",
    "os": "Ubuntu 22.04"
  },
  "limits": {
    "max_agents": 16,
    "max_memory_per_agent_gb": 32,
    "max_concurrent_jobs": 8
  },
  "tags": ["high_performance", "on_grid"]
}
```

---

## 🔍 Capability Map (capability_map.yaml)

This YAML file maps profile tags to known system capabilities:

```yaml
low_power:
  max_concurrent_jobs: 1
  inference_latency_ms: 200

high_performance:
  max_concurrent_jobs: 8
  training_speed_factor: 2.5

on_grid:
  thermal_limit: 95
  max_continuous_runtime_hrs: 72

mobile:
  power_saver_mode: true
  gps_sync: true
```

---

## 🔁 Matching Logic (agent_matcher.py)

```python
def match_agent_to_node(agent_requirements, available_profiles):
    matches = []
    for profile in available_profiles:
        if all(req in profile['roles'] for req in agent_requirements['roles']):
            if profile['limits']['max_memory_per_agent_gb'] >= agent_requirements['memory_gb']:
                matches.append(profile['id'])
    return matches
```

---

## 🌡️ Thermal Governor (thermal_governor.py)

Controls system performance under thermal and power constraints.

```python
def adjust_for_temperature(temp, profile):
    if temp > 90 and profile['specs']['thermal_class'] == 'high':
        return "reduce_gpu_load"
    if temp > 80:
        return "scale_down"
    return "normal"
```

---

## 📈 Metrics Monitoring (metrics_monitor.py)

Sends agent performance metrics back to central coordinator:

```python
{
  "agent_id": "a21k9d",
  "node_id": "gpu_rig_03",
  "cpu_usage": 72.5,
  "gpu_temp": 87,
  "ram_used_gb": 48,
  "uptime_min": 3920,
  "job_status": "running"
}
```

---

## 🧠 Usage in kOS
- The scheduler uses AHPs to decide which agent can be deployed where.
- Hardware-based task routing allows dynamic rebalancing of workloads.
- Profiles can be synced from remote nodes using `klink sync-profiles`.

---

## 🏁 Future Plans
- Auto-benchmarking module to generate profiles from raw hardware
- Power draw estimation module
- Adaptive job shaping based on metrics

---

### Changelog
– 2025-06-20 • Initial version (AI-generated)


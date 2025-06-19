---
id: advanced-settings
slug: /advanced-settings
sidebar_label: Advanced Settings
---

# Advanced Settings System

This document describes the modular, dynamic advanced settings system for ChatDemon. It is intended for both users and developers.

## Features

- 🧩 Modular: Each settings group (UI, Network, Advanced, etc.) is a separate, dynamically loaded component.
- 🛠️ Centralized Config: All settings are defined in a single schema file (`src/config/settingsSchema.ts`).
- 🔄 Import/Export: Easily back up or restore all settings and server lists as JSON.
- 🧑‍💻 Power User Options: Exposes advanced and experimental options for those who need them.

## User Guide

### Accessing Advanced Settings
- Open the app and click the settings icon.
- Choose "Advanced Settings" to open the modal.
- Use the sidebar to switch between sections (UI, Network, Advanced, etc.).
- Edit settings as needed. Changes are saved automatically.
- Use the Import/Export buttons to back up or restore your settings and server list.

### Import/Export
- **Export:** Click "Export Settings" to download a JSON file containing all settings and servers.
- **Import:** Click "Import Settings" and select a compatible JSON file to restore settings and servers.

## Developer Guide

### Structure
- **Schema:** All settings are defined in `src/config/settingsSchema.ts` as an array of objects. Each object includes:
  - `key`: Unique identifier
  - `label`: Display name
  - `type`: Field type (`string`, `number`, `boolean`, `select`, `json`)
  - `default`: Default value
  - `description`: Help text
  - `section`: Which section/component it belongs to
  - `options`: (For `select` fields) List of allowed values
- **Modal:** `src/components/settings/AdvancedSettingsModal.tsx` dynamically loads section components and renders fields based on the schema.
- **Sections:** Each section is a separate file in `src/components/settings/sections/`, e.g., `NetworkSettingsSection.tsx`.
- **Import/Export:** Logic is in `src/utils/settingsIO.ts` (to be implemented).

### Adding a New Setting
1. Add a new object to `SETTINGS_SCHEMA` in `settingsSchema.ts`.
2. If it's a new section, create a new section component in `sections/`.
3. The modal will automatically pick up the new section and field.

### Extending Import/Export
- To include new data (e.g., user profiles), update the logic in `settingsIO.ts`.

## Example Schema Entry
```ts
{
  key: 'timeout',
  label: 'Network Timeout (seconds)',
  type: 'number',
  default: 30,
  description: 'Timeout for API requests.',
  section: 'Network',
}
```

## New Features (2024-xx-xx)

### Granular Endpoint Editing & IP History
- The service edit form now splits the endpoint into IP/Host, Port, and Path fields.
- The IP/Host field provides a dropdown/autocomplete of previously used IPs.
- When you save a new IP, it is added to your history for quick reuse.

### Advanced Settings Save/Reset/Cancel
- The advanced settings page now has explicit **Save**, **Reset**, and **Cancel** buttons:
  - **Save**: Persists your changes.
  - **Reset**: Restores all settings to their default values.
  - **Cancel**: Discards unsaved changes and reverts to the last saved state.
- All settings sections (UI, Network, Advanced, etc.) now use a unified editing state, so changes are only saved when you click **Save**.

### Import/Export Improvements
- Importing settings now updates the UI immediately.
- Export includes all settings and servers.

## Usage Instructions

### Editing a Service Endpoint
1. Click the service in the list to expand its details.
2. Edit the IP/Host, Port, or Path fields as needed.
3. Use the dropdown to select a previously used IP, or type a new one.
4. Click **Save** to persist changes.

### Managing Advanced Settings
1. Navigate to the Advanced Settings page/tab.
2. Edit settings in any section.
3. Click **Save** to persist, **Reset** to restore defaults, or **Cancel** to discard changes.

### Importing/Exporting Settings
- Use the Import/Export buttons in the sidebar to backup or restore your configuration.

---

This system is designed for easy maintenance, extensibility, and power-user flexibility. 
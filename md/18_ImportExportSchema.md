# 📄 18: Import/Export Data Schema

This document defines the JSON schema for exporting and importing user data in Kai-CD.

## 1. Versioning

The schema includes a `version` field to ensure that backups can be migrated correctly as the application evolves. The initial version is `1.0`.

## 2. Schema Structure

The exported JSON file will have the following top-level structure:

```json
{
  "version": "1.0",
  "metadata": {
    "exportDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "source": "kai-cd-v0.2.0" 
  },
  "data": {
    "services": [],
    "settings": {},
    "history": {}
  }
}
```

### 2.1 `metadata` Object

- `exportDate`: An ISO 8601 timestamp of when the export was created.
- `source`: The version of the Kai-CD extension from which the data was exported.

### 2.2 `data` Object

This object contains the core user data, separated by category.

#### `services` Array

An array of `Service` objects, matching the structure defined in `src/store/serviceStore.ts`.

- **Example `Service` object:**
```json
{
  "id": "c7a8b9d0-e1f2-g3h4-i5j6-k7l8m9n0o1p2",
  "name": "Local Ollama",
  "type": "ollama",
  "url": "http://localhost:11434",
  "apiKey": "ollama-api-key-if-any",
  "lastUsed": "2025-06-20T10:00:00.000Z",
  "lastModel": "llama3:latest"
}
```
*Note: Sensitive fields like `apiKey` will be included, and the user should be warned about this upon export.*

#### `settings` Object

An object to store application-level settings, such as theme preference. This will map to the state managed by `src/store/themeStore.ts` and any future global settings stores.

- **Example `settings` object:**
```json
{
  "theme": "dark"
}
```

#### `history` Object (Future-proofing)

An object where keys are `service.id` and values are arrays of conversation messages. This is designed for future implementation of chat history export.

- **Example `history` object:**
```json
{
  "c7a8b9d0-e1f2-g3h4-i5j6-k7l8m9n0o1p2": [
    { "role": "user", "content": "Hello, world!" },
    { "role": "assistant", "content": "Hello! How can I help you today?" }
  ]
}
```

## 3. Implementation Plan

1.  Create a `backupManager.ts` utility in `src/utils/`.
2.  This utility will have two main functions:
    - `exportData()`: Gathers data from the relevant Zustand stores (`useServiceStore`, `useThemeStore`, etc.) and constructs the JSON object according to this schema. It will then trigger a download of the resulting `.json` file.
    - `importData(file: File)`: Parses the uploaded JSON file, validates its `version`, and then updates the Zustand stores with the imported data, overwriting existing data after user confirmation.
3.  Create a reusable `<ImportExportButtons />` component to be placed in the `SettingsView`.

This schema provides a solid foundation for user data portability. 
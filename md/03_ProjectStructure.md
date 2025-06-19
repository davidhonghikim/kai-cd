# 📂 03: Project Structure

This document provides a detailed breakdown of the directory and file structure of the Kai-CD project.

## Root Directory

- `md/`: Contains all project documentation in Markdown format.
- `public/`: Static assets that are directly served, such as `index.html` and icons.
- `src/`: The main application source code.
- `package.json`: Project dependencies and scripts.
- `vite.config.ts`: Configuration for the Vite build tool.
- `tailwind.config.js`: Configuration for the Tailwind CSS framework.
- `postcss.config.js`: Configuration for PostCSS.
- `eslint.config.js`: Configuration for ESLint.

## `src/` Directory

This is where the core application logic resides.

- `src/background/`: Contains the service worker for the Chrome Extension (Manifest V3).
- `src/components/`: Shared, reusable React components.
- `src/config/`: Application-wide configuration files.
- `src/connectors/`: The heart of the service integration logic.
    - `definitions/`: *This is the most important directory for adding new services.* It contains the "Rich Service Definition" files.
- `src/hooks/`: Custom React hooks for managing state and side effects.
- `src/popup/`: The code for the main extension popup window.
- `src/sidepanel/`: Code for the Chrome Side Panel.
- `src/store/`: Contains the Zustand global state management stores.
- `src/tab/`: Code for full-page UIs that open in a new tab.
- `src/styles/`: Global CSS styles and Tailwind CSS base files.
- `src/types/`: Contains all TypeScript type definitions.
    - `index.ts`: *The most critical types file.* Defines the core `ServiceDefinition`, `Capability`, and `ParameterDefinition` types.
- `src/utils/`: Utility functions that can be used anywhere in the application.
# 🏗️ 02: Architecture & Tech Stack

This document details the technical architecture of Kai-CD and the technologies used to build it.

## Core Architecture: The "Rich Service Definition" Model

The entire Kai-CD system is built upon a single, powerful concept: the *Rich Service Definition*.

This is the project's core innovation. Instead of using generic adapters or complex plugin systems, each supported AI service is defined by a single, self-contained TypeScript file. This file acts as a comprehensive "manual" for a service, providing a single source of truth for all its properties, capabilities, and configurations.

### The `ServiceDefinition` Object

The heart of this model is the `ServiceDefinition` type, located in `src/types/index.ts`. An object of this type contains everything the application needs to interact with a service:

- *Identity & Metadata:* `type`, `name`, `category`, `defaultPort`, `docs`.
- *User Setup (`configuration`):* Specifies required command-line arguments and provides help text, so the UI can guide the user on how to launch the service correctly.
- *Authentication (`authentication`):* Defines the security scheme (e.g., `none`, `api_key`, `bearer`), allowing the UI to request the correct credentials.
- *Capabilities (`capabilities`):* This is the most critical property. It's an array that describes *what the service can do*.

### The `Capability` Object

A `Capability` defines a specific function, like `image_generation` or `llm_chat`. It contains:

- *`endpoints`*: A map of the API endpoints for this capability (e.g., a `txt2img` endpoint).
- *`parameters`*: A rich schema for every parameter an endpoint accepts. This schema defines the parameter's `key`, `label`, `type` (which determines the UI control to render), `defaultValue`, and `description`.
- *Dynamic Options*: For `<select>` inputs, the definition can specify an `optionsEndpoint`. The application will call this endpoint to dynamically populate the dropdown with real-time data from the service (e.g., a list of available models).

This architecture makes the application incredibly robust and easy to extend. The UI is dynamically generated from these definitions.

## Centralized Configuration (`src/config/env.ts`)

All environment-specific and user-configurable settings are centralized in `src/config/env.ts`. This file exports a single `config` object containing structured settings for networking, services, UI, and developer options, preventing hardcoded values.

## Tech Stack

- Framework: **React** with **TypeScript**
- Build Tool: **Vite**
- Extension Framework: **Chrome Extension Manifest V3**
- Styling: **Tailwind CSS**
- State Management: **Zustand**
- Linting & Formatting: **ESLint** and **Prettier**

## Application Flow

1.  *Initialization:* The extension loads the `config` object and all `ServiceDefinition` objects.
2.  *Service Selection:* The user selects a service from the main UI.
3.  *UI Generation:* The application reads the selected `ServiceDefinition` and dynamically generates UI controls based on its `capabilities` and `parameters`.
4.  *API Interaction:* When the user performs an action, the application constructs the API request using the details from the service definition.
5.  *Dynamic Population:* If a parameter has an `optionsEndpoint`, the application first makes a GET request to that endpoint to populate its choices. 
# ChatDemon Project Structure

## Directory Structure

```
chatdemon/
├── .github/                    # GitHub specific files
│   ├── workflows/             # CI/CD workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
├── md/                        # Markdown documentation
├── public/                    # Static assets
│   ├── icons/              # Extension icons
│   └── manifest.json       # The extension manifest
├── src/                       # Source code
│   ├── background/           # Service worker and background scripts
│   ├── components/           # Shared React components
│   ├── config/               # Service definitions, types, constants
│   ├── content/              # Content scripts (if any)
│   ├── options/              # Options page UI and components
│   ├── popup/                # Popup UI and components
│   ├── services/             # Connectors for external services
│   │   ├── llm/            # LLM service connectors (Ollama, OpenAI-compatible)
│   │   ├── image/          # Image generation connectors (A1111, ComfyUI)
│   │   ├── automation/     # Automation service connectors (n8n)
│   │   └── network/        # Network service connectors (Tailscale)
│   ├── sidepanel/            # Side panel UI and components
│   ├── storage/              # Storage management (Chrome Storage)
│   ├── styles/               # CSS Modules and global styles
│   ├── tab/                  # Full-page tab UI
│   ├── utils/                # Utility functions (chrome messaging, keep-alive)
│   └── views/                # Specific views for services (A1111, ComfyUI)
│   └── offscreen/            # Offscreen document for DOM/window access from service worker
├── .vscode/                   # VS Code settings
├── dist/                      # Build output
└── vite.config.ts             # Vite build configuration
```

## Key Components

### 1. Core Extension Components
- **`background`**: The service worker, which handles extension lifecycle, message routing, and core logic.
- **`popup`**: The main UI that appears when clicking the extension icon.
- **`sidepanel`**: The panel that can be opened alongside a webpage for quick access.
- **`options`**: The settings page for managing services and other configurations.
- **`tab`**: A full-page view for specific services.
- **`offscreen`**: A special hidden document used by the service worker to access DOM APIs (like creating download links) that are not available in the service worker context.

### 2. Service Connectors (`services`)
- Contains the logic for communicating with external APIs (Ollama, A1111, etc.).
- Each service type has its own connector class that implements a common interface.

### 3. UI and Views
- **`components`**: Shared, reusable React components used across different parts of the UI (e.g., `ViewRouter`, `ChatInterface`).
- **`views`**: Larger, more complex components that represent the main view for a specific service (e.g., `A1111View`).
- **`styles`**: Contains all CSS, organized into modules for each component and a global style sheet.

### 4. Configuration and Utilities
- **`config`**: Holds all static definitions, such as service types, constants, and TypeScript interfaces (`types.ts`).
- **`storage`**: A wrapper around `chrome.storage` for easy data persistence.
- **`utils`**: Helper functions, especially for `chrome.runtime.sendMessage` and the service worker keep-alive mechanism.

## Build and Development

- The project is built using **Vite** and **TypeScript**.
- The build process is defined in `vite.config.ts`.
- The main entry points for the extension (popup, options, etc.) are defined in `vite.config.ts` and `public/manifest.json`.
- Code quality is maintained with ESLint and Prettier.

## File Naming Conventions

1. **Component Files**:
   - React components: `PascalCase.tsx`
   - Utility functions: `camelCase.ts`
   - Type definitions: `PascalCase.types.ts`

2. **Test Files**:
   - Unit tests: `*.test.ts`
   - Integration tests: `*.integration.test.ts`
   - E2E tests: `*.e2e.test.ts`

3. **Configuration Files**:
   - Environment: `.env.*`
   - Build config: `*.config.js`
   - TypeScript config: `tsconfig.json`

## Module Organization

1. **Service Connectors**:
   - Each service type has its own directory
   - Common interfaces in `types/`
   - Implementation-specific code in service directories

2. **UI Components**:
   - Organized by feature/functionality
   - Shared components in `components/common/`
   - Feature-specific components in feature directories

3. **Utilities**:
   - Domain-specific utilities in feature directories
   - Shared utilities in `utils/`
   - Type definitions in `types/`

## Version Control

1. **Branch Strategy**:
   - `main`: Production-ready code
   - `develop`: Development branch
   - `feature/*`: Feature branches
   - `bugfix/*`: Bug fix branches
   - `release/*`: Release preparation

2. **Commit Guidelines**:
   - Conventional commits
   - Clear commit messages
   - Atomic commits

## Documentation Standards

1. **Code Documentation**:
   - JSDoc comments for functions and classes
   - README files in each major directory
   - Type definitions with descriptions

2. **Project Documentation**:
   - API documentation
   - User guides
   - Development guides
   - Contributing guidelines

## Testing Strategy

1. **Unit Testing**:
   - Component testing
   - Utility function testing
   - Service connector testing

2. **Integration Testing**:
   - Component interaction testing
   - Service integration testing
   - API integration testing

3. **E2E Testing**:
   - User flow testing
   - Cross-browser testing
   - Performance testing 
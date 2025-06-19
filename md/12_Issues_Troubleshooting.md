# Issues & Troubleshooting

This document outlines the known issues and recent troubleshooting steps taken on the project. It is intended to provide context for the next developer or agent taking over.

## Current State: STABLE BUT DEGRADED
The build is stable and the application is functional, but several features are broken or need improvement. The critical, application-breaking `TypeError: this.getData is not a function` error has been resolved by fixing underlying dependency conflicts.

## Current Known Issues (For Next Agent)

1.  **Docs Viewer UI Needs Improvement:**
    -   **Problem:** While the markdown content now loads correctly, the styling is basic. The text is readable, but it does not feel integrated with the application's theme.
    -   **Task:** Improve the CSS for the `prose` class in the `DocsViewer` to better match the application's light and dark themes. This involves adjusting colors, font sizes, link styles, and code block appearance.

2.  **Service Reordering is Disabled:**
    -   **Problem:** The drag-and-drop functionality on the `ServiceManagement` page was removed because its underlying library, `react-beautiful-dnd`, is unmaintained and incompatible with React 19.
    -   **Task:** Research and implement a modern, maintained drag-and-drop library (e.g., `dnd-kit`) to restore the service reordering functionality.

3.  **Review `17_UI_RedesignPlan.md`:**
    -   **Problem:** The UI redesign plan may contain references to components or libraries that are no longer in use.
    -   **Task:** Review the redesign plan, including any Mermaid diagrams, and update it to reflect the current state of the codebase and the removal of `react-beautiful-dnd`.

## Resolved Issues (June 2024)

-   **`Uncaught TypeError: this.getData is not a function`:** Resolved by upgrading `remark-gfm` to v4.0.0 and removing `react-beautiful-dnd`.
-   **Build Failure due to `react-beautiful-dnd`:** Resolved by removing the package and its usage in `ServiceManagement.tsx`.
-   **Docs Viewer Not Loading:** Resolved by fixing the logic that accesses content from Vite's `glob` import.
-   **Popup Buttons Not Working:** Resolved by making the `onClick` handlers `async` and awaiting the panel/tab switching functions.

---
*This document has been updated to reflect the current project state for handoff.*

## 1. Current State: BROKEN BUILD

### Status Update (2025-06-19)
✅ The build has been restored. The root cause was missing HTML entry files at the project root combined with incorrect paths in `vite.config.ts`. New `popup.html`, `sidepanel.html`, and `tab.html` were added to the project root, and the Rollup `input` paths were updated accordingly. `npm run build` now completes successfully, and the extension loads in Chrome without manifest errors.

When attempting to load the extension from the `dist` directory after running `npm run build`, the browser displays the following error:

```
Failed to load extension
File: ~/CascadeProjects/kai-cd/dist
Error: Side panel file path must exist.
Could not load manifest.
```

### Root Cause Analysis

The build process, managed by Vite, is not correctly placing the HTML entry-point files (`popup.html`, `sidepanel.html`, `tab.html`) into the output `dist` directory.

- The `public/manifest.json` file expects these HTML files to be at the root of the extension's directory (e.g., `dist/sidepanel.html`).
- The last successful-but-incorrect build placed them inside a nested `src` directory (e.g., `dist/src/sidepanel.html`).
- In a series of failed attempts to fix this, **the original source HTML files were deleted**.

**Immediate Task:** The files `src/popup/popup.html`, `src/sidepanel/sidepanel.html`, and `src/tab/tab.html` must be restored. They are simple HTML files that should contain a root div and a script tag pointing to their respective `main.tsx` entry point. For example, `src/popup/popup.html` should contain `<script type="module" src="/src/popup/main.tsx"></script>`.

## 2. Recent History: Failed UI Refactoring

The build issues began during a major UI overhaul.

### The PostCSS/Tailwind Failure

- The initial goal was to implement a new, themeable UI using Tailwind CSS.
- The build process became stuck in an unbreakable loop with a misleading PostCSS configuration error. Every attempt to configure Tailwind and PostCSS according to modern standards failed.
- **Decision:** To unblock development, a radical decision was made to completely remove Tailwind, PostCSS, and Autoprefixer from the project.

### The Styling Removal

- All `className` attributes were stripped from the React components.
- Basic inline styles or no styles were applied to ensure basic functionality.
- The application's aesthetic is currently minimal and unstyled.

### The `vite.config.ts` Quagmire

- After removing the styling system, a new build error related to the HTML file paths emerged.
- Several attempts were made to fix this by modifying `vite.config.ts`, which were unsuccessful and led to the accidental deletion of the source HTML files. The `vite.config.ts` may still be in an incorrect state.

## 3. Path Forward for the Next Agent

1.  **Restore Source Files:** Re-create the three missing HTML files in their original locations (`src/popup/`, `src/sidepanel/`, `src/tab/`).
2.  **Fix the Build:** Debug the `vite.config.ts` file to ensure the build process correctly places the HTML files in the root of the `dist` directory as required by the manifest.
3.  **Re-evaluate Styling:** Once the build is stable and the extension is loadable, assess the best path forward for styling. This could involve re-attempting Tailwind with a fresh setup or choosing a different CSS framework or methodology.
4.  **Continue Roadmap:** Proceed with the feature development outlined in the roadmap, starting with the import/export functionality.

## 2. Runtime UX Issues (2025-06-19)

Although the extension now loads, several visual / UX issues remain:
1. Popup window is very narrow (~380 px) and lacks spacing; controls overflow on smaller text zoom.
2. No top-bar buttons for Service Manager or Settings — user can only access via context menus.
3. Global theme variables exist, but components still use inline/unthemed styles.

These items are tracked under Phase-2 tasks (see Roadmap).

## ❗ Known Issues

- (None at this time)
    - This section should be updated as bugs are identified.

## 🧠 Potential Challenges & Architectural Hurdles

This section outlines foreseeable challenges that will require careful thought and implementation.

#### 1. Complex Capability: ComfyUI Graph Execution
- Challenge: The ComfyUI API is not a simple request-response model. It requires constructing a "workflow" or "graph" in a specific JSON format.
- Implication: This will require a new `Capability` type, `graph_execution`, and a UI for managing graph workflows.

#### 2. State Management for Dynamic UI
- Challenge: The UI is generated dynamically from service definitions. Managing the state for a form that can have any number and type of inputs can be complex.
- Implication: Requires a robust state management solution (Zustand is used) and a well-designed structure to hold the form state for the currently active service.

#### 3. Cross-Origin Resource Sharing (CORS)
- Challenge: The extension makes API requests from a `chrome-extension://` origin to `http://localhost`, which browsers block by default.
- Solution: The `ServiceDefinition` for each service must include the correct command-line arguments to launch the service with the proper CORS headers.

#### 4. API Response Variation
- Challenge: The exact structure of API responses differs between services (e.g., A1111's image array vs. OpenAI's chat choices).
- Implication: UI components must be written defensively to handle different response schemas. The application now uses toast notifications to show users what went wrong.

#### 5. Build Tooling and Linter Configuration
- Challenge: The project's linter requires `type`-only imports for TypeScript types (`import type { ... } from '...'`).
- Implication: Forgetting `import type` will cause the build to fail.

## 🛠️ Troubleshooting

### "Failed to fetch" or "CORS" Error in Browser Console

- Symptom: You try to interact with a service and see a network error in the developer console related to CORS. A toast notification will also appear, displaying the "Failed to fetch" message.
- Cause: The target AI service (e.g., A1111, Ollama) was not started with the necessary flags to allow requests from other origins.
- Fix:
    1.  Stop the AI service.
    2.  Consult the `configuration.help.instructions` for that service within its definition file in `src/connectors/definitions/`.
    3.  Restart the service using the exact command-line arguments specified.

## 📚 Appendix: Vite × Chrome-Extension Configuration Reference

The build system is Vite v6 with Rollup under the hood. Below is a concise reference of the moving parts that must stay in sync so the packed extension loads correctly.

### 1. HTML entrypoints
• The extension exposes **three UI entrypoints** (popup, side-panel, full-tab) plus the background script.

| Logical UI | Source file | Packed file |
|------------|-------------|-------------|
| Popup      | `popup.html` (root) | `dist/popup.html` |
| Side-Panel | `sidepanel.html` (root) | `dist/sidepanel.html` |
| New Tab    | `tab.html` (root) | `dist/tab.html` |
| Background | `src/background/main.ts` | `dist/background.js` |

All three HTML files are **flat at the project root** to keep their relative URLs identical in both dev & prod.

### 2. vite.config.ts (Rollup `input`)
```ts
rollupOptions: {
  input: {
    popup:      resolve(__dirname, 'popup.html'),
    sidepanel:  resolve(__dirname, 'sidepanel.html'),
    tab:        resolve(__dirname, 'tab.html'),
    background: resolve(__dirname, 'src/background/main.ts'),
  },
  // … output filenames remain default
}
```
Vite treats each key as a build entry. Leaving the keys named (`popup`, `sidepanel`, `tab`) is optional but helps dev-tools trace chunks back to entries.

### 3. Manifest expectations (public/manifest.json)
```jsonc
{
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  }
}
```
Chrome loads these assets **relative to the extension root** at runtime, so they must exist exactly at those paths inside `dist/`.

### 4. Static assets & manifest copy

`vite-plugin-static-copy` copies the entire `public/` folder (including `manifest.json` and `icons`) to the root of `dist/`. No additional configuration is needed as long as:

* `public/manifest.json` remains the single source of truth.
* Icon paths in the manifest (`icons/icon128.png`, etc.) point inside the same `icons/` folder being copied.

### 5. Common pitfalls
1. **Nested HTML files** – moving the HTML sources into `src/` requires a matching change to `manifest.json` *or* custom Rollup `output` code to move them back. Simpler: keep them flat.
2. **Forgotten Manifest copy** – removing `vite-plugin-static-copy` will break the build; the manifest must end up in `dist/`.
3. **MV3 service-worker file name** – background script must be named exactly as referenced in the manifest; our config emits `background.js` via the output hook.

Keeping these five elements aligned prevents the "Side panel file path must exist" / "Could not load manifest" errors that plagued earlier builds. 

## Current Known Issues (v0.2.0)

While the recent refactor stabilized the UI and core functionality, several areas require attention:

-   **Popup UI/UX:** The popup window (`popup.html`) has some minor layout issues (e.g., scrollbars appearing unnecessarily) and the UX for button interactions could be improved.
-   **Side Panel Behavior:** The side panel does not currently persist its state effectively. Switching between services or views can sometimes close it unexpectedly. The goal is for the panel to be a persistent, stateful workspace.
-   **Documentation Viewer:** While the main viewer loads, internal navigation links within the markdown files do not work as expected. The viewer needs a more robust solution for handling relative links between documents.
-   **UI Control Redundancy:** A review of the main tab and popup UIs is needed to identify and streamline any redundant or confusing buttons and links. The goal is to simplify the user flow.
-   **Dark Theme Application:** The dark theme is not always applied consistently or automatically based on system settings, particularly in the side panel and popup.
-   **Dependency Conflict with React 19:** The project uses `react-beautiful-dnd`, which has a peer dependency on React versions `^16.8.5 || ^17.0.0 || ^18.0.0`. The project is currently on React `19.1.0`. This conflict prevents the installation of new packages (e.g., `lucide-react`) that are compatible with React 19. This will need to be resolved to keep the project's dependencies up to date. The library `react-beautiful-dnd` seems to be unmaintained.

## 3. Runtime Errors from User Session (2025-06-19)

The following errors were reported from a recent user session and require investigation.

### API Response Parsing Errors

-   **Symptom:** The application shows errors like `SyntaxError: Unexpected token 'O', "Ollama is running" is not valid JSON` or `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`.
-   **Affected Services:** Ollama, A1111, ComfyUI.
-   **Probable Cause:** The status check endpoints for these services are returning plain text (e.g., "Ollama is running") or an HTML document (like a login page or a 404 page) instead of a valid JSON response. The `apiClient` expects JSON and fails when trying to parse the unexpected format. This could be due to misconfigured service URLs (e.g., pointing to a UI instead of an API endpoint) or changes in the services' API contracts.

### Network and API Fetch Errors

-   **Symptom:** The application shows generic `TypeError: Failed to fetch`.
-   **Affected Services:** ComfyUI (Local), Open WebUI (Local/Remote), A1111 (Local/Remote), OpenAI API.
-   **Probable Cause:** This is a general network failure. The most likely causes are:
    1.  The AI service is not running or is unreachable at the configured address/port.
    2.  A Cross-Origin Resource Sharing (CORS) issue is preventing the extension from accessing the service. The service needs to be started with the correct CORS headers allowing the `chrome-extension://` origin.
    3.  A firewall or network configuration is blocking the connection.

### Side Panel Error
- **Symptom:** An error `Uncaught (in promise) Error: No active side panel for tabId: ...` was reported.
- **Probable Cause:** This suggests a potential race condition or a logic error in how the extension manages the side panel's state, particularly when switching between tabs or services.

## Common Problems

### Service Connection Errors
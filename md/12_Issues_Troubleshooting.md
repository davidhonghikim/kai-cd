# Issues & Troubleshooting

This document outlines the known issues and recent troubleshooting steps taken on the project. It is intended to provide context for the next developer or agent taking over.

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
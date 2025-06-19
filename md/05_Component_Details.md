# 05_Component_Details.md
# kai-cd – Component-level Design & Logic

This document drills into the internal logic of each major subsystem so new agents can understand how things work under the hood.

---
## 1. Background Service Worker (`src/background/index.ts`)
* **Purpose**: central message router, life-cycle of connectors, keep-alive workaround.
* **Key objects**:
  * `ConnectorManager` – lazily loads and caches connectors per service.
  * `browser.runtime.onMessage` – single entry-point for communication from any UI context.
* **Message schema** (TypeScript):
```ts
export interface KaiMessage {
  action: string;
  payload?: any;
}
```
* **Persistence**: background never directly touches storage; instead delegates to `StateStore` (IndexedDB wrapper) via messages so that logic stays testable.

---
## 2. Connector Layer (`src/connectors/*`)
### BaseConnector
```ts
abstract class BaseConnector<T = unknown> {
  id: string;
  config: ServiceConfig;
  protected connected = false;

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract checkStatus(): Promise<{ isOnline: boolean; error?: string; details?: T }>;
}
```
* **connect()** should perform a lightweight ping to ensure the remote API is reach­able and set `this.connected`.
* **disconnect()** toggles state & cleans up resources; no network call is required but connectors **may** cancel pending fetches.

### ConnectorManager
* HashMap `<serviceId, IConnector>` prevents duplicate instances.
* Uses dynamic `import()` based on `service.type` to cut bundle size – Webpack/Vite tree-shakes unused connectors.

### Example: `OpenAIConnector`
* GET `/models` to verify API key; all endpoint wrappers use `ApiClient` for uniform error handling.
* Streaming responses (SSE) handled with `eventsource-parser` in later iteration.

---
## 3. UI Surfaces
### Popup UI (`src/ui/popup`)
* React entry‐point renders **ServiceManager** page by default.
* Uses `webextension-polyfill` to call background for add/update/remove service.
* Employs CSS Modules; colour values link to CSS variables from `styles/tokens.css`.

### Side-panel Chat (`src/ui/panel`)
* Loads once per browser window; stores session ID in `chrome.storage.session` for quick restore.
* Chat flow:
  1. User enters prompt → `sendMessage` hook.
  2. Hook sends `KaiMessage { action: "chat", payload: { prompt, model, serviceId } }` to background.
  3. Background fetches connector, calls `.chat(...)` and streams tokens back via `browser.runtime.sendMessage` events.
* UI subscribes to streaming tokens via listener and renders incremental message.

### Tab View (`src/ui/tab`)
* `<iframe src="${service.url}" sandbox="allow-scripts allow-forms allow-same-origin" />` shows full remote interface.
* Height/width flex to viewport; top bar contains action shortcuts (reload, view logs, open settings).

---
## 4. State Store (`src/storage/index.ts`)
* Wrapper around `idb-keyval` offering `get<T>(key)`, `set(key, value)`, `remove(key)`.
* Namespaces: `settings`, `artefacts`, `theme`, each a top-level prefix to avoid key clashes.
* All writes are debounced (250 ms) to avoid excessive IO.

---
## 5. Artefact Manager (`src/storage/artefacts.ts`)
* Schema:
```ts
interface ArtefactMeta {
  id: string;
  type: 'image' | 'chat';
  sourceService: string;
  prompt: string;
  createdAt: number;
}
```
* Stores binary blobs in IndexedDB with detached metadata row for search.
* Exposes `search(query)` which does simple text search over prompts & service names – to be replaced with full-text later.

---
## 6. Theme Manager (`src/styles/theme.ts`)
* Reads preferred theme from `StateStore('theme', 'light')`.
* Applies CSS variable set (`:root` variables) by toggling `<html data-theme="dark">` attribute.
* Emits `theme-changed` custom event consumed by UI components to re-render.

---
## 7. Backup Script (`scripts/create_backup.sh`)
* Tarballs the entire repo **excluding** `node_modules`, `dist`, and `backups/*` then writes to `backups/backup-<date>.tar.gz`.
* Called automatically via `npm run backup`.

---
## 8. Test Strategy
* Unit tests live beside source (`*.test.tsx`).
* Mocks for `webextension-polyfill` inside `tests/mocks/browser.ts`.
* Coverage gate configured at 80 % branches & functions in `package.json`.

---
*Document last updated: <!--timestamp placeholder-->. 
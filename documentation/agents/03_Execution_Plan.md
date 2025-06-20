# 03: Execution Plan – Comprehensive Audit & Verification of Kai-CD Codebase

## Objective
Conduct a full-scope audit of the Kai-CD codebase to ensure:
1. Adherence to the mandatory agent rules and architectural guidelines documented in `documentation/agents/`.
2. Logical correctness, stability, and maintainability of the source code.
3. Synchronisation between documentation and implementation (identify stale, missing, or inaccurate docs).

Deliverables:
- A detailed findings report (issues, gaps, improvement opportunities).
- Recommended remediation tasks, each with an implementation outline.
- Updated documentation where discrepancies are found.

---

## Phase 0 – Preparation
| Status | Step | Description | Owner |
| --- | --- | --- | --- |
| 🟩 | P0-1 | Review all core docs (`documentation/`, `README.md`, `docs.html`) for architectural & workflow expectations. | Agent |
| 🟩 | P0-2 | Inventory source files and high-risk modules (state stores, `apiClient.ts`, service connectors). | Agent |

## Phase 1 – Static Verification
| Status | Step | Description | Owner |
| --- | --- | --- | --- |
| 🟩 | S1-1 | Run `npm run build` to obtain baseline TypeScript & Vite diagnostics. | Agent |
| 🟩 | S1-2 | Run ESLint (`npm run lint`) to capture style & potential logic errors. | Agent |
| 🟩 | S1-3 | Parse compiler/linter output and categorise issues (critical, warning, stylistic). | Agent |

#### Lint Error Categorisation (2025-06-20)
| Severity | Count | Representative Examples |
| --- | --- | --- |
| 🟥 Critical | 4 | `Tab.tsx` multiple `react-hooks/rules-of-hooks` violations (lines 40, 60, 83, 89) – can cause runtime bugs. |
| 🟨 Warning | 1 | Empty interface in `types/index.ts` (line 283) – type safety concern. |
| ⬜ Stylistic | 56 | `@typescript-eslint/no-unused-vars` across components, connectors, utils. |

Next: open tasks under Phase 2 for critical & warning fixes (L2-6, L2-7). Stylistic cleanup can be batched later.

## Phase 2 – Logic & Architecture Review
| Status | Task ID | Description | Owner |
| --- | --- | --- | --- |
| 🟩 | A2-1 | Read & document runtime flow of state stores (`serviceStore`, `viewStateStore`, etc.). | Agent |
| ⬜ | A2-2 | Trace `apiClient` call chain with one example service; note error & timeout handling paths. | Agent |
| ⬜ | A2-3 | Map model-list logic (`useModelList → serviceStore → connectors`); identify edge cases. | Agent |
| ⬜ | A2-4 | Catalogue user-input surfaces in UI; assess validation & XSS risk. | Agent |
| ⬜ | A2-5 | Evaluate credential storage & retrieval (vaultStore, chromeStorage). | Agent |
| ⬜ | A2-6 | Summarise findings in execution-plan log; prioritise fix tasks (L2-series). | Agent |

## Phase 3 – Documentation Parity Check
| Status | Step | Description | Owner |
| --- | --- | --- | --- |
| ⬜ | D3-1 | Compare connector capability docs in `documentation/developers/services/` with `src/connectors/definitions/*`. | Agent |
| ⬜ | D3-2 | Verify user guides reference current UI components & flows. | Agent |
| ⬜ | D3-3 | Flag out-of-date or missing documentation sections. | Agent |

## Phase 4 – Reporting & Recommendation
| Status | Step | Description | Owner |
| --- | --- | --- | --- |
| ⬜ | R4-1 | Compile audit findings into Markdown report under `documentation/reports/YYMMDD_audit.md`. | Agent |
| ⬜ | R4-2 | Prioritise remediation tasks (P0 blockers, P1 improvements, P2 nice-to-haves). | Agent |
| ⬜ | R4-3 | Present action plan to user for approval. | Agent |

## Phase 5 – UI Parity & Feature Enhancements (Open-WebUI Baseline)
| Status | Task ID | Description | Owner |
| --- | --- | --- | --- |
| ⬜ | U5-1 | Implement global light/dark theme toggle; ensure Tailwind config maps semantic colors. | Agent |
| ⬜ | U5-2 | Audit and refactor Chat UI into three-pane layout (service list, chat, parameter drawer). | Agent |
| ⬜ | U5-3 | Add streaming cursor & hover actions (copy, rerun, delete) to `ChatMessage` component. | Agent |
| ⬜ | U5-4 | Build toast feedback for parameter saves & file uploads using `react-hot-toast`. | Agent |
| ⬜ | U5-5 | Model availability indicator in `ModelSelector` (green dot for active, grey for offline). | Agent |
| ⬜ | U5-6 | Design Prompt Manager view for saving/reusing prompt snippets. | Agent |
| ⬜ | U5-7 | Integrate Artifacts panel for generated images/files; leverage `ImageGalleryView`. | Agent |
| ⬜ | U5-8 | Enhance Vault Manager UI for credential CRUD, grouping by service. | Agent |
| ⬜ | U5-9 | Service-specific tweaks: review Ollama, ComfyUI, and A1111 views to mimic OWUI flow. | Agent |
| ⬜ | U5-10 | Add RAG "Sources" drawer when connector includes citations array. | Agent |

## Phase 6 – Documentation Migration & Authoring
| Status | Task ID | Description | Owner |
| --- | --- | --- | --- |
| ⬜ | D6-1 | Port and update "Best Practices" doc from archive (`md/06_BestPractices.md`). | Agent |
| ⬜ | D6-2 | Write new Contributing Guide (git-flow, PR checklist) based on archive material. | Agent |
| ⬜ | D6-3 | Migrate "Roadmap" into `developers/09_Roadmap.md`; update dates. | Agent |
| ⬜ | D6-4 | Convert "Issues & Troubleshooting" into user FAQ in `users/05_Troubleshooting.md`. | Agent |
| ⬜ | D6-5 | Publish JSON schema doc for Import/Export (`developers/11_ImportExportSchema.md`). | Agent |
| ⬜ | D6-6 | Author Security & Threat Model doc (`developers/12_Security_Model.md`). | Agent |
| ⬜ | D6-7 | Refresh UI redesign plan with new wireframes & Mermaid diagrams (`developers/13_UI_Redesign.md`). | Agent |
| ⬜ | D6-8 | Draft Test Strategy & Coverage Targets (`developers/10_Test_Strategy.md`). | Agent |

---

## Execution Log

> _Log entries will be appended chronologically as work progresses. Each entry includes timestamp, action, findings, and next step._

### 2025-06-20 – Phase 0 Doc Review & Inventory
- Read `README.md`; architecture description matches current folder structure.
- Noted missing screenshot reference in README (non-blocking, cosmetic).
- Listed state stores: `viewStateStore.ts`, `settingsStore.ts`, `serviceStore.ts`, `vaultStore.ts`, `logStore.ts`, `chromeStorage.ts`.
- High-risk utility: `src/utils/apiClient.ts` (249 LOC) – reviewed URL builder & error handling; no immediate logical errors spotted.
- Service definitions enumerated (18 files) under `src/connectors/definitions/`.
- Next: complete doc review of `documentation/` and `docs.html`, then proceed to Phase 1 static checks.

### 2025-06-20 – Plan Initialisation
- Created execution plan in correct directory with proper naming convention.

### 2025-06-20 – User Clarification
- User confirmed that files in `documentation/agents/assets/` are intentionally kept as UI inspiration references. Remove recommendation to prune duplicates.

### 2025-06-20 – Interface Parity Analysis
- Reviewed OWUI images; extracted layout & UX patterns (three-pane, parameter drawer, streaming, toast feedback).
- Extended audit to Ollama, ComfyUI, A1111 screenshots: they follow similar chat-centric structure; key differentiators:
  • **Ollama**: minimal parameter drawer; quick model switcher.
  • **ComfyUI**: image grid, workflow sidebar.
  • **A1111**: advanced image-gen params (sampler, cfg scale) stacked in accordion.
- Added Phase 5 tasks U5-1 through U5-10 covering theme toggle, UI refactor, prompt manager, artifacts, vault manager, and RAG sources.

### 2025-06-20 – Phase 1 Static Checks
- Build succeeded with no TypeScript errors (`npm run build` completed in ~4 s).
- ESLint surfaced 61 errors—predominantly `no-unused-vars` and several React `rules-of-hooks` violations in `Tab.tsx`.
- Other notable issues:
  • Empty interface warning in `types/index.ts` (line 283).
  • Unused constants and params across multiple service definitions and utils.
- Next action: triage lint errors; many are unused imports generated by earlier refactors—safe to delete. The React Hook ordering errors in `Tab.tsx` are critical and need immediate fix.

### 2025-06-20 – A2-1 State-Store Flow Analysis

**Stores Reviewed**
1. `serviceStore` (≈295 LOC)
2. `viewStateStore` (146 LOC)
3. `settingsStore` (51 LOC)
4. `vaultStore` (105 LOC)
5. `logStore` (39 LOC)
6. `chromeStorage` adapter (14 LOC)

**Hydration Pattern**
• All stores use `zustand/persist` with a custom `chromeStorage` implementation that proxies to `chrome.storage.local`.
• Each store sets a `_hasHydrated` flag in `onRehydrateStorage` which components must check.
• Advantage: prevents render-before-rehydrate race conditions.
• Gap:  No retry logic if storage read fails (e.g., quota errors).  Recommended to add try/catch + toast.

**serviceStore Logic**
• Maintains array of `Service` objects + helper for CRUD.
• URL building centralised in `buildServiceUrl` => good.
• `getInitialDefaultServices` seeds default services based on localIp/remoteIp from `config`.
• Adds cloud OpenAI service unconditionally → potential duplicate if user adds same URL manually.
• `checkServiceStatus` (omitted in earlier snippet) uses `apiClient.head`; rate-limited by caller.
• Side-effect: `updateService` re-computes URL but does **not** update `customUrls` if ipType changes from custom→cloud.

**viewStateStore Logic**
• Tracks `activeServiceId`, `activeModel`, chat parameters.
• When `setActiveServiceId` runs, it re-initialises parameters based on the service's `llm_chat` capability.
• Uses separate `switchToTab` and `switchToPanel` helpers to message background script.
• Risk: `chatParameters` persisted wholesale; large prompt parameters may bloat `chrome.storage` (5 MB quota).

**settingsStore + vaultStore**
• `settingsStore` persists theme, log level, dev flags—small, safe.
• `vaultStore` encrypts credential values with CryptoJS AES—key derived from `config.vault.secretKey`; default secret is `default-secret-key` (demo value) if userConfig not set.  Security Risk: Weak default key.

**logStore**
• Simple in-memory log array, persisted; can grow unbounded → quota risk.

**Security Observations**
1. Vault encryption relies on global config secret; need user-specific secret or master password.
2. No schema validation on persisted data; malformed storage could break app.
3. No cross-tab lock when multiple tabs write to same storage key (rare, but async).

**Initial Recommendations** (will become L2 tasks after analysis phase):
• Add storage size monitoring + auto-purge logs > N entries.
• Prompt user to set vault master password; derive AES key from it.
• Wrap storage get/set in try/catch with error toast and fallback defaults.
• Deduplicate cloud services when user attempts to add an existing URL.

---

_Next: proceed to A2-2 apiClient call-chain analysis._ 
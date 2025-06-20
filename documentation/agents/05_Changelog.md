# 05: Changelog

> Consolidated log of major agent-driven changes, refactors, and bug fixes.

(Imported from `archives/docs_backup/md/agent/07_Changelog.md`; new entries will follow the same format.)

## 2024-06-20: Build Fixes & Core Refactor
*Agent responsible: Gemini*

### Summary
This session focused on a comprehensive review and refactoring of the codebase to align it with the project's documentation, followed by a series of critical bug fixes that culminated in a successful production build.

### Changes & Fixes

1.  **Architectural Cleanup:**
    -   **Deleted `src/config/endpoints.ts`:** This file was a remnant of an old design and contradicted the "Rich Service Definition" architecture. All endpoint logic is now correctly contained within the individual service definition files.
    -   **Refactored Core Types:** The `Service` type in `src/types/index.ts` was refactored to be a clean intersection of `ServiceDefinition` and runtime properties, removing significant code duplication and improving type safety.
    -   **Standardized Service Definitions:** All service definition files in `src/connectors/definitions/` were updated to use consistent named exports (`export const`), resolving import/export mismatches.

2.  **Bug Squashing:**
    -   **Fixed `serviceStore` Logic:** Corrected a type error in `addService` and streamlined the logic for populating default services in `onRehydrateStorage`, making it more robust and aligned with the refactored types.
    -   **Repaired `Tab.tsx` View:** Fixed a major bug where the main chat view always defaulted to the first available chat service. The view now correctly uses the `selectedServiceId` from the store.
    -   **Added `ServiceSelector`:** Integrated the `ServiceSelector` component into the `Tab.tsx` header, allowing users to switch between multiple chat services.
    -   **Fixed `Sidepanel.tsx` Crash:** Resolved a critical bug that prevented the side panel from rendering due to an incorrect lookup of the selected service.

3.  **Build System:**
    -   Systematically debugged and resolved a cascade of build errors related to inconsistent import/export styles across more than half a dozen service definition files. The `npm run build` command now completes successfully.

## 2024-06-19: Critical Stabilization & Dependency Cleanup
*Agent responsible: Gemini 2.5 Pro*

### Summary
This session addressed a catastrophic application failure caused by underlying dependency conflicts. The work involved identifying and resolving these conflicts, fixing the resulting build errors, and repairing the UI, which had become non-functional.

### Changes & Fixes
1.  **Dependency & Build Repair:**
    -   **Resolved `react-markdown`/`remark-gfm` conflict:** Upgraded `remark-gfm` to v4.0.0, which is compatible with `react-markdown` v9 and React 19, fixing the `this.getData is not a function` error.
    -   **Removed `react-beautiful-dnd`:** This unmaintained package was incompatible with React 19 and was preventing all dependency installations. It has been removed.
    -   **Disabled Drag-and-Drop:** The drag-and-drop functionality in `ServiceManagement.tsx` was temporarily removed to allow the build to succeed. This feature needs to be re-implemented with a modern library.

2.  **UI & Functionality Restoration:**
    -   **Fixed `DocsViewer`:** The component now correctly parses the module structure from Vite's glob import and renders markdown content.
    -   **Fixed Popup Buttons:** Repaired the "Tab" and "Panel" buttons by making their `onClick` handlers asynchronous, ensuring all browser operations complete before the popup closes.
    -   **Fixed `DocsViewer` Links:** Internal navigation within the documentation now works correctly.
    -   **Added `tailwindcss/typography` plugin:** Added the plugin to `tailwind.config.js` to enable `prose` styling for markdown.

---
*(Earlier entries omitted for brevity; see archive for full history.)* 
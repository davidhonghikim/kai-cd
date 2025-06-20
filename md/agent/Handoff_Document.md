# Agent Handoff Document & Bug Report

This document summarizes the current state of the `kai-cd` project, including all known bugs, regressions, and pending feature requests. It is intended to provide a clear starting point for the next development session.

## Current State
The codebase has been reverted to the last known stable state, and the `npm run build` command completes successfully. However, numerous issues reported during the last session are present in this build.

---

## **Priority 1: Critical Bugs & Regressions**

These issues must be addressed first as they significantly impact core functionality.

### 1. **API Client Failures & Data Corruption**
- **Symptoms:**
    - `TypeError: Failed to execute 'fetch'... Failed to parse URL from http://:11434...`
    - Service status checks fail.
    - Model lists cannot be fetched.
    - Chat functionality is broken.
    - Remote service IPs do not appear in the tab view header.
- **Root Cause Analysis:** The `ServiceEditor.tsx` component does not validate or sanitize the URL input. Users can enter values like `localhost:11434` without a protocol, which is then saved to the service store. The `apiClient` receives this malformed base URL, causing all subsequent `fetch` requests to fail.
- **Urgent Task:** Implement URL validation and sanitization in `ServiceEditor.tsx`. Ensure all URLs are stored in a valid, absolute format (e.g., `http://localhost:11434`).

### 2. **UI Rendering Crash**
- **Symptom:** `Uncaught TypeError: Cannot read properties of undefined (reading 'map')`.
- **Root Cause Analysis:** The `comfyui.ts` service definition includes a placeholder `LlmChatCapability` with an empty `parameters.chat` array. The `LlmChatView.tsx` component attempts to `.map()` over this `undefined` or empty array when rendering the parameter sidebar, causing a fatal rendering error.
- **Urgent Task:** Remove the placeholder `LlmChatCapability` from the `comfyuiDefinition` in `src/connectors/definitions/comfyui.ts`. ComfyUI does not have a standard chat interface, so this capability is invalid.

---

## **Priority 2: Core Feature Regressions**

### 1. **Chat View UI**
- **Issues:**
    - **Parameter Sidebar:** The button to toggle the chat parameter sidebar is non-functional. The sidebar should also be hidden by default.
    - **`NaN` Values:** Some numeric parameter controls display `NaN` instead of a number.
    - **Mystery Nav Button:** A new, unidentified icon has appeared in the tab view's left navigation. It has no tooltip and opens a blank page.
- **Tasks:**
    - Fix the `onClick` state management for the parameter sidebar in `LlmChatView.tsx`.
    - Investigate the `ParameterControl.tsx` component and the service definitions to find why default numeric values are being parsed as `NaN`.
    - Identify the source of the new navigation button in `Tab.tsx`, determine its purpose, and either fix it (with a tooltip) or remove it.

### 2. **Service & Model Management**
- **Issues:**
    - **Model Selection:** The model selector dropdowns are non-functional (likely due to the API client bug).
    - **Service Status:** The "Check Status" feature is broken.
    - **A1111 View:** The view for `a1111` services is still rendering a blank page instead of the Image Generation UI.
    - **UI Inconsistency:** The service selector dropdown in the tab view is not in sync with the service lists in the popup or the main service manager.
- **Tasks:**
    - After fixing the API client, verify and reconnect the `ModelSelector` component.
    - Re-implement the `handleCheckStatus` logic in `ServiceManagement.tsx` and ensure it provides clear visual feedback (checking, online, offline).
    - Trace the view rendering logic for `a1111` from `switchToTab` to `Tab.tsx` to fix the component loading.
    - Unify the data source for all service selector dropdowns to ensure they are consistent.

---

## **Priority 3: Pending Feature Implementation**

### 1. **Service Manager Enhancements**
- **Features:**
    - **Inline Editor:** The service editor should be an inline, expandable component within the service list, not a separate modal/view.
    - **Archived Services:** Implement a mechanism to view and "unarchive" services that have been archived.
- **Tasks:**
    - Refactor `ServiceManagement.tsx` to render an inline `ServiceEditor` when an "Edit" button is clicked.
    - Add a toggle/button to the Service Manager to show/hide a list of archived services, with an "Unarchive" button for each.

### 2. **UI/UX Polish & Consistency**
- **Goal:** Unify the navigation components into a single, reusable system.
- **Task:** Refactor the navigation in `Popup.tsx` (horizontal) and `Tab.tsx` (vertical) to use a single, configurable `Navigation` component to ensure they share the same look, feel, and functionality. 
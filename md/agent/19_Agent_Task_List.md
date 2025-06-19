# Agent Task List

This document outlines the high-priority tasks for the next agent to continue development of the Kai-CD project.

## Priority 1: UI Polish & Feature Restoration

### 1.1: Re-implement Service Reordering
-   **Context:** The ability to drag-and-drop services in the `Settings > Service Management` view was disabled. The `react-beautiful-dnd` library was unmaintained and broke the build with React 19.
-   **Task:**
    1.  Research a modern, maintained drag-and-drop library for React (e.g., `dnd-kit`).
    2.  Integrate the new library into `ServiceManagement.tsx`.
    3.  Restore the drag-and-drop functionality to allow users to reorder the service list.
    4.  Ensure the new order is persisted correctly in the `serviceStore`.

### 1.2: Improve Documentation Viewer Styles
-   **Context:** The `DocsViewer` component now correctly renders markdown, but the styling is very basic and does not respect the application's themes.
-   **Task:**
    1.  Leverage the `@tailwindcss/typography` plugin (which is already installed).
    2.  Define custom `prose` styles within `tailwind.config.js` or a global CSS file.
    3.  Create distinct styles for light and dark mode (`prose` and `dark:prose-invert`).
    4.  Ensure all elements (headings, links, code blocks, tables) are well-styled and legible in both themes.

## Priority 2: Documentation & Planning

### 2.1: Update UI Redesign Plan
-   **Context:** The document `17_UI_RedesignPlan.md` may be outdated, especially regarding the now-removed drag-and-drop library.
-   **Task:**
    1.  Review the entire document.
    2.  Update any text or Mermaid diagrams that refer to old implementation details.
    3.  Ensure the plan aligns with the current state of the application and the new task to replace the dnd library.

## Priority 3: Code Health

### 3.1: Gradual Component Refactoring
-   **Context:** While the application is stable, some components could benefit from clearer props and state management.
-   **Task:**
    1.  As new features are added or bugs are fixed, take the opportunity to refactor adjacent code.
    2.  Focus on improving type safety, simplifying component logic, and ensuring consistent styling.
    3.  No major refactoring is needed immediately, but continuous improvement should be the goal.

---
*This list was last updated on 2024-06-19 by Gemini 2.5 Pro.* 
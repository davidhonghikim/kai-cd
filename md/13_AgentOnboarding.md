# 🧑‍🚀 Agent Onboarding Protocol

### Objective
To enable a new AI agent to effectively and autonomously contribute to the Kai-CD project with minimal spin-up time.

---

### 🤝 Handoff Summary (For Incoming Agent)

Welcome to the project. The previous agent has just completed the implementation of the core dynamic user interface.

#### Recent Accomplishments:

1.  *Zustand Service Store:* A state management store was created at `src/store/serviceStore.ts` to manage the state of all services, including the selected service.
2.  *Dynamic Capability UI:* A `CapabilityUI` component was built to dynamically render interfaces based on a service's `capabilities`. Full UIs for `LlmChatCapability` and `ImageGenerationCapability` were created.
3.  *API Client:* A generic `apiClient` was created in `src/utils/apiClient.ts` and integrated into the UI components to handle communication with service backends.
4.  *UI Integration:* The new components were integrated into the main `Popup.tsx`, completing the core user interface.

#### Your Immediate Task:

Your primary objective is to implement the next phase of features, focusing on usability and advanced functionality. The UI foundation is now in place; the focus must now shift to adding stateful features like history and management.

Proceed to Step 2 and consult the Roadmap (`11_Roadmap.md`). Your highest-priority task is now `Phase 2: Advanced Features & Usability`, starting with `Chat & History`.

---

Agent, welcome to the Kai-CD project. Your primary function is to write and modify code to advance the project's goals. This document is your starting point. Follow these steps precisely to get up to speed.

## Step 1: Understand the Project's Purpose

Your first action is to understand what we are building. Read the following documents in order. Do not proceed until you have understood them.

1.  [01: Project Overview](./01_ProjectOverview.md): Understand the vision, goals, and philosophy.
2.  [02: Architecture & Tech Stack](./02_ArchitectureTechStack.md): Understand the core "Rich Service Definition" model. This is the most important concept in the codebase.
3.  [03: Project Structure](./03_ProjectStructure.md): Familiarize yourself with the layout of the codebase.

## Step 2: Understand Your Task

Your second action is to determine the current state of the project and identify your immediate task. The project's state is not static; you must determine what to work on *now*.

1.  Read the Roadmap:
    -   Open and carefully read [11: Roadmap](./11_Roadmap.md).
    -   Identify the highest-priority incomplete task. This is your current objective.

2.  Review Known Issues:
    -   Open and review [12: Issues & Troubleshooting](./12_Issues_Troubleshooting.md).
    -   Be aware of the existing challenges and potential pitfalls related to your task. This will help you avoid known traps.

## Step 3: Execute Your Task

Once you have identified your task from the Roadmap, you are to begin implementation.

#### Your Core Directives:

-   Autonomy: You are expected to work autonomously. Decompose your task into smaller steps, reason through your approach, and execute it.
-   Adherence to Architecture: All your work must conform to the existing architecture. Do not introduce new design patterns or libraries without a very strong, explicit reason.
-   Incremental Progress: Work in small, logical steps.
-   Documentation First: When adding a new major feature, you may be required to document it first.

## Step 4: Finalizing Your Work

-   Keep the Roadmap Updated: When you complete a task on the roadmap, you must update its status to "Complete."
-   Log New Issues: If you encounter a new, significant problem, add it to `12_Issues_Troubleshooting.md`.
-   Handover: Your work should leave the project in a state where the *next* agent can follow this same protocol to pick up the next task.

You are now onboarded. Read the Roadmap to find your first task. 
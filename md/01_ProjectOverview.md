# 01_ProjectOverview.md
# kai-cd – Project Overview & Goals

**Vision**: kai-cd is a browser extension that unifies interaction with multiple local or remote AI services (LLMs, image generators, automation pipelines, vector stores) inside a single Open-WebUI-style interface.

**Pain points addressed**
1. Fragmented UIs across different AI tools.
2. Manual copy/paste between services.
3. No central place to store chat logs or generated artefacts.
4. Difficult remote-server management.

**Value proposition**
• Single extension hosts popup, side-panel chat, and full-page tabs embedding remote service UIs.<br/>
• Connector system allows bridging data between services (e.g. LLM prompt → Image Gen API).<br/>
• IndexedDB artefact store with search & metadata.<br/>
• One-click backup & restore of settings and artefacts.

**MVP feature list**
1. Service Manager – add/edit/remove services (OpenAI, Ollama, A1111, ComfyUI, n8n …).
2. Side-panel Chat (LLM) with model selector and streaming answers.
3. Tab view that loads remote service UI via `<iframe>`.
4. Theme switcher (light/dark/rose-pine).
5. Backup / restore JSON file.
6. Automated tests & CI.

Success is defined by: 100 % passing tests, consistent UX, extensible connector API, and ≤ 150-line modules. 
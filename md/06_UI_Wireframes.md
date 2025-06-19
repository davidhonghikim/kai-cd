# 06_UI_Wireframes.md
# kai-cd – UI Wireframes & Interaction Notes

> ASCII wireframes are approximate. Exact spacing/colour/fonts handled by CSS modules + theme variables.

## 1. Popup – Service Manager (default)
```
+--------------------------------------------------+
|  kai-cd  ⌄         🔄 Refresh   ✚ Add Service    |
+--------------------------------------------------+
| [ Online ] OpenAI (openai.com)          ⚙️ Edit  |
| [ Offline] Ollama (http://127.0.0.1)    ⚙️ Edit  |
| [ Online ] ComfyUI (http://...)         ⚙️ Edit  |
+--------------------------------------------------+
|   Import Settings  |  Export Settings  |  Help   |
+--------------------------------------------------+
```
* Clicking **Add Service** opens a modal form (name, type, url, apiKey).
* Row edit icon opens inline form; long-press shows delete.

## 2. Side-panel Chat
```
┌──────────────────────── kai-cd ───────────────────────┐
│ Model: [gpt-4o ▼]      Temp: 0.8   ⚙️ Settings        │
├───────────────────────────────────────────────────────┤
│ User 09:31  > Explain quantum entanglement           │
│ Bot  09:31  < *streaming tokens…*                    │
│ …                                                    │
├───────────────────────────────────────────────────────┤
│ ⏎  Prompt multiline textarea                      »  │
└───────────────────────────────────────────────────────┘
```
* **Settings** opens quick-config (temperature, max tokens, etc.).
* Msg toolbar (hover) shows Copy ▸, Edit ✎, Continue ▶.

## 3. Tab – Service UI Iframe
```
┌──── Service: ComfyUI ────────────────────────────────┐
│ ⟳ Reload │ ⬈ Open in new tab │ Logs │ Back to Popup │
└──────────────────────────────────────────────────────┘
|                                                    |
|            [   remote UI iframe   ]                |
|                                                    |
└────────────────────────────────────────────────────┘
```
* The top strip is injected by the extension; iframe fills remainder.

## Interaction Flow
1. **Add Service** (popup) → background saves entry → Popup re-renders list.
2. **Side-panel prompt** → background → Connector.chat() → stream tokens back → Side-panel renders.
3. **Tab reload** button sends `browser.tabs.reload(iframeTab)` for hard refresh; does not recreate connector.

*Document last updated: <!--timestamp placeholder-->* 
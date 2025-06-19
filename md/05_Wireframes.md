# 05_Wireframes.md
# kai-cd – UI Wire-frames

These ASCII wire-frames capture the layout of core extension surfaces.  Keep them updated when UI changes.

## Popup (Settings)
```
+--------------------------------------------------+
|  kai-cd Popup                                    |
+-------------------+-----------------------------+
| Service List      |  Service Details            |
|  [OpenAI]  ⚙      |  Name  [___________]        |
|  [Ollama] ⚙       |  URL   [___________]        |
|  [+] Add Service  |  API-Key [_________]        |
+-------------------+-----------------------------+
|  Theme:  Light ◉  Dark ○  Rose-Pine ○           |
+--------------------------------------------------+
```

## Side-panel Chat
```
┌────────────────── kai-cd Chat (panel) ────────────────────┐
│  Model: ▼ gemma3:1b          ◇ Clear Chat  ⟳ Regenerate  │
├───────────────────────────────────────────────────────────┤
│  Assistant ▸ Hello, how can I help?                      │
│  User ▸ Draft a haiku about sunrise                      │
│  Assistant ▸ Golden rays appear…                        │
│                                                         │
└─────────────── [ Prompt multiline textbox ] ─────────────┘
```

## Service Tab (Iframe)
```
┌─── Tab: "ComfyUI – remote-gpu" ──────────────────────────┐
│ [◁ Back to Popup]                                        │
├───────────────────────────────────────────────────────────┤
│                       <iframe>                           │
│      (full remote UI loaded from service.url)            │
│                                                         │
└───────────────────────────────────────────────────────────┘
```

These wire-frames are illustrative; exact styling comes from CSS modules and theme variables. 
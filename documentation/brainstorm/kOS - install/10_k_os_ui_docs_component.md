# kOS UI Component – Docs.js

This component displays internal documentation, agent guides, Codex excerpts, and links to markdown or Codex-registered docs via the web UI.

---

## 📁 Component: `Docs.js`
```javascript
import React, { useEffect, useState } from 'react';

export default function Docs() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetch('/docs/list')
      .then(res => res.json())
      .then(setDocs)
      .catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Documentation</h2>
      <ul className="space-y-2">
        {docs.map((doc, i) => (
          <li key={i} className="bg-gray-100 p-3 rounded shadow">
            <a href={`/docs/view/${doc.id}`} className="text-blue-600 underline">
              {doc.title || doc.id}
            </a>
            <p className="text-sm text-gray-600">{doc.summary || 'No summary available'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔧 Backend Support Needed
- `/docs/list` – return list of available documents
- `/docs/view/:id` – serve markdown or rendered HTML
- Optional: `/docs/upload` or Codex-bound upload agent

---

## 🧠 Future Integration
- Markdown viewer with syntax highlighting
- Codex-linked inline glossary or ethics lookup
- Versioning, annotation, and tribal overlays

---

## ✅ Next:
Would you like to scaffold the backend `/docs/list` and `/view` routes, or focus on building the plugin or mesh discovery systems?


# kOS UI Components – AgentList, InstallModal, ConfigDisplay

This document scaffolds core React components used within the kOS frontend for listing active agents, managing install setup, and displaying configuration data.

---

## 📁 Component: `AgentList.js`
```javascript
import React from 'react';

export default function AgentList({ agents }) {
  return (
    <div>
      <h2 className="text-xl font-bold">Active Agents</h2>
      <ul className="mt-2">
        {agents.map((a, i) => (
          <li key={i} className="border p-2 my-1 bg-gray-100">
            {a.id} – Tribe: {a.tribe} – Codex: {a.codex_tier}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📁 Component: `InstallModal.js`
```javascript
import React, { useState } from 'react';

export default function InstallModal({ onInstall }) {
  const [id, setId] = useState('');

  return (
    <div className="border p-4 bg-white shadow-md">
      <h3 className="text-lg font-semibold">Install New Agent</h3>
      <input className="border p-2 w-full" value={id} onChange={e => setId(e.target.value)} placeholder="agent.id.name" />
      <button className="bg-green-600 text-white px-4 py-1 mt-2" onClick={() => onInstall(id)}>Install</button>
    </div>
  );
}
```

---

## 📁 Component: `ConfigDisplay.js`
```javascript
import React from 'react';

export default function ConfigDisplay({ config }) {
  return (
    <pre className="bg-black text-green-300 p-3 text-sm">
      {JSON.stringify(config, null, 2)}
    </pre>
  );
}
```

---

## ✅ Next:
Would you like to scaffold `Docs.js`, `LoginForm.js`, or the plugin framework and mesh onboarding logic?


# kOS Frontend UI – App Entry

This document provides the base React UI entrypoint for the kOS frontend. It includes agent overview, system status, message testing, and plugin integration space.

---

## 📁 File: `web/src/App.js`
```javascript
import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetch('/status')
      .then(res => res.json())
      .then(data => setStatus(data));
  }, []);

  const sendMessage = async () => {
    const res = await fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'agent.receptionist', message })
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div className="p-4 font-mono">
      <h1 className="text-2xl">kOS UI</h1>
      <pre className="bg-black text-white p-2 mt-2">{JSON.stringify(status, null, 2)}</pre>
      <div className="mt-4">
        <input
          className="border p-2 w-full"
          placeholder="Send message to agent..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={sendMessage}>
          Send
        </button>
        <p className="mt-2">Response: <code>{response}</code></p>
      </div>
    </div>
  );
}

export default App;
```

---

## 🧠 Components Coming Soon
- Agent List + Live Status
- Plugin Loader
- Tribe Map + Memory Browser
- Settings + Codex View

---

## ✅ Next:
Shall we scaffold `AgentList.js`, `InstallModal.js`, and other frontend components?


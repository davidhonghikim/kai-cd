# kOS UI Component – LoginForm.js

This document defines the `LoginForm.js` React component used to authenticate users or agents in the kOS web interface. It can support local auth, token auth, or future pluggable identity backends.

---

## 📁 Component: `LoginForm.js`
```javascript
import React, { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (result.success) onLogin(result.token);
    else alert("Login failed");
  };

  return (
    <div className="p-4 border w-full max-w-sm mx-auto bg-white">
      <h2 className="text-lg font-bold mb-2">Login</h2>
      <input className="border p-2 w-full mb-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 w-full" onClick={handleSubmit}>Login</button>
    </div>
  );
}
```

---

## 🛡️ Notes
- To enable login support, backend will need `/auth/login` route
- This can be integrated with local, tribal, or codex-based identity systems
- Auth token should be stored in session or secured cookie for downstream API calls

---

## ✅ Next:
Proceed to scaffold `Docs.js` or begin backend `/auth/login` handler?


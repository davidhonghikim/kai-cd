# kOS UI Server Backend (FastAPI)

This document outlines the backend server implementation using FastAPI for the kOS ecosystem. It provides REST and WebSocket endpoints to manage agents, configuration, authentication, and frontend integration.

---

## 🚀 File: `ui_server.py`
```python
from fastapi import FastAPI, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agents = {}

class AgentRequest(BaseModel):
    id: str
    message: str

@app.get("/status")
def get_status():
    return {"status": "kOS backend online", "agents_loaded": len(agents)}

@app.post("/message")
def send_message(data: AgentRequest):
    agent = agents.get(data.id)
    if not agent:
        return {"error": "Agent not found"}
    response = agent.respond(data.message)
    return {"response": response}

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    while True:
        data = await ws.receive_text()
        await ws.send_text(f"Echo: {data}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 30436))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## 🔐 Features
- CORS enabled for frontend communication
- `/status` endpoint for health checks
- `/message` route to send messages to agents
- `/ws` route for WebSocket support

---

## 📦 Integration
- Frontend connects via `/ws` for live logs and `/message` for task commands
- Can be containerized via `Dockerfile` to run alongside UI and agent layers

---

## ✅ Next Step:
Would you like to generate `web/src/App.js` and UI React components, or create the `Dockerfile` and `docker-compose.yml` build files?


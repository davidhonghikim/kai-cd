# ==============================================
# kOS UI Server (FastAPI Backend)
# ==============================================
# REST + WebSocket + Live Agent Interface
# ==============================================

from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json

app = FastAPI()

# === Allow cross-origin for local/dev ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "kOS UI Server running."}

@app.get("/agents")
async def list_agents():
    return {"agents": ["agent_dev", "agent_creator", "agent_ui"]}

@app.post("/agents/start")
async def start_agent(name: str):
    subprocess.Popen(["python3", f"agents/{name}.py"])
    return {"status": "started", "agent": name}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        response = {"echo": data, "from": "kOS"}
        await websocket.send_text(json.dumps(response))

# === Start via `python3 ui_server.py` ===

# 08_Service_Catalog.md
# kai-cd – Service Catalog & Default End-Points

This catalog enumerates every service type the extension supports out-of-the-box, including the **default local** (192.168.1.159) and **default remote** (192.168.1.180) URLs the UI will suggest when a user adds a service.

> Change ports/IPs as required – these are merely sensible defaults for a homelab with two servers.

## Legend
* Cat. – Category (LLM / Image / Automation / Vector)
* Local – `http://192.168.1.159:<port>`
* Remote – `http://192.168.1.180:<port>`
* API Path – root path the connector will call for health-check or requests

| Service | Cat. | Local | Remote | API Path | Notes |
|---------|------|-------|--------|----------|-------|
| Ollama            | LLM   | :11434 | :11434 | `/api/*` | Local/remote Llama-based models |
| OpenAI Compatible | LLM   | n/a    | `https://api.openai.com` | `/v1/*` | Actual OpenAI or any mimic |
| Open WebUI        | LLM   | :3000  | :3000  | *(iframe)* | UI only, no API call required |
| Llama.cpp server  | LLM   | :8080  | :8080  | `/v1/*` | Compile with `--server --api` |
| vLLM              | LLM   | :8000  | :8000  | `/v1/*` | Fast inference engine |
| LLM Studio        | LLM   | :1234  | :1234  | `/v1/*` | H2O LLM Studio REST |
| Automatic1111     | Image | :7860  | :7860  | `/sdapi/v1/*` | Stable Diffusion Web UI |
| ComfyUI           | Image | :8188  | :8188  | `/` | Graph-based SD |
| n8n               | Auto  | :5678  | :5678  | `/api/v1` | Automation workflows |
| TailScale         | Auto  | n/a    | n/a    | `/api/v2/*` | Example remote network tool |
| Qdrant            | Vec   | :6333  | :6333  | `/` | REST / gRPC open-source vector DB |
| ChromaDB          | Vec   | :8000  | :8000  | `/api` | Python/HTTP vector DB |
| Milvus            | Vec   | :19530 | :19530 | gRPC | Large-scale vector store |
| Elasticsearch     | Vec   | :9200  | :9200  | `/_cluster/health` | Also usable for full-text |

### Adding a new Service Type
1. Implement a connector in `src/connectors/<category>/<name>Connector.ts` following `BaseConnector` interface.
2. Register dynamic import mapping in `ConnectorManager`.
3. Update this table so future agents know default port/IP.

### Health-check rules
* LLM connectors must implement a `connect()` ping to `/models` or `/v1/models`.
* Image gen connectors ping `/sdapi/v1/sd-models` (A1111) or `/` for Comfy (HTTP 200 JSON).
* Vector DB connectors use cluster-health or `/api/v1/whoami` (Qdrant).

*Document last updated: <!--timestamp placeholder-->* 
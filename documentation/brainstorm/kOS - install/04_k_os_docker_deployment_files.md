# kOS Docker Deployment Files

This document defines the containerization files required to launch the kOS system stack using Docker and Compose, enabling consistent deployment of the backend, frontend, and agent layers.

---

## 🐳 `Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 30436
CMD ["python", "ui_server.py"]
```

---

## 📦 `docker-compose.yml`
```yaml
version: '3.9'
services:
  kos-ui:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "30436:30436"
    environment:
      - PG_HOST=db
      - PG_USER=postgres
      - PG_PASS=postgres
      - PG_DB=kos_memory
    depends_on:
      - db

  db:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kos_memory
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 🧪 Notes
- Ports can be remapped via `.env`
- Logs and volumes are persistent
- Additional services (Weaviate, Chroma) can be added per layer

---

## ✅ Next
Would you like to scaffold the `web/src/App.js` frontend UI or move to the `configs/defaults.yaml` and `.env` system?


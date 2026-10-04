# Mnemos

**Temporal Memory & Knowledge Graph for AI Agents**

Mnemos is a lightweight portfolio POC of a persistent memory layer for AI agents. It stores semantic, episodic, and procedural memories with temporal state, provenance, supersession relationships, and a knowledge-graph visualization — without Redis, Neo4j, vector databases, or LLM dependency.

> This is explicitly a **proof of concept**, not production memory infrastructure.

## Why ordinary agent memory is insufficient

Most chatbot “memory” is either a chat transcript or a vector store of embeddings. That loses:

- **What is currently true** vs what used to be true
- **Why** a fact was recorded (provenance)
- **How** knowledge changed over time (temporal state)
- **How** facts relate (graph relationships)

Mnemos models those concerns directly.

## Memory types

| Type | Meaning | Example |
|------|---------|---------|
| **Semantic** | Stable facts / preferences | “PostgreSQL is the primary database.” |
| **Episodic** | Events that happened | “Previous deployment failed due to expired credentials.” |
| **Procedural** | How things are done | “The repository uses pnpm.” |

## Temporal memory & supersession

June 2026: *User prefers MongoDB.*  
August 2026: *PostgreSQL is the primary database.*

Mnemos marks MongoDB as `SUPERSEDED`, PostgreSQL as `CURRENT`, and links them with a `SUPERSEDES` relation. The UI surfaces this as a timeline and graph edge.

## Provenance

Each memory carries `source`, `source_type`, timestamps, and confidence so you can inspect *where a belief came from*.

## Architecture

```
Next.js UI  →  FastAPI REST  →  Service layer  →  SQLite
```

Service modules (lightweight, not separate engines):

- `memory_service` — CRUD + search
- `temporal_service` — supersession + history chains
- `provenance_service` — source / related assembly
- `classifier` — rule-based type classification

## Tech stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Lucide, Recharts, React Flow
- **Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic
- **Package manager:** npm (frontend)

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On startup the API creates `mnemos.db` and seeds ~28 demo memories if the DB is empty.

Optional re-seed:

```bash
cd backend && source .venv/bin/activate && python seed.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

API base URL defaults to `http://127.0.0.1:8000`. Copy `frontend/.env.example` to `frontend/.env.local` to override it.

### Docker Compose (optional)

```bash
docker compose up --build
```

## API examples

```bash
# List memories
curl http://127.0.0.1:8000/api/memories

# Search
curl "http://127.0.0.1:8000/api/memories/search?q=PostgreSQL"

# Temporal history
curl http://127.0.0.1:8000/api/memories/mem_postgres/history

# Agent recall
curl -X POST http://127.0.0.1:8000/api/agent/recall \
  -H 'Content-Type: application/json' \
  -d '{"query":"What database does the project currently use?"}'

# Create a memory
curl -X POST http://127.0.0.1:8000/api/memories \
  -H 'Content-Type: application/json' \
  -d '{"content":"User prefers TypeScript strict mode.","confidence":0.9}'
```

## Screens

1. **Overview** — counts, search, recent memories, evaluation snapshot  
2. **Memories** — filterable explorer + detail (temporal / provenance / related)  
3. **Timeline** — month-grouped chronological view  
4. **Knowledge Graph** — React Flow visualization of relations  
5. **Agent Interface** — remember / recall / history / forget playground  
6. **Memory Health / Configuration** — demo metrics + static config  

## What is real vs simulated

| Feature | Status |
|---------|--------|
| SQLite persistence | Real |
| CRUD / search | Real |
| Types, status, supersession | Real |
| Timeline / provenance / relations | Real |
| Knowledge graph visualization | Real |
| MCP-style agent endpoints | Lightweight |
| Rule-based classification | Simplified |
| Evaluation metrics | Demo values only |
| Embeddings / vector DB / LLM extraction | Not implemented |

## Limitations & future extensions

- No embeddings or semantic retrieval beyond keyword search  
- No production MCP server SDK  
- No multi-agent sync or auth  
- Temporal inference is deterministic supersession only  
- Evaluation Snapshot metrics are seeded for demo  

Possible extensions: embeddings + hybrid recall, real MCP server, LLM-assisted extraction with human override, conflict detection, multi-agent namespaces.

Design notes for the demo story and product scope are in [`spec.md`](spec.md).

## License

MIT

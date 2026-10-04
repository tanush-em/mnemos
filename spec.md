Mnemos — POC Pack

Temporal Memory & Knowledge Graph for AI Agents

A lightweight POC demonstrating how an AI agent can store, retrieve, update, supersede, and trace memories over time.

1. What we're actually building

The POC is essentially a Memory Console for an AI agent.

A user can:

Add a memory.
View all memories.
Search memories.
See how a memory changed over time.
Inspect relationships between memories.
See why/where a memory came from.
See which memory is currently considered true.

That's enough.

The deeper AI architecture is represented conceptually in the UI, rather than fully implemented.

The demo story

We preload Mnemos with something like:

June 2026

User prefers MongoDB for rapid prototyping.

Then:

August 2026

User migrated the project to PostgreSQL.

Mnemos displays:

MongoDB
   │
   │ superseded by
   ▼
PostgreSQL
   │
   └── CURRENT

And the user can inspect:

Why is PostgreSQL considered current?

Source:
Project configuration

Recorded:
Aug 18, 2026

Supersedes:
MongoDB preference

Confidence:
0.94

That single workflow sells the entire concept.

2. Product positioning
Name

Mnemos

Tagline

Memory infrastructure for intelligent agents.

Alternative:

Give agents a memory that knows what changed.

One-line description

Mnemos is a lightweight temporal memory layer that helps AI agents store, retrieve, track, and reason over persistent memories with provenance and temporal state.

3. Tech stack

Keep this extremely simple.

Frontend
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
Recharts
Backend

FastAPI

Database

SQLite

ORM

SQLAlchemy

Optional AI layer

Do not make the application dependent on an LLM.

Instead:

Memory Input
     ↓
FastAPI
     ↓
Memory Classifier
     ↓
SQLite

The classifier can initially use simple rules.

For example:

"I prefer..."
    → semantic

"Yesterday deployment failed..."
    → episodic

"This repo uses..."
    → procedural

You can later replace this with an LLM.

Why this stack?

Because the whole application can be started with:

npm run dev

and

uvicorn app.main:app --reload

No Redis.

No Neo4j.

No vector DB.

No Kafka.

No complicated cloud infrastructure.

4. Architecture

Keep the architecture visually impressive but technically lightweight.

                 ┌───────────────────────┐
                 │       Mnemos UI       │
                 │    Next.js / React     │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │      Memory API       │
                 │        FastAPI        │
                 └───────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │  Memory    │ │ Temporal   │ │ Provenance │
       │  Engine    │ │  Engine    │ │  Tracker   │
       └────────────┘ └────────────┘ └────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌─────────────────┐
                    │     SQLite      │
                    │ Memory + Graph  │
                    └─────────────────┘

Important:

Don't actually build separate complicated engines.

These can simply be Python service modules.

5. Core data model

This is where the POC gets interesting.

Memory
id
content
type
status
confidence
created_at
valid_from
valid_until
source
source_type
Types
SEMANTIC
EPISODIC
PROCEDURAL
Status
CURRENT
SUPERSEDED
ARCHIVED

Example:

{
  "id": "mem_018",
  "content": "The project uses PostgreSQL.",
  "type": "SEMANTIC",
  "status": "CURRENT",
  "confidence": 0.94,
  "valid_from": "2026-08-18",
  "source": "Project configuration"
}
6. Relationships

You don't need Neo4j.

Create a simple SQLite table:

memory_relations

with:

id
source_memory_id
target_memory_id
relation_type
created_at

Possible relationships:

SUPERSEDES
RELATED_TO
DERIVED_FROM
CONTRADICTS
SUPPORTS

So:

Memory A
   │
   │ SUPERSEDES
   ▼
Memory B

This gives you the knowledge graph concept without actually building a graph database.

7. The most important feature: Temporal Memory

This is what differentiates Mnemos from:

"I added a vector database to my chatbot."

Suppose we have:

Memory 1
User prefers MongoDB.
June 10
CURRENT

Later:

Memory 2
User migrated the project to PostgreSQL.
August 18
CURRENT

Mnemos automatically changes:

MongoDB
SUPERSEDED

and:

PostgreSQL
CURRENT

The UI shows:

Memory Timeline

June
● MongoDB preference
│
│ superseded
│
August
● PostgreSQL
  CURRENT

That's the centerpiece of the demo.

8. Screens

Don't build 15 screens.

Build 5.

Screen 1 — Memory Overview

Dashboard.

┌─────────────────────────────────────────────────────┐
│ MNEMOS                              Agent: default   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  128             43              31              54 │
│ Memories      Semantic        Episodic       Procedural│
│                                                     │
├─────────────────────────────────────────────────────┤
│ Search memories...                    [+ Add Memory] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ● PostgreSQL is the primary database                │
│   SEMANTIC   CURRENT   94%                          │
│                                                     │
│ ● Production deployment failed due to timeout      │
│   EPISODIC   CURRENT   87%                          │
│                                                     │
│ ● Repository uses pnpm                              │
│   PROCEDURAL CURRENT   99%                          │
│                                                     │
└─────────────────────────────────────────────────────┘
9. Screen 2 — Memory Explorer

Click a memory.

Show:

PostgreSQL is the primary database

SEMANTIC
CURRENT
Confidence: 94%

────────────────────────────

Temporal State

Valid from
Aug 18, 2026

Previously
MongoDB is the primary database

Superseded
Aug 18, 2026

────────────────────────────

Provenance

Source
Project configuration

Recorded by
Mnemos Memory Engine

Evidence
Database configuration

────────────────────────────

Related Memories

PostgreSQL migration
Production database
Backend architecture

This screen is extremely important for the resume/demo.

10. Screen 3 — Knowledge Graph

A beautiful graph visualization.

Example:

              ┌──────────────┐
              │ PostgreSQL   │
              └──────┬───────┘
                     │
                SUPPORTS
                     │
                     ▼
             ┌───────────────┐
             │ Backend Stack │
             └───────┬───────┘
                     │
                  RELATED
                     │
                     ▼
             ┌───────────────┐
             │ FastAPI       │
             └───────────────┘


MongoDB ────── SUPERSEDED ──────► PostgreSQL

The graph can use seeded data.

It doesn't need sophisticated graph reasoning.

11. Screen 4 — Timeline

This is another major selling point.

MEMORY TIMELINE

JUN 2026
│
├── User prefers MongoDB
│       Semantic
│
├── Repository uses npm
│       Procedural
│
AUG 2026
│
├── Project migrated to PostgreSQL
│       Semantic
│       ↓
│   MongoDB preference superseded
│
├── Repository migrated to pnpm
│       Procedural
│       ↓
│   npm workflow superseded
│
SEP 2026
│
└── Production deployment failed
        Episodic

You can filter:

All
Semantic
Episodic
Procedural
12. Screen 5 — MCP / Agent Interface

This is mostly a demonstration screen.

Call it:

Agent Memory API

Show tools:

┌─────────────────────────────────────┐
│ Mnemos Agent Interface              │
├─────────────────────────────────────┤
│                                     │
│ ● remember                          │
│   Store a new memory                │
│                                     │
│ ● recall                            │
│   Retrieve relevant memories        │
│                                     │
│ ● forget                            │
│   Archive a memory                  │
│                                     │
│ ● history                           │
│   Retrieve temporal memory history  │
│                                     │
└─────────────────────────────────────┘

Then show an example request:

{
  "tool": "recall",
  "query": "What database does the project use?"
}

Response:

{
  "memory": "PostgreSQL",
  "status": "CURRENT",
  "confidence": 0.94,
  "supersedes": "MongoDB"
}

This gives you the MCP angle without needing to build a complete MCP ecosystem.

13. Add Memory modal

This should actually work.

Add Memory

Memory
┌─────────────────────────────────────┐
│ User prefers PostgreSQL             │
└─────────────────────────────────────┘

Type

○ Semantic
○ Episodic
○ Procedural

Source
┌─────────────────────────────────────┐
│ Conversation                        │
└─────────────────────────────────────┘

Confidence
──────●────────── 90%

        [Save Memory]

On save:

POST /memories

and insert into SQLite.

That's enough actual functionality to make the POC legitimate.

14. API

Keep the backend tiny.

Memories
GET /api/memories
GET /api/memories/{id}
POST /api/memories
PATCH /api/memories/{id}
DELETE /api/memories/{id}
Search
GET /api/memories/search?q=postgres
Timeline
GET /api/memories/{id}/history
Graph
GET /api/graph
Agent interface
POST /api/agent/recall
POST /api/agent/remember

That's it.

15. Seed data

This is important because the application should look populated immediately.

Create around 25–30 memories.

Example dataset:

Semantic
User prefers PostgreSQL for production systems.
User is comfortable with React and Next.js.
User prefers FastAPI for AI backends.
The project uses Azure OpenAI.
The production environment runs on Azure.
User prefers TypeScript for frontend development.
Episodic
Previous deployment failed because of an expired API credential.
The August migration caused database connection issues.
A production RAG test revealed poor retrieval quality.
The previous release required a rollback.
Procedural
The repository uses pnpm.
Backend services use Python 3.12.
Environment variables are stored in .env.
Pull requests require CI checks.
The API uses /api/v1 as its base path.

And create relationships.

16. Fake advanced metrics

These can be UI-only.

Dashboard:

Memory Health

Recall Accuracy       94.2%
Conflict Resolution   91.8%
Temporal Consistency  96.1%
Provenance Coverage   88.7%

Don't pretend these are scientifically measured.

Label the section:

Evaluation Snapshot

and use seeded/demo values.

17. What is actually implemented vs simulated

This is important for keeping the project honest.

Feature	POC
SQLite persistence	✅ Real
CRUD memories	✅ Real
Search	✅ Real
Memory types	✅ Real
Memory status	✅ Real
Supersession	✅ Real
Timeline	✅ Real
Provenance	✅ Real
Relationships	✅ Real
Knowledge graph visualization	✅ Real
MCP-style interface	🟡 Lightweight
Embeddings	❌
Vector DB	❌
LLM memory extraction	🟡 Rule-based
Temporal inference	🟡 Simplified
Autonomous consolidation	❌
Production MCP server	❌
Multi-agent memory	❌

This is exactly the level I'd target.

18. Folder structure

Keep it clean:

mnemos/
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── memories/
│   │   ├── graph/
│   │   ├── timeline/
│   │   └── agent/
│   │
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── memory.py
│   │   │   └── relation.py
│   │   │
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── memory_service.py
│   │   │   ├── temporal_service.py
│   │   │   └── provenance_service.py
│   │   │
│   │   └── api/
│   │       ├── memories.py
│   │       ├── graph.py
│   │       └── agent.py
│   │
│   ├── seed.py
│   └── requirements.txt
│
├── README.md
└── docker-compose.yml

Don't over-engineer this.

19. UI design direction

I'd make this look like a developer infrastructure product, not a generic AI chatbot.

Think:

Linear
+
Vercel
+
Langfuse
+
knowledge graph

Dark-first interface.

Sidebar:

MNEMOS

Overview
Memories
Timeline
Knowledge Graph
Agent Interface

────────────────

System

Memory Health
Configuration

Top bar:

Mnemos
Memory Engine ● Online

Agent: default-agent

Use lots of:

cards
subtle borders
monospace metadata
badges
timelines
graph nodes
confidence indicators
timestamps

Avoid:

giant AI robot graphics
chat bubbles everywhere
excessive gradients
generic "AI SaaS" aesthetics
20. The 2-minute demo

This is how I'd actually present it.

Step 1

Open dashboard.

"Mnemos is a persistent memory layer for AI agents."

Show:

128 Memories
43 Semantic
31 Episodic
54 Procedural
Step 2

Open:

PostgreSQL is the primary database.

Show:

CURRENT
94% confidence
Step 3

Click:

View History

Show:

MongoDB
June
     ↓
superseded
     ↓
PostgreSQL
August
CURRENT
Step 4

Open graph.

Show:

MongoDB → SUPERSEDED → PostgreSQL
Step 5

Open Agent Interface.

Ask:

What database does the project currently use?

Response:

PostgreSQL

Previous:
MongoDB

Reason:
PostgreSQL migration superseded the previous database preference.

Confidence:
94%

That's your entire pitch.

21. Resume description

I'd put something like:

Mnemos — Temporal Memory & Knowledge Graph for AI Agents
Built a lightweight agent-memory infrastructure POC using FastAPI, SQLite and Next.js that models semantic, episodic and procedural memories with temporal state, provenance, supersession relationships and knowledge-graph visualization. Implemented memory retrieval, lifecycle tracking and agent-facing recall/remember APIs to demonstrate persistent context beyond individual LLM conversations.

Skills/keywords
Agent Memory
Temporal Reasoning
Knowledge Graphs
Context Engineering
MCP
FastAPI
Next.js
SQLite
LLM Systems
AI Infrastructure
22. The single master prompt

This is the important part.

You can give the following directly to Cursor / Claude Code / another coding agent.

Mnemos — Master Build Prompt

Build a polished, lightweight full-stack POC called Mnemos — Temporal Memory & Knowledge Graph for AI Agents.

The goal is NOT to build a production-grade memory infrastructure system. The goal is to create a highly polished, runnable portfolio POC that demonstrates the concepts of persistent agent memory, semantic/episodic/procedural memory, temporal state, supersession, provenance, relationships, and MCP-style agent access.

Prioritize SPEED, POLISH, and DEMONSTRABILITY over sophisticated AI infrastructure.

PRODUCT CONCEPT

Mnemos acts as a persistent memory layer for an AI agent.

It stores memories such as:

Semantic: "The project uses PostgreSQL."
Episodic: "The previous deployment failed because of an expired API credential."
Procedural: "This repository uses pnpm."

The key differentiator is temporal state.

Example:

June:
"The project uses MongoDB."

August:
"The project migrated to PostgreSQL."

Mnemos should represent MongoDB as SUPERSEDED and PostgreSQL as CURRENT.

Each memory should also contain provenance such as source, timestamp, confidence, and related memories.

TECH STACK

Frontend:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
Recharts where useful

Backend:

Python
FastAPI
SQLAlchemy
SQLite

Do NOT introduce Redis, PostgreSQL, Neo4j, vector databases, Kafka, LangChain, or other unnecessary infrastructure.

The entire POC must run locally with minimal setup.

ARCHITECTURE

Use:

Next.js frontend
↓
FastAPI REST API
↓
Service layer
↓
SQLite

Create simple backend modules for:

memory management
temporal state
provenance
relationships

These should remain lightweight.

DATABASE

Create two primary tables.

memories

Fields:

id
content
memory_type
status
confidence
source
source_type
created_at
valid_from
valid_until

memory_type values:

SEMANTIC
EPISODIC
PROCEDURAL

status values:

CURRENT
SUPERSEDED
ARCHIVED

memory_relations

Fields:

id
source_memory_id
target_memory_id
relation_type
created_at

relation_type values:

SUPERSEDES
RELATED_TO
DERIVED_FROM
CONTRADICTS
SUPPORTS

Implement real SQLite persistence.

TEMPORAL LOGIC

Implement a simple supersession mechanism.

When a new memory is added that explicitly supersedes another memory:

mark the old memory as SUPERSEDED
set its valid_until
mark the new memory CURRENT
create a SUPERSEDES relation

Do not attempt sophisticated temporal reasoning.

Simple deterministic logic is sufficient.

MEMORY CLASSIFICATION

Implement lightweight rule-based classification.

Examples:

"I prefer..."
"user likes..."
"user uses..."
→ SEMANTIC

"previous deployment..."
"yesterday..."
"last incident..."
"the release failed..."
→ EPISODIC

"repository uses..."
"run this command..."
"deployment requires..."
"workflow uses..."
→ PROCEDURAL

Allow the user to manually override the classification.

Do NOT make the application dependent on an LLM.

API

Implement:

GET /api/memories
GET /api/memories/{id}
POST /api/memories
PATCH /api/memories/{id}
DELETE /api/memories/{id}

GET /api/memories/search?q=

GET /api/memories/{id}/history

GET /api/graph

POST /api/agent/remember

POST /api/agent/recall

The agent endpoints should provide a lightweight MCP-style conceptual interface, but do not build a full production MCP server.

FRONTEND

Create a polished developer-infrastructure style UI.

Dark-first design inspired by products such as Linear, Vercel and Langfuse.

Avoid generic AI chatbot aesthetics.

Use:

subtle borders
cards
badges
monospace metadata
timelines
graph visualization
confidence indicators
clean typography
restrained accent colors

Create a persistent sidebar:

MNEMOS

Overview
Memories
Timeline
Knowledge Graph
Agent Interface

System

Memory Health
Configuration

Top navigation should show:

Mnemos
Memory Engine ● Online
Agent: default-agent

SCREEN 1 — OVERVIEW

Display:

128 Memories
43 Semantic
31 Episodic
54 Procedural

These numbers can be generated from seeded data.

Include a search field.

Include "Add Memory" button.

Show recent memories.

Each memory card should display:

content
type
status
confidence
timestamp
SCREEN 2 — MEMORY EXPLORER

Create a searchable memory table/list.

Filters:

All
Semantic
Episodic
Procedural
Current
Superseded

Clicking a memory opens a detail panel/page.

Detail page should show:

Memory content
Type
Status
Confidence

Temporal State:
Valid from
Valid until
Superseded by
Previously superseded memory

Provenance:
Source
Source type
Created timestamp

Related Memories

SCREEN 3 — MEMORY DETAIL

For an example memory:

"PostgreSQL is the primary database."

Display:

SEMANTIC
CURRENT
94% confidence

Temporal history:

June 2026
MongoDB is the primary database

August 2026
PostgreSQL is the primary database

Show:

MongoDB → SUPERSEDED → PostgreSQL

Create a visually polished timeline.

SCREEN 4 — KNOWLEDGE GRAPH

Create a visual relationship graph using a lightweight React graph visualization library or a simple SVG/canvas implementation.

Seed relationships such as:

MongoDB
↓ SUPERSEDED BY
PostgreSQL

PostgreSQL
↓ SUPPORTS
Backend Architecture

Backend Architecture
↓ RELATED TO
FastAPI

Show nodes with different visual treatments based on memory type.

Clicking a node should show the corresponding memory.

The graph does not need advanced graph algorithms.

SCREEN 5 — TIMELINE

Create a chronological memory timeline.

Example:

JUN 2026

User prefers MongoDB
SEMANTIC

Repository uses npm
PROCEDURAL

AUG 2026

Project migrated to PostgreSQL
SEMANTIC

MongoDB preference superseded

Repository migrated to pnpm
PROCEDURAL

npm workflow superseded

SEP 2026

Production deployment failed because of expired credentials
EPISODIC

Add filters for:
All
Semantic
Episodic
Procedural

SCREEN 6 — AGENT INTERFACE

Create a developer-oriented page titled:

Agent Memory Interface

Show available tools:

remember
Store a new memory

recall
Retrieve relevant memories

history
Retrieve temporal memory history

forget
Archive a memory

Include a request/response playground.

Example:

Request:

{
"tool": "recall",
"query": "What database does the project currently use?"
}

Response:

{
"memory": "PostgreSQL",
"status": "CURRENT",
"confidence": 0.94,
"supersedes": "MongoDB",
"reason": "A later migration memory superseded the previous database preference."
}

The interface can use the real backend endpoints.

ADD MEMORY

Implement a working modal.

Fields:

Memory content
Type
Source
Source type
Confidence

Button:

Save Memory

Saving must persist the memory in SQLite.

SEED DATA

Create approximately 25–30 realistic memories.

Include semantic memories such as:

User prefers PostgreSQL for production systems.
User is comfortable with React and Next.js.
User prefers FastAPI for AI backends.
The project uses Azure OpenAI.
The production environment runs on Azure.
User prefers TypeScript for frontend development.

Episodic memories:

Previous deployment failed because of an expired API credential.
The August migration caused database connection issues.
A production RAG test revealed poor retrieval quality.
The previous release required a rollback.

Procedural memories:

The repository uses pnpm.
Backend services use Python 3.12.
Environment variables are stored in .env.
Pull requests require CI checks.
The API uses /api/v1 as its base path.

Create temporal supersession examples:

MongoDB → PostgreSQL
npm → pnpm

Create related/supporting relationships between other memories.

MEMORY HEALTH

Create a small dashboard section called:

Evaluation Snapshot

Display:

Recall Accuracy 94.2%
Temporal Consistency 96.1%
Conflict Resolution 91.8%
Provenance Coverage 88.7%

These are DEMO VALUES only.

Do not claim that they are scientifically evaluated.

Add a subtle label indicating they are evaluation/demo metrics.

IMPORTANT SCOPE LIMITS

Do NOT implement:

production vector search
embeddings
Neo4j
distributed memory
autonomous memory consolidation
sophisticated temporal reasoning
multi-agent memory synchronization
real-world authentication
complex authorization
production MCP infrastructure
LLM-dependent memory extraction

The project should remain a lightweight POC.

README

Create a professional README explaining:

What Mnemos is
Why ordinary agent memory is insufficient
Semantic vs episodic vs procedural memory
Temporal memory
Supersession
Provenance
Knowledge graph relationships
Architecture
Tech stack
Running locally
API examples
Limitations
Future extensions

Explicitly describe this as a POC.

RUNNING

Make local setup simple.

Frontend:

npm install
npm run dev

Backend:

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main --reload

Ensure database initialization and seed data happen automatically or through one simple command.

FINAL QUALITY BAR

The application should feel like a legitimate developer infrastructure product rather than a student CRUD application.

Prioritize:

polished UI
coherent information architecture
excellent seeded demo data
convincing temporal memory visualization
working CRUD/search
graph visualization
agent interface
clean code structure

The application should be immediately demoable after setup.

Do not stop after creating boilerplate. Build the complete runnable POC, seed it with realistic data, connect the frontend to the backend, and ensure all primary interactions work.

23. What I would not add

This is important.

Don't let the coding agent convince you that you need:

LangGraph
+
LangChain
+
Qdrant
+
Neo4j
+
Redis
+
Postgres
+
OpenAI embeddings
+
MCP SDK
+
Celery
+
Kafka

That would turn a 2–3 day portfolio POC into a 2–3 week engineering project without making the resume significantly better.

The strongest part of Mnemos isn't the number of technologies.

It's the conceptual model:

MEMORY
   ↓
TYPE
   ↓
TEMPORAL STATE
   ↓
RELATIONSHIP
   ↓
PROVENANCE
   ↓
CURRENT TRUTH

That's what makes it look like an AI systems engineering project rather than another RAG chatbot.

The final portfolio architecture should therefore be:
                 MNEMOS
        Temporal Agent Memory
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
    Semantic  Episodic  Procedural
       │         │         │
       └─────────┼─────────┘
                 ↓
        Temporal State
                 ↓
      Current / Superseded
                 ↓
       Provenance + Graph
                 ↓
          Agent Interface

This is the version I'd actually build for your portfolio. It gives you a credible story around agent memory + knowledge graphs + temporal reasoning + provenance + MCP/context engineering, while keeping the implementation small enough that a coding agent can produce most of it in one pass.
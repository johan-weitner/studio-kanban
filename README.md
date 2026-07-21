# Studio Kanban

A Kanban board for music production. Organize projects, songs, and tasks with configurable columns.
Intended for personal local use, hence no authentication or user management. But it can of course be hosted in the cloud as well.
**Demo**: [Go here](https://studio-kanban-verdant-harborlight-7283.fly.dev/).

## Quick Start

```bash
docker compose up --build
```

Open http://localhost:5173

> The database is created automatically on first run and persisted in a Docker volume.

## Data Structure

- **Project** — a music project (e.g. an album)
- **Song** — a track within the project (swimlane row on the board)
- **Task** — a unit of work within a song (Kanban card)
- **Subtask** — checklist item within a task

Columns are configurable per project. Defaults: Pending → In Progress → Done → Discarded.

## Development

| Service  | URL                                    |
|----------|----------------------------------------|
| Frontend | http://localhost:5173                  |
| Backend  | http://localhost:3001                  |
| API spec | http://localhost:3001/api/openapi.json |

To regenerate frontend TypeScript types after backend changes:

```bash
cd frontend && npm run generate:api
```

## Screenshot
![Studio Kanban Screenshot](./assets/studio-kanban-screenshot.png)

## Stack

- **Frontend**: Vite + React + TypeScript, Zustand, TanStack Query, Radix UI, @dnd-kit
- **Backend**: Express + TypeScript, Drizzle ORM + SQLite (better-sqlite3)
- **API**: REST with auto-generated OpenAPI 3.1 spec

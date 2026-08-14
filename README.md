# BabyCheck

Monorepo baby event tracker: feeding, diaper, sleep, weight, medication, and pumping — with a visual week diary, filters, and a personal to-do list.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TanStack Query, React Router, Tailwind CSS v4 |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Drizzle |
| Auth | JWT (email + password) |
| Shared | `@babycheck/shared` (Zod schemas + TypeScript types) |

## Structure

```
BabyCheckapp/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # React SPA
├── packages/
│   └── shared/       # Shared types & validation
├── docker-compose.yml
├── setup-windows.cmd
└── package.json      # npm workspaces root
```

## Features

### Authentication & profiles

- Email/password **register** and **login** with JWT sessions
- **Baby profile**: name, birth date, gender — edited in a centered blur modal
- **Baby photo upload** (stored on the server) with optional remove
- Tiled **photo background** on the diary page (subtle repeat behind the grid)
- **Circular avatar** next to the baby’s name in the diary header

### Diary (home)

- **7-day week view** with a 24-hour time axis (`00:00`–`23:00`)
- Day columns **stretch evenly** across the grid width
- **Week navigation**: previous week, today, next week
- Tap an **hour slot** to log an event at that time
- **Boy / girl theme** toggle (blue / pink) with CSS variables
- **Responsive layout**: sticky top nav, bottom nav on mobile, slide-in drawers for filters and to-dos

### Logging & editing events

- **Log events** modal (blur overlay) — log **multiple events at the same timestamp** in one save
- Event types: feeding, diaper, sleep, weight, medication, pumping (see payloads below)
- **Click an event** to edit or delete (blur modal)
- **Drag and drop** events to a new day/time on the grid (15-minute snap)
- Events at the **same time** render **side by side** in the day column
- Each event tile shows the **exact time** (`HH:MM`, 24h) plus a short summary

### Event filters (left sidebar)

- Sticky **filter panel** stays visible while scrolling the diary
- Filter by **category** with expandable sub-options:
  - **Feeding** — breast, bottle, mixed
  - **Diaper** — wet only, dirty only, wet & dirty
  - **Sleep**, **weight**, **pumping** — whole category
  - **Medication** — per medication name (from logged events that week)
- Count badges per filter for the current week
- Mobile: **Filter events** button opens a left drawer

### To-do list (right sidebar)

- Per-user **to-do list** stored in PostgreSQL
- Add, complete, remove, and **clear completed** tasks
- Sticky panel on desktop; **To-do list** button opens a right drawer on mobile

### Navigation

- **Logout** in the top navbar
- **Profile** and **Log** from top nav (desktop) and bottom nav (mobile)

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (pick one option below)

### PostgreSQL options

| Option | Best for |
|--------|----------|
| **Docker Desktop** | Easiest if you install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) |
| **PostgreSQL installer** | No Docker — [download PostgreSQL for Windows](https://www.postgresql.org/download/windows/) |
| **Neon / Supabase** | Free cloud DB — paste connection string into `apps/api/.env` |

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment files**

   **Windows (CMD):**

   ```cmd
   setup-windows.cmd
   ```

   Or manually:

   ```cmd
   copy .env.example .env
   copy apps\api\.env.example apps\api\.env
   ```

   **Mac / Linux / Git Bash:**

   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   ```

   Update `JWT_SECRET` in `apps/api/.env` before production.

3. **Start PostgreSQL**

   **With Docker Desktop:**

   ```bash
   npm run db:up
   ```

   **With local PostgreSQL installer**, create a database and user, then set `DATABASE_URL` in `apps/api/.env`, for example:

   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/babycheck
   ```

   Create the database in `psql` or pgAdmin:

   ```sql
   CREATE DATABASE babycheck;
   ```

4. **Run migrations**

   ```bash
   npm run db:migrate
   ```

5. **Start dev servers** (API on :3001, web on :5173)

   ```bash
   npm run dev
   ```

   Open the URL Vite prints (usually http://localhost:5173). If that port is busy, it may use 5174 instead.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user |
| GET/POST | `/api/babies` | Yes | List / create babies |
| GET/PATCH/DELETE | `/api/babies/:id` | Yes | Baby CRUD |
| POST | `/api/babies/:id/photo` | Yes | Upload baby photo (`multipart/form-data`, field `photo`) |
| DELETE | `/api/babies/:id/photo` | Yes | Remove baby photo |
| GET/POST | `/api/babies/:babyId/events` | Yes | List / log events (query: `from`, `to`, `type`, `limit`, `offset`) |
| GET/PATCH/DELETE | `/api/events/:id` | Yes | Single event |
| GET | `/api/babies/:babyId/stats/today` | Yes | Today's summary |
| GET | `/api/todos` | Yes | List current user's to-dos |
| POST | `/api/todos` | Yes | Create to-do (`{ "text": "..." }`) |
| PATCH | `/api/todos/:id` | Yes | Update to-do (`text`, `completed`) |
| DELETE | `/api/todos/:id` | Yes | Delete to-do |
| DELETE | `/api/todos/completed` | Yes | Delete all completed to-dos |

Uploaded baby photos are served from `/uploads/babies/` (proxied to the API in dev).

## Event types

| Type | Payload |
|------|---------|
| `feeding` | `method` (breast \| bottle \| mixed), `amountMl?`, `side?`, `durationMinutes?` |
| `diaper` | `wet`, `dirty` |
| `sleep` | `durationMinutes` (manual entry) |
| `weight` | `weightKg` |
| `medication` | `name`, `dose` |
| `pumping` | `amountMl`, `side?`, `durationMinutes?` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web |
| `npm run build` | Build all packages |
| `npm run db:up` | Start Postgres via Docker |
| `npm run db:down` | Stop Postgres container |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

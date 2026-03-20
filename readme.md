# CollabBoard

A real-time collaborative project management app — Kanban boards, infinite canvas whiteboards, activity feeds, and analytics. Built as a full-stack portfolio project.

---

## Features

- **Kanban boards** — drag-and-drop tasks across status columns, filters, search
- **Task detail panel** — assignee, due date, priority, comments
- **Real-time collaboration** — live cursor presence, task updates synced via Socket.io
- **Infinite canvas whiteboard** — sticky notes, shapes, arrows, pan/zoom, undo/redo, export PNG
- **Command palette** — `Ctrl+K` / `⌘K` to navigate anywhere
- **Activity feed** — per-project event log with relative timestamps
- **Notifications** — personal feed of recent activity across all projects
- **Analytics** — task breakdown by status/priority, 14-day creation trend charts
- **Access control** — per-project member management (invite by email, remove members)
- **Workspaces** — multi-workspace support with role-based access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | TanStack Query, Zustand |
| Real-time | Socket.io (client + server) |
| Canvas | react-konva |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | SQLite (dev) · PostgreSQL via Supabase (prod) |
| Auth | JWT (bcrypt passwords) |
| Hosting | Vercel (frontend) · Render (backend) · Supabase (database) |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### 1. Clone & install

```bash
git clone https://github.com/your-username/CollabBoard.git
cd CollabBoard

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env — defaults work for local SQLite dev

# Client
cp client/.env.example client/.env
# VITE_API_URL=http://localhost:3001  (already set)
```

### 3. Set up the database

```bash
cd server
npm run db:push      # create SQLite DB from schema
npm run db:seed      # optional: seed demo data
```

### 4. Run

```bash
# Terminal 1 — backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5174)
cd client && npm run dev
```

---

## Deployment (Free Tier)

The app deploys entirely for free:

| Service | What it runs | Free tier limits |
|---|---|---|
| [Vercel](https://vercel.com) | React frontend | Unlimited static deploys |
| [Render](https://render.com) | Express + Socket.io API | 750 hrs/month, sleeps after 15 min idle |
| [Supabase](https://supabase.com) | PostgreSQL database | 500 MB storage, 2 projects |

### Step 1 — Supabase (Database)

1. Create a free account at [supabase.com](https://supabase.com)
2. New project → choose a region close to your users
3. Once provisioned, go to **Settings → Database → Connection string → URI**
4. Copy the connection string — looks like:
   ```
   postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
   ```
5. Keep this for the Render step.

### Step 2 — Render (Backend API)

1. Create a free account at [render.com](https://render.com)
2. **New → Web Service** → connect your GitHub repo
3. Render will detect `render.yaml` automatically. Confirm:
   - **Root directory:** `server`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
4. Set environment variables:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string |
   | `JWT_SECRET` | Click "Generate" |
   | `CLIENT_URL` | Your Vercel URL (fill after Step 3) |
5. Deploy. After deploy succeeds, open the Render **Shell** tab and run:
   ```bash
   npx prisma migrate deploy
   ```
6. Note your Render service URL (e.g. `https://collabboard-api.onrender.com`).

### Step 3 — Vercel (Frontend)

1. Create a free account at [vercel.com](https://vercel.com)
2. **New Project** → import your GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render URL from Step 2 |
5. Deploy. Copy the Vercel URL and update `CLIENT_URL` in Render.

> **Note:** The Render free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake.

---

## Project Structure

```
CollabBoard/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── kanban/      # KanbanBoard, TaskDetailPanel, TaskCard
│   │   │   ├── layout/      # Header, Sidebar
│   │   │   ├── projects/    # ProjectMembersPanel
│   │   │   ├── command/     # CommandPalette
│   │   │   ├── notifications/ # NotificationsDropdown
│   │   │   ├── activity/    # ActivityFeed
│   │   │   └── realtime/    # CursorOverlay, PresencePill
│   │   ├── context/         # CommandPaletteContext
│   │   ├── hooks/           # useProjects, useWorkspaces, useRealtimeTasks, etc.
│   │   ├── lib/             # socket.ts
│   │   ├── pages/           # Dashboard, Projects, WhiteboardPage, AnalyticsPage, Settings
│   │   └── types/           # api.ts, socket.ts
│   └── .env.example
│
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts
│   ├── src/
│   │   ├── routes/          # auth, workspaces, projects, tasks, comments, whiteboard, activity
│   │   ├── middleware/       # auth.ts (JWT verify)
│   │   ├── lib/             # socketServer.ts
│   │   └── index.ts
│   └── .env.example
│
├── render.yaml              # Render deployment config
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## API Reference

Base URL: `http://localhost:3001/api`

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/workspaces` | List user's workspaces |
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces/:id/projects` | List projects in workspace |
| GET | `/projects/:id/tasks` | List tasks in project |
| POST | `/projects/:id/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/projects/:id/whiteboard` | Get whiteboard state |
| PUT | `/projects/:id/whiteboard` | Save whiteboard state |
| GET | `/projects/:id/activity` | Project activity log |
| GET | `/projects/:id/analytics` | Project analytics data |
| GET | `/activity/mine` | Personal notification feed |

Interactive docs available at `/api-docs` when running locally.

---

## License

MIT

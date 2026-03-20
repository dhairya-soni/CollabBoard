# Phase Roadmap

CollabBoard is built in **8 sequential phases** with strict review gates.

---

## Phase 0: Design System & Project Skeleton ✅
**Days 1–2 | Status: COMPLETE**

- Tailwind v4 config with full color/font tokens
- Global CSS with dark/light theme support
- 10 UI components: Button, Card, Input, Badge, Avatar, Skeleton, EmptyState, Tooltip, Dialog, DropdownMenu
- Layout shell: AppShell, Sidebar (collapsible + mobile drawer), Header (breadcrumbs + actions)
- Theme toggle (dark/light, persisted to localStorage, respects system preference)
- Design System showcase page at `/design-system`

---

## Phase 1: Database & API Foundation
**Days 3–5 | Status: NOT STARTED**

- Prisma schema: User, Workspace, WorkspaceMember, Project, Task, Comment, Attachment, ActivityLog
- PostgreSQL setup with proper indexes
- Express server with TypeScript
- Authentication (Clerk middleware)
- REST API: Auth, Workspaces, Projects, Tasks, Comments (full CRUD)
- Zod request validation
- Consistent error handling
- Seed script with realistic data
- Swagger API docs

---

## Phase 2: Frontend Shell & Data Fetching
**Days 6–8 | Status: NOT STARTED**

- React Router with protected routes
- TanStack Query setup with caching
- Workspace switcher
- Project list, task list (no drag-drop)
- Task detail side panel
- Settings pages, 404, error boundaries

---

## Phase 3: Kanban Board Core
**Days 9–12 | Status: NOT STARTED**

- Column management (CRUD)
- Task cards with priority/assignee/due date
- @dnd-kit drag-and-drop (between columns + reorder)
- Task detail panel with rich text (TipTap)
- Filtering, sorting, search
- Optimistic updates

---

## Phase 4: Real-time Collaboration + Access Control
**Days 13–16 | Status: ✅ COMPLETE**

### Real-time Collaboration
- Socket.io server attached to HTTP server (in-memory adapter for dev, Redis-ready for prod)
- JWT auth middleware on socket handshake
- Room management: join/leave project rooms on board mount/unmount
- Live task updates: task:move, task:update, task:create, task:delete events → TanStack Query cache invalidation
- Server-side broadcasting pattern: API routes emit after every mutation (not client-side)
- Live cursor tracking (throttled at 50ms / ~20fps) with colored named cursors overlay
- Online presence indicators: stacked avatars + count in board header
- "User is typing" in comments with auto-clear timeout
- Conflict resolution: own-user events filtered client-side to avoid duplicate updates

### Workspace Membership
- Auto-create personal workspace on register (new users always have a workspace)
- Workspace invite by email (admin only) via Settings → Members tab
- Remove workspace member (admin only, cannot remove owner)
- Role system: ADMIN | MEMBER

### Project-level Access Control (Micromanagement)
- `isPrivate` flag on projects (default: workspace-visible)
- `ProjectMember` table: explicit per-project membership (ADMIN | MEMBER | VIEWER)
- Private projects hidden from workspace listing unless user is a ProjectMember
- Privacy toggle from ProjectMembersPanel (gear icon on project card)
- Invite/remove project members by email with role assignment
- **Inline role editing**: change any member's role via dropdown directly in the panel
- **Workspace members list**: shows all workspace members not yet in the project with one-click "Add" button
- **Members button in board header**: manage project members from inside the board without navigating away
- `PATCH /projects/:id/members/:userId` endpoint to change member role
- Creator auto-added as project ADMIN when making a project private
- Lock icon badge on private project cards

---

## Phase 5: Infinite Canvas Whiteboard
**Days 17–21 | Status: ✅ COMPLETE**

- `react-konva` + `konva` for canvas rendering
- Infinite canvas with pan (middle-mouse drag) and zoom (mouse wheel, zoom buttons)
- Tool palette: Select (V), Sticky Note (S), Text (T), Rectangle (R), Circle (C), Arrow (A)
- Click to place sticky/text; click+drag to draw rect/circle/arrow
- Select tool: click to select, drag to move, Transformer handles for resize + rotate
- Double-click to edit text content (floating textarea overlay at canvas coords)
- Delete key to remove selected element
- Undo/Redo stack (Ctrl+Z / Ctrl+Y), 50-state history
- Color palette (6 swatches) per tool; arrow inherits active color
- Dot-grid background with parallax offset to match pan/zoom
- SVG minimap (bottom-right): colored rects for each element + viewport indicator
- Auto-save: debounced 2s → `PUT /api/projects/:id/whiteboard`
- Real-time sync: `whiteboard:update` socket event relayed to all project room members
- Export PNG via Konva `stage.toDataURL()` (2× pixel ratio)
- "Whiteboard" button in board header → `/projects/:id/whiteboard`
- Backend: `Whiteboard` Prisma model (one per project, JSON blob), `GET`/`PUT` endpoints
- Access control reuses `verifyProjectAccess` from projects route

---

## Phase 6: Polish & Advanced Features
**Days 22–25 | Status: ✅ COMPLETE**

### Command Palette (Cmd+K)
- Global `CommandPaletteProvider` context + `useCommandPalette()` hook
- Triggered by Cmd+K / Ctrl+K from anywhere in the app; also a "Jump to…" button in header
- Sections: Navigate (Dashboard, Projects, Analytics, Settings), Projects (with task count), Whiteboards
- Keyboard navigation: ↑↓ arrows, Enter to select, Escape to close
- Live fuzzy search across all items
- Highlighted selected item with arrow indicator

### Activity Feed
- Per-project slide-over panel (Activity button in board header)
- Shows task created/updated/deleted + comment added events with icons and relative timestamps
- Auto-refreshes every 15s
- Enriched activity metadata: title, projectId, changes, taskTitle stored in ActivityLog.metadata
- Activity log populated on: task create, update, delete, comment create

### Notifications
- Real bell icon in header replaces placeholder
- Dropdown showing recent activity from others across all user's projects
- First 3 items highlighted as unread; "Mark all read" button
- Auto-refreshes every 30s
- `GET /api/activity/mine` endpoint

### Analytics
- Dedicated `/analytics` page, linked from sidebar
- Project selector dropdown (defaults to first project)
- Stat cards: Total Tasks, Completed, In Progress, Backlog
- Donut chart: tasks by status (recharts PieChart)
- Bar chart: tasks by priority (recharts BarChart)
- Line chart: task creation trend over last 14 days
- `GET /api/projects/:id/analytics` endpoint

---

## Phase 7: Testing & Deployment
**Days 26–28 | Status: NOT STARTED**

- Vitest unit tests (70%+ coverage)
- Playwright E2E tests
- Docker Compose local dev
- GitHub Actions CI/CD
- Vercel (frontend) + Railway (backend) + Supabase (DB) + Upstash (Redis)
- Sentry error tracking
- PostHog analytics
- Production README with architecture diagram

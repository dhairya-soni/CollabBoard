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

## Phase 4: Real-time Collaboration
**Days 13–16 | Status: NOT STARTED**

- Socket.io server + Redis adapter
- Room management
- Live cursor tracking (throttled)
- Live task updates
- "User is typing" in comments
- Online presence indicators
- Conflict resolution

---

## Phase 5: Infinite Canvas Whiteboard
**Days 17–21 | Status: NOT STARTED**

- Canvas with pan/zoom (HTML5 Canvas or Fabric.js or react-konva)
- Sticky notes, text, shapes, arrows
- Select/move/resize/delete
- Bi-directional task linking
- Minimap
- Auto-save + export to PNG

---

## Phase 6: Polish & Advanced Features
**Days 22–25 | Status: NOT STARTED**

- Command palette (Cmd+K)
- Keyboard shortcuts
- Activity feed
- Notifications
- Onboarding flow
- Dashboard charts (Recharts)
- File attachments
- AI task breakdown (OpenAI)
- Performance: virtualized lists, code splitting

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

 I'll create a complete **phase-by-phase roadmap** and a **master prompt** that controls the workflow. This prevents the "8 hours of debugging a mess" problem by enforcing review gates.

---

## 🗺️ **PHASE-BY-PHASE BUILD ROADMAP**

### **PHASE 0: Foundation & Design System (Days 1-2)**
**Goal:** Locked design system + project skeleton. No features yet.

**What to build:**
- Tailwind config with custom colors/fonts
- Global layout shell (sidebar + header)
- Design system components (Button, Card, Input, Badge, Avatar)
- Dark/light mode toggle
- Loading skeletons
- Empty state components

**Deliverable:** Style guide page showing all components + Storybook-style documentation

**Your review checkpoint:** 
- [ ] Colors match Linear/Vercel aesthetic?
- [ ] Spacing consistent (4px grid)?
- [ ] Typography hierarchy clear?
- [ ] Components feel premium, not Bootstrap?

**If NO → Fix Phase 0. If YES → Proceed.**

---

### **PHASE 1: Database & API Foundation (Days 3-5)**
**Goal:** Solid backend architecture, no frontend yet except API testing UI.

**What to build:**
- Prisma schema (Users, Workspaces, Projects, Tasks, Comments, Attachments)
- PostgreSQL setup with proper relations and indexes
- Authentication middleware (Clerk or JWT)
- REST API routes for: Auth, Workspaces, Projects, Tasks (CRUD)
- Request validation (Zod)
- Error handling middleware
- API documentation (Swagger/OpenAPI)
- Seed script with realistic dummy data

**Deliverable:** Working API you can test via Postman/Insomnia + Prisma Studio showing data

**Your review checkpoint:**
- [ ] Schema handles all relations properly (no N+1 issues)?
- [ ] API responses consistent format?
- [ ] Authentication actually secure (tested)?
- [ ] Error messages helpful, not exposing internals?

**If NO → Fix Phase 1. If YES → Proceed.**

---

### **PHASE 2: Frontend Shell & Data Fetching (Days 6-8)**
**Goal:** App structure with real data flowing, no complex UI yet.

**What to build:**
- React Router setup with protected routes
- Layout system (collapsible sidebar, header)
- TanStack Query setup with caching strategy
- Workspace switcher
- Project list view (simple table/card list)
- Basic task list (no drag-drop yet)
- Settings pages (profile, workspace settings)
- Global error boundary
- 404 page

**Deliverable:** Clickable app shell where you can navigate between workspaces/projects, see real data

**Your review checkpoint:**
- [ ] Navigation feels snappy (caching working)?
- [ ] Data fetching shows proper loading states?
- [ ] Error states handled gracefully?
- [ ] Mobile responsive at least for tablet?

**If NO → Fix Phase 2. If YES → Proceed.**

---

### **PHASE 3: Kanban Board Core (Days 9-12)**
**Goal:** Working drag-and-drop task management.

**What to build:**
- Column management (add/rename/delete)
- Task cards with full details view
- Drag-and-drop between columns (@dnd-kit/core)
- Inline task editing (quick edit title, click to expand details)
- Task detail panel (side panel or modal - pick one, be consistent)
- Filtering and sorting
- Search functionality

**Deliverable:** Fully functional Kanban board you could actually use for project management

**Your review checkpoint:**
- [ ] Drag-and-drop smooth, no jank?
- [ ] Task details easy to access and edit?
- [ ] Search/filter actually useful?
- [ ] Performance good with 50+ tasks?

**If NO → Fix Phase 3. If YES → Proceed.**

---

### **PHASE 4: Real-time Collaboration (Days 13-16)**
**Goal:** Socket.io integration for live updates.

**What to build:**
- Socket.io server setup with Redis adapter
- Room management (join project room, leave room)
- Live cursor tracking on Kanban board (throttled)
- Live task updates (someone moves a card, you see it move)
- "User is typing" in comments
- Online presence indicators
- Conflict resolution for simultaneous edits (operational transform or last-write-wins with timestamp)

**Deliverable:** Open two browsers, see real-time cursors and updates

**Your review checkpoint:**
- [ ] Cursors smooth, not jumping?
- [ ] Live updates feel instant?
- [ ] Conflict handling sensible (no lost data)?
- [ ] Reconnection handled (refresh page, still works)?

**If NO → Fix Phase 4. If YES → Proceed.**

---

### **PHASE 5: Infinite Canvas (Days 17-21)**
**Goal:** Whiteboard functionality.

**What to build:**
- Canvas setup with pan/zoom (HTML5 Canvas or Fabric.js or custom)
- Basic shapes: sticky notes, text, rectangles, arrows
- Selection and manipulation (move, resize, delete)
- Connection lines between elements
- Bi-directional linking (canvas item ↔ task)
- Minimap for navigation
- Export to PNG

**Deliverable:** Functional whiteboard where you can brainstorm and link to tasks

**Your review checkpoint:**
- [ ] Pan/zoom smooth (60fps)?
- [ ] Creating elements intuitive?
- [ ] Linking to tasks works both ways?
- [ ] Export function works?

**If NO → Fix Phase 5. If YES → Proceed.**

---

### **PHASE 6: Polish & Advanced Features (Days 22-25)**
**Goal:** Make it feel like a real product.

**What to build:**
- Command palette (Cmd+K) with fuzzy search
- Keyboard shortcuts
- Activity feed / audit log
- Notifications system
- Onboarding flow for new users
- Dashboard with charts (project stats)
- File attachments (drag-drop to upload)
- Rich text descriptions (TipTap editor)
- AI feature (task breakdown via OpenAI) - optional but impressive

**Deliverable:** Feature-complete product that feels professional

**Your review checkpoint:**
- [ ] Every interaction has feedback (toast, animation)?
- [ ] Empty states helpful and branded?
- [ ] No console errors?
- [ ] Lighthouse score > 90?

**If NO → Fix Phase 6. If YES → Proceed.**

---

### **PHASE 7: Testing & Deployment (Days 26-28)**
**Goal:** Production ready.

**What to build:**
- Unit tests for critical functions (Vitest)
- E2E tests for main flows (Playwright)
- Docker setup for local dev
- CI/CD pipeline (GitHub Actions)
- Deployment: Vercel (frontend), Railway/Render (backend), Supabase (DB)
- Environment variable management
- Error monitoring (Sentry)
- Analytics (PostHog/Plausible)

**Deliverable:** Live URL you can put on your resume

**Final review:**
- [ ] Deployed and accessible?
- [ ] All environment variables set?
- [ ] Database migrations run?
- [ ] Smoke test: Can sign up → create project → add task → see it live?

---

## 📝 **MASTER PROMPT FOR CLAUDE**

This is your **complete, copy-paste prompt**. It includes workflow controls, design specs, and phase gates.

```markdown
I am building "CollabBoard" - a full-stack collaborative project management tool with an infinite canvas whiteboard. This is for my SDE portfolio and must look like a premium SaaS product (Linear/Vercel quality), not a tutorial project.

## CRITICAL WORKFLOW RULES

1. **PHASED DEVELOPMENT**: I will tell you which phase to build. Never build ahead.
2. **REVIEW GATES**: After each phase, you stop and wait for my "APPROVED, proceed to Phase X" before continuing.
3. **NO FEATURE CREEP**: If I say "Phase 1", you build ONLY Phase 1 scope. No "while we're at it" additions.
4. **DESIGN FIRST**: Every phase starts with "show me the design/code structure, then implement after I approve".
5. **TESTING**: Every phase includes "verify it works" steps before marking complete.

## TECH STACK (Locked)

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **State**: Zustand (client) + TanStack Query (server)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.io + Redis (adapter)
- **Auth**: Clerk (preferred) or Auth0
- **File Storage**: Cloudinary or AWS S3
- **Testing**: Vitest (unit) + Playwright (E2E)

## DESIGN SYSTEM (Implement Exactly)

### Color Palette (Slate/Indigo - Linear Style)
```javascript
// tailwind.config.js extensions
colors: {
  background: '#0f172a',      // slate-950
  surface: '#1e293b',        // slate-900
  'surface-light': '#334155', // slate-800
  primary: '#6366f1',         // indigo-500
  'primary-hover': '#818cf8', // indigo-400
  secondary: '#8b5cf6',       // violet-500
  success: '#10b981',         // emerald-500
  danger: '#f43f5e',          // rose-500
  'text-primary': '#f1f5f9',  // slate-100
  'text-secondary': '#94a3b8', // slate-400
  border: '#1e293b',          // slate-800 (subtle)
}
```

### Typography
- **Font**: Inter (weights: 400, 500, 600)
- **Mono**: JetBrains Mono (for IDs, timestamps)
- **Scale**: 
  - Page titles: `text-2xl font-semibold text-text-primary`
  - Section: `text-sm font-medium text-text-secondary uppercase tracking-wider`
  - Body: `text-sm text-text-primary`
  - Small: `text-xs text-text-secondary`

### Spacing (4px Grid - Strict)
- Never use arbitrary values like `w-[123px]`
- Use: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Card padding: `p-6` (24px)
- Gap between items: `gap-3` (12px) or `gap-4` (16px)

### Component Patterns

**Button Primary:**
```jsx
className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
```

**Button Secondary:**
```jsx
className="bg-surface-light hover:bg-surface text-text-primary px-4 py-2 rounded-lg font-medium border border-border transition-colors"
```

**Card:**
```jsx
className="bg-surface border border-border rounded-xl shadow-lg shadow-black/20 hover:border-surface-light transition-colors"
```

**Input:**
```jsx
className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
```

### Icons & Assets
- **Icons**: Lucide React only (`lucide-react`)
- **Illustrations**: unDraw (customize to primary color #6366f1)
- **Avatars**: DiceBear or `boringavatars`
- **No emojis as UI elements**

### Animation Standards (Framer Motion)
- Page enter: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}`
- List stagger: `staggerChildren: 0.05`
- Hover: Color transitions, never scale transforms on buttons
- Loading: Skeleton screens, never spinners for content

## PHASES (Build One at a Time)

---

### PHASE 0: DESIGN SYSTEM & PROJECT SKELETON
**Scope**: Design tokens, global layout, base components. NO features.

**Deliverables**:
1. `tailwind.config.js` with exact color/font extensions
2. Global CSS variables in `index.css`
3. Component library in `/components/ui/`:
   - Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
   - Card (with header, content, footer slots)
   - Input (text, password, textarea)
   - Badge (variants: default, success, warning, danger)
   - Avatar (with fallback initials)
   - Skeleton (pulse animation for loading)
   - EmptyState (illustration + text + optional action)
   - Tooltip (hover explanations)
   - Dialog/Modal (using Radix UI or Headless UI)
   - Dropdown Menu
4. Layout shell: Sidebar (collapsible) + Header + Main content area
5. Theme toggle (dark/light - dark default)
6. Storybook-style page at `/design-system` showing all components

**Before Implementing**: Show me the file structure and component props interfaces. Wait for approval.

**Verification Checklist** (include in response):
- [ ] All components use design tokens, no hardcoded colors
- [ ] Dark mode works (manual toggle + system preference)
- [ ] Responsive sidebar (collapses to icon-only or drawer on mobile)
- [ ] No console errors
- [ ] Components are accessible (keyboard navigation, ARIA labels)

**Stop here. Wait for: "PHASE 0 APPROVED, proceed to Phase 1"**

---

### PHASE 1: DATABASE & API FOUNDATION
**Scope**: Backend architecture, schema, auth, basic CRUD. NO frontend features beyond API testing.

**Deliverables**:
1. Prisma schema with models:
   - User (id, email, name, avatar, createdAt, updatedAt)
   - Workspace (id, name, slug, ownerId, createdAt)
   - WorkspaceMember (workspaceId, userId, role: ADMIN|MEMBER)
   - Project (id, name, description, workspaceId, status, createdAt)
   - Task (id, title, description, status, priority, projectId, assigneeId, creatorId, dueDate, createdAt, updatedAt)
   - Comment (id, content, taskId, userId, createdAt)
   - Attachment (id, url, filename, taskId, uploadedBy)
   - ActivityLog (id, action, entityType, entityId, userId, metadata, createdAt)
2. Database indexes on foreign keys and frequently queried fields
3. Express server setup with:
   - Error handling middleware
   - Request logging (morgan)
   - CORS configuration
   - Rate limiting (express-rate-limit)
4. Authentication:
   - Clerk middleware integration OR JWT strategy
   - Protected route middleware
   - Current user endpoint
5. API Routes (RESTful):
   - `POST /auth/clerk-webhook` (if using Clerk)
   - `GET /me` (current user)
   - `GET /workspaces`, `POST /workspaces`, `GET /workspaces/:id`, `PATCH /workspaces/:id`, `DELETE /workspaces/:id`
   - `GET /workspaces/:id/projects`, `POST /projects`, `GET /projects/:id`, etc.
   - `GET /projects/:id/tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
   - `GET /tasks/:id/comments`, `POST /comments`
6. Zod validation for all request bodies
7. Consistent API response format: `{ success: boolean, data?: any, error?: { message: string, code: string } }`
8. Seed script (`npm run seed`) creating:
   - 1 workspace with 2 projects
   - Each project with 10-15 tasks of varying status/priority
   - 2-3 comments on some tasks
9. API documentation at `/api-docs` (Swagger UI)

**Before Implementing**: Show me the Prisma schema and API route structure. Wait for approval.

**Verification Checklist**:
- [ ] Prisma migrate dev runs without errors
- [ ] Prisma Studio shows correct data relations
- [ ] All API endpoints tested with curl/Postman and return correct format
- [ ] Authentication blocks unauthorized requests
- [ ] Rate limiting tested (hit endpoint 101 times, see 429 error)
- [ ] Seed script runs and creates realistic data

**Stop here. Wait for: "PHASE 1 APPROVED, proceed to Phase 2"**

---

### PHASE 2: FRONTEND SHELL & DATA FETCHING
**Scope**: App structure, routing, data layer, basic views. NO Kanban drag-drop yet.

**Deliverables**:
1. React Router setup with route definitions:
   - `/` → Dashboard
   - `/workspaces/:workspaceId` → Projects list
   - `/workspaces/:workspaceId/projects/:projectId` → Project detail (Kanban)
   - `/workspaces/:workspaceId/settings` → Workspace settings
   - `/profile` → User profile
2. ProtectedRoute component (redirects to login if not authenticated)
3. Layout components:
   - AppShell with Sidebar and Header
   - Sidebar: Workspace switcher, Navigation (Projects, Members, Settings), User profile footer
   - Header: Breadcrumbs, Search trigger, Notifications bell, User menu
4. TanStack Query setup:
   - QueryClient with caching strategy
   - Axios instance with auth header injection
   - Global loading and error handlers
5. Data fetching hooks:
   - `useWorkspaces()`, `useWorkspace(id)`
   - `useProjects(workspaceId)`, `useProject(id)`
   - `useTasks(projectId)`, `useTask(id)`
6. Views (simple lists/grids for now):
   - Dashboard: Recent projects, assigned tasks, activity feed (static for now)
   - Projects list: Grid of project cards with status indicators
   - Project detail: Simple column layout (To Do, In Progress, Done) with task cards (no drag yet)
   - Task detail side panel (opens when clicking task)
7. Global states:
   - Current workspace context
   - Sidebar collapse state (persisted to localStorage)
8. Error boundaries and 404 page

**Before Implementing**: Show me the route structure and TanStack Query hook signatures. Wait for approval.

**Verification Checklist**:
- [ ] Navigation between routes is instant (caching working)
- [ ] Switching workspaces updates all data correctly
- [ ] Sidebar collapse persists after refresh
- [ ] API errors show toast notifications (use Sonner)
- [ ] Loading states use skeletons, not spinners
- [ ] Mobile: Sidebar becomes drawer or icon rail

**Stop here. Wait for: "PHASE 2 APPROVED, proceed to Phase 3"**

---

### PHASE 3: KANBAN BOARD WITH DRAG-AND-DROP
**Scope**: Full Kanban functionality with @dnd-kit.

**Deliverables**:
1. Column management:
   - Add new column (inline input)
   - Edit column title (inline)
   - Delete column (with confirmation)
   - Columns persist to database (add Column model to schema if needed)
2. Task cards:
   - Visual design: Priority indicator (colored dot), assignee avatar, title, tags, due date
   - Quick edit: Click title to edit inline
   - Expand: Click card body to open detail panel
   - Context menu: Edit, Delete, Duplicate
3. Drag-and-drop (@dnd-kit/core + @dnd-kit/sortable):
   - Reorder tasks within column
   - Move tasks between columns
   - Reorder columns horizontally
   - Smooth animations during drag
   - Drop indicators (ghost preview)
4. Task detail panel (side panel, not modal):
   - Full editable form (title, description with TipTap rich text, assignee select, priority, due date)
   - Comments section (add, list)
   - Activity history (from ActivityLog)
   - Attachments list with upload
5. Filtering and search:
   - Search tasks by title/description
   - Filter by assignee, priority, due date range
   - Clear filters button
6. Optimistic updates (UI updates before API confirms)

**Before Implementing**: Show me the drag-and-drop component structure and state management plan. Wait for approval.

**Verification Checklist**:
- [ ] Dragging feels smooth (60fps), no jank
- [ ] Task moves persist after refresh
- [ ] Filtering works in real-time (no page reload)
- [ ] Rich text editor saves and renders correctly
- [ ] Panel animations smooth (Framer Motion)
- [ ] Works with 50+ tasks without lag

**Stop here. Wait for: "PHASE 3 APPROVED, proceed to Phase 4"**

---

### PHASE 4: REAL-TIME COLLABORATION
**Scope**: Socket.io integration for live updates.

**Deliverables**:
1. Socket.io server setup:
   - Redis adapter for multi-server scaling
   - Room management (join project room on connect, leave on disconnect)
   - Authentication middleware for socket connections
2. Client socket setup:
   - Socket context/provider
   - Connection status indicator (reconnecting, connected)
   - Automatic reconnection with exponential backoff
3. Live features:
   - Cursor tracking: Show other users' cursors on Kanban board (throttled to 20ms)
   - Live task updates: When someone moves/edits a task, all clients see it move
   - "User is typing" indicator in comments
   - Online presence list (sidebar showing who's viewing this project)
4. Conflict resolution:
   - Operational Transform OR last-write-wins with timestamp versioning
   - Handle simultaneous edits gracefully (show "Task was modified by another user" if conflict)
5. Optimizations:
   - Throttle cursor updates (don't send every pixel)
   - Debounce rapid task updates
   - Compress socket payloads if large

**Before Implementing**: Show me the socket event structure and room management logic. Wait for approval.

**Verification Checklist**:
- [ ] Open two browsers, see both cursors moving smoothly
- [ ] Move task in Browser A, see it animate in Browser B within 500ms
- [ ] Disconnect network, make changes, reconnect - changes sync
- [ ] Simultaneous edit shows conflict resolution (not broken data)
- [ ] Server handles 100+ concurrent connections (test with multiple tabs)

**Stop here. Wait for: "PHASE 4 APPROVED, proceed to Phase 5"**

---

### PHASE 5: INFINITE CANVAS WHITEBOARD
**Scope**: Visual collaboration space.

**Deliverables**:
1. Canvas setup:
   - HTML5 Canvas or Fabric.js or react-konva (pick one, justify choice)
   - Pan (middle mouse or space+drag) and zoom (scroll or buttons)
   - Grid background (subtle dots or lines)
   - Minimap showing viewport and all elements
2. Drawing tools:
   - Sticky notes (add, edit text, move, delete, change color)
   - Text boxes
   - Simple shapes (rectangle, circle)
   - Arrows/lines (connect elements)
   - Select tool (move multiple items)
3. Element interactions:
   - Select on click, show transform handles
   - Drag to move
   - Double-click to edit text
   - Delete key to remove selected
   - Copy/paste (Ctrl+C/V)
4. Task linking:
   - Link whiteboard sticky note to existing task (bi-directional)
   - Click note → opens task panel
   - Task shows "Linked to whiteboard" indicator
5. Persistence:
   - Save canvas state as JSON to database (Project.canvasData)
   - Auto-save every 5 seconds when changes occur
   - Export to PNG (canvas.toDataURL)

**Before Implementing**: Show me the canvas architecture and data model for elements. Wait for approval.

**Verification Checklist**:
- [ ] Pan/zoom smooth at 60fps with 100 elements
- [ ] Creating and editing sticky notes intuitive
- [ ] Linked tasks open correct detail panel
- [ ] Canvas state persists after refresh
- [ ] Export PNG works and looks correct

**Stop here. Wait for: "PHASE 5 APPROVED, proceed to Phase 6"**

---

### PHASE 6: POLISH & ADVANCED FEATURES
**Scope:** Make it feel like a real product.

**Deliverables**:
1. Command palette (Cmd+K):
   - Fuzzy search projects, tasks, actions
   - Recent items
   - Keyboard navigation (arrow keys, enter)
2. Keyboard shortcuts:
   - C: Create task, /: Command palette, Esc: Close panel, etc.
   - Shortcut help modal (show all shortcuts)
3. Activity feed:
   - Real-time updates in sidebar
   - Filter by type (comments, task changes, joins)
4. Notifications system:
   - In-app notification bell with dropdown
   - Mark as read/unread
   - Browser push notifications (optional)
5. Onboarding flow:
   - First-time user sees guided tour (react-joyride or custom)
   - Create first workspace → Create first project → Add first task
   - "Skip tour" option
6. Dashboard improvements:
   - Project stats cards (tasks completed this week, overdue)
   - Burndown chart (Recharts)
   - Recent activity timeline
7. File attachments:
   - Drag-drop file upload to task
   - Image previews in comments
   - File type validation and size limits
8. AI feature (optional but impressive):
   - "Break down task" button: Send task title to OpenAI, get suggested subtasks
   - Generate task description from title
9. Performance optimizations:
   - Virtualized lists for large task lists (react-window)
   - Image lazy loading
   - Route-based code splitting

**Before Implementing**: Show me which 4 features you'll prioritize (don't do all if time-constrained). Wait for approval.

**Verification Checklist**:
- [ ] Command palette opens with Cmd+K, searches fast
- [ ] Onboarding flow completes without errors
- [ ] Charts render correctly with real data
- [ ] File upload works with progress indicator
- [ ] No memory leaks (check React DevTools Profiler)
- [ ] Lighthouse performance score > 90

**Stop here. Wait for: "PHASE 6 APPROVED, proceed to Phase 7"**

---

### PHASE 7: TESTING & DEPLOYMENT
**Scope:** Production readiness.

**Deliverables**:
1. Testing:
   - Unit tests for utilities and hooks (Vitest, 70%+ coverage)
   - E2E tests for critical flows (Playwright):
     - User signup → create workspace → create project → add task
     - Drag and drop task between columns
     - Real-time collaboration (two sessions)
2. DevOps:
   - Docker Compose for local development (app + postgres + redis)
   - GitHub Actions CI: Lint → Test → Build
   - Staging environment (deploy on Railway)
3. Production deployment:
   - Frontend: Vercel (with proper env vars)
   - Backend: Railway or Render
   - Database: Supabase PostgreSQL or Railway Postgres
   - Redis: Upstash or Railway Redis
   - File storage: Cloudinary or AWS S3
4. Monitoring:
   - Sentry for error tracking
   - PostHog or Plausible for analytics (privacy-friendly)
   - Health check endpoint `/health` that checks DB and Redis connectivity
5. Documentation:
   - README with architecture diagram (Mermaid or ASCII)
   - Setup instructions
   - Environment variable template
   - API documentation link
   - Screenshots/gifs of features

**Verification Checklist**:
- [ ] All tests pass in CI
- [ ] Deployed to production URL
- [ ] Can sign up with real email and use the app
- [ ] Error tracking captures exceptions
- [ ] Analytics respects Do Not Track
- [ ] README is clear enough for another dev to run locally

## CURRENT PHASE INSTRUCTION

**I want you to start with [PHASE X - specify 0-7].**

Follow the workflow:
1. Acknowledge which phase you're building and repeat its scope
2. Show me the design/architecture plan before writing implementation code
3. After I approve, implement with verification checklist
4. Mark phase complete, wait for next instruction

Do not build ahead. Do not skip review gates. Quality over speed.
```

---

## 🎯 **How to Use This**

1. **Copy the entire prompt above**
2. **Replace** `[PHASE X - specify 0-7]` with the phase you want (start with 0)
3. **Paste into Claude**
4. **When it shows you the plan**, review carefully and say either:
   - `"APPROVED, implement this"` 
   - Or give specific feedback: `"Change the Button component to have rounded-md instead of rounded-lg"`
5. **After implementation**, run the verification checklist yourself
6. **If good**: `"PHASE X APPROVED, proceed to Phase Y"`
7. **If bad**: `"Fix these issues: [list]"` and stay in same phase

---

## ⚠️ **Critical Rules for You**

| Don't | Do |
|-------|-----|
| Say "just build everything" | Enforce one phase at a time |
| Skip the "show me first" step | Review architecture before implementation |
| Accept "it works on my machine" | Demand verification checklist proof |
| Let Claude add "bonus features" | Reject scope creep strictly |
| Ignore design inconsistencies | Fix Phase 0 before moving on |
| Rush to deployment with bugs | Spend time in Phase 7 testing |

---

Want me to create a **condensed version** of this prompt for later phases (so you don't paste 500 lines every time)? Or a **troubleshooting guide** for when Claude generates bad code?
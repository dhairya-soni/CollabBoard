/// <reference types="node" />
/**
 * CollabBoard — Database Seed Script
 *
 * Creates:
 *   - 3 users (admin, member, designer)
 *   - 1 workspace
 *   - 3 projects:
 *       1. Getting Started — feature showcase with pre-seeded whiteboard
 *       2. Frontend Revamp — realistic dev project
 *       3. API Platform    — realistic backend project
 *
 * Run: npm run db:seed
 * Login: admin@collabboard.dev / password123
 *        member@collabboard.dev / password123
 *        designer@collabboard.dev / password123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Clean ───────────────────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.whiteboard.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@collabboard.dev', name: 'Dhairya Soni', password: hashedPassword },
  });
  const member = await prisma.user.create({
    data: { email: 'member@collabboard.dev', name: 'Alex Rivera', password: hashedPassword },
  });
  const designer = await prisma.user.create({
    data: { email: 'designer@collabboard.dev', name: 'Priya Sharma', password: hashedPassword },
  });
  console.log(`✓ User: ${admin.name} (${admin.email})`);
  console.log(`✓ User: ${member.name} (${member.email})`);
  console.log(`✓ User: ${designer.name} (${designer.email})`);

  // ── Workspace ───────────────────────────────────────────
  const workspace = await prisma.workspace.create({
    data: { name: 'CollabBoard', slug: 'collabboard', ownerId: admin.id },
  });
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: admin.id, role: 'ADMIN' },
      { workspaceId: workspace.id, userId: member.id, role: 'MEMBER' },
      { workspaceId: workspace.id, userId: designer.id, role: 'MEMBER' },
    ],
  });
  console.log(`\n✓ Workspace: ${workspace.name} (3 members)`);

  // ══════════════════════════════════════════════════════
  // PROJECT 1 — Getting Started (Feature Showcase)
  // ══════════════════════════════════════════════════════
  const guide = await prisma.project.create({
    data: {
      name: '👋 Getting Started',
      description: 'A guided tour of CollabBoard features. Explore this project to see Kanban boards, task detail panels, comments, real-time collaboration, and the whiteboard in action.',
      status: 'ACTIVE',
      workspaceId: workspace.id,
    },
  });
  console.log(`\n✓ Project: ${guide.name}`);

  const guideTasks = [
    {
      title: '👆 Click any task to open the detail panel',
      status: 'TODO', priority: 'HIGH', assigneeId: admin.id,
      description: 'The task detail panel slides in from the right. You can edit the title, description, assignee, due date, priority, and add comments — all in real time.',
      dueDate: new Date(Date.now() + 1 * 86400000),
    },
    {
      title: '🗂️ Drag tasks between columns to update status',
      status: 'TODO', priority: 'HIGH', assigneeId: member.id,
      description: 'Drag and drop tasks between Backlog, Todo, In Progress, and Done columns. Changes are broadcast live to everyone viewing the same board.',
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
    {
      title: '🎨 Open the Whiteboard to sketch ideas',
      status: 'TODO', priority: 'MEDIUM', assigneeId: designer.id,
      description: 'Click the "Whiteboard" button in the top-right of any project board. Draw sticky notes, shapes, arrows, and text. Use Ctrl+Z to undo, scroll to zoom, middle-mouse to pan.',
      dueDate: new Date(Date.now() + 3 * 86400000),
    },
    {
      title: '⌨️ Try the Command Palette (Ctrl+K)',
      status: 'TODO', priority: 'MEDIUM', assigneeId: admin.id,
      description: 'Press Ctrl+K (or ⌘K on Mac) to open the command palette. You can jump to any project, whiteboard, or page instantly without using the sidebar.',
    },
    {
      title: '🔔 Check Notifications in the header',
      status: 'TODO', priority: 'LOW', assigneeId: member.id,
      description: 'The bell icon in the top-right shows your recent activity feed — task creations, updates, and comments across all projects you are a member of.',
    },
    {
      title: '📊 View Analytics for this project',
      status: 'TODO', priority: 'LOW', assigneeId: designer.id,
      description: 'Click Analytics in the sidebar to see charts: task breakdown by status and priority, plus a 14-day creation trend. Select any project from the dropdown.',
    },
    {
      title: '👥 Invite a team member to a project',
      status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: admin.id,
      description: 'Click the gear ⚙️ icon on any project card in the Projects page to manage members. Type an email to invite — they are automatically added to the workspace too.',
      dueDate: new Date(Date.now() + 1 * 86400000),
    },
    {
      title: '🔴 See live cursors — open this board in two tabs',
      status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: member.id,
      description: 'Open this board in two browser tabs (or log in as member@collabboard.dev in another tab). Move your mouse and you will see live colored cursors for each connected user.',
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
    {
      title: '💬 Add a comment on this task',
      status: 'DONE', priority: 'LOW', assigneeId: admin.id,
      description: 'Open any task detail panel and scroll to the Comments section. Comments are stored and visible to all project members.',
    },
    {
      title: '🔍 Use filters and search on the board',
      status: 'DONE', priority: 'LOW', assigneeId: designer.id,
      description: 'The search bar at the top of the Kanban board filters tasks by title in real time. You can also filter by priority or assignee using the dropdown filters.',
    },
  ];

  const guidTaskRecords = [];
  for (let i = 0; i < guideTasks.length; i++) {
    const t = guideTasks[i];
    const task = await prisma.task.create({
      data: {
        title: t.title, status: t.status, priority: t.priority,
        assigneeId: t.assigneeId, creatorId: admin.id,
        projectId: guide.id, position: i,
        description: t.description, dueDate: t.dueDate ?? null,
      },
    });
    guidTaskRecords.push(task);
  }
  console.log(`  → ${guideTasks.length} tasks created`);

  // Comments on guide tasks
  const guideComments = [
    { taskIdx: 0, content: 'You can also press E to quick-edit a task title directly from the board!', userId: member.id },
    { taskIdx: 7, content: 'Try logging in as member@collabboard.dev in an incognito window — you will see your cursor show up here in real time 👋', userId: designer.id },
    { taskIdx: 8, content: 'Comments support multiple authors and are ordered chronologically. Try posting one!', userId: admin.id },
  ];
  for (const c of guideComments) {
    await prisma.comment.create({
      data: { content: c.content, userId: c.userId, taskId: guidTaskRecords[c.taskIdx].id },
    });
  }

  // Whiteboard for guide project — pre-seeded sticky notes
  const whiteboardElements = [
    {
      id: 'wb-1', type: 'sticky', x: 80, y: 80, width: 200, height: 160,
      content: '👋 Welcome!\n\nThis whiteboard is a shared canvas. Try adding sticky notes, shapes, and arrows.',
      color: '#FFE066', strokeColor: '#E6C800', fontSize: 14, rotation: 0,
    },
    {
      id: 'wb-2', type: 'sticky', x: 320, y: 80, width: 200, height: 160,
      content: '🛠️ Tools\n\nV — Select\nS — Sticky note\nT — Text\nR — Rectangle\nC — Circle\nA — Arrow',
      color: '#B5EAD7', strokeColor: '#2D9E6E', fontSize: 13, rotation: 0,
    },
    {
      id: 'wb-3', type: 'sticky', x: 560, y: 80, width: 200, height: 160,
      content: '⌨️ Shortcuts\n\nCtrl+Z — Undo\nCtrl+Y — Redo\nScroll — Zoom\nMiddle drag — Pan\nDelete — Remove',
      color: '#C7CEEA', strokeColor: '#5C6BC0', fontSize: 13, rotation: 0,
    },
    {
      id: 'wb-4', type: 'sticky', x: 800, y: 80, width: 200, height: 160,
      content: '📡 Real-time\n\nChanges sync live to all collaborators in the same project. Try opening in two tabs!',
      color: '#FFB7B2', strokeColor: '#E05050', fontSize: 13, rotation: 0,
    },
    {
      id: 'wb-5', type: 'rect', x: 80, y: 300, width: 280, height: 80,
      content: 'Feature Brainstorm', color: '#1a1a2e', strokeColor: '#6c63ff', fontSize: 16, rotation: 0,
    },
    {
      id: 'wb-6', type: 'sticky', x: 80, y: 420, width: 180, height: 120,
      content: '💡 Real-time cursors for team presence', color: '#FFDAC1', strokeColor: '#E06030', fontSize: 12, rotation: -2,
    },
    {
      id: 'wb-7', type: 'sticky', x: 280, y: 420, width: 180, height: 120,
      content: '💡 Infinite canvas with export to PNG', color: '#E2F0CB', strokeColor: '#4CAF50', fontSize: 12, rotation: 1,
    },
    {
      id: 'wb-8', type: 'sticky', x: 480, y: 420, width: 180, height: 120,
      content: '💡 Command palette for fast navigation', color: '#C7CEEA', strokeColor: '#5C6BC0', fontSize: 12, rotation: -1,
    },
    {
      id: 'wb-9', type: 'text', x: 560, y: 310, width: 300, height: 40,
      content: 'Double-click any element to edit text ✏️', color: 'transparent', strokeColor: '#888', fontSize: 15, rotation: 0,
    },
    {
      id: 'wb-10', type: 'circle', x: 750, y: 300, width: 100, height: 100,
      content: '🚀', color: '#2d2d44', strokeColor: '#6c63ff', fontSize: 28, rotation: 0,
    },
  ];

  await prisma.whiteboard.create({
    data: { projectId: guide.id, data: JSON.stringify(whiteboardElements) },
  });
  console.log('  → Whiteboard pre-seeded with 10 elements');

  // ══════════════════════════════════════════════════════
  // PROJECT 2 — Frontend Revamp
  // ══════════════════════════════════════════════════════
  const project1 = await prisma.project.create({
    data: {
      name: 'Frontend Revamp',
      description: 'Complete redesign of the client application with React 18, TypeScript, and a Linear-inspired design system.',
      status: 'ACTIVE',
      workspaceId: workspace.id,
    },
  });
  console.log(`\n✓ Project: ${project1.name}`);

  const frontendTasks = [
    { title: 'Setup Vite + React + TypeScript project',             status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,     desc: 'Scaffolded with Vite, configured TypeScript strict mode, ESLint, and Prettier.' },
    { title: 'Create Tailwind design system with custom tokens',    status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,     desc: 'Defined color, spacing, radius, and shadow tokens in tailwind.config.ts.' },
    { title: 'Build core UI components (Button, Card, Badge)',      status: 'DONE',        priority: 'HIGH',   assigneeId: designer.id,  desc: 'All components support dark/light mode and follow the design token system.' },
    { title: 'Implement dark/light mode toggle',                    status: 'DONE',        priority: 'MEDIUM', assigneeId: designer.id,  desc: 'Uses CSS variables + Tailwind dark class. Persisted to localStorage.' },
    { title: 'Build sidebar with collapsible project navigation',   status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,     desc: null },
    { title: 'Kanban board with drag-and-drop',                     status: 'DONE',        priority: 'URGENT', assigneeId: admin.id,     desc: 'Uses @dnd-kit. Supports cross-column drag with optimistic UI updates.' },
    { title: 'Task detail panel with inline editing',               status: 'IN_PROGRESS', priority: 'HIGH',   assigneeId: admin.id,     desc: 'Slides in from the right. Assignee dropdown, due date picker, priority selector.' },
    { title: 'Add filter chips and search to board header',         status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: member.id,    desc: null },
    { title: 'Command palette (Ctrl+K) with fuzzy search',          status: 'TODO',        priority: 'MEDIUM', assigneeId: member.id,    desc: 'Custom implementation — no cmdk dependency. Groups: Navigate, Projects, Whiteboards.' },
    { title: 'Notification bell with live activity feed',           status: 'TODO',        priority: 'MEDIUM', assigneeId: designer.id,  desc: null },
    { title: 'Analytics page with Recharts',                        status: 'TODO',        priority: 'LOW',    assigneeId: designer.id,  desc: 'Pie chart (by status), bar chart (by priority), 14-day line chart.' },
    { title: 'Loading skeletons for all list views',                status: 'BACKLOG',     priority: 'LOW',    assigneeId: null,         desc: null },
    { title: 'Mobile responsive sidebar (drawer on small screens)', status: 'BACKLOG',     priority: 'MEDIUM', assigneeId: null,         desc: null },
    { title: 'Keyboard shortcut reference modal',                   status: 'BACKLOG',     priority: 'LOW',    assigneeId: null,         desc: null },
    { title: 'Onboarding flow for new workspaces',                  status: 'BACKLOG',     priority: 'LOW',    assigneeId: null,         desc: null },
  ];

  const p1Tasks = [];
  for (let i = 0; i < frontendTasks.length; i++) {
    const t = frontendTasks[i];
    const task = await prisma.task.create({
      data: {
        title: t.title, status: t.status, priority: t.priority,
        assigneeId: t.assigneeId, creatorId: admin.id,
        projectId: project1.id, position: i,
        description: t.desc,
        dueDate: t.status === 'IN_PROGRESS' ? new Date(Date.now() + 3 * 86400000) : t.status === 'TODO' ? new Date(Date.now() + 7 * 86400000) : null,
      },
    });
    p1Tasks.push(task);
  }
  console.log(`  → ${frontendTasks.length} tasks created`);

  const p1Comments = [
    { taskIdx: 0, content: 'Vite cold start is blazing fast. Using SWC for transforms instead of Babel.', userId: member.id },
    { taskIdx: 5, content: 'Drag-and-drop feels really smooth. The optimistic updates prevent any flicker 🎉', userId: designer.id },
    { taskIdx: 6, content: 'Should we add a markdown editor for the description field?', userId: member.id },
    { taskIdx: 6, content: 'Good idea — let\'s add it in the next sprint. Tiptap or react-markdown should work.', userId: admin.id },
  ];
  for (const c of p1Comments) {
    await prisma.comment.create({
      data: { content: c.content, userId: c.userId, taskId: p1Tasks[c.taskIdx].id },
    });
  }

  // ══════════════════════════════════════════════════════
  // PROJECT 3 — API Platform
  // ══════════════════════════════════════════════════════
  const project2 = await prisma.project.create({
    data: {
      name: 'API Platform',
      description: 'Backend API with Express, Prisma, JWT auth, Socket.io real-time, and comprehensive REST endpoints.',
      status: 'ACTIVE',
      workspaceId: workspace.id,
    },
  });
  console.log(`\n✓ Project: ${project2.name}`);

  const apiTasks = [
    { title: 'Setup Express + TypeScript server',                    status: 'DONE',        priority: 'URGENT', assigneeId: admin.id,  desc: 'Node.js + Express + TypeScript. Prisma ORM with SQLite for dev, Postgres for prod.' },
    { title: 'Design Prisma schema with all models',                 status: 'DONE',        priority: 'URGENT', assigneeId: admin.id,  desc: 'Models: User, Workspace, Project, Task, Comment, ActivityLog, Whiteboard, ProjectMember.' },
    { title: 'JWT authentication middleware',                        status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,  desc: 'bcrypt password hashing, JWT sign/verify, token refresh.' },
    { title: 'Zod validation schemas for all endpoints',             status: 'DONE',        priority: 'HIGH',   assigneeId: member.id, desc: null },
    { title: 'Workspace CRUD endpoints',                             status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,  desc: null },
    { title: 'Project CRUD + member management endpoints',           status: 'DONE',        priority: 'HIGH',   assigneeId: member.id, desc: null },
    { title: 'Task CRUD with filtering, sorting, pagination',        status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,  desc: 'Filter by status, priority, assignee. Sort by position, dueDate, createdAt.' },
    { title: 'Comment endpoints',                                    status: 'DONE',        priority: 'MEDIUM', assigneeId: member.id, desc: null },
    { title: 'Activity log + analytics endpoints',                   status: 'DONE',        priority: 'MEDIUM', assigneeId: admin.id,  desc: 'ActivityLog model tracks all mutations. Analytics aggregates by status, priority, and day.' },
    { title: 'Socket.io server for real-time events',                status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id,  desc: 'Room-based broadcasting per project. Events: task:created, task:updated, task:deleted, cursor:move, whiteboard:update.' },
    { title: 'Whiteboard persistence endpoint',                      status: 'DONE',        priority: 'MEDIUM', assigneeId: admin.id,  desc: 'GET + PUT /api/projects/:id/whiteboard. Stores JSON blob, auto-creates on first access.' },
    { title: 'Rate limiting + Helmet security middleware',           status: 'DONE',        priority: 'MEDIUM', assigneeId: admin.id,  desc: null },
    { title: 'Swagger / OpenAPI docs at /api-docs',                  status: 'IN_PROGRESS', priority: 'LOW',    assigneeId: member.id, desc: null },
    { title: 'Add file upload with cloud storage',                   status: 'BACKLOG',     priority: 'LOW',    assigneeId: null,      desc: 'Cloudinary or S3 for task attachments.' },
    { title: 'Write integration tests for all routes',               status: 'BACKLOG',     priority: 'MEDIUM', assigneeId: null,      desc: 'Vitest + Supertest. Target 80% coverage on auth and task routes.' },
    { title: 'Add Redis adapter for Socket.io (multi-instance)',     status: 'BACKLOG',     priority: 'LOW',    assigneeId: null,      desc: 'Currently uses in-memory adapter — fine for single Render instance.' },
  ];

  const p2Tasks = [];
  for (let i = 0; i < apiTasks.length; i++) {
    const t = apiTasks[i];
    const task = await prisma.task.create({
      data: {
        title: t.title, status: t.status, priority: t.priority,
        assigneeId: t.assigneeId, creatorId: admin.id,
        projectId: project2.id, position: i,
        description: t.desc,
        dueDate: t.status === 'IN_PROGRESS' ? new Date(Date.now() + 5 * 86400000) : null,
      },
    });
    p2Tasks.push(task);
  }
  console.log(`  → ${apiTasks.length} tasks created`);

  const p2Comments = [
    { taskIdx: 1, content: 'The cascade deletes on Project and Task are critical — make sure they\'re set in schema.', userId: member.id },
    { taskIdx: 1, content: 'All set — onDelete: Cascade on all child relations.', userId: admin.id },
    { taskIdx: 9, content: 'Socket rooms are per-projectId. JWT verified on handshake so unauthenticated clients are rejected immediately.', userId: admin.id },
    { taskIdx: 11, content: 'Rate limit is 100 requests per 15 min per IP. Should be fine for demo usage.', userId: member.id },
  ];
  for (const c of p2Comments) {
    await prisma.comment.create({
      data: { content: c.content, userId: c.userId, taskId: p2Tasks[c.taskIdx].id },
    });
  }

  // ── Activity Logs ──────────────────────────────────────
  const allTasks = await prisma.task.findMany({
    include: { project: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const task of allTasks) {
    await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        userId: task.creatorId,
        taskId: task.id,
        metadata: JSON.stringify({ title: task.title, projectId: task.projectId }),
      },
    });
  }

  // A few update logs for realism
  const doneTasks = allTasks.filter((t) => t.status === 'DONE').slice(0, 8);
  for (const task of doneTasks) {
    await prisma.activityLog.create({
      data: {
        action: 'TASK_UPDATED',
        entityType: 'TASK',
        entityId: task.id,
        userId: task.assigneeId ?? admin.id,
        taskId: task.id,
        metadata: JSON.stringify({ title: task.title, projectId: task.projectId, changes: { status: { from: 'IN_PROGRESS', to: 'DONE' } } }),
      },
    });
  }

  // ── Summary ────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    workspaces: await prisma.workspace.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    comments: await prisma.comment.count(),
    activityLogs: await prisma.activityLog.count(),
    whiteboards: await prisma.whiteboard.count(),
  };

  console.log('\n─────────────────────────────────');
  console.log('📊 Seed Summary:');
  console.log(`   Users:         ${counts.users}`);
  console.log(`   Workspaces:    ${counts.workspaces}`);
  console.log(`   Projects:      ${counts.projects}`);
  console.log(`   Tasks:         ${counts.tasks}`);
  console.log(`   Comments:      ${counts.comments}`);
  console.log(`   Activity Logs: ${counts.activityLogs}`);
  console.log(`   Whiteboards:   ${counts.whiteboards}`);
  console.log('─────────────────────────────────');
  console.log('\n🔑 Test credentials:');
  console.log('   admin@collabboard.dev / password123');
  console.log('   member@collabboard.dev / password123');
  console.log('   designer@collabboard.dev / password123\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * CollabBoard — Database Seed Script
 *
 * Creates:
 *   - 2 users (admin + member)
 *   - 1 workspace
 *   - 2 projects (Frontend Revamp, API Platform)
 *   - 12-15 tasks per project with varying status/priority
 *   - Comments on several tasks
 *   - Activity logs
 *
 * Run: npm run db:seed
 * Login: admin@collabboard.dev / password123
 *        member@collabboard.dev / password123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@collabboard.dev',
      name: 'Dhairya Soni',
      password: hashedPassword,
      avatar: null,
    },
  });
  console.log(`✓ User: ${admin.name} (${admin.email})`);

  const member = await prisma.user.create({
    data: {
      email: 'member@collabboard.dev',
      name: 'Alex Rivera',
      password: hashedPassword,
      avatar: null,
    },
  });
  console.log(`✓ User: ${member.name} (${member.email})`);

  const member2 = await prisma.user.create({
    data: {
      email: 'designer@collabboard.dev',
      name: 'Priya Sharma',
      password: hashedPassword,
      avatar: null,
    },
  });
  console.log(`✓ User: ${member2.name} (${member2.email})`);

  // ── Workspace ──────────────────────────────────────────

  const workspace = await prisma.workspace.create({
    data: {
      name: 'CollabBoard',
      slug: 'collabboard',
      ownerId: admin.id,
    },
  });
  console.log(`\n✓ Workspace: ${workspace.name}`);

  // Add all members
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: admin.id, role: 'ADMIN' },
      { workspaceId: workspace.id, userId: member.id, role: 'MEMBER' },
      { workspaceId: workspace.id, userId: member2.id, role: 'MEMBER' },
    ],
  });
  console.log('✓ Members added (1 admin, 2 members)');

  // ── Project 1: Frontend Revamp ─────────────────────────

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
    { title: 'Setup Vite + React + TypeScript project',             status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Create Tailwind design system with custom tokens',    status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Build Button, Card, Input, Badge components',         status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Implement dark/light mode toggle',                    status: 'DONE',        priority: 'MEDIUM', assigneeId: admin.id },
    { title: 'Create sidebar navigation with collapsible sections', status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Build issue list view with status grouping',          status: 'IN_PROGRESS', priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Add filter chips and view toggle to header',          status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: member.id },
    { title: 'Implement workspace switcher dropdown',               status: 'TODO',        priority: 'MEDIUM', assigneeId: member.id },
    { title: 'Create task detail side panel',                       status: 'TODO',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Add keyboard shortcuts (Cmd+K, Esc, etc)',            status: 'BACKLOG',     priority: 'LOW',    assigneeId: null },
    { title: 'Setup TanStack Query for data fetching',              status: 'TODO',        priority: 'HIGH',   assigneeId: member.id },
    { title: 'Build project settings page',                         status: 'BACKLOG',     priority: 'LOW',    assigneeId: null },
    { title: 'Add loading skeletons to all list views',             status: 'BACKLOG',     priority: 'MEDIUM', assigneeId: member2.id },
    { title: 'Mobile responsive sidebar (drawer on small screens)', status: 'BACKLOG',     priority: 'MEDIUM', assigneeId: null },
    { title: 'Implement command palette with fuzzy search',         status: 'BACKLOG',     priority: 'LOW',    assigneeId: null },
  ];

  for (let i = 0; i < frontendTasks.length; i++) {
    const t = frontendTasks[i];
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        creatorId: admin.id,
        projectId: project1.id,
        position: i,
        description: i < 3 ? 'This task has been completed as part of Phase 0.' : null,
        dueDate: t.status === 'IN_PROGRESS' ? new Date(Date.now() + 3 * 86400000) : null,
      },
    });
  }
  console.log(`  → ${frontendTasks.length} tasks created`);

  // ── Project 2: API Platform ────────────────────────────

  const project2 = await prisma.project.create({
    data: {
      name: 'API Platform',
      description: 'Backend API with Express, Prisma, JWT auth, and comprehensive REST endpoints for all CollabBoard features.',
      status: 'ACTIVE',
      workspaceId: workspace.id,
    },
  });
  console.log(`\n✓ Project: ${project2.name}`);

  const apiTasks = [
    { title: 'Setup Express + TypeScript server',                     status: 'DONE',        priority: 'URGENT', assigneeId: admin.id },
    { title: 'Design Prisma schema with all models',                  status: 'DONE',        priority: 'URGENT', assigneeId: admin.id },
    { title: 'Implement JWT authentication middleware',               status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Create Zod validation schemas',                         status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Build workspace CRUD endpoints',                        status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Build project CRUD endpoints',                          status: 'DONE',        priority: 'HIGH',   assigneeId: member.id },
    { title: 'Build task CRUD with filtering and ordering',           status: 'IN_PROGRESS', priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Build comment endpoints',                               status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: member.id },
    { title: 'Add Swagger/OpenAPI documentation',                     status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: admin.id },
    { title: 'Write seed script with realistic data',                 status: 'TODO',        priority: 'MEDIUM', assigneeId: admin.id },
    { title: 'Add rate limiting middleware',                          status: 'DONE',        priority: 'MEDIUM', assigneeId: admin.id },
    { title: 'Setup error handling with consistent envelope',         status: 'DONE',        priority: 'HIGH',   assigneeId: admin.id },
    { title: 'Add activity log tracking to all mutations',            status: 'TODO',        priority: 'LOW',    assigneeId: member.id },
    { title: 'Setup Socket.io server for real-time events',           status: 'BACKLOG',     priority: 'HIGH',   assigneeId: null },
    { title: 'Add file upload endpoint with Cloudinary integration',  status: 'BACKLOG',     priority: 'LOW',    assigneeId: null },
    { title: 'Write unit tests for auth and task routes',             status: 'BACKLOG',     priority: 'MEDIUM', assigneeId: null },
  ];

  for (let i = 0; i < apiTasks.length; i++) {
    const t = apiTasks[i];
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        creatorId: admin.id,
        projectId: project2.id,
        position: i,
        description: i === 0 ? 'Node.js + Express + TypeScript with Prisma ORM and SQLite for development.' : null,
        dueDate: t.status === 'TODO' ? new Date(Date.now() + 7 * 86400000) : null,
      },
    });
  }
  console.log(`  → ${apiTasks.length} tasks created`);

  // ── Comments ───────────────────────────────────────────

  // Get some tasks to add comments to
  const tasksForComments = await prisma.task.findMany({
    where: { status: { in: ['IN_PROGRESS', 'DONE'] } },
    take: 6,
  });

  const commentData = [
    { content: 'Looking great! The design system is coming together nicely. Love the Linear-inspired tokens.', userId: member.id },
    { content: 'I pushed the initial implementation. Can you review the responsive behavior on the sidebar?', userId: admin.id },
    { content: 'The dark mode toggle works perfectly. Tested on Chrome, Firefox, and Safari.', userId: member2.id },
    { content: 'Should we add animation to the filter chips? I was thinking a subtle spring transition.', userId: member.id },
    { content: 'Fixed the TypeScript strict mode errors. All good now — zero warnings.', userId: admin.id },
    { content: 'The Prisma schema handles all the relations correctly. Ran the migration without issues.', userId: admin.id },
  ];

  for (let i = 0; i < Math.min(tasksForComments.length, commentData.length); i++) {
    await prisma.comment.create({
      data: {
        content: commentData[i].content,
        userId: commentData[i].userId,
        taskId: tasksForComments[i].id,
      },
    });
  }
  console.log(`\n✓ ${Math.min(tasksForComments.length, commentData.length)} comments added`);

  // ── Activity Logs ──────────────────────────────────────

  const allTasks = await prisma.task.findMany({ take: 10 });
  for (const task of allTasks) {
    await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        userId: task.creatorId,
        taskId: task.id,
        metadata: JSON.stringify({ title: task.title }),
      },
    });
  }
  console.log(`✓ ${allTasks.length} activity logs created`);

  // ── Summary ────────────────────────────────────────────

  const counts = {
    users: await prisma.user.count(),
    workspaces: await prisma.workspace.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    comments: await prisma.comment.count(),
    activityLogs: await prisma.activityLog.count(),
  };

  console.log('\n─────────────────────────────────');
  console.log('📊 Seed Summary:');
  console.log(`   Users:         ${counts.users}`);
  console.log(`   Workspaces:    ${counts.workspaces}`);
  console.log(`   Projects:      ${counts.projects}`);
  console.log(`   Tasks:         ${counts.tasks}`);
  console.log(`   Comments:      ${counts.comments}`);
  console.log(`   Activity Logs: ${counts.activityLogs}`);
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

import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ── GET /api/projects/:id/activity ── */
router.get('/projects/:id/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { workspaceId: true, isPrivate: true },
    });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const inWorkspace = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: req.userId! } },
    });
    if (!inWorkspace) throw new AppError(403, 'FORBIDDEN', 'Not a workspace member');

    const limit = Math.min(Number(req.query.limit) || 50, 100);

    // Get task IDs for this project
    const taskIds = await prisma.task.findMany({
      where: { projectId: req.params.id },
      select: { id: true },
    });

    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { taskId: { in: taskIds.map((t) => t.id) } },
          { metadata: { contains: req.params.id } }, // catch project-level events
        ],
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

/* ── GET /api/activity/mine — Notifications feed ── */
router.get('/mine', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    // Projects the user has access to (via workspace membership)
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.userId! },
      select: { workspaceId: true },
    });
    const workspaceIds = memberships.map((m) => m.workspaceId);

    const projectIds = await prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: { id: true },
    });

    const taskIds = await prisma.task.findMany({
      where: { projectId: { in: projectIds.map((p) => p.id) } },
      select: { id: true },
    });

    const logs = await prisma.activityLog.findMany({
      where: {
        taskId: { in: taskIds.map((t) => t.id) },
        userId: { not: req.userId! }, // exclude own actions
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

/* ── GET /api/projects/:id/analytics ── */
router.get('/projects/:id/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { workspaceId: true },
    });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const inWorkspace = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: req.userId! } },
    });
    if (!inWorkspace) throw new AppError(403, 'FORBIDDEN', 'Not a workspace member');

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.id },
      select: { status: true, priority: true, createdAt: true },
    });

    // Tasks by status
    const byStatus: Record<string, number> = {};
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    }

    // Tasks by priority
    const byPriority: Record<string, number> = {};
    for (const t of tasks) {
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }

    // Tasks created per day — last 14 days
    const now = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toISOString().slice(0, 10);
      const count = tasks.filter((t) => t.createdAt.toISOString().slice(0, 10) === label).length;
      days.push({ date: label, count });
    }

    res.json({ success: true, data: { byStatus, byPriority, createdByDay: days, total: tasks.length } });
  } catch (err) {
    next(err);
  }
});

export { router as activityRoutes };

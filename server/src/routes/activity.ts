import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

/* ────────────────────────────────────────────────────────────
 * projectActivityRouter — mounted at /api/projects
 * routes: /:id/activity  and  /:id/analytics
 * ──────────────────────────────────────────────────────────── */
const projectActivityRouter = Router();
projectActivityRouter.use(authenticate);

async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  });
  if (!member) throw new AppError(403, 'FORBIDDEN', 'Not a workspace member');
}

/* GET /api/projects/:id/activity */
projectActivityRouter.get('/:id/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyProjectAccess(req.params.id as string, req.userId!);
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const taskIds = await prisma.task.findMany({
      where: { projectId: req.params.id as string },
      select: { id: true },
    });

    const logs = await prisma.activityLog.findMany({
      where: { taskId: { in: taskIds.map((t) => t.id) } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

/* GET /api/projects/:id/analytics */
projectActivityRouter.get('/:id/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyProjectAccess(req.params.id as string, req.userId!);

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.id as string },
      select: { status: true, priority: true, createdAt: true },
    });

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    for (const t of tasks) {
      byStatus[t.status]   = (byStatus[t.status]   ?? 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }

    const now = new Date();
    const createdByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toISOString().slice(0, 10);
      const count = tasks.filter((t) => t.createdAt.toISOString().slice(0, 10) === label).length;
      createdByDay.push({ date: label, count });
    }

    res.json({ success: true, data: { byStatus, byPriority, createdByDay, total: tasks.length } });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * notificationsRouter — mounted at /api/activity
 * routes: /mine
 * ──────────────────────────────────────────────────────────── */
const notificationsRouter = Router();
notificationsRouter.use(authenticate);

/* GET /api/activity/mine */
notificationsRouter.get('/mine', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.userId! },
      select: { workspaceId: true },
    });
    const projectIds = await prisma.project.findMany({
      where: { workspaceId: { in: memberships.map((m) => m.workspaceId) } },
      select: { id: true },
    });
    const taskIds = await prisma.task.findMany({
      where: { projectId: { in: projectIds.map((p) => p.id) } },
      select: { id: true },
    });

    const logs = await prisma.activityLog.findMany({
      where: {
        taskId: { in: taskIds.map((t) => t.id) },
        userId: { not: req.userId! },
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

export { projectActivityRouter, notificationsRouter };

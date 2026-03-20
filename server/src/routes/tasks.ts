import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.js';
import { AppError } from '../middleware/error.js';
import { broadcastToProject } from '../lib/socketServer.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ── Helper: verify workspace membership via project ── */
async function verifyTaskAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  });
  if (!member) throw new AppError(403, 'FORBIDDEN', 'Not a member of this workspace');
  return member;
}

/* ────────────────────────────────────────────────────────────
 * POST /api/tasks — Create task
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/',
  validate(createTaskSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;
      await verifyTaskAccess(projectId, req.userId!);

      // Get next position in the same status column
      const lastTask = await prisma.task.findFirst({
        where: { projectId, status: status || 'BACKLOG' },
        orderBy: { position: 'desc' },
      });
      const position = (lastTask?.position ?? -1) + 1;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'BACKLOG',
          priority: priority || 'NONE',
          projectId,
          assigneeId,
          creatorId: req.userId!,
          dueDate: dueDate ? new Date(dueDate) : null,
          position,
        },
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      });

      await prisma.activityLog.create({
        data: {
          action: 'TASK_CREATED',
          entityType: 'TASK',
          entityId: task.id,
          userId: req.userId!,
          taskId: task.id,
          metadata: JSON.stringify({ title: task.title, projectId, status: task.status, priority: task.priority }),
        },
      });

      broadcastToProject(task.projectId, 'task:created', {
        task: task as Record<string, unknown>,
        createdBy: req.userId!,
      });

      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * GET /api/tasks/:id — Get task with comments + attachments
 * ──────────────────────────────────────────────────────────── */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, workspaceId: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        _count: { select: { comments: true, attachments: true } },
      },
    });

    if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * PATCH /api/tasks/:id — Update task
 * ──────────────────────────────────────────────────────────── */
router.patch(
  '/:id',
  validate(updateTaskSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.task.findUnique({
        where: { id: req.params.id },
      });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Task not found');
      await verifyTaskAccess(existing.projectId, req.userId!);

      // Convert dueDate string to Date if present
      const data: Record<string, unknown> = { ...req.body };
      if (typeof data.dueDate === 'string') {
        data.dueDate = new Date(data.dueDate as string);
      }

      const task = await prisma.task.update({
        where: { id: req.params.id },
        data,
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          creator: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      });

      // Log changes
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      for (const key of Object.keys(req.body)) {
        const oldVal = (existing as Record<string, unknown>)[key];
        const newVal = (task as Record<string, unknown>)[key];
        if (String(oldVal) !== String(newVal)) {
          changes[key] = { from: oldVal, to: newVal };
        }
      }

      if (Object.keys(changes).length > 0) {
        await prisma.activityLog.create({
          data: {
            action: 'TASK_UPDATED',
            entityType: 'TASK',
            entityId: task.id,
            userId: req.userId!,
            taskId: task.id,
            metadata: JSON.stringify({ title: task.title, projectId: task.projectId, changes }),
          },
        });
      }

      broadcastToProject(task.projectId, 'task:updated', {
        taskId: task.id,
        changes: req.body as Record<string, unknown>,
        updatedBy: req.userId!,
      });

      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * DELETE /api/tasks/:id — Delete task
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');
    await verifyTaskAccess(task.projectId, req.userId!);

    await prisma.task.delete({ where: { id: req.params.id } });

    await prisma.activityLog.create({
      data: {
        action: 'TASK_DELETED',
        entityType: 'TASK',
        entityId: task.id,
        userId: req.userId!,
        metadata: JSON.stringify({ title: task.title, projectId: task.projectId }),
      },
    });

    broadcastToProject(task.projectId, 'task:deleted', {
      taskId: task.id,
      deletedBy: req.userId!,
    });

    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (err) {
    next(err);
  }
});

export { router as taskRoutes };

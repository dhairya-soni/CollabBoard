import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ── Helper: verify workspace membership ── */
async function verifyMembership(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new AppError(403, 'FORBIDDEN', 'Not a member of this workspace');
  return member;
}

/* ────────────────────────────────────────────────────────────
 * POST /api/projects — Create project
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/',
  validate(createProjectSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description, workspaceId } = req.body;
      await verifyMembership(workspaceId, req.userId!);

      const project = await prisma.project.create({
        data: { name, description, workspaceId },
        include: { _count: { select: { tasks: true } } },
      });

      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * GET /api/projects/:id — Get project with workspace info
 * ──────────────────────────────────────────────────────────── */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: { select: { id: true, name: true, slug: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');
    await verifyMembership(project.workspaceId, req.userId!);

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * PATCH /api/projects/:id — Update project
 * ──────────────────────────────────────────────────────────── */
router.patch(
  '/:id',
  validate(updateProjectSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');
      await verifyMembership(project.workspaceId, req.userId!);

      const updated = await prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
        include: { _count: { select: { tasks: true } } },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * DELETE /api/projects/:id — Delete project (admin only)
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const member = await verifyMembership(project.workspaceId, req.userId!);
    if (member.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can delete projects');
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * GET /api/projects/:id/tasks — List tasks in project
 * ──────────────────────────────────────────────────────────── */
router.get('/:id/tasks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');
    await verifyMembership(project.workspaceId, req.userId!);

    const { status, priority, assigneeId } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        projectId: req.params.id,
        ...(status ? { status: status as string } : {}),
        ...(priority ? { priority: priority as string } : {}),
        ...(assigneeId ? { assigneeId: assigneeId as string } : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

export { router as projectRoutes };

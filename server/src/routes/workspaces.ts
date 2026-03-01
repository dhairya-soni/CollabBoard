import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas/workspace.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ────────────────────────────────────────────────────────────
 * GET /api/workspaces — List workspaces for current user
 * ──────────────────────────────────────────────────────────── */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: {
        _count: { select: { projects: true, members: true } },
        owner: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: workspaces });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * POST /api/workspaces — Create workspace (creator becomes ADMIN)
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/',
  validate(createWorkspaceSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, slug } = req.body;

      const workspace = await prisma.workspace.create({
        data: {
          name,
          slug,
          ownerId: req.userId!,
          members: { create: { userId: req.userId!, role: 'ADMIN' } },
        },
        include: {
          _count: { select: { projects: true, members: true } },
          owner: { select: { id: true, name: true, avatar: true } },
        },
      });

      res.status(201).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * GET /api/workspaces/:id — Get workspace with members
 * ──────────────────────────────────────────────────────────── */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.userId } },
      },
      include: {
        _count: { select: { projects: true, members: true } },
        owner: { select: { id: true, name: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!workspace) throw new AppError(404, 'NOT_FOUND', 'Workspace not found');

    res.json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * PATCH /api/workspaces/:id — Update workspace (admin only)
 * ──────────────────────────────────────────────────────────── */
router.patch(
  '/:id',
  validate(updateWorkspaceSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: req.params.id, userId: req.userId! } },
      });

      if (!membership || membership.role !== 'ADMIN') {
        throw new AppError(403, 'FORBIDDEN', 'Only admins can update this workspace');
      }

      const updated = await prisma.workspace.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          _count: { select: { projects: true, members: true } },
          owner: { select: { id: true, name: true, avatar: true } },
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * DELETE /api/workspaces/:id — Delete workspace (owner only)
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
    });

    if (!workspace) {
      throw new AppError(403, 'FORBIDDEN', 'Only the workspace owner can delete it');
    }

    await prisma.workspace.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Workspace deleted' } });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * GET /api/workspaces/:id/projects — List projects in workspace
 * ──────────────────────────────────────────────────────────── */
router.get('/:id/projects', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: req.params.id, userId: req.userId! } },
    });
    if (!member) throw new AppError(403, 'FORBIDDEN', 'Not a member of this workspace');

    const projects = await prisma.project.findMany({
      where: { workspaceId: req.params.id },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

export { router as workspaceRoutes };

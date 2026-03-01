import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { authRoutes } from './auth.js';
import { workspaceRoutes } from './workspaces.js';
import { projectRoutes } from './projects.js';
import { taskRoutes } from './tasks.js';
import { commentRoutes } from './comments.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

/* ── Auth (unprotected) ── */
router.use('/auth', authRoutes);

/* ── Protected resources ── */
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);

/* ── Nested comment listing under tasks ── */
router.get(
  '/tasks/:taskId/comments',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const comments = await prisma.comment.findMany({
        where: { taskId: req.params.taskId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  },
);

export { router as apiRoutes };

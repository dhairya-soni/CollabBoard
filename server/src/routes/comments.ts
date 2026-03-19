import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCommentSchema, updateCommentSchema } from '../schemas/comment.js';
import { AppError } from '../middleware/error.js';
import { broadcastToProject } from '../lib/socketServer.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ────────────────────────────────────────────────────────────
 * GET /api/tasks/:taskId/comments — List comments on a task
 * (mounted via route index, not directly under /comments)
 * ──────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────
 * POST /api/comments — Create comment
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/',
  validate(createCommentSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content, taskId } = req.body;

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

      const comment = await prisma.comment.create({
        data: { content, taskId, userId: req.userId! },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });

      // Activity log
      await prisma.activityLog.create({
        data: {
          action: 'COMMENT_ADDED',
          entityType: 'COMMENT',
          entityId: comment.id,
          userId: req.userId!,
          taskId,
          metadata: JSON.stringify({ preview: content.slice(0, 100) }),
        },
      });

      broadcastToProject(task.projectId, 'comment:added', {
        taskId,
        comment: comment as Record<string, unknown>,
        addedBy: req.userId!,
      });

      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * PATCH /api/comments/:id — Update own comment
 * ──────────────────────────────────────────────────────────── */
router.patch(
  '/:id',
  validate(updateCommentSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
      if (!comment) throw new AppError(404, 'NOT_FOUND', 'Comment not found');
      if (comment.userId !== req.userId) {
        throw new AppError(403, 'FORBIDDEN', 'Can only edit your own comments');
      }

      const updated = await prisma.comment.update({
        where: { id: req.params.id },
        data: { content: req.body.content },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * DELETE /api/comments/:id — Delete own comment
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError(404, 'NOT_FOUND', 'Comment not found');
    if (comment.userId !== req.userId) {
      throw new AppError(403, 'FORBIDDEN', 'Can only delete your own comments');
    }

    await prisma.comment.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Comment deleted' } });
  } catch (err) {
    next(err);
  }
});

export { router as commentRoutes };

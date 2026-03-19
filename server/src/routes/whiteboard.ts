import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

/* ── Helper: verify project access ── */
async function verifyAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, isPrivate: true },
  });
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

  const inWorkspace = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
  });
  if (!inWorkspace) throw new AppError(403, 'FORBIDDEN', 'Not a workspace member');

  if (project.isPrivate) {
    const pm = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!pm) throw new AppError(403, 'FORBIDDEN', 'Not a project member');
  }
  return project;
}

/* ── GET /api/projects/:id/whiteboard ── */
router.get('/:id/whiteboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyAccess(req.params.id, req.userId!);

    // Upsert: create empty whiteboard if it doesn't exist yet
    const wb = await prisma.whiteboard.upsert({
      where: { projectId: req.params.id },
      create: { projectId: req.params.id, data: '[]' },
      update: {},
    });

    res.json({ success: true, data: { ...wb, elements: JSON.parse(wb.data) } });
  } catch (err) {
    next(err);
  }
});

/* ── PUT /api/projects/:id/whiteboard ── */
router.put('/:id/whiteboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyAccess(req.params.id, req.userId!);

    const { elements } = req.body;
    if (!Array.isArray(elements)) throw new AppError(400, 'VALIDATION_ERROR', 'elements must be an array');

    const wb = await prisma.whiteboard.upsert({
      where: { projectId: req.params.id },
      create: { projectId: req.params.id, data: JSON.stringify(elements) },
      update: { data: JSON.stringify(elements) },
    });

    res.json({ success: true, data: { ...wb, elements } });
  } catch (err) {
    next(err);
  }
});

export { router as whiteboardRoutes };

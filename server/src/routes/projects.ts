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
async function verifyWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new AppError(403, 'FORBIDDEN', 'Not a member of this workspace');
  return member;
}

/* ── Helper: verify project access (workspace + optional private gate) ── */
async function verifyProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, isPrivate: true },
  });
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

  // Must be in the workspace
  await verifyWorkspaceMember(project.workspaceId, userId);

  // Private projects require explicit membership
  if (project.isPrivate) {
    const pm = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!pm) throw new AppError(403, 'FORBIDDEN', 'You do not have access to this project');
    return { project, projectMember: pm };
  }

  return { project, projectMember: null };
}

/* ────────────────────────────────────────────────────────────
 * POST /api/projects — Create project
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/',
  validate(createProjectSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description, workspaceId, isPrivate } = req.body;
      await verifyWorkspaceMember(workspaceId, req.userId!);

      const project = await prisma.project.create({
        data: {
          name,
          description,
          workspaceId,
          isPrivate: isPrivate ?? false,
          // Auto-add creator as project ADMIN when private
          ...(isPrivate
            ? {
                projectMembers: {
                  create: { userId: req.userId!, role: 'ADMIN' },
                },
              }
            : {}),
        },
        include: {
          _count: { select: { tasks: true } },
          projectMembers: {
            include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
          },
        },
      });

      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * GET /api/projects/:id — Get project
 * ──────────────────────────────────────────────────────────── */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyProjectAccess(req.params.id as string, req.userId!);

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: { select: { id: true, name: true, slug: true } },
        _count: { select: { tasks: true } },
        projectMembers: {
          include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
        },
      },
    });

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
      await verifyProjectAccess(req.params.id as string, req.userId!);

      // If switching to private, ensure the updater is a project member
      if (req.body.isPrivate === true) {
        const existing = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId: req.params.id as string, userId: req.userId! } },
        });
        if (!existing) {
          await prisma.projectMember.create({
            data: { projectId: req.params.id as string, userId: req.userId!, role: 'ADMIN' },
          });
        }
      }

      const updated = await prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          _count: { select: { tasks: true } },
          projectMembers: {
            include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
          },
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * DELETE /api/projects/:id — Delete project (workspace admin only)
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const member = await verifyWorkspaceMember(project.workspaceId, req.userId!);
    if (member.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only workspace admins can delete projects');
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
    await verifyProjectAccess(req.params.id as string, req.userId!);

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

/* ────────────────────────────────────────────────────────────
 * GET /api/projects/:id/members — List project members
 * ──────────────────────────────────────────────────────────── */
router.get('/:id/members', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyProjectAccess(req.params.id as string, req.userId!);

    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.id },
      include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * POST /api/projects/:id/members — Add member by email
 * Requires: workspace admin OR project admin
 * ──────────────────────────────────────────────────────────── */
router.post('/:id/members', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, workspaceId: true, isPrivate: true },
    });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    // Must be workspace member
    const wsMember = await verifyWorkspaceMember(project.workspaceId, req.userId!);

    // Check permission: workspace admin OR project admin
    const pmSelf = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id as string, userId: req.userId! } },
    });
    if (wsMember.role !== 'ADMIN' && pmSelf?.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only workspace or project admins can add members');
    }

    const { email, role = 'MEMBER' } = req.body;
    if (!email) throw new AppError(400, 'VALIDATION_ERROR', 'Email is required');
    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role as string)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid role');
    }

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new AppError(404, 'NOT_FOUND', 'No user found with that email');

    // Auto-add to workspace if not already a member (upsert)
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: invitee.id } },
      create: { workspaceId: project.workspaceId, userId: invitee.id, role: 'MEMBER' },
      update: {},
    });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id as string, userId: invitee.id } },
    });
    if (existing) throw new AppError(409, 'ALREADY_MEMBER', 'User is already a project member');

    const newMember = await prisma.projectMember.create({
      data: { projectId: req.params.id as string, userId: invitee.id, role },
      include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * PATCH /api/projects/:id/members/:userId — Change member role
 * ──────────────────────────────────────────────────────────── */
router.patch('/:id/members/:userId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, workspaceId: true },
    });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const wsMember = await verifyWorkspaceMember(project.workspaceId, req.userId!);
    const pmSelf = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id as string, userId: req.userId! } },
    });
    if (wsMember.role !== 'ADMIN' && pmSelf?.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only workspace or project admins can change roles');
    }

    const { role } = req.body;
    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role as string)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid role');
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId: req.params.id as string, userId: req.params.userId as string } },
      data: { role },
      include: { user: { select: { id: true, name: true, avatar: true, email: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

/* ────────────────────────────────────────────────────────────
 * DELETE /api/projects/:id/members/:userId — Remove project member
 * ──────────────────────────────────────────────────────────── */
router.delete('/:id/members/:userId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { id: true, workspaceId: true },
    });
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const wsMember = await verifyWorkspaceMember(project.workspaceId, req.userId!);
    const pmSelf = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id as string, userId: req.userId! } },
    });

    if (wsMember.role !== 'ADMIN' && pmSelf?.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only workspace or project admins can remove members');
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id as string, userId: req.params.userId as string } },
    });

    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (err) {
    next(err);
  }
});

export { router as projectRoutes };

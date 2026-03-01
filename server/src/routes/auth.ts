import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { AppError } from '../middleware/error.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

/* ────────────────────────────────────────────────────────────
 * POST /api/auth/register
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/register',
  validate(registerSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      });

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * POST /api/auth/login
 * ──────────────────────────────────────────────────────────── */
router.post(
  '/login',
  validate(loginSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/* ────────────────────────────────────────────────────────────
 * GET /api/auth/me — Current authenticated user
 * ──────────────────────────────────────────────────────────── */
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

export { router as authRoutes };

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { setupSwagger } from './lib/swagger.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiRoutes } from './routes/index.js';

const app = express();

/* ── Security ── */
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

/* ── Rate limiting (100 req / 15 min per IP) ── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  },
});
app.use('/api', limiter);

/* ── Parsing ── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Logging ── */
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ── Health check ── */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── API routes ── */
app.use('/api', apiRoutes);

/* ── Swagger docs ── */
setupSwagger(app);

/* ── Error handling ── */
app.use(notFound);
app.use(errorHandler);

export { app };

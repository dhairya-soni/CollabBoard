import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { createSocketServer } from './lib/socketServer.js';

async function main() {
  // Verify database connectivity
  await prisma.$connect();
  console.log('✓ Database connected');

  const httpServer = createServer(app);

  // Attach Socket.io
  createSocketServer(httpServer);
  console.log('✓ Socket.io attached');

  httpServer.listen(env.PORT, () => {
    console.log(`✓ Server running on http://localhost:${env.PORT}`);
    console.log(`✓ API docs at http://localhost:${env.PORT}/api-docs`);
    console.log(`  Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

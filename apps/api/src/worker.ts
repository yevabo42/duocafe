/**
 * DuoCafé - BullMQ Worker
 * Procesador de colas asíncronas (gamificación, notificaciones, etc.)
 *
 * Sprint 1: stub. Las colas se implementan en Sprint 2+
 */
import 'reflect-metadata';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function startWorker() {
  logger.info({ env: process.env.NODE_ENV }, 'DuoCafé Worker started (Sprint 1 stub)');

  // Mantener proceso vivo
  // En Sprint 2 se registrarán los Workers de BullMQ aquí:
  // new Worker('badge-evaluation', ..., { connection: redis })
  // new Worker('league-processing', ..., { connection: redis })
  // new Worker('notifications', ..., { connection: redis })
  // new Worker('streak-processing', ..., { connection: redis })
  // new Worker('heart-regeneration', ..., { connection: redis })
  // new Worker('analytics', ..., { connection: redis })

  // Keep-alive hasta Sprint 2 cuando se registren los Workers de BullMQ.
  // Sin un handle activo Node.js termina inmediatamente y Docker reinicia en loop.
  const keepAlive = setInterval(() => {}, 1 << 30);

  process.on('SIGTERM', () => {
    logger.info('Worker shutting down gracefully...');
    clearInterval(keepAlive);
    process.exit(0);
  });
}

startWorker().catch((err) => {
  pino().error(err, 'Worker failed to start');
  process.exit(1);
});

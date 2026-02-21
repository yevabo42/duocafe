/**
 * DuoCafé - Scheduler (Cron Jobs)
 * Siempre corre con replicas: 1 para evitar ejecucion duplicada.
 *
 * Sprint 1: stub. Los crons se implementan en Sprint 2+
 */
import 'reflect-metadata';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function startScheduler() {
  logger.info({ env: process.env.NODE_ENV }, 'DuoCafé Scheduler started (Sprint 1 stub)');

  // En Sprint 2 se registrarán los crons aquí:
  // cron.schedule('0 0 * * 1', resetWeeklyLeagues)    // Lunes 00:00 UTC
  // cron.schedule('0 * * * *', processHeartRegeneration) // Cada hora
  // cron.schedule('5 0 * * *', generateDailyChallenges)  // 00:05 UTC diario
  // cron.schedule('0 0 * * *', updateStreaks)             // Medianoche UTC

  process.on('SIGTERM', () => {
    logger.info('Scheduler shutting down gracefully...');
    process.exit(0);
  });
}

startScheduler().catch((err) => {
  pino().error(err, 'Scheduler failed to start');
  process.exit(1);
});

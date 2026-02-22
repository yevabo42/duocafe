/**
 * DuoCafé - Scheduler (Cron Jobs)
 * Siempre corre con replicas: 1 para evitar ejecución duplicada.
 * Cada 5 minutos busca usuarios con corazones < 5 y next_regen_at <= now,
 * y encola un job de regeneración por cada uno.
 */
import 'reflect-metadata';
import pino from 'pino';
import { Queue } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// Opciones de conexión a Redis pasadas directamente a BullMQ
// (evita conflicto de versiones entre ioredis del proyecto y el de BullMQ)
const redisConnection = {
  host: process.env.REDIS_HOST ?? 'redis',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

async function startScheduler() {
  logger.info({ env: process.env.NODE_ENV }, 'DuoCafé Scheduler iniciando...');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const heartQueue = new Queue('heart-regen', { connection: redisConnection });

  // ----------------------------------------------------------
  // Cron: regeneración de corazones cada 5 minutos
  // Busca usuarios con hearts_remaining < 5 y next_regen_at vencido
  // ----------------------------------------------------------
  async function processHeartRegen() {
    const now = new Date().toISOString();

    const { data: users, error } = await supabase
      .from('user_hearts')
      .select('user_id')
      .lt('hearts_remaining', 5)
      .lte('next_regen_at', now)
      .not('next_regen_at', 'is', null);

    if (error) {
      logger.error({ error: error.message }, 'Error al consultar usuarios para heart-regen');
      return;
    }

    if (!users?.length) {
      logger.debug('No hay usuarios pendientes de regeneración de corazón');
      return;
    }

    logger.info({ count: users.length }, 'Encolando jobs de regeneración de corazón');

    for (const user of users) {
      await heartQueue.add(
        'regen',
        { userId: user.user_id },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );
    }
  }

  // Ejecutar inmediatamente al iniciar
  await processHeartRegen();

  // Ejecutar cada 5 minutos
  const INTERVAL_MS = 5 * 60 * 1000;
  const cronInterval = setInterval(() => {
    processHeartRegen().catch((err) =>
      logger.error({ error: (err as Error).message }, 'Error en cron de heart-regen'),
    );
  }, INTERVAL_MS);

  logger.info('DuoCafé Scheduler listo — ejecutando heart-regen cada 5 minutos');

  process.on('SIGTERM', async () => {
    logger.info('Scheduler cerrando...');
    clearInterval(cronInterval);
    await heartQueue.close();
    process.exit(0);
  });
}

startScheduler().catch((err) => {
  pino().error(err, 'Scheduler falló al iniciar');
  process.exit(1);
});

/**
 * DuoCafé - BullMQ Worker
 * Procesa jobs de regeneración de corazones
 */
import 'reflect-metadata';
import pino from 'pino';
import { Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { MAX_HEARTS, HEART_REGEN_MINUTES } from '@duocafe/shared';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// Opciones de conexión a Redis pasadas directamente a BullMQ
// (evita conflicto de versiones entre ioredis del proyecto y el de BullMQ)
const redisConnection = {
  host: process.env.REDIS_HOST ?? 'redis',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,  // requerido por BullMQ
};

async function startWorker() {
  logger.info({ env: process.env.NODE_ENV }, 'DuoCafé Worker iniciando...');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ----------------------------------------------------------
  // Worker: regeneración de corazones
  // Cola: 'heart-regen' | Job: { userId: string }
  // ----------------------------------------------------------
  const heartWorker = new Worker(
    'heart-regen',
    async (job) => {
      const userId = job.data.userId as string;
      logger.debug({ jobId: job.id, userId }, 'Procesando regeneración de corazón');

      const { data: hearts, error } = await supabase
        .from('user_hearts')
        .select('hearts_remaining, next_regen_at')
        .eq('user_id', userId)
        .single();

      if (error || !hearts) {
        logger.warn({ userId, error }, 'No se encontró registro de corazones');
        return;
      }

      const current = hearts.hearts_remaining as number;
      if (current >= MAX_HEARTS) {
        logger.debug({ userId }, 'Corazones ya completos, nada que hacer');
        return;
      }

      const newRemaining = current + 1;
      const now = new Date();
      const nextRegen =
        newRemaining < MAX_HEARTS
          ? new Date(now.getTime() + HEART_REGEN_MINUTES * 60 * 1000).toISOString()
          : null;

      const { error: updateError } = await supabase
        .from('user_hearts')
        .update({
          hearts_remaining: newRemaining,
          next_regen_at: nextRegen,
          updated_at: now.toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        logger.error({ userId, error: updateError.message }, 'Error al actualizar corazones');
        throw new Error(updateError.message);
      }

      logger.info(
        { userId, hearts_remaining: newRemaining, next_regen_at: nextRegen },
        'Corazón regenerado',
      );
    },
    { connection: redisConnection },
  );

  heartWorker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Job heart-regen completado');
  });

  heartWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Job heart-regen fallido');
  });

  heartWorker.on('error', (err) => {
    logger.error({ error: err.message }, 'Worker error');
  });

  logger.info('DuoCafé Worker listo — escuchando cola heart-regen');

  process.on('SIGTERM', async () => {
    logger.info('Worker cerrando...');
    await heartWorker.close();
    process.exit(0);
  });
}

startWorker().catch((err) => {
  pino().error(err, 'Worker falló al iniciar');
  process.exit(1);
});

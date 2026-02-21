import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class HealthService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

  async checkRedis(): Promise<HealthIndicatorResult> {
    const key = 'redis';
    try {
      const start = Date.now();
      await this.redis.ping();
      const latencyMs = Date.now() - start;
      return {
        [key]: { status: 'up', latencyMs },
      };
    } catch (err) {
      return {
        [key]: {
          status: 'down',
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  async checkDatabase(): Promise<HealthIndicatorResult> {
    const key = 'database';
    try {
      const supabaseUrl = this.config.get<string>('SUPABASE_URL');
      const anonKey = this.config.get<string>('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !anonKey) {
        return { [key]: { status: 'down', error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' } };
      }

      const start = Date.now();
      const res = await fetch(`${supabaseUrl}/rest/v1/brands?select=id&limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { [key]: { status: 'down', error: `HTTP ${res.status}` } };
      }

      const latencyMs = Date.now() - start;
      return { [key]: { status: 'up', latencyMs } };
    } catch (err) {
      return {
        [key]: {
          status: 'down',
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }
}

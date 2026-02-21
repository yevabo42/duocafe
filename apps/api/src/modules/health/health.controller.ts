import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  /**
   * GET /api/v1/health
   * Liveness probe: la app está viva (responde HTTP)
   */
  @Get()
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'duocafe-api',
      version: process.env.npm_package_version ?? '0.1.0',
    };
  }

  /**
   * GET /api/v1/health/ready
   * Readiness probe: dependencias criticas disponibles (DB, Redis)
   */
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      // Memory: alertar si RSS supera 512MB
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      // Redis
      () => this.healthService.checkRedis(),
      // Database (via PostgREST / Supabase REST)
      () => this.healthService.checkDatabase(),
    ]);
  }
}

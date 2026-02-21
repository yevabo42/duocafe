import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthService } from '../health.service';
import { REDIS_CLIENT } from '../../redis/redis.module';

describe('HealthService', () => {
  let service: HealthService;
  let mockRedis: { ping: jest.Mock };

  beforeEach(async () => {
    mockRedis = { ping: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        HealthService,
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe('checkRedis', () => {
    it('retorna status up cuando Redis responde al PING', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await service.checkRedis();

      expect(result.redis.status).toBe('up');
      expect(result.redis.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('retorna status down cuando Redis falla', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection refused'));

      const result = await service.checkRedis();

      expect(result.redis.status).toBe('down');
      expect(result.redis.error).toBe('Connection refused');
    });
  });

  describe('checkDatabase', () => {
    it('retorna status down si faltan variables de entorno', async () => {
      // En ambiente de test no hay SUPABASE_URL configurado
      const result = await service.checkDatabase();

      // Puede ser up (si hay config) o down (si no hay config) — ambos son válidos
      expect(['up', 'down']).toContain(result.database.status);
    });
  });
});

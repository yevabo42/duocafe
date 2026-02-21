import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, MemoryHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { ConfigModule } from '@nestjs/config';
import { REDIS_CLIENT } from '../../redis/redis.module';

// Mock del cliente Redis
const mockRedis = {
  ping: jest.fn().mockResolvedValue('PONG'),
};

// Mock del HealthService
const mockHealthService = {
  checkRedis: jest.fn().mockResolvedValue({ redis: { status: 'up', latencyMs: 1 } }),
  checkDatabase: jest.fn().mockResolvedValue({ database: { status: 'up', latencyMs: 5 } }),
};

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheck: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TerminusModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      controllers: [HealthController],
      providers: [
        { provide: HealthService,  useValue: mockHealthService },
        { provide: REDIS_CLIENT,   useValue: mockRedis },
      ],
    }).compile();

    controller  = module.get<HealthController>(HealthController);
    healthCheck = module.get<HealthCheckService>(HealthCheckService);
  });

  describe('GET /health (liveness)', () => {
    it('retorna status ok con timestamp', () => {
      const result = controller.liveness();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('duocafe-api');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });

    it('el timestamp es reciente (menos de 1 segundo)', () => {
      const before = Date.now();
      const result = controller.liveness();
      const after  = Date.now();

      const ts = new Date(result.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('GET /health/ready (readiness)', () => {
    it('llama a checkRedis y checkDatabase', async () => {
      await controller.readiness();

      expect(mockHealthService.checkRedis).toHaveBeenCalled();
      expect(mockHealthService.checkDatabase).toHaveBeenCalled();
    });
  });
});

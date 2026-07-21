import {
  DiskHealthIndicator,
  HealthCheckService,
  HealthIndicatorService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { Public } from 'src/app/auth/decorators/public-route.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly healthIndicator: HealthIndicatorService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Check if service is healthy',
  })
  async getHealth() {
    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => this.healthIndicator.check('backend').up(),
      async () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      async () =>
        this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }
}

import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  appInfo() {
    return {
      name: this.configService.get<string>('APP_NAME'),
      desc:
        'MyTelU - ' +
        this.configService.get<string>('APP_NAME') +
        ' API Service | Telkom University',
      version: '1.0.0',
      status: 'API Services Ready!',
    };
  }

  @Get('health')
  @HealthCheck()
  async check(): Promise<any> {
    return this.health.check([
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ]);
  }
}

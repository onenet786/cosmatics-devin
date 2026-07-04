import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    let db = 'unknown';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch (e) {
      db = 'error';
    }
    return { status: 'ok', db, timestamp: new Date().toISOString() };
  }
}

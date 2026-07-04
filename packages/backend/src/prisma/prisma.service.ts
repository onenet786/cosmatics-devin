import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: { url: config.get('DATABASE_URL') },
      },
      log: config.get('NODE_ENV') === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (this.config.get('NODE_ENV') === 'production') return;
    const tablenames = await this.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tables = tablenames
      .map(({ tablename }: { tablename: string }) => tablename)
      .filter((name: string) => name !== '_prisma_migrations')
      .map((name: string) => `"public"."${name}"`);
    if (tables.length) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(', ')} CASCADE;`);
    }
  }
}

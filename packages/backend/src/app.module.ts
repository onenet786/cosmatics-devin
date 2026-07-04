import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseSalesModule } from './purchase-sales/purchase-sales.module';
import { PosModule } from './pos/pos.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    ChartOfAccountsModule,
    InventoryModule,
    PurchaseSalesModule,
    PosModule,
    ApprovalsModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

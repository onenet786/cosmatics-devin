import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(tenantId: string, data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeState?: any;
    afterState?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLogEntry.create({
      data: { ...data, tenantId },
    });
  }

  list(tenantId: string, entityType?: string, entityId?: string) {
    return this.prisma.auditLogEntry.findMany({
      where: { tenantId, entityType, entityId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

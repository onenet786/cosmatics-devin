import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  pending(tenantId: string) {
    return this.prisma.approvalRecord.findMany({
      where: { tenantId, status: 'PENDING' },
      include: { requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  myApprovals(tenantId: string, userId: string) {
    return this.prisma.approvalRecord.findMany({
      where: { tenantId, approverId: userId },
      include: { requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  decide(id: string, tenantId: string, approverId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    return this.prisma.approvalRecord.updateMany({
      where: { id, tenantId },
      data: {
        status,
        approverId,
        decisionAt: new Date(),
        reason,
      },
    });
  }

  create(tenantId: string, data: any) {
    return this.prisma.approvalRecord.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING',
      },
    });
  }

  configs(tenantId: string) {
    return this.prisma.approvalChainConfig.findMany({
      where: { tenantId },
    });
  }

  createConfig(tenantId: string, data: any) {
    return this.prisma.approvalChainConfig.create({
      data: { ...data, tenantId },
    });
  }
}

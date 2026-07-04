import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  sessions(tenantId: string, branchId?: string) {
    return this.prisma.posSession.findMany({
      where: { tenantId, branchId },
      include: { branch: true, cashAccount: true },
      orderBy: { openedAt: 'desc' },
    });
  }

  openSession(tenantId: string, data: any) {
    return this.prisma.posSession.create({
      data: {
        ...data,
        tenantId,
        status: 'OPEN',
      },
    });
  }

  closeSession(id: string, tenantId: string, data: any) {
    return this.prisma.posSession.updateMany({
      where: { id, tenantId },
      data: {
        ...data,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  transactions(tenantId: string, sessionId?: string) {
    return this.prisma.posTransaction.findMany({
      where: { tenantId, sessionId },
      include: { lines: { include: { item: true } }, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  createTransaction(tenantId: string, data: any) {
    return this.prisma.posTransaction.create({
      data: {
        ...data,
        tenantId,
      },
      include: { lines: true, payments: true },
    });
  }

  createReturnRequest(tenantId: string, data: any) {
    return this.prisma.posReturnRequest.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING',
      },
    });
  }

  returnRequests(tenantId: string) {
    return this.prisma.posReturnRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

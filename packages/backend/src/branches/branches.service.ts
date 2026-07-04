import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      include: { warehouses: true, cashAccounts: true },
    });
  }

  findOne(id: string, tenantId: string) {
    return this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: { warehouses: true, cashAccounts: true },
    });
  }

  create(tenantId: string, data: any) {
    return this.prisma.branch.create({
      data: { ...data, tenantId },
    });
  }

  update(id: string, tenantId: string, data: any) {
    return this.prisma.branch.updateMany({
      where: { id, tenantId },
      data,
    });
  }
}

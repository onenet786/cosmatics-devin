import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChartOfAccountsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.chartOfAccount.findMany({
      where: { tenantId },
      include: { parent: true, children: true },
      orderBy: { code: 'asc' },
    });
  }

  findOne(id: string, tenantId: string) {
    return this.prisma.chartOfAccount.findFirst({
      where: { id, tenantId },
      include: { parent: true, children: true },
    });
  }

  create(tenantId: string, data: any) {
    return this.prisma.chartOfAccount.create({
      data: { ...data, tenantId },
    });
  }

  update(id: string, tenantId: string, data: any) {
    return this.prisma.chartOfAccount.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async trialBalance(tenantId: string, from: Date, to: Date) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, level: 4 },
      include: { voucherLines: { where: { voucher: { date: { gte: from, lte: to } } } } },
    });
    return accounts.map((a: any) => {
      const debit = a.voucherLines.reduce((sum: number, l: any) => sum + Number(l.debit), 0);
      const credit = a.voucherLines.reduce((sum: number, l: any) => sum + Number(l.credit), 0);
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        opening: a.openingBalance,
        debit,
        credit,
        closing: Number(a.openingBalance) + debit - credit,
      };
    });
  }
}

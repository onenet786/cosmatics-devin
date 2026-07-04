import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [salesToday, purchasesToday, stockValue, ar, ap, lowStock] = await Promise.all([
      this.prisma.posTransaction.aggregate({
        where: { tenantId, date: { gte: today, lt: tomorrow } },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchaseInvoice.aggregate({
        where: { tenantId, date: { gte: today, lt: tomorrow } },
        _sum: { totalAmount: true },
      }),
      this.prisma.stockLedgerEntry.aggregate({
        where: { tenantId },
        _sum: { totalCost: true },
      }),
      this.prisma.partyLedgerEntry.aggregate({
        where: { tenantId, transactionType: 'SALE', balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      this.prisma.partyLedgerEntry.aggregate({
        where: { tenantId, transactionType: 'PURCHASE', balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      this.prisma.item.findMany({
        where: { tenantId },
        include: { stockLedger: { select: { quantityBase: true } } },
      }),
    ]);

    return {
      salesToday: salesToday._sum.totalAmount || 0,
      purchasesToday: purchasesToday._sum.totalAmount || 0,
      stockValue: stockValue._sum.totalCost || 0,
      accountsReceivable: ar._sum.balance || 0,
      accountsPayable: ap._sum.balance || 0,
      lowStockCount: lowStock.filter((i: any) => i.reorderLevel > 0).length,
    };
  }

  async posZReport(sessionId: string) {
    const session = await this.prisma.posSession.findUnique({
      where: { id: sessionId },
      include: { transactions: { include: { lines: true, payments: true } } },
    });
    if (!session) return null;

    const totalSales = session.transactions.reduce((sum: number, t: any) => sum + Number(t.totalAmount), 0);
    const payments: Record<string, number> = {};
    for (const t of session.transactions) {
      for (const p of t.payments) {
        payments[p.mode] = (payments[p.mode] || 0) + Number(p.amount);
      }
    }
    return {
      session,
      totalSales,
      transactionCount: session.transactions.length,
      payments,
    };
  }

  aging(tenantId: string) {
    return this.prisma.partyLedgerEntry.findMany({
      where: { tenantId, balance: { gt: 0 } },
      include: { party: true },
      orderBy: { dueDate: 'asc' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseSalesService {
  constructor(private prisma: PrismaService) {}

  // Purchase Orders
  purchaseOrders(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: { supplier: true, lines: { include: { item: true } } },
      orderBy: { date: 'desc' },
    });
  }

  createPurchaseOrder(tenantId: string, data: any) {
    return this.prisma.purchaseOrder.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  // Sales Orders
  salesOrders(tenantId: string) {
    return this.prisma.salesOrder.findMany({
      where: { tenantId },
      include: { customer: true, lines: { include: { item: true } } },
      orderBy: { date: 'desc' },
    });
  }

  createSalesOrder(tenantId: string, data: any) {
    return this.prisma.salesOrder.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  // Sales Invoices
  salesInvoices(tenantId: string) {
    return this.prisma.salesInvoice.findMany({
      where: { tenantId },
      include: { customer: true, lines: { include: { item: true } } },
      orderBy: { date: 'desc' },
    });
  }

  createSalesInvoice(tenantId: string, data: any) {
    return this.prisma.salesInvoice.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  // Purchase Invoices
  purchaseInvoices(tenantId: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: { tenantId },
      include: { grn: true },
      orderBy: { date: 'desc' },
    });
  }

  // Parties
  parties(tenantId: string) {
    return this.prisma.party.findMany({
      where: { tenantId },
      include: { priceList: true },
    });
  }

  createParty(tenantId: string, data: any) {
    return this.prisma.party.create({ data: { ...data, tenantId } });
  }

  // Price Lists
  priceLists(tenantId: string) {
    return this.prisma.priceList.findMany({
      where: { tenantId },
      include: { items: { include: { item: true, uom: true } } },
    });
  }

  createPriceList(tenantId: string, data: any) {
    return this.prisma.priceList.create({ data: { ...data, tenantId } });
  }
}

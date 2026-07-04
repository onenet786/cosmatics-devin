import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  items(tenantId: string) {
    return this.prisma.item.findMany({
      where: { tenantId },
      include: {
        baseUnit: true,
        variants: true,
        uomConversions: true,
        barcodes: true,
      },
    });
  }

  itemDetail(id: string, tenantId: string) {
    return this.prisma.item.findFirst({
      where: { id, tenantId },
      include: {
        baseUnit: true,
        purchaseUnit: true,
        salesUnit: true,
        variants: true,
        uomConversions: { include: { fromUnit: true, toUnit: true } },
        barcodes: true,
      },
    });
  }

  createItem(tenantId: string, data: any) {
    return this.prisma.item.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async stockLevels(tenantId: string, filters?: any) {
    const entries = await this.prisma.stockLedgerEntry.findMany({
      where: { tenantId, ...filters },
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<string, any> = {};
    for (const e of entries) {
      const key = `${e.itemId}-${e.variantId || 'null'}-${e.warehouseId}`;
      if (!grouped[key]) {
        grouped[key] = {
          itemId: e.itemId,
          variantId: e.variantId,
          warehouseId: e.warehouseId,
          quantityBase: 0,
          value: 0,
        };
      }
      grouped[key].quantityBase += Number(e.quantityBase);
      grouped[key].value += Number(e.totalCost);
    }
    return Object.values(grouped);
  }

  async stockLedger(tenantId: string, itemId: string, warehouseId?: string) {
    return this.prisma.stockLedgerEntry.findMany({
      where: { tenantId, itemId, warehouseId },
      orderBy: { date: 'desc' },
    });
  }

  createAdjustment(tenantId: string, data: any) {
    return this.prisma.stockAdjustment.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  createTransfer(tenantId: string, data: any) {
    return this.prisma.stockTransfer.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING_APPROVAL',
      },
    });
  }
}

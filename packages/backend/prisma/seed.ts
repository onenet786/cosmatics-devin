import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'default-tenant-id';
  const tenant = await prisma.tenant.upsert({
    where: { code: 'DEFAULT' },
    update: {},
    create: {
      id: tenantId,
      name: 'Cosmatics Trading Demo',
      code: 'DEFAULT',
      schemaName: 'tenant_default',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
    },
  });

  // Fiscal year
  const fiscalYear = await prisma.fiscalYear.upsert({
    where: { tenantId_name: { tenantId, name: 'FY 2026-27' } },
    update: {},
    create: {
      id: 'fy-2026',
      tenantId,
      name: 'FY 2026-27',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2027-06-30'),
    },
  });

  // Roles
  const roles = {
    owner: await prisma.role.upsert({
      where: { tenantId_name: { tenantId, name: 'Owner' } },
      update: {},
      create: { tenantId, name: 'Owner', description: 'Full system access', isSystem: true },
    }),
    accountant: await prisma.role.upsert({
      where: { tenantId_name: { tenantId, name: 'Accountant' } },
      update: {},
      create: { tenantId, name: 'Accountant', description: 'Financial and reporting access', isSystem: true },
    }),
    branchManager: await prisma.role.upsert({
      where: { tenantId_name: { tenantId, name: 'Branch Manager' } },
      update: {},
      create: { tenantId, name: 'Branch Manager', description: 'Branch inventory and sales oversight', isSystem: true },
    }),
    cashier: await prisma.role.upsert({
      where: { tenantId_name: { tenantId, name: 'Cashier' } },
      update: {},
      create: { tenantId, name: 'Cashier', description: 'POS operations', isSystem: true },
    }),
  };

  // Permissions
  const modules = ['dashboard', 'inventory', 'purchase-sales', 'pos', 'approvals', 'reports', 'accounting', 'admin'];
  const actions = ['view', 'create', 'edit', 'delete', 'approve'];
  for (const module of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action, description: `${action} ${module}` },
      });
    }
  }

  // Assign all permissions to owner
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles.owner.id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles.owner.id, permissionId: perm.id },
    });
  }

  // Users
  const hash = await bcrypt.hash('Cosmatics2026!', 10);
  const users = {
    owner: await prisma.user.upsert({
      where: { tenantId_email: { tenantId, email: 'owner@cosmatics.local' } },
      update: {},
      create: { tenantId, email: 'owner@cosmatics.local', passwordHash: hash, firstName: 'Owner', lastName: 'Admin', roleId: roles.owner.id },
    }),
    accountant: await prisma.user.upsert({
      where: { tenantId_email: { tenantId, email: 'accountant@cosmatics.local' } },
      update: {},
      create: { tenantId, email: 'accountant@cosmatics.local', passwordHash: hash, firstName: 'Accountant', lastName: 'User', roleId: roles.accountant.id },
    }),
    branchManager: await prisma.user.upsert({
      where: { tenantId_email: { tenantId, email: 'branchmanager@cosmatics.local' } },
      update: {},
      create: { tenantId, email: 'branchmanager@cosmatics.local', passwordHash: hash, firstName: 'Branch', lastName: 'Manager', roleId: roles.branchManager.id },
    }),
    cashier: await prisma.user.upsert({
      where: { tenantId_email: { tenantId, email: 'cashier@cosmatics.local' } },
      update: {},
      create: { tenantId, email: 'cashier@cosmatics.local', passwordHash: hash, firstName: 'POS', lastName: 'Cashier', roleId: roles.cashier.id },
    }),
  };

  // Branches
  const mainBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId, code: 'MAIN' } },
    update: {},
    create: { tenantId, name: 'Main Shop', code: 'MAIN', address: 'DHA Phase 6, Lahore' },
  });
  const gulbergBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId, code: 'GULBERG' } },
    update: {},
    create: { tenantId, name: 'Gulberg Outlet', code: 'GULBERG', address: 'Gulberg III, Lahore' },
  });

  // Warehouses
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { branchId_code: { branchId: mainBranch.id, code: 'MAIN-WH' } },
    update: {},
    create: { tenantId, branchId: mainBranch.id, name: 'Main Warehouse', code: 'MAIN-WH' },
  });
  const gulbergWarehouse = await prisma.warehouse.upsert({
    where: { branchId_code: { branchId: gulbergBranch.id, code: 'GULBERG-WH' } },
    update: {},
    create: { tenantId, branchId: gulbergBranch.id, name: 'Gulberg Stock Room', code: 'GULBERG-WH' },
  });

  // Cash accounts
  const mainCash = await prisma.cashAccount.upsert({
    where: { branchId_code: { branchId: mainBranch.id, code: 'CASH-MAIN' } },
    update: {},
    create: { tenantId, branchId: mainBranch.id, name: 'Main Cash Till', code: 'CASH-MAIN', accountType: 'CASH', glAccountId: 'cash-control' },
  });

  // Chart of accounts
  const coa: any = {};
  coa.assets = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '1000' } },
    update: {},
    create: { tenantId, code: '1000', name: 'Assets', level: 1, type: 'ASSET' },
  });
  coa.liabilities = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '2000' } },
    update: {},
    create: { tenantId, code: '2000', name: 'Liabilities', level: 1, type: 'LIABILITY' },
  });
  coa.revenue = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '4000' } },
    update: {},
    create: { tenantId, code: '4000', name: 'Revenue', level: 1, type: 'REVENUE' },
  });
  coa.cash = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '1100' } },
    update: {},
    create: { tenantId, code: '1100', name: 'Cash & Bank', level: 2, type: 'ASSET', parentId: coa.assets.id },
  });
  coa.cashControl = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '1110' } },
    update: {},
    create: { tenantId: tenantId, code: '1110', name: 'Cash Control', level: 4, type: 'ASSET', parentId: coa.cash.id, isControl: true, isCash: true },
  });
  coa.inventory = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '1200' } },
    update: {},
    create: { tenantId, code: '1200', name: 'Inventory Control', level: 4, type: 'ASSET', parentId: coa.assets.id, isControl: true },
  });
  coa.ar = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '1300' } },
    update: {},
    create: { tenantId, code: '1300', name: 'Accounts Receivable', level: 4, type: 'ASSET', parentId: coa.assets.id, isControl: true },
  });
  coa.ap = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '2100' } },
    update: {},
    create: { tenantId, code: '2100', name: 'Accounts Payable', level: 4, type: 'LIABILITY', parentId: coa.liabilities.id, isControl: true },
  });
  coa.sales = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '4100' } },
    update: {},
    create: { tenantId, code: '4100', name: 'Sales Revenue', level: 4, type: 'REVENUE', parentId: coa.revenue.id },
  });
  coa.cogs = await prisma.chartOfAccount.upsert({
    where: { tenantId_code: { tenantId, code: '5000' } },
    update: {},
    create: { tenantId, code: '5000', name: 'Cost of Goods Sold', level: 4, type: 'EXPENSE', parentId: coa.revenue.id },
  });

  // Update cash account GL reference
  await prisma.cashAccount.update({ where: { id: mainCash.id }, data: { glAccountId: coa.cashControl.id } });

  // Units of measure
  const piece = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId, name: 'Piece' } },
    update: {},
    create: { tenantId, name: 'Piece', symbol: 'pc', isBaseUnit: true },
  });
  const dozen = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId, name: 'Dozen' } },
    update: {},
    create: { tenantId, name: 'Dozen', symbol: 'dz', isBaseUnit: false },
  });
  const carton = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId, name: 'Carton' } },
    update: {},
    create: { tenantId, name: 'Carton', symbol: 'ctn', isBaseUnit: false },
  });

  // Tax categories
  const taxGeneral = await prisma.taxCategory.upsert({
    where: { tenantId_name: { tenantId, name: 'General Sales Tax' } },
    update: {},
    create: { tenantId, name: 'General Sales Tax', ratePct: 18 },
  });

  // Item categories
  const skincare = await prisma.itemCategory.upsert({
    where: { tenantId_name: { tenantId, name: 'Skincare' } },
    update: {},
    create: { tenantId, name: 'Skincare' },
  });
  const makeup = await prisma.itemCategory.upsert({
    where: { tenantId_name: { tenantId, name: 'Makeup' } },
    update: {},
    create: { tenantId, name: 'Makeup' },
  });

  // Brands
  const brandA = await prisma.brand.upsert({
    where: { tenantId_name: { tenantId, name: 'Glamour Glow' } },
    update: {},
    create: { tenantId, name: 'Glamour Glow' },
  });

  // Items
  const item1 = await prisma.item.upsert({
    where: { tenantId_code: { tenantId, code: 'GG-CREAM-001' } },
    update: {},
    create: {
      tenantId,
      code: 'GG-CREAM-001',
      name: 'Glamour Glow Face Cream 50ml',
      categoryId: skincare.id,
      brandId: brandA.id,
      baseUnitId: piece.id,
      purchaseUnitId: carton.id,
      salesUnitId: piece.id,
      taxCategoryId: taxGeneral.id,
      isBatchTracked: true,
      reorderLevel: 50,
    },
  });

  const item2 = await prisma.item.upsert({
    where: { tenantId_code: { tenantId, code: 'GG-LIPSTICK-001' } },
    update: {},
    create: {
      tenantId,
      code: 'GG-LIPSTICK-001',
      name: 'Glamour Glow Lipstick',
      categoryId: makeup.id,
      brandId: brandA.id,
      baseUnitId: piece.id,
      salesUnitId: piece.id,
      taxCategoryId: taxGeneral.id,
      isBatchTracked: false,
      reorderLevel: 100,
    },
  });

  // Item variants
  const variant1 = await prisma.itemVariant.upsert({
    where: { tenantId_sku: { tenantId, sku: 'GG-CREAM-001-ROSE' } },
    update: {},
    create: { tenantId, itemId: item1.id, sku: 'GG-CREAM-001-ROSE', attributes: { shade: 'Rose' } },
  });

  // UOM conversions
  await prisma.itemUOMConversion.upsert({
    where: { tenantId_itemId_fromUnitId_toUnitId: { tenantId, itemId: item1.id, fromUnitId: carton.id, toUnitId: piece.id } },
    update: {},
    create: { tenantId, itemId: item1.id, fromUnitId: carton.id, toUnitId: piece.id, factor: 144 },
  });
  await prisma.itemUOMConversion.upsert({
    where: { tenantId_itemId_fromUnitId_toUnitId: { tenantId, itemId: item1.id, fromUnitId: dozen.id, toUnitId: piece.id } },
    update: {},
    create: { tenantId, itemId: item1.id, fromUnitId: dozen.id, toUnitId: piece.id, factor: 12 },
  });

  // Barcodes
  await prisma.barcode.upsert({
    where: { tenantId_code: { tenantId, code: '8901234567890' } },
    update: {},
    create: { tenantId, itemId: item1.id, variantId: variant1.id, uomId: piece.id, code: '8901234567890' },
  });
  await prisma.barcode.upsert({
    where: { tenantId_code: { tenantId, code: '8901234567891' } },
    update: {},
    create: { tenantId, itemId: item1.id, uomId: carton.id, code: '8901234567891' },
  });

  // Parties
  const customer = await prisma.party.upsert({
    where: { tenantId_name: { tenantId, name: 'ABC Salon' } },
    update: {},
    create: { tenantId, name: 'ABC Salon', type: 'CUSTOMER', subClass: 'SALON', creditLimit: 50000, creditPeriodDays: 15 },
  });
  const supplier = await prisma.party.upsert({
    where: { tenantId_name: { tenantId, name: 'Glamour Glow Distributor' } },
    update: {},
    create: { tenantId, name: 'Glamour Glow Distributor', type: 'SUPPLIER', subClass: 'DISTRIBUTOR', creditLimit: 200000, creditPeriodDays: 30 },
  });

  // Price lists
  const retailPriceList = await prisma.priceList.upsert({
    where: { tenantId_name: { tenantId, name: 'Retail Price List' } },
    update: {},
    create: { tenantId, name: 'Retail Price List', appliesTo: 'RETAILER', isDefault: true, effectiveFrom: new Date('2026-07-01') },
  });
  const salonPriceList = await prisma.priceList.upsert({
    where: { tenantId_name: { tenantId, name: 'Salon Price List' } },
    update: {},
    create: { tenantId, name: 'Salon Price List', appliesTo: 'SALON', isDefault: false, effectiveFrom: new Date('2026-07-01') },
  });

  // Link customer to salon price list
  await prisma.party.update({ where: { id: customer.id }, data: { priceListId: salonPriceList.id } });

  await prisma.priceListItem.upsert({
    where: { id: 'retail-item1' },
    update: {},
    create: { priceListId: retailPriceList.id, itemId: item1.id, uomId: piece.id, unitPrice: 850, minQty: 1 },
  });
  await prisma.priceListItem.upsert({
    where: { id: 'salon-item1' },
    update: {},
    create: { priceListId: salonPriceList.id, itemId: item1.id, uomId: piece.id, unitPrice: 750, minQty: 1 },
  });

  // Purchase order
  const po = await prisma.purchaseOrder.upsert({
    where: { tenantId_branchId_fiscalYearId_number: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, number: 'PO-0001' } },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      supplierId: supplier.id,
      fiscalYearId: fiscalYear.id,
      number: 'PO-0001',
      date: new Date(),
      subtotal: 120000,
      taxAmount: 21600,
      totalAmount: 141600,
      status: 'APPROVED',
    },
  });

  // Purchase order line
  const poLine = await prisma.purchaseOrderLine.upsert({
    where: { id: 'po-line-1' },
    update: {},
    create: {
      id: 'po-line-1',
      orderId: po.id,
      itemId: item1.id,
      variantId: variant1.id,
      uomId: carton.id,
      quantity: 144,
      quantityBase: 144,
      unitPrice: 500,
      total: 72000,
    },
  });

  // Batch (moved before GRN line)
  const batch = await prisma.batch.upsert({
    where: { tenantId_itemId_variantId_warehouseId_batchNo: { tenantId, itemId: item1.id, variantId: variant1.id, warehouseId: mainWarehouse.id, batchNo: 'BATCH-001' } },
    update: {},
    create: { tenantId, itemId: item1.id, variantId: variant1.id, warehouseId: mainWarehouse.id, batchNo: 'BATCH-001', expiryDate: new Date('2028-06-30'), quantity: 144, costPrice: 500 },
  });

  // GRN
  const grn = await prisma.goodsReceivedNote.upsert({
    where: { tenantId_branchId_fiscalYearId_number: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, number: 'GRN-0001' } },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      warehouseId: mainWarehouse.id,
      poId: po.id,
      supplierId: supplier.id,
      fiscalYearId: fiscalYear.id,
      number: 'GRN-0001',
      date: new Date(),
    },
  });
  await prisma.goodsReceivedNoteLine.upsert({
    where: { id: 'grn-line-1' },
    update: {},
    create: { grnId: grn.id, poLineId: poLine.id, itemId: item1.id, variantId: variant1.id, batchId: batch.id, uomId: piece.id, quantity: 144, quantityBase: 144, unitPrice: 500, total: 72000 },
  });

  // Purchase invoice
  await prisma.purchaseInvoice.upsert({
    where: { tenantId_branchId_fiscalYearId_number: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, number: 'PI-0001' } },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      supplierId: supplier.id,
      grnId: grn.id,
      fiscalYearId: fiscalYear.id,
      number: 'PI-0001',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 120000,
      taxAmount: 21600,
      totalAmount: 141600,
      balanceAmount: 141600,
    },
  });

  // Stock ledger entry
  await prisma.stockLedgerEntry.upsert({
    where: { id: 'sle-001' },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      warehouseId: mainWarehouse.id,
      itemId: item1.id,
      variantId: variant1.id,
      transactionType: 'GRN',
      referenceType: 'GoodsReceivedNote',
      referenceId: grn.id,
      referenceNo: grn.number,
      date: new Date(),
      quantityBase: 144,
      unitCost: 500,
      totalCost: 72000,
      runningQty: 144,
      runningValue: 72000,
    },
  });

  // Sales order
  const so = await prisma.salesOrder.upsert({
    where: { tenantId_branchId_number: { tenantId, branchId: mainBranch.id, number: 'SO-0001' } },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      customerId: customer.id,
      number: 'SO-0001',
      date: new Date(),
      subtotal: 15000,
      taxAmount: 2700,
      totalAmount: 17700,
    },
  });

  // Sales invoice
  await prisma.salesInvoice.upsert({
    where: { tenantId_branchId_fiscalYearId_number: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, number: 'SI-0001' } },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      customerId: customer.id,
      orderId: so.id,
      fiscalYearId: fiscalYear.id,
      number: 'SI-0001',
      date: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      subtotal: 15000,
      taxAmount: 2700,
      totalAmount: 17700,
      balanceAmount: 17700,
    },
  });

  // POS session
  const session = await prisma.posSession.upsert({
    where: { id: 'pos-session-1' },
    update: {},
    create: { tenantId, branchId: mainBranch.id, cashAccountId: mainCash.id, cashierId: users.cashier.id, openingFloat: 5000 },
  });

  // POS transaction
  await prisma.posTransaction.upsert({
    where: { id: 'pos-tx-1' },
    update: {},
    create: {
      tenantId,
      branchId: mainBranch.id,
      sessionId: session.id,
      number: 'POS-0001',
      date: new Date(),
      subtotal: 1700,
      taxAmount: 306,
      totalAmount: 2006,
      status: 'COMPLETED',
    },
  });

  // Voucher sequence
  await prisma.voucherSequence.upsert({
    where: { tenantId_branchId_fiscalYearId_type: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, type: 'PAYMENT' } },
    update: {},
    create: { tenantId, branchId: mainBranch.id, fiscalYearId: fiscalYear.id, type: 'PAYMENT', prefix: 'PAY', nextNumber: 1 },
  });

  // Approval chain config
  await prisma.approvalChainConfig.upsert({
    where: { id: 'approval-config-1' },
    update: {},
    create: { tenantId, module: 'sales_return', thresholdAmount: 5000, approverRoleId: roles.owner.id },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

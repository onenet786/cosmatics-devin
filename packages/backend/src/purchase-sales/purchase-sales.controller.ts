import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseSalesService } from './purchase-sales.service';

@ApiTags('Purchase & Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-sales')
export class PurchaseSalesController {
  constructor(private service: PurchaseSalesService) {}

  // Parties
  @Get('parties')
  parties() {
    return this.service.parties('default');
  }

  @Post('parties')
  createParty(@Body() body: any) {
    return this.service.createParty('default', body);
  }

  // Purchase Orders
  @Get('purchase-orders')
  purchaseOrders() {
    return this.service.purchaseOrders('default');
  }

  @Post('purchase-orders')
  createPurchaseOrder(@Body() body: any) {
    return this.service.createPurchaseOrder('default', body);
  }

  // Purchase Invoices
  @Get('purchase-invoices')
  purchaseInvoices() {
    return this.service.purchaseInvoices('default');
  }

  // Sales Orders
  @Get('sales-orders')
  salesOrders() {
    return this.service.salesOrders('default');
  }

  @Post('sales-orders')
  createSalesOrder(@Body() body: any) {
    return this.service.createSalesOrder('default', body);
  }

  // Sales Invoices
  @Get('sales-invoices')
  salesInvoices() {
    return this.service.salesInvoices('default');
  }

  @Post('sales-invoices')
  createSalesInvoice(@Body() body: any) {
    return this.service.createSalesInvoice('default', body);
  }

  // Price Lists
  @Get('price-lists')
  priceLists() {
    return this.service.priceLists('default');
  }

  @Post('price-lists')
  createPriceList(@Body() body: any) {
    return this.service.createPriceList('default', body);
  }
}

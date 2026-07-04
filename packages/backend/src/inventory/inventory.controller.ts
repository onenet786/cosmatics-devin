import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get('items')
  items() {
    return this.service.items('default');
  }

  @Get('items/:id')
  itemDetail(@Param('id') id: string) {
    return this.service.itemDetail(id, 'default');
  }

  @Post('items')
  createItem(@Body() body: any) {
    return this.service.createItem('default', body);
  }

  @Get('stock-levels')
  stockLevels(@Query() query: any) {
    return this.service.stockLevels('default', query);
  }

  @Get('stock-ledger/:itemId')
  stockLedger(@Param('itemId') itemId: string, @Query('warehouseId') warehouseId?: string) {
    return this.service.stockLedger('default', itemId, warehouseId);
  }

  @Post('adjustments')
  createAdjustment(@Body() body: any) {
    return this.service.createAdjustment('default', body);
  }

  @Post('transfers')
  createTransfer(@Body() body: any) {
    return this.service.createTransfer('default', body);
  }
}

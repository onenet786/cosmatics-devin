import { Module } from '@nestjs/common';
import { PurchaseSalesService } from './purchase-sales.service';
import { PurchaseSalesController } from './purchase-sales.controller';

@Module({
  controllers: [PurchaseSalesController],
  providers: [PurchaseSalesService],
  exports: [PurchaseSalesService],
})
export class PurchaseSalesModule {}

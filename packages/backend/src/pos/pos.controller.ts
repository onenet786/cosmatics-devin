import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PosService } from './pos.service';

@ApiTags('POS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {
  constructor(private service: PosService) {}

  @Get('sessions')
  sessions(@Query('branchId') branchId?: string) {
    return this.service.sessions('default', branchId);
  }

  @Post('sessions')
  openSession(@Body() body: any) {
    return this.service.openSession('default', body);
  }

  @Patch('sessions/:id/close')
  closeSession(@Param('id') id: string, @Body() body: any) {
    return this.service.closeSession(id, 'default', body);
  }

  @Get('transactions')
  transactions(@Query('sessionId') sessionId?: string) {
    return this.service.transactions('default', sessionId);
  }

  @Post('transactions')
  createTransaction(@Body() body: any) {
    return this.service.createTransaction('default', body);
  }

  @Get('return-requests')
  returnRequests() {
    return this.service.returnRequests('default');
  }

  @Post('return-requests')
  createReturnRequest(@Body() body: any) {
    return this.service.createReturnRequest('default', body);
  }
}

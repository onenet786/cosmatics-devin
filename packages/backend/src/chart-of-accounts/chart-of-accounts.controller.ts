import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChartOfAccountsService } from './chart-of-accounts.service';

@ApiTags('Chart of Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(private service: ChartOfAccountsService) {}

  @Get()
  list() {
    return this.service.findAll('default');
  }

  @Get('trial-balance')
  trialBalance(@Query('from') from: string, @Query('to') to: string) {
    return this.service.trialBalance('default', new Date(from), new Date(to));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id, 'default');
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create('default', body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, 'default', body);
  }
}

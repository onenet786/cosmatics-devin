import { Controller, Get, Post, Body, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private service: ApprovalsService) {}

  @Get('pending')
  pending() {
    return this.service.pending('default');
  }

  @Get('my-approvals')
  myApprovals(@Request() req: any) {
    return this.service.myApprovals('default', req.user.userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create('default', body);
  }

  @Patch(':id/decide')
  decide(@Param('id') id: string, @Request() req: any, @Body() body: { status: 'APPROVED' | 'REJECTED'; reason?: string }) {
    return this.service.decide(id, 'default', req.user.userId, body.status, body.reason);
  }

  @Get('configs')
  configs() {
    return this.service.configs('default');
  }

  @Post('configs')
  createConfig(@Body() body: any) {
    return this.service.createConfig('default', body);
  }
}

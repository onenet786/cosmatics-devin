import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard('default');
  }

  @Get('pos-z-report/:sessionId')
  posZReport(@Param('sessionId') sessionId: string) {
    return this.service.posZReport(sessionId);
  }

  @Get('aging')
  aging() {
    return this.service.aging('default');
  }
}

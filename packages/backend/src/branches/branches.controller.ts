import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BranchesService } from './branches.service';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Get()
  list() {
    return this.service.findAll('default');
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

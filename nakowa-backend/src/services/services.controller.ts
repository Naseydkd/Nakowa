import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('services')
@UseGuards(AuthGuard('jwt'))
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() data: any) {
    return this.servicesService.create(data);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.servicesService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.update(id, data);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.servicesService.deactivate(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }

  @Get('stats')
  async getStats() {
    return this.servicesService.getStats();
  }
}

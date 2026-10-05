import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PaymentsService } from '../payments/payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('import')
  async importClients(@Body() body: { clients: Array<{ name: string; phone: string; activity?: string; number?: string; defaultAmount?: number; address?: string }> }) {
    console.log('📥 Import endpoint called with data:', body);
    return this.clientsService.importClients(body.clients);
  }

  @Get('map')
  async getClientsForMap() {
    return this.clientsService.getClientsForMap();
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.clientsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Get(':id/payments')
  async getClientPayments(@Param('id') id: string) {
    return this.paymentsService.findByClient(id);
  }

  @Get(':id/collections')
  async getClientCollections(@Param('id') id: string) {
    return this.clientsService.getClientCollections(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.clientsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.clientsService.update(id, data);
  }

  @Patch(':id/default-amount')
  async updateDefaultAmount(@Param('id') id: string, @Body() body: { defaultAmount: number }) {
    return this.clientsService.updateDefaultAmount(id, body.defaultAmount);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.clientsService.deactivate(id);
  }
}

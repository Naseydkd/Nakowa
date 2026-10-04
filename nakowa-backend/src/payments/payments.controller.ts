import { Controller, Get, Post, Delete, Param, Query, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    async findAll(@Query() filters: any) {
        return this.paymentsService.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.paymentsService.findOne(id);
    }

    @Post()
    async create(@Body() data: any, @Request() req) {
        return this.paymentsService.create(data, req.user.id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.paymentsService.delete(id);
    }
}

import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll(@Query('month') month?: string, @Query('year') year?: string) {
        return this.subscriptionsService.getAllSubscriptions(month, year);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Param('id') id: string) {
        return this.subscriptionsService.getSubscriptionById(id);
    }

    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() data: any) {
        return this.subscriptionsService.createSubscription(
            data.clientId,
            data.serviceId,
            data.amount,
            data.period,
            new Date(data.startDate),
            new Date(data.endDate)
        );
    }

    @Post('prepare-month')
    @UseGuards(AuthGuard('jwt'))
    async prepareMonth(@Query('month') month?: string, @Query('year') year?: string) {
        return this.subscriptionsService.prepareMonth(month, year);
    }

    @Delete('reset')
    async resetMonth(@Query('month') month: string, @Query('year') year: string) {
        return this.subscriptionsService.resetMonth(month, year);
    }
}

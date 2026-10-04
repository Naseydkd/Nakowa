import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    async getStats(@Query('month') month?: string, @Query('year') year?: string) {
        return this.dashboardService.getStats(month, year);
    }
}

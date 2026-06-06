import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  sales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.salesReport({ startDate, endDate });
  }

  @Get('revenue')
  revenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.revenueReport({ startDate, endDate });
  }

  @Get('inventory')
  inventory(
    @Query('leadDays') leadDays?: string,
    @Query('inactivityDays') inactivityDays?: string,
  ) {
    return this.reportsService.inventoryReport(
      Number(leadDays ?? 30),
      Number(inactivityDays ?? 30),
    );
  }
}

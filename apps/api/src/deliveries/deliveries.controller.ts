import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DeliveriesService } from './deliveries.service';
import { DeliveryDto } from './dto/delivery.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  listDeliveries(@Query('supplierId') supplierId?: string) {
    return this.deliveriesService.listDeliveries(supplierId);
  }

  @Post()
  receiveDelivery(@Body() body: DeliveryDto) {
    return this.deliveriesService.receiveDelivery(body);
  }
}

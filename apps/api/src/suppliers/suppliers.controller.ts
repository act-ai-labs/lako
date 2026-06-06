import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PurchaseOrderStatus } from '../database/entities';
import { PurchaseOrderDto } from './dto/purchase-order.dto';
import { SupplierDto } from './dto/supplier.dto';
import { SuppliersService } from './suppliers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('suppliers')
  listSuppliers(@Query('search') search?: string) {
    return this.suppliersService.listSuppliers(search);
  }

  @Post('suppliers')
  createSupplier(@Body() body: SupplierDto) {
    return this.suppliersService.createSupplier(body);
  }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() body: SupplierDto) {
    return this.suppliersService.updateSupplier(id, body);
  }

  @Get('purchase-orders')
  listPurchaseOrders(@Query('status') status?: PurchaseOrderStatus) {
    return this.suppliersService.listPurchaseOrders(status);
  }

  @Post('purchase-orders')
  createPurchaseOrder(@Body() body: PurchaseOrderDto) {
    return this.suppliersService.createPurchaseOrder(body);
  }
}

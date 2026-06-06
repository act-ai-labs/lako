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
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../database/entities';
import { CategoryDto } from './dto/category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  listProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('stockStatus') stockStatus?: 'low' | 'out',
  ) {
    return this.inventoryService.listProducts({
      search,
      categoryId,
      stockStatus,
    });
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post('products')
  createProduct(@Body() body: CreateProductDto) {
    return this.inventoryService.createProduct(body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.inventoryService.updateProduct(id, body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post('products/:id/stock-adjustments')
  adjustStock(@Param('id') id: string, @Body() body: StockAdjustmentDto) {
    return this.inventoryService.adjustStock(id, body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post('products/import-csv')
  importCsv(@Body('csv') csv: string) {
    return this.inventoryService.importCsv(csv);
  }

  @Get('categories')
  listCategories() {
    return this.inventoryService.listCategories();
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post('categories')
  createCategory(@Body() body: CategoryDto) {
    return this.inventoryService.createCategory(body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: CategoryDto) {
    return this.inventoryService.updateCategory(id, body);
  }
}

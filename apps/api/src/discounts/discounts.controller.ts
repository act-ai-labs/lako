import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../database/entities';
import { DiscountsService } from './discounts.service';
import { DiscountRuleDto } from './dto/discount-rule.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  listRules() {
    return this.discountsService.listRules();
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post()
  createRule(@Body() body: DiscountRuleDto) {
    return this.discountsService.createRule(body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Patch(':id')
  updateRule(@Param('id') id: string, @Body() body: DiscountRuleDto) {
    return this.discountsService.updateRule(id, body);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Delete(':id')
  deleteRule(@Param('id') id: string) {
    return this.discountsService.deleteRule(id);
  }
}

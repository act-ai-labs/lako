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
import { ExpenseCategoryDto, ExpenseDto } from './dto/expense.dto';
import { ExpensesService } from './expenses.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('expenses')
  listExpenses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.expensesService.listExpenses({
      startDate,
      endDate,
      categoryId,
      supplierId,
    });
  }

  @Post('expenses')
  createExpense(@Body() body: ExpenseDto) {
    return this.expensesService.createExpense(body);
  }

  @Patch('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() body: ExpenseDto) {
    return this.expensesService.updateExpense(id, body);
  }

  @Get('expense-categories')
  listCategories() {
    return this.expensesService.listCategories();
  }

  @Post('expense-categories')
  createCategory(@Body() body: ExpenseCategoryDto) {
    return this.expensesService.createCategory(body);
  }

  @Patch('expense-categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: ExpenseCategoryDto) {
    return this.expensesService.updateCategory(id, body);
  }
}

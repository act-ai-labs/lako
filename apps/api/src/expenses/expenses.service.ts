import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { Expense, ExpenseCategory } from '../database/entities';
import { ExpenseCategoryDto, ExpenseDto } from './dto/expense.dto';

interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  supplierId?: string;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense, POSTGRES_CONNECTION)
    private readonly expensesRepo: Repository<Expense>,
    @InjectRepository(ExpenseCategory, POSTGRES_CONNECTION)
    private readonly categoriesRepo: Repository<ExpenseCategory>,
  ) {}

  listExpenses(filters: ExpenseFilters): Promise<Expense[]> {
    return this.expensesRepo.find({
      where: {
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.supplierId ? { supplierId: filters.supplierId } : {}),
        ...(filters.startDate && filters.endDate
          ? { date: Between(filters.startDate, filters.endDate) }
          : {}),
      },
      relations: { category: true, supplier: true },
      order: { date: 'DESC' },
    });
  }

  createExpense(dto: ExpenseDto): Promise<Expense> {
    return this.expensesRepo.save(
      this.expensesRepo.create({
        categoryId: dto.categoryId,
        amount: dto.amount,
        date: dto.date,
        description: dto.description ?? null,
        supplierId: dto.supplierId ?? null,
      }),
    );
  }

  async updateExpense(id: string, dto: ExpenseDto): Promise<Expense> {
    const expense = await this.expensesRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    Object.assign(expense, {
      categoryId: dto.categoryId,
      amount: dto.amount,
      date: dto.date,
      description: dto.description ?? null,
      supplierId: dto.supplierId ?? null,
    });
    return this.expensesRepo.save(expense);
  }

  listCategories(): Promise<ExpenseCategory[]> {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  createCategory(dto: ExpenseCategoryDto): Promise<ExpenseCategory> {
    return this.categoriesRepo.save(this.categoriesRepo.create(dto));
  }

  async updateCategory(
    id: string,
    dto: ExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Expense category not found');
    category.name = dto.name;
    return this.categoriesRepo.save(category);
  }
}

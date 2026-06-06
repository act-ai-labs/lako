import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  Expense,
  Product,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../database/entities';

interface Period {
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction, POSTGRES_CONNECTION)
    private readonly transactionsRepo: Repository<Transaction>,
    @InjectRepository(Expense, POSTGRES_CONNECTION)
    private readonly expensesRepo: Repository<Expense>,
    @InjectRepository(Product, POSTGRES_CONNECTION)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async salesReport(period: Period) {
    const transactions = await this.transactionsRepo.find({
      where: {
        status: TransactionStatus.COMPLETED,
        type: TransactionType.SALE,
        ...(period.startDate && period.endDate
          ? {
              createdAt: Between(
                new Date(period.startDate),
                new Date(period.endDate),
              ),
            }
          : {}),
      },
      relations: { items: { product: { category: true } }, payments: true },
    });
    const items = transactions.flatMap((transaction) => transaction.items);
    const revenue = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.total),
      0,
    );
    const unitsSold = items.reduce((sum, item) => sum + item.qty, 0);
    const byProduct = new Map<
      string,
      { product: string; units: number; revenue: number; cogs: number }
    >();
    const byCategory = new Map<
      string,
      { category: string; units: number; revenue: number }
    >();
    const byPayment = new Map<string, number>();

    for (const item of items) {
      const key = item.product?.id ?? 'unknown';
      const current = byProduct.get(key) ?? {
        product: item.product?.name ?? 'Unknown',
        units: 0,
        revenue: 0,
        cogs: 0,
      };
      current.units += item.qty;
      current.revenue +=
        Number(item.unitPrice) * item.qty - Number(item.discountAmount);
      current.cogs += Number(item.product?.unitCost ?? 0) * item.qty;
      byProduct.set(key, current);
      const category = item.product?.category?.name ?? 'Uncategorized';
      const categoryCurrent = byCategory.get(category) ?? {
        category,
        units: 0,
        revenue: 0,
      };
      categoryCurrent.units += item.qty;
      categoryCurrent.revenue +=
        Number(item.unitPrice) * item.qty - Number(item.discountAmount);
      byCategory.set(category, categoryCurrent);
    }
    for (const payment of transactions.flatMap(
      (transaction) => transaction.payments,
    )) {
      byPayment.set(
        payment.method,
        (byPayment.get(payment.method) ?? 0) + Number(payment.amount),
      );
    }

    return {
      totals: {
        revenue: revenue.toFixed(2),
        transactions: transactions.length,
        averageTransaction: transactions.length
          ? (revenue / transactions.length).toFixed(2)
          : '0.00',
        unitsSold,
      },
      byProduct: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue),
      byCategory: [...byCategory.values()],
      byPayment: [...byPayment.entries()].map(([method, amount]) => ({
        method,
        amount: amount.toFixed(2),
      })),
    };
  }

  async revenueReport(period: Period) {
    const sales = await this.salesReport(period);
    const expenses = await this.expensesRepo.find({
      where:
        period.startDate && period.endDate
          ? { date: Between(period.startDate, period.endDate) }
          : {},
      relations: { category: true },
    });
    const expenseTotal = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );
    const cogs = sales.byProduct.reduce(
      (sum, product) => sum + product.cogs,
      0,
    );
    const byExpenseCategory = new Map<string, number>();
    for (const expense of expenses) {
      byExpenseCategory.set(
        expense.category.name,
        (byExpenseCategory.get(expense.category.name) ?? 0) +
          Number(expense.amount),
      );
    }
    const serviceTransactions = await this.transactionsRepo.find({
      where: [
        TransactionType.GCASH_IN,
        TransactionType.GCASH_OUT,
        TransactionType.LOAD,
      ].map((type) => ({
        type,
        status: TransactionStatus.COMPLETED,
      })),
    });
    const gcashServiceIncome = serviceTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.total),
      0,
    );
    const revenue = Number(sales.totals.revenue) + gcashServiceIncome;

    return {
      revenue: revenue.toFixed(2),
      productSales: sales.totals.revenue,
      gcashServiceIncome: gcashServiceIncome.toFixed(2),
      cogs: cogs.toFixed(2),
      grossProfit: (revenue - cogs).toFixed(2),
      expenses: expenseTotal.toFixed(2),
      netProfit: (revenue - cogs - expenseTotal).toFixed(2),
      byExpenseCategory: [...byExpenseCategory.entries()].map(
        ([category, amount]) => ({
          category,
          amount: amount.toFixed(2),
        }),
      ),
    };
  }

  async inventoryReport(leadDays = 30, inactivityDays = 30) {
    const products = await this.productsRepo.find({
      relations: { category: true },
    });
    const now = new Date();
    const lead = new Date(now.getTime() + leadDays * 24 * 60 * 60 * 1000);
    return {
      expiring: products
        .filter(
          (product) =>
            product.expiryDate && new Date(product.expiryDate) <= lead,
        )
        .sort((a, b) =>
          String(a.expiryDate).localeCompare(String(b.expiryDate)),
        ),
      lowStock: products.filter(
        (product) => product.stockQty <= product.reorderPoint,
      ),
      nonMoving: products.filter((product) => product.stockQty > 0),
      valuation: products.map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        stockQty: product.stockQty,
        unitCost: product.unitCost,
        totalValue: (product.stockQty * Number(product.unitCost)).toFixed(2),
      })),
      grandTotal: products
        .reduce(
          (sum, product) => sum + product.stockQty * Number(product.unitCost),
          0,
        )
        .toFixed(2),
      settings: { leadDays, inactivityDays },
    };
  }
}

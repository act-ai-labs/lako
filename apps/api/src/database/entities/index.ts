import { Category } from './category.entity';
import { Delivery } from './delivery.entity';
import { DeliveryItem } from './delivery-item.entity';
import { DiscountRule } from './discount-rule.entity';
import {
  EloadDenomination,
  GcashFloatAdjustment,
  GcashFloatBalance,
} from './gcash.entity';
import { Expense } from './expense.entity';
import { ExpenseCategory } from './expense-category.entity';
import { Payment } from './payment.entity';
import { PoItem } from './po-item.entity';
import { Product } from './product.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { Supplier } from './supplier.entity';
import { SyncQueue } from './sync-queue.entity';
import { Transaction } from './transaction.entity';
import { TransactionItem } from './transaction-item.entity';
import { TransactionVoid } from './transaction-void.entity';
import { User } from './user.entity';

export const ALL_ENTITIES = [
  User,
  Category,
  Product,
  Transaction,
  TransactionItem,
  TransactionVoid,
  Payment,
  Supplier,
  PurchaseOrder,
  PoItem,
  Delivery,
  DeliveryItem,
  ExpenseCategory,
  Expense,
  DiscountRule,
  SyncQueue,
  StockAdjustment,
  GcashFloatBalance,
  GcashFloatAdjustment,
  EloadDenomination,
];

export { SyncOperation, SyncStatus } from './sync-queue.enums';
export { DiscountType, DiscountScope, DiscountTrigger } from './discount.enums';
export { PaymentMethod } from './payment.enums';
export { TransactionType, TransactionStatus } from './transaction.enums';
export { PurchaseOrderStatus } from './purchase-order.enums';
export { UserRole } from './user.entity';

export {
  User,
  Category,
  Product,
  Transaction,
  TransactionItem,
  TransactionVoid,
  Payment,
  Supplier,
  PurchaseOrder,
  PoItem,
  Delivery,
  DeliveryItem,
  ExpenseCategory,
  Expense,
  DiscountRule,
  SyncQueue,
  StockAdjustment,
  GcashFloatBalance,
  GcashFloatAdjustment,
  EloadDenomination,
};

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { GcashModule } from './gcash/gcash.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SyncModule } from './sync/sync.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    DeliveriesModule,
    DiscountsModule,
    ExpensesModule,
    GcashModule,
    InventoryModule,
    PaymentsModule,
    ReportsModule,
    SuppliersModule,
    TransactionsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

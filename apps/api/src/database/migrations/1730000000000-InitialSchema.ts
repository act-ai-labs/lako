import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM('owner', 'manager', 'cashier')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL,
        "managerPinHash" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sku" character varying NOT NULL,
        "name" character varying NOT NULL,
        "categoryId" uuid,
        "unitCost" numeric(12,2) NOT NULL DEFAULT '0',
        "sellingPrice" numeric(12,2) NOT NULL DEFAULT '0',
        "stockQty" integer NOT NULL DEFAULT '0',
        "reorderPoint" integer NOT NULL DEFAULT '0',
        "expiryDate" date,
        "barcode" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "transactions_type_enum" AS ENUM('sale', 'gcash_in', 'gcash_out', 'load')
    `);
    await queryRunner.query(`
      CREATE TYPE "transactions_status_enum" AS ENUM('pending', 'completed', 'voided')
    `);
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "transactions_type_enum" NOT NULL,
        "total" numeric(12,2) NOT NULL DEFAULT '0',
        "tendered" numeric(12,2),
        "change" numeric(12,2),
        "status" "transactions_status_enum" NOT NULL DEFAULT 'pending',
        "cashierId" uuid,
        "syncedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transactionId" uuid NOT NULL,
        "productId" uuid,
        "qty" integer NOT NULL DEFAULT '1',
        "unitPrice" numeric(12,2) NOT NULL,
        "discountAmount" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transaction_items_transaction" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transaction_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payments_method_enum" AS ENUM('cash', 'gcash', 'paymaya', 'card')
    `);
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transactionId" uuid NOT NULL,
        "method" "payments_method_enum" NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "referenceNo" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_transaction" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction_voids" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transactionId" uuid NOT NULL,
        "reason" character varying NOT NULL,
        "authorizedById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction_voids" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transaction_voids_transaction" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "contact" character varying,
        "paymentTerms" character varying,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "purchase_orders_status_enum" AS ENUM('pending', 'partially_received', 'received', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TABLE "purchase_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supplierId" uuid NOT NULL,
        "status" "purchase_orders_status_enum" NOT NULL DEFAULT 'pending',
        "expectedDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_purchase_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_orders_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "po_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "poId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "orderedQty" integer NOT NULL DEFAULT '0',
        "receivedQty" integer NOT NULL DEFAULT '0',
        "unitCost" numeric(12,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_po_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_po_items_po" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_po_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "deliveries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "poId" uuid,
        "supplierId" uuid NOT NULL,
        "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "notes" text,
        "discrepancyNotes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deliveries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_deliveries_po" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_deliveries_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "delivery_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "deliveryId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "receivedQty" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_delivery_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_delivery_items_delivery" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_delivery_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expense_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_expense_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_expense_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "categoryId" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "date" date NOT NULL,
        "description" text,
        "supplierId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_expenses_category" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id"),
        CONSTRAINT "FK_expenses_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "discount_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "type" character varying(20) NOT NULL,
        "scope" character varying(20) NOT NULL,
        "trigger" character varying(30) NOT NULL,
        "value" numeric(12,2) NOT NULL,
        "triggerValue" character varying,
        "authorizationRequired" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discount_rules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sync_queue" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tableName" character varying NOT NULL,
        "operation" character varying(20) NOT NULL,
        "payload" text NOT NULL,
        "recordId" character varying,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "errorMessage" text,
        "syncedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sync_queue" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "stock_adjustments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "qtyChange" integer NOT NULL,
        "previousQty" integer NOT NULL,
        "newQty" integer NOT NULL,
        "reason" character varying NOT NULL,
        "adjustedById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_adjustments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_adjustments_product" FOREIGN KEY ("productId") REFERENCES "products"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "gcash_float_balances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "balance" numeric(12,2) NOT NULL DEFAULT '0',
        "loadBalance" numeric(12,2) NOT NULL DEFAULT '0',
        "cashDrawerBalance" numeric(12,2) NOT NULL DEFAULT '0',
        "lowFloatThreshold" numeric(12,2) NOT NULL DEFAULT '1000',
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gcash_float_balances" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "gcash_float_adjustments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying(30) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "previousBalance" numeric(12,2) NOT NULL,
        "newBalance" numeric(12,2) NOT NULL,
        "authorizedById" uuid,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gcash_float_adjustments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "eload_denominations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric(12,2) NOT NULL,
        "sellingPrice" numeric(12,2) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eload_denominations" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "eload_denominations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gcash_float_adjustments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gcash_float_balances"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_adjustments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sync_queue"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "discount_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expense_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deliveries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "po_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_orders"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "purchase_orders_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction_voids"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payments_method_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}

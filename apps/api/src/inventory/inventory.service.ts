import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { Category, Product, StockAdjustment } from '../database/entities';
import { CategoryDto } from './dto/category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';

interface ProductFilters {
  search?: string;
  categoryId?: string;
  stockStatus?: 'low' | 'out';
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product, POSTGRES_CONNECTION)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Category, POSTGRES_CONNECTION)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(StockAdjustment, POSTGRES_CONNECTION)
    private readonly adjustmentsRepo: Repository<StockAdjustment>,
  ) {}

  async listProducts(filters: ProductFilters): Promise<Product[]> {
    const where = [];
    const base = filters.categoryId ? { categoryId: filters.categoryId } : {};

    if (filters.search) {
      where.push({ ...base, name: ILike(`%${filters.search}%`) });
      where.push({ ...base, sku: ILike(`%${filters.search}%`) });
      where.push({ ...base, barcode: ILike(`%${filters.search}%`) });
    }

    let products = await this.productsRepo.find({
      where: where.length > 0 ? where : base,
      relations: { category: true },
      order: { name: 'ASC' },
    });

    if (filters.stockStatus === 'low') {
      products = products.filter(
        (product) => product.stockQty <= product.reorderPoint,
      );
    }
    if (filters.stockStatus === 'out') {
      products = products.filter((product) => product.stockQty === 0);
    }

    return products;
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    await this.ensureSkuAvailable(dto.sku);
    const categoryId =
      dto.categoryId ?? (await this.getUncategorizedCategory()).id;
    const product = this.productsRepo.create({
      ...dto,
      categoryId,
      stockQty: dto.stockQty ?? 0,
      expiryDate: dto.expiryDate ?? null,
      barcode: dto.barcode ?? null,
    });

    return this.productsRepo.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findProduct(id);

    if (dto.sku && dto.sku !== product.sku) {
      await this.ensureSkuAvailable(dto.sku);
    }

    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async adjustStock(
    id: string,
    dto: StockAdjustmentDto,
  ): Promise<StockAdjustment> {
    const product = await this.findProduct(id);
    const previousQty = product.stockQty;
    const newQty = previousQty + dto.qtyChange;

    if (newQty < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    product.stockQty = newQty;
    await this.productsRepo.save(product);

    const adjustment = this.adjustmentsRepo.create({
      productId: product.id,
      qtyChange: dto.qtyChange,
      previousQty,
      newQty,
      reason: dto.reason,
    });

    return this.adjustmentsRepo.save(adjustment);
  }

  async listCategories(): Promise<Category[]> {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  async createCategory(dto: CategoryDto): Promise<Category> {
    const existing = await this.categoriesRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      return existing;
    }
    return this.categoriesRepo.save(this.categoriesRepo.create(dto));
  }

  async updateCategory(id: string, dto: CategoryDto): Promise<Category> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.name = dto.name;
    return this.categoriesRepo.save(category);
  }

  async importCsv(
    csv: string,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
    const headers = headerLine.split(',').map((header) => header.trim());
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const values = row.split(',').map((value) => value.trim());
      const record = Object.fromEntries(
        headers.map((header, i) => [header, values[i] ?? '']),
      );

      try {
        if (!record.sku || !record.name || !record.sellingPrice) {
          skipped += 1;
          errors.push(`Row ${index + 2}: missing sku, name, or sellingPrice`);
          continue;
        }

        await this.createProduct({
          sku: record.sku,
          name: record.name,
          unitCost: record.unitCost || '0',
          sellingPrice: record.sellingPrice,
          reorderPoint: Number(record.reorderPoint || 0),
          stockQty: Number(record.stockQty || 0),
          barcode: record.barcode || undefined,
          expiryDate: record.expiryDate || undefined,
        });
        imported += 1;
      } catch (error) {
        skipped += 1;
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : 'import failed'}`,
        );
      }
    }

    return { imported, skipped, errors };
  }

  private async findProduct(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async ensureSkuAvailable(sku: string): Promise<void> {
    const existing = await this.productsRepo.findOne({ where: { sku } });
    if (existing) {
      throw new BadRequestException('Duplicate SKU rejected');
    }
  }

  private async getUncategorizedCategory(): Promise<Category> {
    return this.createCategory({ name: 'Uncategorized' });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  PoItem,
  PurchaseOrder,
  PurchaseOrderStatus,
  Supplier,
} from '../database/entities';
import { PurchaseOrderDto } from './dto/purchase-order.dto';
import { SupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier, POSTGRES_CONNECTION)
    private readonly suppliersRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder, POSTGRES_CONNECTION)
    private readonly purchaseOrdersRepo: Repository<PurchaseOrder>,
    @InjectRepository(PoItem, POSTGRES_CONNECTION)
    private readonly poItemsRepo: Repository<PoItem>,
  ) {}

  listSuppliers(search?: string): Promise<Supplier[]> {
    return this.suppliersRepo.find({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { name: 'ASC' },
    });
  }

  createSupplier(dto: SupplierDto): Promise<Supplier> {
    return this.suppliersRepo.save(
      this.suppliersRepo.create({
        name: dto.name,
        contact: dto.contact ?? null,
        paymentTerms: dto.paymentTerms ?? null,
        notes: dto.notes ?? null,
      }),
    );
  }

  async updateSupplier(id: string, dto: SupplierDto): Promise<Supplier> {
    const supplier = await this.suppliersRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    Object.assign(supplier, {
      name: dto.name,
      contact: dto.contact ?? null,
      paymentTerms: dto.paymentTerms ?? null,
      notes: dto.notes ?? null,
    });
    return this.suppliersRepo.save(supplier);
  }

  listPurchaseOrders(status?: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    return this.purchaseOrdersRepo.find({
      where: status ? { status } : {},
      relations: { supplier: true, items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async createPurchaseOrder(dto: PurchaseOrderDto): Promise<PurchaseOrder> {
    const supplier = await this.suppliersRepo.findOne({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const purchaseOrder = await this.purchaseOrdersRepo.save(
      this.purchaseOrdersRepo.create({
        supplierId: dto.supplierId,
        expectedDate: dto.expectedDate ?? null,
        status: PurchaseOrderStatus.PENDING,
      }),
    );

    await this.poItemsRepo.save(
      dto.items.map((item) =>
        this.poItemsRepo.create({
          poId: purchaseOrder.id,
          productId: item.productId,
          orderedQty: item.orderedQty,
          receivedQty: 0,
          unitCost: item.unitCost,
        }),
      ),
    );

    return this.purchaseOrdersRepo.findOneOrFail({
      where: { id: purchaseOrder.id },
      relations: { supplier: true, items: { product: true } },
    });
  }
}

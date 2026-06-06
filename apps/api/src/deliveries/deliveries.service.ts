import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import {
  Delivery,
  DeliveryItem,
  PoItem,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  StockAdjustment,
} from '../database/entities';
import { DeliveryDto } from './dto/delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery, POSTGRES_CONNECTION)
    private readonly deliveriesRepo: Repository<Delivery>,
    @InjectDataSource(POSTGRES_CONNECTION)
    private readonly dataSource: DataSource,
  ) {}

  listDeliveries(supplierId?: string): Promise<Delivery[]> {
    return this.deliveriesRepo.find({
      where: supplierId ? { supplierId } : {},
      relations: {
        supplier: true,
        purchaseOrder: true,
        items: { product: true },
      },
      order: { receivedAt: 'DESC' },
    });
  }

  async receiveDelivery(dto: DeliveryDto): Promise<Delivery> {
    return this.dataSource.transaction(async (manager) => {
      const delivery = await manager.save(
        manager.create(Delivery, {
          poId: dto.poId ?? null,
          supplierId: dto.supplierId,
          receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
          notes: dto.notes ?? null,
          discrepancyNotes: dto.discrepancyNotes ?? null,
        }),
      );

      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }

        const previousQty = product.stockQty;
        product.stockQty += item.receivedQty;
        await manager.save(product);
        await manager.save(
          manager.create(DeliveryItem, {
            deliveryId: delivery.id,
            productId: item.productId,
            receivedQty: item.receivedQty,
          }),
        );
        await manager.save(
          manager.create(StockAdjustment, {
            productId: item.productId,
            qtyChange: item.receivedQty,
            previousQty,
            newQty: product.stockQty,
            reason: `Delivery ${delivery.id}`,
          }),
        );

        if (dto.poId) {
          const poItem = await manager.findOne(PoItem, {
            where: { poId: dto.poId, productId: item.productId },
          });
          if (poItem) {
            poItem.receivedQty += item.receivedQty;
            await manager.save(poItem);
          }
        }
      }

      if (dto.poId) {
        await this.updatePurchaseOrderStatus(manager, dto.poId);
      }

      return manager.findOneOrFail(Delivery, {
        where: { id: delivery.id },
        relations: {
          supplier: true,
          purchaseOrder: true,
          items: { product: true },
        },
      });
    });
  }

  private async updatePurchaseOrderStatus(
    manager: EntityManager,
    poId: string,
  ) {
    const po = await manager.findOne(PurchaseOrder, {
      where: { id: poId },
      relations: { items: true },
    });
    if (!po) return;

    const allReceived = po.items.every(
      (item) => item.receivedQty >= item.orderedQty,
    );
    const anyReceived = po.items.some((item) => item.receivedQty > 0);
    po.status = allReceived
      ? PurchaseOrderStatus.RECEIVED
      : anyReceived
        ? PurchaseOrderStatus.PARTIALLY_RECEIVED
        : PurchaseOrderStatus.PENDING;
    await manager.save(po);
  }
}

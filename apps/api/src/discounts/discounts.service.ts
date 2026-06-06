import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTGRES_CONNECTION } from '../database/data-source';
import { DiscountRule } from '../database/entities';
import { DiscountRuleDto } from './dto/discount-rule.dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(DiscountRule, POSTGRES_CONNECTION)
    private readonly discountRulesRepo: Repository<DiscountRule>,
  ) {}

  listRules(): Promise<DiscountRule[]> {
    return this.discountRulesRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  createRule(dto: DiscountRuleDto): Promise<DiscountRule> {
    return this.discountRulesRepo.save(
      this.discountRulesRepo.create({
        ...dto,
        triggerValue: dto.triggerValue ?? null,
        authorizationRequired: dto.authorizationRequired ?? false,
        isActive: true,
      }),
    );
  }

  async updateRule(id: string, dto: DiscountRuleDto): Promise<DiscountRule> {
    const rule = await this.discountRulesRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Discount rule not found');
    }

    Object.assign(rule, {
      ...dto,
      triggerValue: dto.triggerValue ?? null,
      authorizationRequired: dto.authorizationRequired ?? false,
    });
    return this.discountRulesRepo.save(rule);
  }

  async deleteRule(id: string): Promise<{ deleted: true }> {
    const rule = await this.discountRulesRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Discount rule not found');
    }

    rule.isActive = false;
    await this.discountRulesRepo.save(rule);
    return { deleted: true };
  }
}

import {
  applyDeliveryReceipt,
  applyStockDecrement,
  calculateDiscount,
  canCashIn,
  isDuplicateSync,
  splitTenderTotal,
} from './business-rules';

describe('business rules', () => {
  it('calculates percentage and fixed discounts', () => {
    expect(calculateDiscount(100, 'percentage', 10)).toBe(10);
    expect(calculateDiscount(100, 'fixed', 150)).toBe(100);
  });

  it('prevents duplicate sync by transaction id', () => {
    expect(isDuplicateSync(['txn-1'], 'txn-1')).toBe(true);
    expect(isDuplicateSync(['txn-1'], 'txn-2')).toBe(false);
  });

  it('decrements stock on checkout and blocks insufficient stock', () => {
    expect(applyStockDecrement(5, 3)).toBe(2);
    expect(() => applyStockDecrement(1, 2)).toThrow('Insufficient stock');
  });

  it('increments stock on delivery receipt', () => {
    expect(applyDeliveryReceipt(5, 7)).toBe(12);
  });

  it('supports split tender totals', () => {
    expect(splitTenderTotal([{ amount: 100 }, { amount: 50 }])).toBe(150);
  });

  it('blocks cash-in when float is insufficient', () => {
    expect(canCashIn(100, 99)).toBe(true);
    expect(canCashIn(100, 101)).toBe(false);
  });
});

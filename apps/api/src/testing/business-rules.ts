export function calculateDiscount(
  baseAmount: number,
  type: 'percentage' | 'fixed',
  value: number,
) {
  return type === 'percentage'
    ? Math.min(baseAmount, (baseAmount * value) / 100)
    : Math.min(baseAmount, value);
}

export function applyStockDecrement(stockQty: number, qty: number) {
  if (stockQty < qty) throw new Error('Insufficient stock');
  return stockQty - qty;
}

export function applyDeliveryReceipt(stockQty: number, receivedQty: number) {
  return stockQty + receivedQty;
}

export function isDuplicateSync(existingIds: string[], transactionId: string) {
  return existingIds.includes(transactionId);
}

export function splitTenderTotal(payments: Array<{ amount: number }>) {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function canCashIn(floatBalance: number, amount: number) {
  return floatBalance >= amount;
}

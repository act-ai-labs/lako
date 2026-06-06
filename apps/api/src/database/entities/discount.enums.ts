export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum DiscountScope {
  ITEM = 'item',
  CART = 'cart',
}

export enum DiscountTrigger {
  MANUAL = 'manual',
  SKU = 'sku',
  CATEGORY = 'category',
  MINIMUM_AMOUNT = 'minimum_amount',
}

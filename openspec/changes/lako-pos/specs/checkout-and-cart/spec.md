## ADDED Requirements

### Requirement: Cart management
The system SHALL maintain a live cart session where cashiers can add, remove, and adjust quantities of items before completing a transaction.

#### Scenario: Add item to cart by barcode
- **WHEN** a cashier scans a product barcode or enters a SKU
- **THEN** the system SHALL add the product to the cart with quantity 1 and display the running total

#### Scenario: Add item to cart by search
- **WHEN** a cashier searches for a product by name and selects it
- **THEN** the system SHALL add the product to the cart

#### Scenario: Adjust item quantity in cart
- **WHEN** a cashier changes the quantity of a cart item
- **THEN** the system SHALL update the line item subtotal and recalculate the cart total

#### Scenario: Remove item from cart
- **WHEN** a cashier removes an item from the cart
- **THEN** the system SHALL remove the line item and recalculate the total

#### Scenario: Clear cart
- **WHEN** a cashier clears the cart
- **THEN** the system SHALL empty all items and reset the total to zero

### Requirement: Transaction completion
The system SHALL finalize a sale by recording the transaction, deducting stock, and issuing a receipt upon payment confirmation.

#### Scenario: Successful transaction
- **WHEN** a payment is confirmed for a non-empty cart
- **THEN** the system SHALL record the transaction with all line items and payment details, decrement stock for each product, generate a receipt, and clear the cart

#### Scenario: Out-of-stock item at checkout
- **WHEN** a cashier attempts to complete a transaction containing a product with insufficient stock
- **THEN** the system SHALL block completion and highlight the out-of-stock item with available quantity

### Requirement: Receipt generation
The system SHALL generate itemized receipts for each completed transaction.

#### Scenario: Printed receipt
- **WHEN** a transaction is completed and a receipt printer is connected
- **THEN** the system SHALL print an ESC/POS formatted receipt with store name, date/time, items, discounts, payment method, amount tendered, and change

#### Scenario: Digital receipt fallback
- **WHEN** no printer is connected or print fails
- **THEN** the system SHALL display the receipt on screen and offer a PDF download option

### Requirement: Transaction void
The system SHALL allow authorized users to void a completed transaction, reversing stock and recording the void reason.

#### Scenario: Void transaction
- **WHEN** an authorized user voids a transaction with a reason
- **THEN** the system SHALL mark the transaction as voided, restore stock quantities for all line items, and create a void record linked to the original transaction

#### Scenario: Void requires authorization
- **WHEN** a cashier attempts to void a transaction
- **THEN** the system SHALL require manager PIN or role confirmation before proceeding

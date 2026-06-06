## ADDED Requirements

### Requirement: Cash payment
The system SHALL accept cash as a payment method, compute change, and record the tendered amount.

#### Scenario: Exact cash payment
- **WHEN** a cashier selects Cash and the tendered amount equals the transaction total
- **THEN** the system SHALL record zero change and complete the transaction

#### Scenario: Cash payment with change
- **WHEN** a cashier enters a tendered cash amount greater than the transaction total
- **THEN** the system SHALL display the change due and complete the transaction on confirmation

#### Scenario: Insufficient cash tendered
- **WHEN** the tendered cash amount is less than the transaction total
- **THEN** the system SHALL block completion and display the remaining amount owed

### Requirement: GCash payment
The system SHALL accept GCash QR payments by generating a merchant QR code, awaiting confirmation, and recording the reference number.

#### Scenario: GCash QR payment flow
- **WHEN** a cashier selects GCash as the payment method
- **THEN** the system SHALL display a GCash merchant QR code for the transaction amount

#### Scenario: GCash payment confirmed
- **WHEN** the GCash payment notification is received (webhook) or the cashier manually confirms after verifying in the GCash app
- **THEN** the system SHALL record the payment with the GCash reference number and complete the transaction

#### Scenario: GCash payment timeout
- **WHEN** a GCash payment is not confirmed within the configured timeout (default 5 minutes)
- **THEN** the system SHALL cancel the payment attempt and return to payment method selection, keeping the cart intact

### Requirement: PayMaya payment
The system SHALL accept PayMaya QR payments using the same QR-confirmation flow as GCash.

#### Scenario: PayMaya QR payment flow
- **WHEN** a cashier selects PayMaya as the payment method
- **THEN** the system SHALL display a PayMaya merchant QR code for the transaction amount and await confirmation

#### Scenario: PayMaya payment confirmed
- **WHEN** PayMaya payment confirmation is received
- **THEN** the system SHALL record the PayMaya reference number and complete the transaction

### Requirement: Card payment
The system SHALL accept card payments via PayMongo integration or manual card terminal reference entry.

#### Scenario: Card payment via PayMongo
- **WHEN** a cashier selects Card and PayMongo integration is configured
- **THEN** the system SHALL initiate a PayMongo payment intent and display terminal instructions

#### Scenario: Card payment manual reference
- **WHEN** card payment is processed on a physical terminal
- **THEN** the cashier SHALL be able to enter the card approval reference number manually to complete the transaction

#### Scenario: Card payment declined
- **WHEN** a card payment is declined
- **THEN** the system SHALL display the decline reason and allow the cashier to select a different payment method

### Requirement: Split tender payment
The system SHALL allow a transaction to be paid with multiple payment methods when no single tender covers the full amount.

#### Scenario: Split cash and GCash
- **WHEN** a cashier applies a partial payment in cash and the remainder via GCash
- **THEN** the system SHALL track both payment amounts, ensure they sum to the transaction total, and record both payment methods on the receipt

### Requirement: Payment record audit trail
The system SHALL record the payment method, amount, and reference number for every payment applied to a transaction.

#### Scenario: Payment details stored
- **WHEN** a transaction is completed
- **THEN** the system SHALL store a payment record for each tender with method, amount, and reference number (where applicable)

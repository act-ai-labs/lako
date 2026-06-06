## ADDED Requirements

### Requirement: Discount rule configuration
The system SHALL support configurable discount rules with type (percentage or fixed amount), scope (item-level or cart-level), and optional authorization requirement.

#### Scenario: Create percentage discount rule
- **WHEN** an admin creates a discount rule with type "percentage" and value 10
- **THEN** the system SHALL save the rule and apply a 10% reduction when triggered

#### Scenario: Create fixed-amount discount rule
- **WHEN** an admin creates a discount rule with type "fixed" and value 50
- **THEN** the system SHALL save the rule and reduce the applicable amount by ₱50 when triggered

### Requirement: Item-level discount application
The system SHALL allow discounts to be applied to individual line items in the cart.

#### Scenario: Apply item discount by SKU
- **WHEN** a discount rule is triggered for a specific SKU and the product is in the cart
- **THEN** the system SHALL reduce the line item price by the discount amount and display the original and discounted prices

#### Scenario: Apply item discount by category
- **WHEN** a discount rule targets a product category and a matching product is in the cart
- **THEN** the system SHALL apply the discount to all matching line items

### Requirement: Cart-level discount application
The system SHALL allow a single discount to be applied to the entire cart total.

#### Scenario: Apply cart discount
- **WHEN** a cashier applies a cart-level discount
- **THEN** the system SHALL reduce the cart total by the computed discount amount and display the discount line on the receipt

#### Scenario: Cart discount with minimum amount trigger
- **WHEN** a cart-level discount has a minimum purchase amount trigger and the cart total meets or exceeds it
- **THEN** the system SHALL automatically apply the discount

### Requirement: Manual discount override
The system SHALL allow cashiers to apply an ad-hoc discount with manager authorization when no matching rule exists.

#### Scenario: Manual discount with authorization
- **WHEN** a cashier applies a manual discount and the discount requires authorization
- **THEN** the system SHALL prompt for manager PIN before applying the discount

#### Scenario: Unauthorized manual discount blocked
- **WHEN** a cashier attempts to apply a manual discount without manager authorization
- **THEN** the system SHALL block the discount and display an authorization required message

### Requirement: Discount snapshot on transaction
The system SHALL store the discount amount and rule reference on each transaction line item at the time of sale, preserving historical accuracy.

#### Scenario: Discount preserved in transaction record
- **WHEN** a transaction is completed with discounts applied
- **THEN** the system SHALL store the discount amount per line item in the transaction record, independent of any subsequent changes to discount rules

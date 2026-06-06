## ADDED Requirements

### Requirement: Supplier directory
The system SHALL maintain a directory of suppliers with name, contact information, payment terms, and notes.

#### Scenario: Create supplier
- **WHEN** a user creates a supplier record with name and contact details
- **THEN** the system SHALL save the supplier and make it available for selection when creating purchase orders and recording expenses

#### Scenario: Edit supplier details
- **WHEN** a user updates a supplier's contact or payment terms
- **THEN** the system SHALL save the updated information without affecting existing purchase orders linked to the supplier

#### Scenario: Supplier search
- **WHEN** a user searches for a supplier by name
- **THEN** the system SHALL return matching suppliers filtered in real time

### Requirement: Purchase order creation
The system SHALL allow users to create purchase orders against a supplier, specifying products and ordered quantities.

#### Scenario: Create purchase order
- **WHEN** a user creates a purchase order for a supplier with one or more product line items
- **THEN** the system SHALL save the purchase order with status "pending" and link it to the supplier

#### Scenario: Purchase order line items
- **WHEN** a product is added to a purchase order
- **THEN** the system SHALL record the product, ordered quantity, and agreed unit cost for that line item

#### Scenario: Purchase order statuses
- **WHEN** a purchase order's delivery is received
- **THEN** the system SHALL allow the PO status to be updated to "received" or "partially received" based on the quantities received

### Requirement: Supplier payment terms tracking
The system SHALL store payment terms (e.g., net 30, COD) per supplier for reference during purchasing.

#### Scenario: Payment terms visible on purchase order
- **WHEN** a purchase order is created for a supplier with payment terms set
- **THEN** the system SHALL display the supplier's payment terms on the purchase order detail view

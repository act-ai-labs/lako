## ADDED Requirements

### Requirement: Product catalog management
The system SHALL maintain a searchable product catalog with SKU, name, category, unit cost, selling price, barcode, stock quantity, reorder point, and optional expiry date per product.

#### Scenario: Add new product
- **WHEN** a user submits a new product form with all required fields (name, SKU, selling price, category)
- **THEN** the system SHALL create the product record, set initial stock to zero, and make it immediately available for sale

#### Scenario: Duplicate SKU rejected
- **WHEN** a user attempts to create a product with an SKU that already exists
- **THEN** the system SHALL reject the submission and display an error indicating the duplicate SKU

#### Scenario: Edit existing product
- **WHEN** a user updates a product's price or details
- **THEN** the system SHALL save the change and apply the new price to all subsequent transactions; historical transaction prices SHALL remain unchanged

### Requirement: Stock level tracking
The system SHALL maintain real-time stock quantities for all products, decremented on sale and incremented on delivery receipt or manual adjustment.

#### Scenario: Stock decremented on sale
- **WHEN** a transaction containing a product is completed
- **THEN** the system SHALL reduce that product's stock quantity by the sold quantity

#### Scenario: Manual stock adjustment
- **WHEN** a user with stockroom access submits a stock adjustment with reason (e.g., damaged, count correction)
- **THEN** the system SHALL update the stock quantity and log the adjustment with timestamp and user

#### Scenario: Low stock alert
- **WHEN** a product's stock quantity falls at or below its configured reorder point
- **THEN** the system SHALL display a low-stock indicator on the product listing and include it in the reorder alerts view

### Requirement: Barcode support
The system SHALL support scanning barcodes to look up products during checkout and inventory operations.

#### Scenario: Barcode scan identifies product
- **WHEN** a barcode is scanned or entered in the product search field
- **THEN** the system SHALL locate and display the matching product within 500ms

#### Scenario: Unknown barcode handling
- **WHEN** a scanned barcode does not match any product
- **THEN** the system SHALL notify the cashier that the product was not found and allow manual search

### Requirement: Expiry date tracking
The system SHALL store and track expiry dates for perishable products, enabling expiry-based inventory reports.

#### Scenario: Expiry date stored on product
- **WHEN** a product has an expiry date set
- **THEN** the system SHALL store the date and include it in inventory export and reports

#### Scenario: Expired product warning at checkout
- **WHEN** a cashier adds a product to a cart and the product's expiry date is today or in the past
- **THEN** the system SHALL display a warning and require confirmation before adding to cart

### Requirement: Category management
The system SHALL support configurable product categories for organizing the catalog and filtering reports.

#### Scenario: Assign product to category
- **WHEN** a product is created or edited with a category
- **THEN** the system SHALL associate the product with that category and make it filterable by category in all product views and reports

#### Scenario: Default uncategorized category
- **WHEN** a product is saved without a category
- **THEN** the system SHALL assign it to an "Uncategorized" default category

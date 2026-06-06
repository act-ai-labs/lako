## ADDED Requirements

### Requirement: Expiring products report
The system SHALL identify products approaching or past their expiry date within a configurable lead-time window.

#### Scenario: View expiring products
- **WHEN** a user opens the expiring products report
- **THEN** the system SHALL list all products with expiry dates within the configured lead-time (default: 30 days), sorted by nearest expiry first, showing product name, SKU, stock quantity, and expiry date

#### Scenario: Configure expiry lead-time
- **WHEN** an admin changes the expiry lead-time setting
- **THEN** the system SHALL apply the new threshold to all subsequent expiry report queries

#### Scenario: Expired products highlighted
- **WHEN** the expiring products report includes items already past their expiry date
- **THEN** the system SHALL visually distinguish expired items from soon-to-expire items

### Requirement: Non-moving products report
The system SHALL identify products that have not sold within a configurable inactivity threshold.

#### Scenario: View non-moving products
- **WHEN** a user opens the non-moving products report with a threshold of 30 days
- **THEN** the system SHALL list all products where the last sale date is older than 30 days or the product has never been sold, showing product name, SKU, current stock, and last sale date

#### Scenario: Configure non-moving threshold
- **WHEN** an admin sets the non-moving threshold to a different number of days
- **THEN** the system SHALL recalculate the non-moving list based on the new threshold

#### Scenario: Zero-stock products excluded
- **WHEN** a product has zero stock
- **THEN** the system SHALL exclude it from the non-moving report since it cannot be sold

### Requirement: Low-stock report
The system SHALL produce a list of all products at or below their reorder point.

#### Scenario: View low-stock report
- **WHEN** a user opens the low-stock report
- **THEN** the system SHALL list all products where current stock quantity is at or below the reorder point, with current stock and reorder point values

### Requirement: Inventory valuation report
The system SHALL calculate and display the total inventory value (stock quantity × unit cost) across all products.

#### Scenario: View inventory valuation
- **WHEN** a user opens the inventory valuation report
- **THEN** the system SHALL display each product with its stock quantity, unit cost, and total value, along with a grand total

### Requirement: Inventory report export
The system SHALL allow all inventory reports to be exported as CSV.

#### Scenario: Export inventory report
- **WHEN** a user exports an inventory report
- **THEN** the system SHALL download a CSV with all rows and columns shown in the report

## ADDED Requirements

### Requirement: Daily sales summary
The system SHALL generate a daily sales summary showing total revenue, number of transactions, and total items sold.

#### Scenario: View today's sales summary
- **WHEN** a user opens the sales report for today
- **THEN** the system SHALL display total sales revenue, transaction count, average transaction value, and total units sold for the current day

### Requirement: Period sales report
The system SHALL produce sales reports for configurable date ranges (daily, weekly, monthly, custom).

#### Scenario: Select report period
- **WHEN** a user selects a weekly or monthly period
- **THEN** the system SHALL aggregate sales data for that period and display totals with a day-by-day breakdown

#### Scenario: Custom date range
- **WHEN** a user selects a custom start and end date
- **THEN** the system SHALL display sales data for that specific range

### Requirement: Sales by product
The system SHALL break down sales by product showing units sold, revenue, and cost of goods sold (COGS) per product.

#### Scenario: Per-product sales breakdown
- **WHEN** a user views the product sales breakdown
- **THEN** the system SHALL list each product with quantity sold, total revenue, and COGS for the selected period

#### Scenario: Top sellers
- **WHEN** a user views the top sellers list
- **THEN** the system SHALL display products ranked by revenue or units sold for the period

### Requirement: Sales by category
The system SHALL summarize sales grouped by product category.

#### Scenario: Category sales summary
- **WHEN** a user views the sales-by-category report
- **THEN** the system SHALL show total revenue and units sold per category for the selected period

### Requirement: Sales by payment method
The system SHALL break down sales revenue by payment method (Cash, GCash, PayMaya, Card).

#### Scenario: Payment method breakdown
- **WHEN** a user views the payment method breakdown report
- **THEN** the system SHALL show total collected per payment method for the selected period

### Requirement: Sales report export
The system SHALL allow sales reports to be exported as CSV or PDF.

#### Scenario: Export sales report as CSV
- **WHEN** a user clicks export on a sales report
- **THEN** the system SHALL download a CSV file with the same data shown in the report

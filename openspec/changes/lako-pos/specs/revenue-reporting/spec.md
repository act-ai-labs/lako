## ADDED Requirements

### Requirement: Revenue vs. expenses report
The system SHALL produce an income statement showing total sales revenue, total COGS, gross profit, total operating expenses, and net profit for a selected period.

#### Scenario: View monthly revenue report
- **WHEN** a user opens the revenue report for a month
- **THEN** the system SHALL display: Total Revenue, Cost of Goods Sold, Gross Profit, Total Operating Expenses (by category), and Net Profit

#### Scenario: Net profit calculation
- **WHEN** the revenue report is generated
- **THEN** Net Profit SHALL equal Total Revenue minus COGS minus Total Operating Expenses

### Requirement: Period-over-period comparison
The system SHALL allow comparison of revenue report figures between two periods.

#### Scenario: Compare two months
- **WHEN** a user selects two periods to compare
- **THEN** the system SHALL display both periods side-by-side with absolute and percentage change indicators

### Requirement: Revenue report by expense category
The system SHALL break down operating expenses within the revenue report by expense category.

#### Scenario: Expense category breakdown in revenue report
- **WHEN** a user views the revenue report
- **THEN** the system SHALL list each expense category with its total amount alongside the aggregate expenses figure

### Requirement: GCash services revenue separation
The system SHALL separate GCash service transaction revenue (cash-in, cash-out, e-load fees) from product sales revenue in the revenue report.

#### Scenario: GCash services shown separately
- **WHEN** a user views the revenue report
- **THEN** the system SHALL display GCash service fee income as a distinct revenue line separate from product sales

### Requirement: Revenue report export
The system SHALL allow the revenue report to be exported as CSV or PDF.

#### Scenario: Export revenue report
- **WHEN** a user exports the revenue report
- **THEN** the system SHALL generate a file with all income, COGS, expense, and profit figures for the selected period

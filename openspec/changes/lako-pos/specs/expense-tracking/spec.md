## ADDED Requirements

### Requirement: Record operating expenses
The system SHALL allow users to record operating expenses with amount, category, date, description, and an optional supplier reference.

#### Scenario: Record expense
- **WHEN** a user submits an expense record with category, amount, and date
- **THEN** the system SHALL save the expense and include it in revenue and period reports

#### Scenario: Link expense to supplier
- **WHEN** an expense is a payment to a known supplier
- **THEN** the system SHALL allow the user to link the expense to a supplier record

### Requirement: Expense categories
The system SHALL support configurable expense categories (e.g., Utilities, Rent, Supplies, Salaries, Freight) for grouping and reporting.

#### Scenario: Assign expense category
- **WHEN** a user records an expense
- **THEN** the system SHALL require selection of a category from the configured list

#### Scenario: Create custom expense category
- **WHEN** an admin adds a new expense category
- **THEN** the system SHALL make it available for selection on all subsequent expense records

### Requirement: Expense list and filtering
The system SHALL provide a filterable list of expenses by date range, category, and supplier.

#### Scenario: Filter expenses by date range
- **WHEN** a user applies a date range filter to the expenses list
- **THEN** the system SHALL display only expenses within the selected period

#### Scenario: Filter expenses by category
- **WHEN** a user filters by a specific expense category
- **THEN** the system SHALL display only expenses in that category

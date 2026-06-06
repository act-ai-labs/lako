## ADDED Requirements

### Requirement: GCash cash-in transaction
The system SHALL record GCash cash-in as a service transaction where a customer deposits cash and receives GCash credit, reducing the store's GCash float.

#### Scenario: Process cash-in
- **WHEN** a cashier initiates a GCash cash-in with a customer phone number and amount
- **THEN** the system SHALL record a cash-in transaction, add the cash amount received to the cash drawer, reduce the GCash float balance by the amount sent, and record any applicable service fee as income

#### Scenario: Cash-in blocked when float insufficient
- **WHEN** the cash-in amount exceeds the store's current GCash float balance
- **THEN** the system SHALL block the transaction and display the available float balance

### Requirement: GCash cash-out transaction
The system SHALL record GCash cash-out as a service transaction where a customer sends GCash and receives cash, increasing the store's GCash float.

#### Scenario: Process cash-out
- **WHEN** a cashier processes a GCash cash-out for a confirmed GCash send from the customer
- **THEN** the system SHALL record a cash-out transaction, dispense cash from the drawer, increase the GCash float balance by the received GCash amount, and record any applicable service fee as income

#### Scenario: Cash-out blocked when cash insufficient
- **WHEN** the cash-out amount exceeds available cash in the drawer
- **THEN** the system SHALL block the transaction and display the available cash balance

### Requirement: GCash e-load top-up
The system SHALL record e-load top-up transactions where the cashier sends load to a customer's mobile number and the customer pays cash.

#### Scenario: Process e-load top-up
- **WHEN** a cashier selects a load denomination, enters the customer's mobile number, and confirms
- **THEN** the system SHALL record the load transaction, collect cash payment, deduct the load cost from the store's load float/balance, and record the markup as income

#### Scenario: Load denomination selection
- **WHEN** a cashier opens the e-load screen
- **THEN** the system SHALL display available load denominations and their selling prices

### Requirement: GCash float management
The system SHALL track the store's GCash wallet balance (float) in real time to prevent over-commitment of funds.

#### Scenario: Float balance displayed
- **WHEN** a cashier opens the GCash services screen
- **THEN** the system SHALL display the current GCash float balance

#### Scenario: Low float alert
- **WHEN** the GCash float falls below a configurable threshold
- **THEN** the system SHALL display a low-float warning to the cashier

#### Scenario: Manual float adjustment
- **WHEN** an authorized user records a GCash wallet top-up or withdrawal
- **THEN** the system SHALL update the float balance and log the adjustment with timestamp and user

### Requirement: GCash services fee income tracking
The system SHALL record service fees collected from GCash transactions as a distinct revenue stream separate from product sales.

#### Scenario: Service fee recorded on transaction
- **WHEN** a GCash service transaction is completed with a fee
- **THEN** the system SHALL record the fee amount linked to the transaction and include it in GCash service income totals in reports

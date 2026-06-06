## ADDED Requirements

### Requirement: Delivery receipt against purchase order
The system SHALL allow users to receive a delivery by matching items received against an open purchase order, updating stock quantities on confirmation.

#### Scenario: Receive full delivery
- **WHEN** a user marks all items in a purchase order as fully received
- **THEN** the system SHALL update each product's stock quantity by the received amounts and set the purchase order status to "received"

#### Scenario: Receive partial delivery
- **WHEN** a user records received quantities that are less than the ordered quantities
- **THEN** the system SHALL update stock by the received amounts, set the PO status to "partially received", and track the remaining outstanding quantities

#### Scenario: Stock incremented on delivery
- **WHEN** a delivery is confirmed
- **THEN** the system SHALL increment the stock quantity of each received product and log the delivery as the reason for the stock change

### Requirement: Delivery discrepancy tracking
The system SHALL allow users to note discrepancies between ordered and received items (e.g., short delivery, damaged goods).

#### Scenario: Record discrepancy
- **WHEN** a received quantity differs from the ordered quantity or goods are damaged
- **THEN** the system SHALL allow the user to add a discrepancy note to the delivery record

### Requirement: Delivery history
The system SHALL maintain a history of all deliveries linked to their purchase orders and suppliers.

#### Scenario: View delivery history
- **WHEN** a user views the deliveries list
- **THEN** the system SHALL display all deliveries with date, supplier, linked PO, and received quantities

#### Scenario: View deliveries for supplier
- **WHEN** a user views a supplier's detail page
- **THEN** the system SHALL show a list of all deliveries received from that supplier

### Requirement: Walk-in delivery without purchase order
The system SHALL allow stock-in from a supplier even when no purchase order was pre-created, recording it as an unplanned delivery.

#### Scenario: Record unplanned delivery
- **WHEN** a user creates a delivery without linking it to an existing PO
- **THEN** the system SHALL allow item and quantity entry, update stock, and record the delivery as a direct stock-in with the supplier noted

## ADDED Requirements

### Requirement: Local-first data persistence
The system SHALL store all transaction, inventory, and operational data in a local database first, making all core POS functions available without an internet connection.

#### Scenario: Checkout works offline
- **WHEN** the device loses internet connectivity
- **THEN** the system SHALL continue to accept sales, process cash payments, update local stock, and generate receipts without interruption

#### Scenario: Offline indicator displayed
- **WHEN** the device is offline
- **THEN** the system SHALL display a visible offline status indicator in the POS interface

### Requirement: Sync queue for offline transactions
The system SHALL queue all data changes made while offline and synchronize them to the cloud database when connectivity is restored.

#### Scenario: Transactions queued while offline
- **WHEN** one or more transactions are completed while offline
- **THEN** the system SHALL add them to a persistent sync queue stored in the local database

#### Scenario: Auto-sync on reconnect
- **WHEN** internet connectivity is restored
- **THEN** the system SHALL automatically begin processing the sync queue, uploading pending records to the cloud in chronological order

#### Scenario: Sync status feedback
- **WHEN** a sync is in progress
- **THEN** the system SHALL display the number of pending items and a syncing indicator; on completion it SHALL confirm all records are synced

### Requirement: Idempotent sync operations
The system SHALL ensure that syncing the same transaction multiple times does not create duplicate records in the cloud database.

#### Scenario: Duplicate sync prevented
- **WHEN** a transaction that was already synced is re-submitted due to a sync retry
- **THEN** the cloud database SHALL recognize the duplicate by transaction ID and ignore the re-submission without error

### Requirement: Offline payment method restriction
The system SHALL restrict payment methods to those that do not require real-time API calls when offline.

#### Scenario: QR payment methods disabled offline
- **WHEN** the device is offline and a cashier attempts to use GCash or PayMaya QR payment
- **THEN** the system SHALL display a message that these payment methods require an internet connection and only Cash SHALL be available

### Requirement: Sync conflict resolution
The system SHALL detect and handle conflicts when offline changes conflict with cloud state on sync.

#### Scenario: Conflict flagged for review
- **WHEN** a synced record conflicts with an existing cloud record (e.g., stock level discrepancy)
- **THEN** the system SHALL flag the conflict for manager review rather than silently overwriting either version

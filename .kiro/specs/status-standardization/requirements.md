# Status Standardization Requirements

## Introduction

This specification defines the standardization of status values throughout the QuickServe application to follow web standards, HTTP status conventions, and industry best practices. The current system uses inconsistent status naming that should be aligned with MDN Web Docs standards and common API conventions.

## Glossary

- **Status Code**: A standardized identifier that represents the current state of an entity
- **HTTP Convention**: Status naming patterns that follow HTTP status code semantics
- **State Machine**: A system that transitions between defined states in a predictable manner
- **QuickServe System**: The food ordering and tracking application
- **Order Entity**: A customer's food order with lifecycle states
- **Shop Entity**: A restaurant or food outlet with operational states
- **Payment Entity**: A financial transaction with processing states

## Requirements

### Requirement 1: Order Status Standardization

**User Story:** As a system architect, I want order statuses to follow HTTP and REST API conventions, so that the system is consistent with web standards and easier to integrate with external services.

#### Acceptance Criteria

1. WHEN an order is created, THE QuickServe System SHALL use status "pending" instead of "PENDING"
2. WHEN an order is accepted by shopkeeper, THE QuickServe System SHALL use status "confirmed" instead of "CONFIRMED"  
3. WHEN an order enters preparation phase, THE QuickServe System SHALL use status "processing" instead of "PREPARING"
4. WHEN an order is ready for pickup, THE QuickServe System SHALL use status "ready" instead of "READY"
5. WHEN an order is successfully completed, THE QuickServe System SHALL use status "completed" instead of "COMPLETED"
6. WHEN an order is cancelled, THE QuickServe System SHALL use status "cancelled" instead of "CANCELLED"

### Requirement 2: Shop Status Standardization

**User Story:** As a customer, I want shop statuses to clearly indicate availability using standard web conventions, so that I can easily understand which shops are accepting orders.

#### Acceptance Criteria

1. WHEN a shop is accepting orders, THE QuickServe System SHALL use status "open" instead of "OPEN"
2. WHEN a shop is not accepting orders, THE QuickServe System SHALL use status "closed" instead of "CLOSED"
3. WHEN a shop is temporarily unavailable, THE QuickServe System SHALL use status "maintenance" for system maintenance periods
4. WHEN a shop is permanently closed, THE QuickServe System SHALL use status "inactive" for permanently closed establishments

### Requirement 3: Payment Status Standardization

**User Story:** As a developer, I want payment statuses to follow financial API conventions, so that integration with payment gateways follows industry standards.

#### Acceptance Criteria

1. WHEN a payment is initiated, THE QuickServe System SHALL use status "pending" instead of "PENDING"
2. WHEN a payment is successfully processed, THE QuickServe System SHALL use status "completed" instead of "COMPLETED"
3. WHEN a payment fails, THE QuickServe System SHALL use status "failed" for unsuccessful transactions
4. WHEN a payment is reversed, THE QuickServe System SHALL use status "refunded" instead of "REFUNDED"
5. WHEN a payment is being processed, THE QuickServe System SHALL use status "processing" for in-progress transactions

### Requirement 4: Notification Type Standardization

**User Story:** As a system administrator, I want notification types to follow event naming conventions, so that the system is consistent with webhook and event-driven architectures.

#### Acceptance Criteria

1. WHEN an order is placed, THE QuickServe System SHALL use notification type "order.placed" instead of "ORDER_PLACED"
2. WHEN an order is ready, THE QuickServe System SHALL use notification type "order.ready" instead of "ORDER_READY"
3. WHEN a payment succeeds, THE QuickServe System SHALL use notification type "payment.success" instead of "PAYMENT_SUCCESS"
4. WHEN an order is confirmed, THE QuickServe System SHALL use notification type "order.confirmed" instead of "ORDER_CONFIRMED"
5. WHEN a review is received, THE QuickServe System SHALL use notification type "review.created" instead of "NEW_REVIEW"

### Requirement 5: Case Sensitivity and Format Consistency

**User Story:** As a frontend developer, I want all status values to use consistent casing, so that the UI can handle statuses predictably without case conversion logic.

#### Acceptance Criteria

1. WHEN any status is stored or transmitted, THE QuickServe System SHALL use lowercase format for all status values
2. WHEN status values contain multiple words, THE QuickServe System SHALL use underscore separation (snake_case) for compound statuses
3. WHEN displaying statuses to users, THE QuickServe System SHALL convert to proper case in the presentation layer only
4. WHEN comparing statuses programmatically, THE QuickServe System SHALL perform case-insensitive comparisons
5. WHEN validating status transitions, THE QuickServe System SHALL enforce lowercase status values in business logic
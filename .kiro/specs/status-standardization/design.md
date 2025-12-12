# Status Standardization Design

## Overview

This design document outlines the standardization of status values throughout the QuickServe application to align with web standards, HTTP conventions, and MDN Web Docs recommendations. The design focuses on creating a consistent, lowercase, web-standard approach to status management across all entities.

## Architecture

### Status Value Conventions

Following MDN Web Docs and HTTP standards, all status values will use:
- **Lowercase format**: Following JSON API and REST conventions
- **Snake_case for compounds**: Multi-word statuses use underscores
- **Semantic naming**: Status names reflect actual state meaning
- **HTTP-inspired**: Align with HTTP status code semantics where applicable

### Status Categories

1. **Order Lifecycle Status**
2. **Shop Operational Status** 
3. **Payment Transaction Status**
4. **Notification Event Types**

## Components and Interfaces

### Order Status State Machine

```
pending → confirmed → processing → ready → completed
    ↓         ↓           ↓
cancelled  cancelled   cancelled
```

**Status Mappings:**
- `PENDING` → `pending`
- `CONFIRMED` → `confirmed` 
- `PREPARING` → `processing`
- `READY` → `ready`
- `COMPLETED` → `completed`
- `CANCELLED` → `cancelled`

### Shop Status States

```
open ⟷ closed
  ↓      ↓
maintenance
  ↓
inactive
```

**Status Mappings:**
- `OPEN` → `open`
- `CLOSED` → `closed`
- New: `maintenance` (for temporary unavailability)
- New: `inactive` (for permanently closed)

### Payment Status Flow

```
pending → processing → completed
    ↓         ↓           ↓
cancelled   failed    refunded
```

**Status Mappings:**
- `PENDING` → `pending`
- `COMPLETED` → `completed`
- `REFUNDED` → `refunded`
- New: `processing` (for in-progress payments)
- New: `failed` (for unsuccessful payments)

### Notification Type Convention

Following webhook/event naming patterns:
- `ORDER_PLACED` → `order.placed`
- `ORDER_READY` → `order.ready`
- `PAYMENT_SUCCESS` → `payment.success`
- `ORDER_CONFIRMED` → `order.confirmed`
- `NEW_REVIEW` → `review.created`
- `ORDER_CANCELLED` → `order.cancelled`
- `DAILY_SUMMARY` → `analytics.daily_summary`
- `PROMOTION` → `marketing.promotion`

## Data Models

### Status Validation Schema

```typescript
// Order Status Enum
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  PROCESSING = 'processing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Shop Status Enum  
enum ShopStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive'
}

// Payment Status Enum
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed', 
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Notification Type Enum
enum NotificationType {
  ORDER_PLACED = 'order.placed',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_READY = 'order.ready', 
  ORDER_CANCELLED = 'order.cancelled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  REVIEW_CREATED = 'review.created',
  DAILY_SUMMARY = 'analytics.daily_summary',
  PROMOTION = 'marketing.promotion'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status Format Consistency
*For any* status value in the system, it should be in lowercase format and use snake_case for compound words
**Validates: Requirements 5.1, 5.2**

### Property 2: Order Status Transition Validity  
*For any* order status transition, it should follow the defined state machine and not skip intermediate states
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 3: Shop Status Semantic Correctness
*For any* shop status, it should accurately reflect the shop's operational availability to customers
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Payment Status Financial Accuracy
*For any* payment status, it should correctly represent the financial transaction state according to payment industry standards
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 5: Notification Type Event Alignment
*For any* notification type, it should follow dot-notation event naming conventions used in webhook systems
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 6: Status Comparison Case Insensitivity
*For any* status comparison operation, it should work correctly regardless of input case
**Validates: Requirements 5.4**

### Property 7: Status Display Transformation
*For any* status displayed to users, it should be properly formatted for human readability while maintaining lowercase in data storage
**Validates: Requirements 5.3**

## Error Handling

### Status Validation Errors
- **Invalid Status Value**: Return clear error message with valid options
- **Invalid Transition**: Prevent illegal state transitions with descriptive errors
- **Case Mismatch**: Automatically normalize to lowercase, log warning

### Migration Error Handling
- **Data Inconsistency**: Provide migration scripts with rollback capability
- **API Compatibility**: Maintain backward compatibility during transition period
- **Frontend Sync**: Ensure UI components handle both old and new formats during migration

## Testing Strategy

### Unit Tests
- Status validation functions
- State transition logic
- Case normalization utilities
- Display formatting functions

### Property-Based Tests
- Generate random status values and verify format compliance
- Test all possible state transitions for validity
- Verify case-insensitive comparison behavior
- Test notification type format adherence

### Integration Tests
- End-to-end order lifecycle with new status values
- Shop status changes affecting customer experience
- Payment flow with standardized statuses
- Notification system with new event types

### Migration Tests
- Data migration scripts accuracy
- Backward compatibility during transition
- Frontend component adaptation
- API response format consistency
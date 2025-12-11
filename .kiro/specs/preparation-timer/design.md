# Design Document

## Overview

The Real-time Preparation Timer feature enhances the customer order tracking experience by providing live countdown functionality when orders are being prepared. This feature builds upon the existing order tracking system and adds dynamic timer capabilities with visual progress indicators, real-time updates, and graceful handling of edge cases.

## Architecture

The timer system follows a client-side architecture with the following components:

- **Timer Hook**: Custom React hook managing countdown logic and state
- **Timer Component**: Visual component displaying countdown with progress ring
- **Order Tracking Integration**: Enhanced existing OrderTracking component
- **Real-time Updates**: Second-by-second timer updates with performance optimization
- **State Synchronization**: Periodic server sync to maintain accuracy

## Components and Interfaces

### PreparationTimer Component
```typescript
interface PreparationTimerProps {
  preparationTime: number; // minutes
  preparingAt: string; // ISO timestamp
  onTimeUp: () => void;
  onOvertime: (minutes: number) => void;
}
```

### useCountdownTimer Hook
```typescript
interface CountdownState {
  timeRemaining: number; // seconds
  isOvertime: boolean;
  progress: number; // 0-1 for progress ring
  formattedTime: string; // "MM:SS"
}
```

### Timer Display States
- **Active Countdown**: Shows remaining time with blue progress ring
- **Overtime**: Shows elapsed overtime with orange/red styling
- **Ready**: Shows completion message with green celebration styling
- **Hidden**: Timer not displayed for non-preparing orders

## Data Models

### Enhanced Order Model
The existing order model already includes the necessary fields:
- `preparationTime`: number (minutes)
- `preparingAt`: Date timestamp
- `status`: OrderStatus enum
- `readyAt`: Date timestamp (when order becomes ready)

### Timer State Model
```typescript
interface TimerState {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  remainingSeconds: number;
  isActive: boolean;
  isOvertime: boolean;
  overtimeMinutes: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timer Accuracy
*For any* order with preparation time and preparing timestamp, the countdown timer should always show the mathematically correct remaining time based on current time minus start time
**Validates: Requirements 1.2, 4.1, 4.2**

### Property 2: Progress Ring Consistency
*For any* active countdown timer, the progress ring fill percentage should always equal (elapsed time / total preparation time) * 100
**Validates: Requirements 2.1, 2.2**

### Property 3: State Transition Correctness
*For any* order status change from "PREPARING" to "READY", the timer should immediately transition to the ready state regardless of remaining time
**Validates: Requirements 4.3, 5.1**

### Property 4: Overtime Handling
*For any* timer that exceeds the estimated preparation time, the system should correctly calculate and display overtime minutes while maintaining accurate elapsed time
**Validates: Requirements 1.4, 2.4**

### Property 5: Timer Visibility Rules
*For any* order, the countdown timer should be visible if and only if the order status is "PREPARING" and preparation time is set
**Validates: Requirements 1.1, 1.5, 4.4**

## Error Handling

### Network Connectivity Issues
- Implement offline detection and queue timer sync requests
- Show connection status indicator when offline
- Automatically resync timer when connection is restored
- Graceful degradation to static time display if sync fails repeatedly

### Browser Tab Visibility
- Use Page Visibility API to detect tab focus changes
- Recalculate timer when tab becomes visible again
- Prevent unnecessary timer updates when tab is hidden
- Maintain accuracy across browser sleep/wake cycles

### Invalid Data Handling
- Validate preparation time and timestamp data from server
- Fallback to static display if timer data is invalid
- Handle missing or null preparation times gracefully
- Show appropriate error messages for data inconsistencies

### Performance Optimization
- Use requestAnimationFrame for smooth animations
- Throttle server polling when timer is active
- Clean up intervals and timeouts on component unmount
- Optimize re-renders using React.memo and useMemo

## Testing Strategy

### Unit Testing
- Test countdown calculation logic with various time scenarios
- Verify progress ring percentage calculations
- Test state transitions between different timer states
- Validate formatting of time display (MM:SS format)
- Test edge cases like zero time, negative time, and large values

### Property-Based Testing
- Generate random preparation times and start timestamps
- Verify timer accuracy across different time ranges
- Test progress ring consistency with various elapsed times
- Validate state transitions with random order status changes
- Test overtime calculations with extended preparation periods

### Integration Testing
- Test timer integration with existing OrderTracking component
- Verify server data synchronization and polling behavior
- Test timer behavior across different network conditions
- Validate timer persistence across page refreshes and navigation

### Performance Testing
- Measure timer update performance with multiple active timers
- Test memory usage during extended timer sessions
- Verify smooth animation performance on various devices
- Test battery impact of continuous timer updates on mobile devices

The testing approach ensures both specific functionality and general correctness properties are validated, providing comprehensive coverage for the real-time timer feature.
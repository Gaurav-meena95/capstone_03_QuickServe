import { describe, test, expect, vi } from 'vitest'
import fc from 'fast-check'
import {
  calculateTimerState,
  formatTime,
  getProgressPercentage,
  isOrderPreparing,
  getTimeAgo,
  getEstimatedCompletionTime,
  validatePreparationTime,
  getActualPreparationTime,
  getOvertimeDuration,
  getTimingSummary,
  formatTimingComparison,
  getTimingStatus
} from '../timerUtils'

describe('Timer Utilities', () => {
  /**
   * **Feature: preparation-timer, Property 4: Countdown timer accuracy**
   * For any preparing order with valid timing data, the calculated remaining time 
   * should equal the preparation time minus elapsed time since preparingAt
   * **Validates: Requirements 2.1, 2.3**
   */
  test('Property 4: Countdown timer accuracy', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }), // preparation time in minutes
        fc.integer({ min: 0, max: 3600 }), // elapsed seconds (up to 1 hour)
        (preparationTimeMinutes, elapsedSeconds) => {
          // Create a mock order with preparation data
          const now = new Date()
          const preparingAt = new Date(now.getTime() - elapsedSeconds * 1000)
          
          const order = {
            status: 'PREPARING',
            preparationTime: preparationTimeMinutes,
            preparingAt: preparingAt.toISOString()
          }

          // Mock the current time
          const originalNow = Date.now
          Date.now = vi.fn(() => now.getTime())

          try {
            const timerState = calculateTimerState(order)
            
            const expectedTotalSeconds = preparationTimeMinutes * 60
            const expectedRemaining = Math.max(0, expectedTotalSeconds - elapsedSeconds)
            
            if (elapsedSeconds <= expectedTotalSeconds) {
              // Normal countdown - allow 1 second tolerance for timing precision
              expect(Math.abs(timerState.remaining - expectedRemaining)).toBeLessThanOrEqual(1)
              expect(timerState.isOvertime).toBe(false)
            } else {
              // Overtime - allow 1 second tolerance for timing precision
              const expectedOvertime = elapsedSeconds - expectedTotalSeconds
              expect(Math.abs(timerState.remaining - expectedOvertime)).toBeLessThanOrEqual(1)
              expect(timerState.isOvertime).toBe(true)
            }

            // Progress should be calculated correctly
            const expectedProgress = Math.min(100, (elapsedSeconds / expectedTotalSeconds) * 100)
            expect(Math.abs(timerState.progress - expectedProgress)).toBeLessThan(1) // Allow small floating point differences

            return true
          } finally {
            Date.now = originalNow
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test formatTime function with various inputs
   */
  test('formatTime handles various inputs correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7200 }), // 0 to 2 hours in seconds
        (seconds) => {
          const formatted = formatTime(seconds)
          
          // Should always return MM:SS format (MM can be more than 2 digits for long times)
          expect(formatted).toMatch(/^\d{2,}:\d{2}$/)
          
          // Verify the calculation
          const expectedMins = Math.floor(seconds / 60)
          const expectedSecs = seconds % 60
          const expected = `${expectedMins.toString().padStart(2, '0')}:${expectedSecs.toString().padStart(2, '0')}`
          
          expect(formatted).toBe(expected)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test edge cases for formatTime
   */
  test('formatTime handles edge cases', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(-1)).toBe('00:00')
    expect(formatTime('invalid')).toBe('00:00')
    expect(formatTime(null)).toBe('00:00')
    expect(formatTime(undefined)).toBe('00:00')
  })

  /**
   * Test preparation time validation
   */
  test('validatePreparationTime property test', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        (validTime) => {
          const result = validatePreparationTime(validTime)
          expect(result.isValid).toBe(true)
          expect(result.error).toBeNull()
          return true
        }
      ),
      { numRuns: 50 }
    )

    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ max: 0 }),
          fc.integer({ min: 121 }),
          fc.constant('invalid'),
          fc.constant(null),
          fc.constant(undefined),
          fc.constant('')
        ),
        (invalidTime) => {
          const result = validatePreparationTime(invalidTime)
          expect(result.isValid).toBe(false)
          expect(result.error).toBeTruthy()
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Test isOrderPreparing function
   */
  test('isOrderPreparing correctly identifies preparing orders', () => {
    const preparingOrder = {
      status: 'PREPARING',
      preparationTime: 15,
      preparingAt: new Date().toISOString()
    }
    
    expect(isOrderPreparing(preparingOrder)).toBe(true)
    expect(isOrderPreparing({ status: 'PENDING' })).toBe(false)
    expect(isOrderPreparing({ status: 'PREPARING' })).toBe(false) // missing timing data
    expect(isOrderPreparing(null)).toBe(false)
  })

  /**
   * Test getEstimatedCompletionTime
   */
  test('getEstimatedCompletionTime calculates correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
        (preparationTime, startTime) => {
          const order = {
            preparationTime,
            preparingAt: startTime.toISOString()
          }
          
          const completionTime = getEstimatedCompletionTime(order)
          const expectedTime = new Date(startTime.getTime() + preparationTime * 60000)
          
          expect(completionTime.getTime()).toBe(expectedTime.getTime())
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})
  /**
   * **Feature: preparation-timer, Property 5: Multiple timer independence**
   * For any set of preparing orders, updating the timer display for one order 
   * should not affect the timer calculations for other orders
   * **Validates: Requirements 3.2, 3.5**
   */
  test('Property 5: Multiple timer independence', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            preparationTime: fc.integer({ min: 1, max: 120 }),
            elapsedSeconds: fc.integer({ min: 0, max: 7200 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (orders) => {
          const now = new Date()
          
          // Create timer states for all orders
          const timerStates = orders.map(orderData => {
            const preparingAt = new Date(now.getTime() - orderData.elapsedSeconds * 1000)
            const order = {
              id: orderData.id,
              status: 'PREPARING',
              preparationTime: orderData.preparationTime,
              preparingAt: preparingAt.toISOString()
            }
            
            return {
              orderId: orderData.id,
              originalState: calculateTimerState(order),
              order
            }
          })
          
          // Verify each timer state is independent
          for (let i = 0; i < timerStates.length; i++) {
            const currentTimer = timerStates[i]
            
            // Recalculate this timer's state
            const recalculatedState = calculateTimerState(currentTimer.order)
            
            // The recalculated state should match the original
            expect(Math.abs(recalculatedState.remaining - currentTimer.originalState.remaining)).toBeLessThanOrEqual(1)
            expect(recalculatedState.isOvertime).toBe(currentTimer.originalState.isOvertime)
            
            // Other timers should not be affected by this calculation
            for (let j = 0; j < timerStates.length; j++) {
              if (i !== j) {
                const otherTimer = timerStates[j]
                const otherRecalculated = calculateTimerState(otherTimer.order)
                
                // Other timer should remain unchanged
                expect(Math.abs(otherRecalculated.remaining - otherTimer.originalState.remaining)).toBeLessThanOrEqual(1)
                expect(otherRecalculated.isOvertime).toBe(otherTimer.originalState.isOvertime)
              }
            }
          }
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
  /**
   * **Feature: preparation-timer, Property 6: Timer state restoration**
   * For any preparing order, after system restart, the calculated remaining time 
   * should match the time calculated from stored preparationTime and preparingAt
   * **Validates: Requirements 4.3**
   */
  test('Property 6: Timer state restoration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }), // preparation time in minutes
        fc.integer({ min: 0, max: 3600 }), // elapsed seconds since preparation started
        (preparationTimeMinutes, elapsedSeconds) => {
          // Simulate stored order data (what would be in database)
          const now = new Date()
          const preparingAt = new Date(now.getTime() - elapsedSeconds * 1000)
          
          const storedOrder = {
            status: 'PREPARING',
            preparationTime: preparationTimeMinutes,
            preparingAt: preparingAt.toISOString()
          }

          // Mock system restart by calculating timer state from stored data
          const originalNow = Date.now
          Date.now = vi.fn(() => now.getTime())

          try {
            // Calculate timer state from stored data (simulating restoration)
            const restoredState = calculateTimerState(storedOrder)
            
            // Calculate expected state
            const expectedTotalSeconds = preparationTimeMinutes * 60
            const expectedRemaining = Math.max(0, expectedTotalSeconds - elapsedSeconds)
            
            if (elapsedSeconds <= expectedTotalSeconds) {
              // Normal countdown
              expect(Math.abs(restoredState.remaining - expectedRemaining)).toBeLessThanOrEqual(1)
              expect(restoredState.isOvertime).toBe(false)
            } else {
              // Overtime
              const expectedOvertime = elapsedSeconds - expectedTotalSeconds
              expect(Math.abs(restoredState.remaining - expectedOvertime)).toBeLessThanOrEqual(1)
              expect(restoredState.isOvertime).toBe(true)
            }

            // Progress should be calculated correctly
            const expectedProgress = Math.min(100, (elapsedSeconds / expectedTotalSeconds) * 100)
            expect(Math.abs(restoredState.progress - expectedProgress)).toBeLessThan(1)

            // Start and end times should be set correctly
            expect(restoredState.startTime).toBeInstanceOf(Date)
            expect(restoredState.endTime).toBeInstanceOf(Date)

            return true
          } finally {
            Date.now = originalNow
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  /**
   * **Feature: preparation-timer, Property 9: Historical timing display**
   * For any completed order with timing data, the displayed estimated vs actual time 
   * should accurately reflect the difference between preparationTime and actual duration
   * **Validates: Requirements 5.2, 5.3, 5.4**
   */
  test('Property 9: Historical timing display', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }), // estimated preparation time
        fc.integer({ min: 1, max: 180 }), // actual preparation time
        (estimatedMinutes, actualMinutes) => {
          // Create a completed order with timing data
          const preparingAt = new Date('2024-01-01T10:00:00Z')
          const readyAt = new Date(preparingAt.getTime() + actualMinutes * 60000)
          
          const order = {
            status: 'COMPLETED',
            preparationTime: estimatedMinutes,
            preparingAt: preparingAt.toISOString(),
            readyAt: readyAt.toISOString()
          }

          // Test timing calculation functions
          const actualTime = getActualPreparationTime(order)
          const overtime = getOvertimeDuration(order)
          const summary = getTimingSummary(order)
          const comparison = formatTimingComparison(order)
          const status = getTimingStatus(order)

          // Verify actual time calculation
          expect(actualTime).toBe(actualMinutes)

          // Verify overtime calculation
          const expectedOvertime = actualMinutes > estimatedMinutes ? actualMinutes - estimatedMinutes : null
          expect(overtime).toBe(expectedOvertime)

          // Verify timing summary
          expect(summary.estimated).toBe(estimatedMinutes)
          expect(summary.actual).toBe(actualMinutes)
          expect(summary.overtime).toBe(expectedOvertime)
          expect(summary.hasTimingData).toBe(true)
          expect(summary.wasOnTime).toBe(expectedOvertime === null)
          expect(summary.wasOvertime).toBe(expectedOvertime !== null && expectedOvertime > 0)

          // Verify comparison string contains relevant information
          expect(comparison).toContain(actualMinutes.toString())
          expect(comparison).toContain(estimatedMinutes.toString())
          
          if (expectedOvertime) {
            expect(comparison).toContain('overtime')
            expect(comparison).toContain(expectedOvertime.toString())
          } else {
            expect(comparison).toContain('as estimated')
          }

          // Verify status object
          expect(status.status).toBe(expectedOvertime ? 'overtime' : 'on-time')
          expect(status.color).toBeTruthy()
          expect(status.icon).toBeTruthy()
          expect(status.label).toBeTruthy()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Test historical timing display for orders without timing data
   */
  test('Historical timing display handles orders without timing data', () => {
    const orderWithoutTiming = {
      status: 'COMPLETED',
      // No preparationTime, preparingAt, or readyAt
    }

    const actualTime = getActualPreparationTime(orderWithoutTiming)
    const overtime = getOvertimeDuration(orderWithoutTiming)
    const summary = getTimingSummary(orderWithoutTiming)
    const comparison = formatTimingComparison(orderWithoutTiming)
    const status = getTimingStatus(orderWithoutTiming)

    expect(actualTime).toBeNull()
    expect(overtime).toBeNull()
    expect(summary.hasTimingData).toBe(false)
    expect(comparison).toContain('not tracked')
    expect(status.status).toBe('no-data')
  })
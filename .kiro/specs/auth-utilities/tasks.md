# Implementation Plan

- [ ] 1. Set up authentication utilities infrastructure
  - Create directory structure for authentication utilities
  - Set up base authentication utility functions
  - Create TypeScript interfaces and type definitions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.1 Write property test for authorization header inclusion
  - **Property 1: Authorization header inclusion**
  - **Validates: Requirements 1.1**

- [ ] 1.2 Write property test for no-token authentication error
  - **Property 2: No-token authentication error**
  - **Validates: Requirements 1.2**

- [ ] 1.3 Write property test for successful response structure
  - **Property 3: Successful response structure**
  - **Validates: Requirements 1.3**

- [ ] 1.4 Write property test for error classification consistency
  - **Property 4: Error classification consistency**
  - **Validates: Requirements 1.4**

- [ ] 2. Implement core fetchWithAuth function
- [ ] 2.1 Create main fetchWithAuth utility function
  - Implement authenticated request handling
  - Add proper error classification and response formatting
  - Include refresh token in request headers when available
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2.2 Write property test for refresh token header inclusion
  - **Property 5: Refresh token header inclusion**
  - **Validates: Requirements 1.5**

- [ ] 2.3 Export fetchWithAuth from api.js
  - Add fetchWithAuth export to existing api.js file
  - Ensure compatibility with existing API structure
  - Update imports in ProfilePage.jsx to use new function
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Implement token management system
- [ ] 3.1 Create TokenManager class
  - Implement token storage and retrieval from localStorage
  - Add token validation and expiration checking
  - Create token clearing functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.2 Write property test for token storage completeness
  - **Property 16: Token storage completeness**
  - **Validates: Requirements 4.1**

- [ ] 3.3 Write property test for token retrieval consistency
  - **Property 17: Token retrieval consistency**
  - **Validates: Requirements 4.2**

- [ ] 3.4 Write property test for complete token clearing
  - **Property 18: Complete token clearing**
  - **Validates: Requirements 4.3**

- [ ] 3.5 Write property test for token validation accuracy
  - **Property 19: Token validation accuracy**
  - **Validates: Requirements 4.4**

- [ ] 3.6 Write property test for token replacement behavior
  - **Property 20: Token replacement behavior**
  - **Validates: Requirements 4.5**

- [ ] 4. Implement automatic token refresh system
- [ ] 4.1 Create TokenRefreshService class
  - Implement automatic token refresh on 401 errors
  - Add request retry logic after successful refresh
  - Handle refresh failures with proper cleanup
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.2 Write property test for automatic refresh on 401
  - **Property 6: Automatic refresh on 401**
  - **Validates: Requirements 2.1**

- [ ] 4.3 Write property test for retry after successful refresh
  - **Property 7: Retry after successful refresh**
  - **Validates: Requirements 2.2**

- [ ] 4.4 Write property test for token cleanup on refresh failure
  - **Property 8: Token cleanup on refresh failure**
  - **Validates: Requirements 2.3**

- [ ] 4.5 Write property test for skip refresh without token
  - **Property 9: Skip refresh without token**
  - **Validates: Requirements 2.4**

- [ ] 4.6 Write property test for token storage after refresh
  - **Property 10: Token storage after refresh**
  - **Validates: Requirements 2.5**

- [ ] 5. Implement comprehensive error handling
- [ ] 5.1 Create AuthenticatedRequestHandler class
  - Implement error classification system
  - Add standardized error response formatting
  - Create error information preservation logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.2 Write property test for standardized error objects
  - **Property 11: Standardized error objects**
  - **Validates: Requirements 3.1**

- [ ] 5.3 Write property test for error type distinction
  - **Property 12: Error type distinction**
  - **Validates: Requirements 3.2**

- [ ] 5.4 Write property test for error information preservation
  - **Property 13: Error information preservation**
  - **Validates: Requirements 3.3**

- [ ] 5.5 Write property test for validation error handling
  - **Property 14: Validation error handling**
  - **Validates: Requirements 3.4**

- [ ] 5.6 Write property test for token parsing error handling
  - **Property 15: Token parsing error handling**
  - **Validates: Requirements 3.5**

- [ ] 6. Implement authentication state management
- [ ] 6.1 Create AuthStateManager class
  - Implement authentication status tracking
  - Add state change notification system
  - Create login and logout state management
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.2 Write property test for authentication status accuracy
  - **Property 21: Authentication status accuracy**
  - **Validates: Requirements 5.1**

- [ ] 6.3 Write property test for state change notification
  - **Property 22: State change notification**
  - **Validates: Requirements 5.2**

- [ ] 6.4 Write property test for logout cleanup completeness
  - **Property 23: Logout cleanup completeness**
  - **Validates: Requirements 5.3**

- [ ] 6.5 Write property test for login state establishment
  - **Property 24: Login state establishment**
  - **Validates: Requirements 5.4**

- [ ] 6.6 Write property test for expiration state handling
  - **Property 25: Expiration state handling**
  - **Validates: Requirements 5.5**

- [ ] 7. Create additional authentication utilities
- [ ] 7.1 Implement login utility function
  - Create login function with credential handling
  - Add authentication result processing
  - Integrate with token management and state management
  - _Requirements: 5.4_

- [ ] 7.2 Implement logout utility function
  - Create logout function with complete cleanup
  - Clear all authentication state and tokens
  - Notify components of authentication state change
  - _Requirements: 5.3_

- [ ] 7.3 Implement authentication status utilities
  - Create isAuthenticated function
  - Add getAuthState function for current state access
  - Implement onAuthStateChange subscription system
  - _Requirements: 5.1, 5.2_

- [ ] 8. Integration and testing
- [ ] 8.1 Integrate authentication utilities with existing components
  - Update ProfilePage.jsx to use new fetchWithAuth function
  - Test authentication utilities with real API endpoints
  - Verify error handling works correctly across components
  - _Requirements: All requirements_

- [ ] 8.2 Create comprehensive test suite
  - Set up Jest configuration for authentication testing
  - Create test utilities and mocks for authentication testing
  - Implement integration tests for end-to-end authentication flows
  - _Requirements: All requirements_

- [ ] 8.3 Update existing API utilities
  - Integrate new authentication utilities with existing customerAPI, shopkeeperAPI
  - Ensure backward compatibility with existing API calls
  - Update error handling to use new authentication error system
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
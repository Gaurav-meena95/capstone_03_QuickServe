# Password Reset System Design

## Overview

The Password Reset System provides a secure, token-based mechanism for users to reset their forgotten passwords. The system consists of two main flows: requesting a password reset and completing the password reset using a secure token. The backend API already implements the core functionality, and this design focuses on creating the missing frontend components and ensuring proper integration.

## Architecture

The system follows a client-server architecture with the following components:

```
Frontend (React) ←→ Backend API ←→ Database (PostgreSQL)
     ↓                    ↓              ↓
- ForgotPassword     - /forgot-password  - User.resetToken
- ResetPassword      - /reset-password   - User.resetTokenExpiry
- Navigation         - Token validation  - Password hashing
```

### Key Architectural Principles:
- **Security First**: All tokens are cryptographically secure and time-limited
- **User Privacy**: System doesn't reveal whether email addresses exist
- **Stateless Design**: Each request is self-contained with proper validation
- **Graceful Degradation**: Clear error handling and user feedback

## Components and Interfaces

### Frontend Components

#### 1. ForgotPasswordPage Component
- **Purpose**: Allows users to request password reset
- **Location**: `Frontend/quick_serve/src/components/auth/ForgotPasswordPage.jsx`
- **Props**: None
- **State**: 
  - `email`: User's email input
  - `loading`: Request processing state
  - `message`: Success/error messages
  - `submitted`: Whether form has been submitted

#### 2. ResetPasswordPage Component
- **Purpose**: Allows users to set new password using reset token
- **Location**: `Frontend/quick_serve/src/components/auth/ResetPasswordPage.jsx`
- **Props**: None (reads URL parameters)
- **State**:
  - `newPassword`: New password input
  - `confirmPassword`: Password confirmation input
  - `loading`: Request processing state
  - `error`: Error messages
  - `success`: Success state

#### 3. Route Configuration
- **Forgot Password Route**: `/forgot-password`
- **Reset Password Route**: `/reset-password`
- **Integration**: Add routes to existing React Router configuration

### Backend API Endpoints (Already Implemented)

#### 1. POST /api/auth/forgot-password
- **Input**: `{ email: string }`
- **Output**: `{ message: string, resetUrl?: string }`
- **Behavior**: Generates secure token, stores in database with expiration

#### 2. POST /api/auth/reset-password
- **Input**: `{ email: string, token: string, newPassword: string }`
- **Output**: `{ message: string }`
- **Behavior**: Validates token, updates password, invalidates token

## Data Models

### User Model Extensions (Already Implemented)
```prisma
model User {
  // ... existing fields
  resetToken       String?   // Hashed reset token
  resetTokenExpiry DateTime? // Token expiration time
}
```

### Token Structure
- **Generation**: 32-byte cryptographically secure random token
- **Storage**: Hashed using bcrypt before database storage
- **Expiration**: 1 hour from generation time
- **Validation**: Compare plain token with hashed stored token

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework analysis, I identified several redundant properties:
- Properties 3.4 and 5.4 both test token invalidation after use - these can be combined
- Properties testing error message display (4.3, 4.5) can be consolidated into comprehensive error handling
- Properties testing success message display (4.2, 4.4) can be combined into success flow validation

**Property 1: Email validation consistency**
*For any* string input, the email validation function should return true only for strings that match the standard email format pattern
**Validates: Requirements 1.2**

**Property 2: Token generation security**
*For any* password reset request with a valid email, the system should generate a unique, cryptographically secure token that is different from all previously generated tokens
**Validates: Requirements 1.3, 5.1**

**Property 3: Response consistency for security**
*For any* email address (existing or non-existing), the forgot password API should return the same success message format without revealing account existence
**Validates: Requirements 1.4**

**Property 4: Reset link generation**
*For any* existing user email, a password reset request should generate a properly formatted reset URL containing the secure token and email parameters
**Validates: Requirements 1.5**

**Property 5: Parameter validation completeness**
*For any* URL parameters combination, the reset password page should correctly identify when required token and email parameters are missing or invalid
**Validates: Requirements 2.2, 2.3**

**Property 6: Password matching validation**
*For any* pair of password inputs, the validation should return true only when both passwords are identical and meet security requirements
**Validates: Requirements 2.5**

**Property 7: Token validation and expiration**
*For any* reset token and timestamp combination, the backend should correctly identify whether the token is valid, properly formatted, and not expired
**Validates: Requirements 3.1, 3.2**

**Property 8: Password update with token invalidation**
*For any* valid reset token, successful password update should result in the token being immediately invalidated and unusable for subsequent requests
**Validates: Requirements 3.3, 3.4, 5.4**

**Property 9: Token expiration timing**
*For any* generated reset token, the expiration time should be set to exactly 1 hour from the generation timestamp
**Validates: Requirements 5.2**

**Property 10: Rate limiting protection**
*For any* sequence of password reset requests from the same source, the system should enforce rate limits to prevent abuse while allowing legitimate requests
**Validates: Requirements 5.3**

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display "Connection failed, please try again"
- **Validation Errors**: Show field-specific error messages
- **API Errors**: Display server-provided error messages
- **Token Errors**: Clear messaging about expired/invalid tokens

### Backend Error Handling (Already Implemented)
- **Invalid Email**: 400 status with validation message
- **Expired Token**: 400 status with expiration message
- **Invalid Token**: 400 status with invalid token message
- **Server Errors**: 500 status with generic error message

### Error Recovery
- **Expired Token**: Redirect to forgot password page with explanation
- **Invalid Token**: Redirect to login page with error message
- **Network Issues**: Retry mechanism with exponential backoff

## Testing Strategy

### Unit Testing
- **Component Rendering**: Test that components render correctly with various props/state
- **Form Validation**: Test email and password validation functions
- **Navigation**: Test route transitions and URL parameter handling
- **API Integration**: Test API calls with mocked responses

### Property-Based Testing
- **Library**: fast-check for JavaScript property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Coverage**: Each correctness property implemented as a single property-based test
- **Tagging**: Each test tagged with format: '**Feature: password-reset-system, Property {number}: {property_text}**'

### Integration Testing
- **End-to-End Flow**: Test complete password reset flow from request to completion
- **Error Scenarios**: Test various failure modes and error handling
- **Security Testing**: Verify token security and expiration behavior

### Test Organization
- **Frontend Tests**: `Frontend/quick_serve/src/components/auth/__tests__/`
- **Backend Tests**: `Backend/src/__tests__/password-reset.test.js`
- **Property Tests**: Separate files for property-based testing
- **Integration Tests**: Full flow testing with real API calls
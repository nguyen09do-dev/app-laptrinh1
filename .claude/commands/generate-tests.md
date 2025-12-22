# Generate Tests

You are an expert QA engineer for the AI Content Platform.

Generate comprehensive tests for: **{{prompt}}**

## Testing Requirements:

### For Backend (Vitest)

```typescript
// Import required testing utilities
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Example: Service Tests
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    // Setup
    service = new ServiceName();
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle successful case', async () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });

    it('should handle error case', async () => {
      // Arrange
      const invalidInput = { /* bad data */ };

      // Act & Assert
      await expect(service.methodName(invalidInput)).rejects.toThrow();
    });

    it('should handle edge case: empty input', async () => {
      // Test edge cases
    });
  });
});
```

### For Frontend (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders with correct props', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockOnClick = vi.fn();
    render(<ComponentName onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  it('displays loading state', () => {
    render(<ComponentName isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Test Coverage Requirements:

### 1. Happy Path Tests ✅
- Normal, expected usage
- Valid inputs
- Successful operations

### 2. Error Cases ❌
- Invalid inputs
- Network failures
- Database errors
- AI provider errors
- Authorization failures

### 3. Edge Cases 🔍
- Empty inputs
- Null/undefined values
- Maximum/minimum values
- Boundary conditions
- Race conditions

### 4. Integration Points 🔗
- Database interactions
- API calls
- AI provider calls
- External service integrations

### 5. Mocking Strategy 🎭

**Mock external dependencies:**
```typescript
// Mock database
vi.mock('../lib/db', () => ({
  query: vi.fn(),
  connect: vi.fn(),
}));

// Mock AI provider
vi.mock('../lib/llmClient', () => ({
  generateCompletion: vi.fn().mockResolvedValue('Mocked AI response'),
}));

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true, data: {} }),
});
```

---

## Generate Tests For:

Analyze the code/component provided and generate:

1. **Test Suite Structure**
   - Main describe block
   - Nested describe blocks for each method/feature
   - Clear test organization

2. **Test Cases**
   - At least 5-10 test cases
   - Cover happy path, errors, edge cases
   - Clear test names (describe what's tested)

3. **Setup/Teardown**
   - beforeEach for initialization
   - afterEach for cleanup
   - Mock setup and reset

4. **Assertions**
   - Specific, meaningful assertions
   - Test all important behaviors
   - Verify error messages

5. **Test Data**
   - Realistic test data
   - Edge case data
   - Invalid data examples

---

## Test Naming Convention:

```typescript
it('should [expected behavior] when [condition]', () => {
  // Test
});

// Examples:
it('should generate 10 ideas when valid input provided', () => {});
it('should throw ValidationError when persona is empty', () => {});
it('should return cached results when called twice with same input', () => {});
```

---

## Special Considerations:

### For AI-related code:
- Mock AI provider responses
- Test token usage tracking
- Test retry logic
- Test fallback mechanisms

### For Database code:
- Mock database queries
- Test parameterized queries (security)
- Test transaction handling
- Test error scenarios (connection lost, etc.)

### For React components:
- Test rendering with different props
- Test user interactions
- Test async state updates
- Test error boundaries

### For API endpoints:
- Test authentication/authorization
- Test input validation
- Test response formats
- Test error handling

---

**Project Context:**
- Backend testing: Vitest
- Frontend testing: Jest + React Testing Library
- Mocking: vitest's vi.mock()
- See CLAUDE.md for project patterns

Generate comprehensive tests now.

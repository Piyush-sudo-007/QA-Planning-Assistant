# Edge Case & Boundary Testing Guidelines

## Edge Case Categories

### 1. Data Input Boundaries
- **Strings**: Empty string `""`, max length strings, unicode/emoji `🤖✨`, special characters `<script>alert(1)</script>`, whitespace-only strings `"   "`.
- **Numbers**: `0`, negative numbers, floating point numbers, `NaN`, `Infinity`, max integer values (`2^53 - 1`).
- **Arrays/Lists**: Empty array `[]`, single item, duplicate items, high volume items (10,000+).

### 2. State & Timing Edge Cases
- Double submission / rapid button clicking (race conditions).
- Session expiration mid-form submission.
- Network latencies, packet loss, and connection timeouts.
- Timezone transitions (DST changes, leap years, UTC offsets).

### 3. Permission & Authorization Boundary
- Standard user attempting admin endpoint access.
- User accessing resources belonging to another organization/tenant (cross-tenant isolation).
- Expired authentication token mid-action.

## Test Generation Rules
- Every feature requirement must have at least 2 edge case tests generated.
- Always include input sanitization and boundary check tests for text inputs.

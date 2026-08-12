# Unit Testing Standards & Guidelines

## Core Principles
1. **Isolation**: Each unit test must test a single component or function in isolation. External dependencies like databases, APIs, or system state must be mocked or stubbed.
2. **Determinism**: Unit tests must produce the exact same result every time they are run regardless of environment or order of execution.
3. **Speed**: Unit test suites should execute in milliseconds to provide fast feedback in CI/CD pipelines.
4. **Readability (AAA Pattern)**:
   - **Arrange**: Set up pre-conditions, inputs, and mock objects.
   - **Act**: Execute the function under test.
   - **Assert**: Verify the output matches expectations.

## Target Scenarios for Unit Tests
- Business logic calculations and rule validations.
- Input parsing, data transformations, and validation helper functions.
- State machines and conditional branching logic.
- Edge cases: null/undefined inputs, boundary values, empty collections, extreme numbers.

## Mocking Best Practices
- Mock external networks, disk IO, and databases.
- Avoid over-mocking internal helper functions; test public interfaces instead of internal implementation details.
- Ensure mock expectations are verified to detect broken contracts.

## Naming Conventions
- Use descriptive test titles: `should [expected behavior] when [condition]`.
- Example: `should throw ValidationError when email format is invalid`.

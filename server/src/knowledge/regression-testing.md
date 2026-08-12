# Regression Testing & Risk Assessment Guidelines

## Regression Analysis Methodology
1. **Change Impact Analysis**: Identify which existing modules or dependent features share code, database schema, or APIs with the newly modified feature.
2. **Risk Scoring**:
   - **High Risk**: Core authentication, database schema changes, payment flow, permissions.
   - **Medium Risk**: Common UI components, shared calculation logic, API response updates.
   - **Low Risk**: Isolated styling changes, static copy updates.

## Regression Test Selection
- Always run the core smoke test suite on every pull request.
- Select test cases specifically mapped to affected acceptance criteria and adjacent feature areas.
- Prioritize automated unit and API integration tests in CI pipelines.

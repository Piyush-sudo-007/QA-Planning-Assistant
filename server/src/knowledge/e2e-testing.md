# End-to-End (E2E) Testing Guidelines

## Overview
E2E testing validates complete end-to-end user journeys across frontend UI, backend API, database, and third-party integrations from the user's perspective.

## Core Best Practices
1. **Critical Path Focus**: Test complete critical workflows (e.g., User Signup → Plan Creation → Review Test Cases → Export Plan).
2. **Resilience to Flakiness**:
   - Use dynamic explicit waits based on visual/DOM states instead of static timeouts (`sleep`).
   - Clean up state programmatically via API calls before running UI tests.
3. **Environment Parity**: Run E2E suites against staging/preview environments that mirror production architecture.

## Checklist for E2E Test Cases
- Verify visual components load correctly and UI is responsive.
- Test primary call-to-action buttons, navigation links, and dynamic forms.
- Test session persistence across page refreshes.
- Verify error notifications appear when API calls fail.
- Check cross-browser behavior (Chromium, Firefox, WebKit).

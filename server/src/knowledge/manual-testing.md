# Manual Testing & QA Inspection Guidelines

## Core Principles
1. **Exploratory Testing**: Go beyond predefined scripts to explore unexpected paths, visual glitches, and usability friction.
2. **User Experience & Accessibility**:
   - Keyboard navigation (Tab, Enter, Space, Escape keys).
   - Screen reader attributes (`aria-label`, `role`, focus indicators).
   - Responsive layouts across mobile, tablet, and desktop viewports.
3. **Structured Test Case Format**:
   - **Title**: Clear, concise action summary.
   - **Preconditions**: Required setup (e.g. user logged in as Admin).
   - **Steps**: Step-by-step numbered actions.
   - **Expected Result**: Exact observable outcome.
   - **Actual Result**: Recorded outcome during execution.

## Manual Test Scenarios
- Visual alignment and glassmorphism transparency rendering across different browsers.
- Dark mode readability and contrast ratios.
- Network interruption while submitting forms (offline behavior).
- Confirmation modals on destructive actions (e.g. deleting a project).

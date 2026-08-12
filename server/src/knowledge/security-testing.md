# Security Testing Guidelines

## Key OWASP Top 10 Focus Areas
1. **Broken Access Control**: Verify users cannot view or mutate other users' QA plans by manipulating project/plan IDs in API requests.
2. **Cryptographic Failures**: Verify passwords use strong hashing (bcrypt salt >= 10), and sensitive tokens are never stored in plaintext or logged.
3. **Injection Flaws**: Ensure all SQL parameters use prepared statements / parameterized bindings (`?`).
4. **Security Misconfiguration**: Enforce HTTP security headers via Helmet (CORS policy, X-Content-Type-Options, Strict-Transport-Security).

## Security Test Checklists
- JWT token forgery or tampered signature handling.
- XSS prevention on user input rendered in the frontend.
- API rate limiting enforcement to protect against brute-force logins.
- CORS policy verification ensuring unauthorized domains are blocked.

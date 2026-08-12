# API Testing Standards & Guidelines

## Core Principles
1. **HTTP Contract Compliance**: Verify status codes, header responses, and JSON schemas match the API specification.
2. **Input Validation & Sanity**: Test with valid payloads, missing required fields, unexpected data types, and malicious inputs.
3. **Idempotency & State Safety**: Verify GET, PUT, and DELETE operations handle repeated requests cleanly.
4. **Authentication & Authorization**: Ensure unauthorized requests receive 401 Unauthorized, and forbidden actions return 403 Forbidden.

## Status Code Verification Matrix
- **200 OK / 201 Created / 204 No Content**: Successful resource management.
- **400 Bad Request**: Malformed JSON or missing required query/body parameters.
- **401 Unauthorized**: Missing, expired, or tampered JWT / API Key.
- **403 Forbidden**: Authenticated user attempting access beyond their role permissions.
- **404 Not Found**: Non-existent endpoint or non-existent resource ID.
- **409 Conflict**: Duplicate unique key or concurrent update conflict.
- **422 Unprocessable Entity**: Business rule violation on valid syntax payload.
- **500 Internal Server Error**: Uncaught server exceptions — should be minimized and tracked.

## Required API Test Coverage
- **Happy Path**: Expected payload returns 2xx and exact schema match.
- **Error Payloads**: Field validation errors return detailed message arrays.
- **Rate Limiting**: Burst requests trigger 429 Too Many Requests.
- **Pagination & Filtering**: Offset/limit parameters return correct subset and metadata.

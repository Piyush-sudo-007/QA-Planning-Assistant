# Integration Testing Guidelines

## Overview
Integration tests evaluate interactions between different components, modules, or external services (e.g. Database + Express App + Authentication service).

## Key Coverage Areas
1. **Database Integration**:
   - Verify ORM/Query builder operations correctly read and write to the database schema.
   - Verify transaction rollback on failure to maintain data consistency.
   - Test migration scripts and schema constraint enforcement (foreign keys, unique indices).
2. **External Service Dependencies**:
   - Test contracts with external REST/gRPC endpoints using stub servers (e.g. WireMock or Nock).
   - Test handling of slow responses, timeouts, and network connection resets.
3. **Asynchronous Messaging & Queues**:
   - Verify background job processors (e.g. BullMQ, RabbitMQ) process messages accurately.
   - Test dead-letter queues and retry logic for failed jobs.

## Test Data Lifecycle
- Use clean test database instances (e.g., ephemeral SQLite or Docker containers).
- Seed fresh test data before test suites run and purge state after execution.
- Maintain isolated test fixtures rather than shared mutable state.

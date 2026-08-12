# Performance & Reliability Guidelines

## Metrics & Thresholds
- **API Response Time**: 95% of read requests < 200ms; AI generation workflows < 15s.
- **Database Query Latency**: All queries indexed; read queries execution time < 20ms.
- **Frontend Load Time**: First Contentful Paint (FCP) < 1.2s; Time to Interactive (TTI) < 2.0s.

## Test Scenarios
- **Load Testing**: Test application behavior under expected peak user traffic.
- **Stress Testing**: Push server beyond capacity to determine breaking point and verify graceful degradation.
- **Resource Leaks**: Monitor database connection pool usage and memory footprint under sustained usage.

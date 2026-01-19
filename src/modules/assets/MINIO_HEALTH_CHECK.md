# MinIO Health Check - Assets Module

## Overview

A comprehensive health check endpoint has been added to the Assets module to verify MinIO connection and upload capabilities.

## Endpoint

```
GET /assets/health-check/minio
```

## What It Tests

The health check performs the following tests in sequence:

1. **Connection Test** - Verifies connection to MinIO service
2. **Bucket Access** - Checks if the bucket is accessible
3. **Upload Capability** - Uploads a test file to MinIO
4. **File Operations** - Verifies file existence and metadata retrieval
5. **Cleanup** - Deletes the test file

## Response Format

### Healthy Response

```json
{
  "status": "healthy",
  "message": "MinIO is fully operational",
  "details": {
    "connection": true,
    "bucketAccess": true,
    "uploadCapability": true,
    "fileOperations": true
  },
  "timestamp": "2026-01-19T10:30:00.000Z",
  "testResults": {
    "uploadedFile": "health-check/test-1737285000000.txt",
    "fileSize": 58,
    "uploadTime": 245
  }
}
```

### Unhealthy Response

```json
{
  "status": "unhealthy",
  "message": "MinIO health check failed",
  "details": {
    "connection": true,
    "bucketAccess": true,
    "uploadCapability": false,
    "fileOperations": false
  },
  "timestamp": "2026-01-19T10:30:00.000Z",
  "error": "Upload failed: Connection timeout"
}
```

## Usage Examples

### Using cURL

```bash
# Test MinIO health
curl http://localhost:4000/assets/health-check/minio

# Pretty print with jq
curl http://localhost:4000/assets/health-check/minio | jq
```

### Using Postman

```
GET http://localhost:4000/assets/health-check/minio
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:4000/assets/health-check/minio');
const healthStatus = await response.json();

if (healthStatus.status === 'healthy') {
  console.log('✓ MinIO is operational');
  console.log(`Upload time: ${healthStatus.testResults.uploadTime}ms`);
} else {
  console.error('✗ MinIO is not healthy:', healthStatus.error);
}
```

## Response Fields

| Field                      | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| `status`                   | string  | Overall status: `"healthy"` or `"unhealthy"` |
| `message`                  | string  | Human-readable status message                |
| `details.connection`       | boolean | MinIO connection successful                  |
| `details.bucketAccess`     | boolean | Bucket is accessible                         |
| `details.uploadCapability` | boolean | File upload successful                       |
| `details.fileOperations`   | boolean | File operations (check, delete) successful   |
| `timestamp`                | string  | ISO timestamp of the check                   |
| `testResults.uploadedFile` | string  | Path of the test file (if successful)        |
| `testResults.fileSize`     | number  | Size of test file in bytes                   |
| `testResults.uploadTime`   | number  | Time taken for all tests in milliseconds     |
| `error`                    | string  | Error message (only if unhealthy)            |

## Test Details

### Test File Specifications

- **Bucket**: `bantal-assets`
- **Path**: `health-check/`
- **Filename**: `test-{timestamp}.txt`
- **Content**: `"MinIO health check test file - {ISO timestamp}"`
- **Content-Type**: `text/plain`
- **Metadata**:
  - `test: "health-check"`
  - `timestamp: "{ISO timestamp}"`

### Cleanup

The test file is automatically deleted after the health check completes, regardless of success or failure. This ensures no test files accumulate in the bucket.

## Monitoring Integration

### Health Check Script

```bash
#!/bin/bash
# check-minio-health.sh

ENDPOINT="http://localhost:4000/assets/health-check/minio"
RESPONSE=$(curl -s $ENDPOINT)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" == "healthy" ]; then
  echo "✓ MinIO is healthy"
  exit 0
else
  echo "✗ MinIO is unhealthy"
  echo $RESPONSE | jq
  exit 1
fi
```

### Kubernetes Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /assets/health-check/minio
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 60
  timeoutSeconds: 10
  failureThreshold: 3
```

### Docker Compose Health Check

```yaml
services:
  backend:
    healthcheck:
      test:
        ['CMD', 'curl', '-f', 'http://localhost:4000/assets/health-check/minio']
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 30s
```

## Troubleshooting

### Status: Unhealthy

Check the `details` object to see which specific test failed:

#### Connection Failed

```json
{
  "details": {
    "connection": false,
    "bucketAccess": false,
    "uploadCapability": false,
    "fileOperations": false
  }
}
```

**Solution:**

1. Check if MinIO is running: `docker ps | grep minio`
2. Verify environment variables: `MINIO_ENDPOINT`, `MINIO_PORT`
3. Check network connectivity between backend and MinIO

#### Bucket Access Failed

```json
{
  "details": {
    "connection": true,
    "bucketAccess": false,
    "uploadCapability": false,
    "fileOperations": false
  }
}
```

**Solution:**

1. Verify bucket exists: Check MinIO console at http://localhost:9101
2. Check bucket permissions
3. Verify MinIO credentials: `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`

#### Upload Failed

```json
{
  "details": {
    "connection": true,
    "bucketAccess": true,
    "uploadCapability": false,
    "fileOperations": false
  }
}
```

**Solution:**

1. Check MinIO storage space
2. Verify write permissions on bucket
3. Check MinIO logs: `docker logs minio`

#### File Operations Failed

```json
{
  "details": {
    "connection": true,
    "bucketAccess": true,
    "uploadCapability": true,
    "fileOperations": false
  }
}
```

**Solution:**

1. Check file read/delete permissions
2. Verify bucket policy configuration
3. Check for eventual consistency issues

## Performance Benchmarks

Typical response times (healthy system):

- **Connection Test**: ~10-50ms
- **Upload Test**: ~50-150ms
- **File Operations**: ~20-80ms
- **Total Time**: ~100-300ms

If response times are significantly higher:

1. Check network latency
2. Verify MinIO is not overloaded
3. Check disk I/O performance

## Integration with Monitoring Tools

### Prometheus Metrics

You can create a custom exporter that calls this endpoint:

```javascript
const { register, Gauge } = require('prom-client');

const minioHealth = new Gauge({
  name: 'minio_health_status',
  help: 'MinIO health status (1 = healthy, 0 = unhealthy)',
});

async function updateMetrics() {
  const response = await fetch(
    'http://localhost:4000/assets/health-check/minio',
  );
  const health = await response.json();
  minioHealth.set(health.status === 'healthy' ? 1 : 0);
}

setInterval(updateMetrics, 60000); // Update every minute
```

### Grafana Dashboard

Create alerts based on the health status:

```
Alert: MinIO Unhealthy
Condition: minio_health_status == 0
For: 5m
Severity: Critical
```

## Best Practices

1. **Regular Checks**: Run health checks every 1-5 minutes
2. **Alerting**: Set up alerts for consecutive failures (3+ failures)
3. **Logging**: Monitor logs for health check failures
4. **Timeout**: Set appropriate timeouts (10-30 seconds)
5. **Rate Limiting**: Don't run health checks too frequently (< 30 seconds)

## Security Considerations

- Health check endpoint is public (no authentication required)
- Test files are created in a dedicated `health-check/` directory
- Test files are immediately deleted after check
- No sensitive data is included in test files
- Consider rate limiting if exposed to public internet

## Related Endpoints

- `GET /assets/health-check` - Basic service health check
- `GET /health` - Application-wide health check (if available)

## Support

If you encounter persistent health check failures:

1. Check MinIO console: http://localhost:9101
2. Review backend logs: `docker logs bantal-backend`
3. Review MinIO logs: `docker logs minio`
4. Verify environment configuration
5. Test MinIO directly using MinIO client (`mc`)

---

**Implementation Date:** January 19, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

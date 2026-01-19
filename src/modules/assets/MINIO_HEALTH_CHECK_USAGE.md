# MinIO Health Check - Usage Guide

## Quick Reference

### Default Behavior (Auto-Delete)
```bash
curl http://localhost:4000/assets/health-check/minio
```
✅ Test file is automatically deleted after check

### Keep Test File for Manual Inspection
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true
```
✅ Test file is kept for manual inspection

## Endpoints

### 1. Standard Health Check (Auto-Delete)

**URL:** `GET /assets/health-check/minio`

**Description:** Runs a complete health check and automatically deletes the test file.

**Example:**
```bash
curl http://localhost:4000/assets/health-check/minio | jq
```

**Response:**
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
    "fileUrl": "http://minio:9000/bantal-assets/health-check/test-1737285000000.txt",
    "fileSize": 58,
    "uploadTime": 245
  }
}
```

**Note:** The `fileUrl` is provided, but the file is already deleted.

---

### 2. Keep Test File (Manual Inspection)

**URL:** `GET /assets/health-check/minio?keepTestFile=true`

**Description:** Runs health check but keeps the test file for manual inspection.

**Example:**
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true | jq
```

**Response:**
```json
{
  "status": "healthy",
  "message": "MinIO is fully operational (test file kept for inspection)",
  "details": {
    "connection": true,
    "bucketAccess": true,
    "uploadCapability": true,
    "fileOperations": true
  },
  "timestamp": "2026-01-19T10:30:00.000Z",
  "testResults": {
    "uploadedFile": "health-check/test-1737285000000.txt",
    "fileUrl": "http://minio:9000/bantal-assets/health-check/test-1737285000000.txt",
    "fileSize": 58,
    "uploadTime": 245
  }
}
```

**Note:** The file remains in MinIO and can be accessed via the `fileUrl`.

---

## Query Parameters

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `keepTestFile` | string | `"true"`, `"1"`, `"false"`, `"0"` | `false` | Keep test file for manual inspection |

## Use Cases

### 1. Automated Monitoring (Auto-Delete)
```bash
# Use in monitoring scripts - no cleanup needed
curl http://localhost:4000/assets/health-check/minio
```

**Best for:**
- Automated health checks
- Monitoring dashboards
- CI/CD pipelines
- Kubernetes liveness probes

---

### 2. Manual Testing (Keep File)
```bash
# Keep file to verify upload manually
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true
```

**Best for:**
- Debugging upload issues
- Verifying file permissions
- Testing MinIO console access
- Validating file content

---

### 3. Verify Upload in MinIO Console

**Step 1:** Run health check with `keepTestFile=true`
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true | jq
```

**Step 2:** Copy the `fileUrl` from response
```json
{
  "testResults": {
    "fileUrl": "http://minio:9000/bantal-assets/health-check/test-1737285000000.txt"
  }
}
```

**Step 3:** Open MinIO Console
```
http://localhost:9101
```

**Step 4:** Navigate to:
- Bucket: `bantal-assets`
- Path: `health-check/`
- File: `test-{timestamp}.txt`

**Step 5:** Download and verify file content:
```
MinIO health check test file - 2026-01-19T10:30:00.000Z
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"healthy"` or `"unhealthy"` |
| `message` | string | Status message (indicates if file was kept) |
| `details.connection` | boolean | MinIO connection successful |
| `details.bucketAccess` | boolean | Bucket is accessible |
| `details.uploadCapability` | boolean | File upload successful |
| `details.fileOperations` | boolean | File operations successful |
| `timestamp` | string | ISO timestamp of check |
| `testResults.uploadedFile` | string | Path of test file in bucket |
| `testResults.fileUrl` | string | **Full URL to access the file** |
| `testResults.fileSize` | number | Size in bytes |
| `testResults.uploadTime` | number | Time taken in milliseconds |
| `error` | string | Error message (if unhealthy) |

---

## Examples

### Example 1: Quick Health Check
```bash
curl http://localhost:4000/assets/health-check/minio
```

### Example 2: Keep File for Inspection
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true
```

### Example 3: Keep File (Alternative Syntax)
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=1
```

### Example 4: With Pretty JSON
```bash
curl -s http://localhost:4000/assets/health-check/minio?keepTestFile=true | jq
```

### Example 5: Extract File URL
```bash
curl -s http://localhost:4000/assets/health-check/minio?keepTestFile=true | jq -r '.testResults.fileUrl'
```

### Example 6: Download Test File
```bash
# Run health check and keep file
RESPONSE=$(curl -s http://localhost:4000/assets/health-check/minio?keepTestFile=true)
FILE_URL=$(echo $RESPONSE | jq -r '.testResults.fileUrl')

# Download the file
curl -o test-file.txt "$FILE_URL"

# View content
cat test-file.txt
```

---

## Cleanup

### Manual Cleanup (If Files Accumulate)

If you run many health checks with `keepTestFile=true`, you may want to clean up:

**Option 1: Via MinIO Console**
1. Go to http://localhost:9101
2. Navigate to `bantal-assets` bucket
3. Go to `health-check/` folder
4. Delete old test files

**Option 2: Via MinIO Client (mc)**
```bash
# Remove all test files older than 1 day
mc rm --recursive --force --older-than 1d local/bantal-assets/health-check/
```

**Option 3: Via API**
```bash
# Delete specific file
curl -X DELETE http://localhost:4000/minio/bantal-assets/health-check/test-1737285000000.txt
```

---

## Monitoring Integration

### Prometheus Exporter
```javascript
// Auto-delete for monitoring
async function checkMinioHealth() {
  const response = await fetch('http://localhost:4000/assets/health-check/minio');
  const health = await response.json();
  
  minioHealthGauge.set(health.status === 'healthy' ? 1 : 0);
  minioUploadTimeGauge.set(health.testResults?.uploadTime || 0);
}
```

### Debugging Script
```bash
#!/bin/bash
# Keep file for debugging

RESPONSE=$(curl -s http://localhost:4000/assets/health-check/minio?keepTestFile=true)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" == "healthy" ]; then
  echo "✓ MinIO is healthy"
  FILE_URL=$(echo $RESPONSE | jq -r '.testResults.fileUrl')
  echo "Test file available at: $FILE_URL"
else
  echo "✗ MinIO is unhealthy"
  echo $RESPONSE | jq
fi
```

---

## Best Practices

### For Automated Monitoring
✅ **DO:** Use default behavior (auto-delete)
```bash
curl http://localhost:4000/assets/health-check/minio
```

❌ **DON'T:** Use `keepTestFile=true` in automated checks (files will accumulate)

### For Manual Testing
✅ **DO:** Use `keepTestFile=true` when debugging
```bash
curl http://localhost:4000/assets/health-check/minio?keepTestFile=true
```

✅ **DO:** Clean up test files periodically

### For CI/CD Pipelines
✅ **DO:** Use auto-delete in pipeline health checks
```yaml
- name: Check MinIO Health
  run: |
    curl -f http://localhost:4000/assets/health-check/minio || exit 1
```

---

## Troubleshooting

### Issue: Too Many Test Files

**Symptom:** Many `test-*.txt` files in `health-check/` folder

**Cause:** Using `keepTestFile=true` in automated checks

**Solution:**
1. Switch to auto-delete for automated checks
2. Clean up existing files:
```bash
# Via MinIO console or
mc rm --recursive local/bantal-assets/health-check/
```

### Issue: Can't Access File URL

**Symptom:** File URL returns 404 or access denied

**Possible Causes:**
1. File was auto-deleted (didn't use `keepTestFile=true`)
2. MinIO endpoint not accessible from your location
3. File permissions issue

**Solution:**
1. Use `keepTestFile=true`
2. Check MinIO console at http://localhost:9101
3. Verify bucket policy and permissions

---

## Summary

| Scenario | Command | File Behavior |
|----------|---------|---------------|
| Automated monitoring | `GET /assets/health-check/minio` | Auto-deleted ✓ |
| Manual testing | `GET /assets/health-check/minio?keepTestFile=true` | Kept for inspection ✓ |
| Debugging | `GET /assets/health-check/minio?keepTestFile=1` | Kept for inspection ✓ |

**Default:** Files are automatically deleted (clean, no accumulation)  
**Optional:** Keep files for manual inspection when needed

---

**Last Updated:** January 19, 2026  
**Version:** 2.0.0 (Added keepTestFile parameter)

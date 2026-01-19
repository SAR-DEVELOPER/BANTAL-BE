#!/bin/bash

# MinIO Health Check Test Script
# Usage: ./test-minio-health.sh [endpoint]
# Example: ./test-minio-health.sh http://localhost:4000

ENDPOINT="${1:-http://localhost:4000}"
HEALTH_URL="${ENDPOINT}/assets/health-check/minio"

echo "=================================="
echo "MinIO Health Check Test"
echo "=================================="
echo "Endpoint: $HEALTH_URL"
echo ""

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    HAS_JQ=true
else
    HAS_JQ=false
    echo "Note: Install 'jq' for pretty JSON output"
    echo ""
fi

# Perform health check
echo "Running health check..."
echo ""

if [ "$HAS_JQ" = true ]; then
    RESPONSE=$(curl -s "$HEALTH_URL")
    STATUS=$(echo "$RESPONSE" | jq -r '.status')
    
    echo "$RESPONSE" | jq '.'
    echo ""
    
    # Check status and exit accordingly
    if [ "$STATUS" == "healthy" ]; then
        echo "✓ MinIO is HEALTHY"
        
        # Extract and display test results
        UPLOAD_TIME=$(echo "$RESPONSE" | jq -r '.testResults.uploadTime')
        FILE_SIZE=$(echo "$RESPONSE" | jq -r '.testResults.fileSize')
        
        echo ""
        echo "Performance Metrics:"
        echo "  - Upload Time: ${UPLOAD_TIME}ms"
        echo "  - Test File Size: ${FILE_SIZE} bytes"
        
        exit 0
    else
        echo "✗ MinIO is UNHEALTHY"
        
        # Display error details
        ERROR=$(echo "$RESPONSE" | jq -r '.error')
        echo ""
        echo "Error: $ERROR"
        
        # Show which tests failed
        echo ""
        echo "Test Results:"
        echo "  - Connection: $(echo "$RESPONSE" | jq -r '.details.connection')"
        echo "  - Bucket Access: $(echo "$RESPONSE" | jq -r '.details.bucketAccess')"
        echo "  - Upload Capability: $(echo "$RESPONSE" | jq -r '.details.uploadCapability')"
        echo "  - File Operations: $(echo "$RESPONSE" | jq -r '.details.fileOperations')"
        
        exit 1
    fi
else
    # Without jq, just display raw response
    curl -s "$HEALTH_URL"
    echo ""
    
    # Simple status check
    if curl -s "$HEALTH_URL" | grep -q '"status":"healthy"'; then
        echo ""
        echo "✓ MinIO is HEALTHY"
        exit 0
    else
        echo ""
        echo "✗ MinIO is UNHEALTHY"
        exit 1
    fi
fi

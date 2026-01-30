#!/bin/bash

# Simple test script for creating asset history
# Usage: ./test-create-history.sh <asset-id>

ASSET_ID=${1:-"your-asset-uuid-here"}
API_URL="http://localhost:3000/api"

echo "Testing Asset History Creation"
echo "==============================="
echo "Asset ID: $ASSET_ID"
echo ""

# Test 1: Create a simple maintenance event
echo "Test 1: Creating maintenance event..."
curl -X POST "$API_URL/assets/$ASSET_ID/history" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "maintenance",
    "date": "2024-01-20",
    "description": "Regular maintenance service",
    "payload": {
      "maintenanceType": "service",
      "description": "Oil change and filter replacement",
      "performedBy": "John Doe"
    },
    "notes": "Routine maintenance completed successfully",
    "approvedBy": "123e4567-e89b-12d3-a456-426614174000"
  }' | jq

echo ""
echo ""

# Test 2: Get all history for the asset
echo "Test 2: Getting asset history..."
curl -X GET "$API_URL/assets/$ASSET_ID/history" | jq

echo ""
echo "Done!"

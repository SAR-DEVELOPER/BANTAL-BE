# Asset History API Testing Guide

This document provides instructions for testing the Asset History API endpoints.

## Prerequisites

- Database must be running (PostgreSQL)
- Run migrations: `npm run migration:run`
- Backend server must be running: `npm run start:dev`
- You need a valid asset ID and user authentication

## Test Endpoints

### 1. Create History Event

**Endpoint:** `POST /assets/:id/history`

**Test with curl:**

```bash
# Example: Create a maintenance event
curl -X POST http://localhost:3000/api/assets/{ASSET_ID}/history \
  -H "Content-Type: application/json" \
  -d '{
    "action": "maintenance",
    "date": "2024-01-20",
    "payload": {
      "maintenanceType": "service",
      "description": "Regular maintenance service - oil change and filter replacement",
      "performedBy": "John Doe",
      "vendorName": "ABC Service Center",
      "cost": {
        "amount": 500000,
        "currency": "IDR",
        "invoiceNumber": "INV-2024-001"
      },
      "nextMaintenanceDate": "2024-04-20"
    },
    "notes": "Routine maintenance performed on schedule",
    "approvedBy": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**With file upload:**

```bash
curl -X POST http://localhost:3000/api/assets/{ASSET_ID}/history \
  -F "action=maintenance" \
  -F "date=2024-01-20" \
  -F 'payload={"maintenanceType":"service","description":"Test maintenance","performedBy":"Tech"}' \
  -F "approvedBy=123e4567-e89b-12d3-a456-426614174000" \
  -F "documents=@/path/to/file1.pdf" \
  -F "documents=@/path/to/file2.jpg"
```

### 2. Get Asset History

**Endpoint:** `GET /assets/:id/history`

**Test with curl:**

```bash
# Get all history for an asset
curl http://localhost:3000/api/assets/{ASSET_ID}/history

# With filters
curl "http://localhost:3000/api/assets/{ASSET_ID}/history?action=maintenance&page=1&limit=10"

# With date range
curl "http://localhost:3000/api/assets/{ASSET_ID}/history?startDate=2024-01-01&endDate=2024-12-31"
```

### 3. Get History Document URLs

**Endpoint:** `GET /assets/history/:historyId/documents`

**Test with curl:**

```bash
curl http://localhost:3000/api/assets/history/{HISTORY_ID}/documents
```

## Expected Responses

### Successful Create Response

```json
{
  "id": 1,
  "asset": {
    "id": "asset-uuid-here"
  },
  "action": "maintenance",
  "date": "2024-01-20T00:00:00.000Z",
  "description": null,
  "payload": {
    "maintenanceType": "service",
    "description": "Regular maintenance service",
    "performedBy": "John Doe",
    ...
  },
  "documents": ["assets/uuid/history/timestamp-file.pdf"],
  "notes": "Routine maintenance performed on schedule",
  "approvedBy": "123e4567-e89b-12d3-a456-426614174000",
  "approvedAt": "2024-01-20T10:30:00.000Z",
  "createdBy": "system",
  "updatedBy": "system",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

### Successful Get History Response

```json
{
  "data": [
    {
      "id": 1,
      "action": "maintenance",
      "date": "2024-01-20T00:00:00.000Z",
      "payload": { ... },
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

### Document URLs Response

```json
{
  "assets/uuid/history/timestamp-file.pdf": "https://presigned-url-here",
  "assets/uuid/history/timestamp-file2.jpg": "https://presigned-url-here"
}
```

## Testing Notes

1. **Database Connection**: If you get ECONNREFUSED, ensure PostgreSQL is running
2. **Migration**: Run migrations before testing: `npm run migration:run`
3. **Asset ID**: Use an existing asset ID from your database
4. **Authentication**: These endpoints may require authentication - add auth headers if needed
5. **File Paths**: Replace `/path/to/file.pdf` with actual file paths for document upload tests

## Testing Status

- [ ] Backend endpoints are ready but NOT connected to frontend
- [ ] Migration is created but may need to be run when database is available
- [ ] Test with Postman or curl when database is running
- [ ] Verify payload structure matches frontend expectations

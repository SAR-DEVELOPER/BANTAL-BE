# Quick Start - Asset History API

## 1. Run the Migration

```bash
npm run migration:run
```

## 2. Start the Server

```bash
npm run start:dev
```

## 3. Create a History Event

### Simple curl command:

```bash
curl -X POST http://localhost:3000/api/assets/{ASSET_ID}/history \
  -H "Content-Type: application/json" \
  -d '{
    "action": "maintenance",
    "date": "2024-01-20",
    "payload": {
      "maintenanceType": "service",
      "description": "Oil change and filter replacement",
      "performedBy": "John Doe"
    },
    "approvedBy": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Using the test script:

```bash
./test-create-history.sh your-asset-uuid
```

## 4. Get Asset History

```bash
curl http://localhost:3000/api/assets/{ASSET_ID}/history
```

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/:id/history` | Create history event |
| GET | `/assets/:id/history` | Get asset history |
| GET | `/assets/history/:historyId/documents` | Get document URLs |

## Payload Examples

### Maintenance Event
```json
{
  "action": "maintenance",
  "date": "2024-01-20",
  "payload": {
    "maintenanceType": "service",
    "description": "Regular service",
    "performedBy": "Technician Name",
    "vendorName": "Service Center",
    "cost": {
      "amount": 500000,
      "currency": "IDR"
    }
  },
  "notes": "Optional notes",
  "approvedBy": "uuid-here"
}
```

### With File Upload
```bash
curl -X POST http://localhost:3000/api/assets/{ASSET_ID}/history \
  -F "action=maintenance" \
  -F "date=2024-01-20" \
  -F 'payload={"maintenanceType":"service","description":"Test","performedBy":"Tech"}' \
  -F "approvedBy=uuid-here" \
  -F "documents=@file1.pdf" \
  -F "documents=@file2.jpg"
```

## That's it! 🚀

The endpoint is ready to use. No complex setup needed.

# Base Info Completion API Documentation

## Overview
The Base Info API allows you to retrieve and update the basic information completion status for a pekerjaan (project).

## Endpoints

### 1. Get Base Info Completion Status
**Endpoint:** `POST /pekerjaan/completion/base-info`  
**Description:** Retrieves the current base information and completion status for a project.

#### Request Body
```json
{
  "projectId": "uuid-string"
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending", // "pending" | "completed"
  "completionPercentage": 50,
  "data": {
    "projectName": "Website Development Project",
    "projectDescription": "Building a modern e-commerce website",
    "spkId": "SPK-2024-001" // read-only
  },
  "message": "Base info is 50% complete"
}
```

---

### 2. Update Base Info
**Endpoint:** `POST /pekerjaan/completion/base-info`  
**Description:** Updates the base information for a project (same endpoint, detected by presence of `data` field).

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "projectName": "Updated Project Name",
    "projectDescription": "Updated project description"
  }
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "updated",
  "completionPercentage": 100,
  "data": {
    "projectName": "Updated Project Name",
    "projectDescription": "Updated project description",
    "spkId": "SPK-2024-001" // read-only
  },
  "message": "Base info updated successfully"
}
```

## Field Descriptions

| Field | Type | Required | Editable | Description |
|-------|------|----------|----------|-------------|
| `projectName` | string | ✅ | ✅ | Name of the project |
| `projectDescription` | string | ✅ | ✅ | Detailed description of the project |
| `spkId` | string | ❌ | ❌ | Reference to SPK document (read-only) |

## Completion Logic
- **0%**: No required fields filled
- **50%**: 1 out of 2 required fields filled
- **100%**: All required fields (`projectName`, `projectDescription`) filled

## Error Responses

### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Pekerjaan with id {projectId} not found"
}
```

### 400 - Validation Error
```json
{
  "statusCode": 400,
  "message": "Project name cannot be empty"
}
```

## Usage Examples

### Complete Flow Example
```javascript
// 1. Get current status
const status = await fetch('/pekerjaan/completion/base-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ projectId: "uuid-here" })
});

// 2. Update base info
const update = await fetch('/pekerjaan/completion/base-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      projectName: "My Project",
      projectDescription: "Project description here"
    }
  })
});
```

### Partial Update
```javascript
// Update only project description
await fetch('/pekerjaan/completion/base-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      projectDescription: "Updated description only"
    }
  })
});
```

## Notes
- The `spkId` field is automatically set when the project is created from an SPK document and cannot be modified
- Empty strings are considered as incomplete fields
- Partial updates are supported - you don't need to send all fields
- Operation type (get vs update) is determined by presence of `data` field in request body 
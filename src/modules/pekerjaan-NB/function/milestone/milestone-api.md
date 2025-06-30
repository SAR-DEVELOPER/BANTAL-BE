# Milestone Management API Documentation

## Overview
The Milestone Management API provides comprehensive CRUD operations for managing project milestones. This API allows you to create, read, update, and delete milestones for projects, while automatically calculating project completion percentages and status.

## Base URL
All milestone endpoints are prefixed with `/pekerjaan/milestone`

## Database Schema
- **Table**: `project_milestone`
- **Relationship**: Many-to-One with `pekerjaan` table
- **Foreign Key**: `pekerjaan_id`

## Data Types

### Milestone Status
- `pending` - Milestone not started
- `in_progress` - Milestone currently being worked on
- `completed` - Milestone finished
- `cancelled` - Milestone cancelled

### Milestone Priority
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `critical` - Critical priority

## API Endpoints

### 1. Get Project Milestones
**Endpoint:** `POST /pekerjaan/milestone`  
**Description:** Retrieves all milestones for a project with completion statistics.

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "completionPercentage": 67,
  "data": [
    {
      "id": "milestone-uuid-1",
      "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
      "milestoneName": "Project Kickoff",
      "milestoneDescription": "Initial project setup and planning",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "status": "completed",
      "completionPercentage": 100,
      "priority": "high",
      "orderIndex": 1,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    },
    {
      "id": "milestone-uuid-2",
      "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
      "milestoneName": "Design Phase",
      "milestoneDescription": "Complete UI/UX design and prototyping",
      "dueDate": "2024-03-01T00:00:00.000Z",
      "status": "in_progress",
      "completionPercentage": 60,
      "priority": "medium",
      "orderIndex": 2,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-02-20T09:15:00.000Z"
    }
  ],
  "message": "Project has 2 milestone(s), 67% completed"
}
```

---

### 2. Create New Milestone
**Endpoint:** `POST /pekerjaan/milestone`  
**Description:** Creates a new milestone for the specified project.

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "milestoneName": "Testing Phase",
    "milestoneDescription": "Complete system testing and bug fixes",
    "dueDate": "2024-05-01",
    "status": "pending",
    "completionPercentage": 0,
    "priority": "high",
    "orderIndex": 3
  }
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "completionPercentage": 45,
  "data": {
    "id": "milestone-uuid-3",
    "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
    "milestoneName": "Testing Phase",
    "milestoneDescription": "Complete system testing and bug fixes",
    "dueDate": "2024-05-01T00:00:00.000Z",
    "status": "pending",
    "completionPercentage": 0,
    "priority": "high",
    "orderIndex": 3,
    "createdAt": "2024-02-25T11:00:00.000Z",
    "updatedAt": "2024-02-25T11:00:00.000Z"
  },
  "message": "Milestone created successfully"
}
```

---

### 3. Update Existing Milestone
**Endpoint:** `POST /pekerjaan/milestone`  
**Description:** Updates an existing milestone (detected by presence of `id` in data object).

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "id": "milestone-uuid-2",
    "status": "completed",
    "completionPercentage": 100,
    "milestoneDescription": "Design phase completed with final approval"
  }
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "completionPercentage": 75,
  "data": {
    "id": "milestone-uuid-2",
    "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
    "milestoneName": "Design Phase",
    "milestoneDescription": "Design phase completed with final approval",
    "dueDate": "2024-03-01T00:00:00.000Z",
    "status": "completed",
    "completionPercentage": 100,
    "priority": "medium",
    "orderIndex": 2,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-02-25T15:30:00.000Z"
  },
  "message": "Milestone updated successfully"
}
```

---

### 4. Delete Milestone
**Endpoint:** `POST /pekerjaan/milestone/delete`  
**Description:** Deletes a milestone and recalculates project completion.

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "milestoneId": "milestone-uuid-3"
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "completionPercentage": 100,
  "message": "Milestone deleted successfully"
}
```

---

### 5. Get Specific Milestone
**Endpoint:** `GET /pekerjaan/milestone/:id`  
**Description:** Retrieves a single milestone by its ID.

#### Response
```json
{
  "id": "milestone-uuid-1",
  "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
  "milestoneName": "Project Kickoff",
  "milestoneDescription": "Initial project setup and planning",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "status": "completed",
  "completionPercentage": 100,
  "priority": "high",
  "orderIndex": 1,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

---

### 6. Get Project Milestones (Alternative)
**Endpoint:** `GET /pekerjaan/milestone/project/:projectId`  
**Description:** Alternative endpoint to get all milestones for a project.

#### Response
Same as endpoint #1 (Get Project Milestones)

---

### 7. Health Check
**Endpoint:** `GET /pekerjaan/milestone/health`  
**Description:** Health check endpoint for the milestone service.

#### Response
```json
{
  "status": "ok",
  "service": "milestone"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ❌ | Milestone unique identifier (auto-generated) |
| `pekerjaanId` | string (UUID) | ✅ | Foreign key to pekerjaan table |
| `milestoneName` | string | ✅ | Name/title of the milestone |
| `milestoneDescription` | string \| null | ❌ | Detailed description of the milestone |
| `dueDate` | Date \| null | ❌ | Target completion date (ISO 8601 format) |
| `status` | enum | ❌ | Current status (default: 'pending') |
| `completionPercentage` | number | ❌ | Progress percentage 0-100 (default: 0) |
| `priority` | enum | ❌ | Milestone priority (default: 'medium') |
| `orderIndex` | number | ❌ | Display order sequence (default: 0) |
| `createdAt` | Date | ❌ | Creation timestamp (auto-generated) |
| `updatedAt` | Date | ❌ | Last update timestamp (auto-updated) |

## Business Logic

### Project Completion Calculation
The overall project completion percentage is calculated as the average of all milestone completion percentages:
```
completionPercentage = (sum of all milestone completion percentages) / (number of milestones)
```

### Project Status Determination
- **`pending`**: No milestones exist or all milestones are pending
- **`in_progress`**: At least one milestone is in progress or completed (but not all completed)
- **`completed`**: All milestones are completed (100% completion)

### Milestone Ordering
Milestones are ordered by:
1. `orderIndex` (ascending)
2. `createdAt` (ascending) - as a fallback

## Error Handling

### Common Error Responses

#### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Project with id 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

#### 404 - Milestone Not Found
```json
{
  "statusCode": 404,
  "message": "Milestone with id milestone-uuid-1 not found in project 550e8400-e29b-41d4-a716-446655440000",
  "error": "Not Found"
}
```

#### 400 - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "projectId must be a UUID",
    "milestoneName should not be empty"
  ],
  "error": "Bad Request"
}
```

## Usage Examples

### Creating a Complete Project Milestone Flow

1. **Create initial milestones:**
```bash
curl -X POST http://localhost:3000/pekerjaan/milestone \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "milestoneName": "Requirements Analysis",
      "milestoneDescription": "Gather and analyze project requirements",
      "dueDate": "2024-03-15",
      "priority": "high",
      "orderIndex": 1
    }
  }'
```

2. **Update milestone progress:**
```bash
curl -X POST http://localhost:3000/pekerjaan/milestone \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "id": "milestone-uuid-1",
      "status": "in_progress",
      "completionPercentage": 50
    }
  }'
```

3. **Check project status:**
```bash
curl -X POST http://localhost:3000/pekerjaan/milestone \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## Best Practices

1. **Use meaningful milestone names** that clearly describe the deliverable
2. **Set realistic due dates** to maintain project timeline accuracy
3. **Update completion percentages regularly** for accurate project tracking
4. **Use orderIndex** to maintain logical milestone sequence
5. **Set appropriate priorities** to help with resource allocation
6. **Include detailed descriptions** for complex milestones

## Integration Notes

- The milestone system is integrated with the main `pekerjaan` module
- Milestone data is stored in the `project_milestone` table
- Project completion statistics are calculated in real-time
- All timestamps are in UTC format
- UUIDs are used for all entity identifiers 
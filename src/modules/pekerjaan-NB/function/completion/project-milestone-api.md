# Project Milestone Completion API Documentation

## Overview
The Project Milestone API allows you to manage project milestones and track completion status. This API uses a separate table approach for better data integrity and relationship management.

## Database Structure
- **Table**: `project_milestone`
- **Relationship**: Many-to-One with `pekerjaan` table
- **Foreign Key**: `pekerjaan_id`

## Endpoints

### 1. Get Project Milestones & Completion Status
**Endpoint:** `POST /pekerjaan/completion/project-milestone`  
**Description:** Retrieves all milestones for a project and calculates overall completion status.

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
  "completionPercentage": 67,
  "data": [
    {
      "id": "milestone-uuid-1",
      "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
      "milestoneName": "Project Kickoff",
      "milestoneDescription": "Initial project setup and planning",
      "dueDate": "2024-02-15",
      "status": "completed",
      "completionPercentage": 100,
      "priority": "high",
      "orderIndex": 1,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    },
    {
      "id": "milestone-uuid-2",
      "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
      "milestoneName": "Design Phase",
      "milestoneDescription": "Complete UI/UX design and prototyping",
      "dueDate": "2024-03-01",
      "status": "in_progress",
      "completionPercentage": 60,
      "priority": "medium",
      "orderIndex": 2,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-02-20T09:15:00Z"
    },
    {
      "id": "milestone-uuid-3",
      "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
      "milestoneName": "Development Phase",
      "milestoneDescription": null,
      "dueDate": "2024-04-15",
      "status": "pending",
      "completionPercentage": 0,
      "priority": "critical",
      "orderIndex": 3,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "message": "Project has 3 milestone(s), 67% completed"
}
```

---

### 2. Create New Milestone
**Endpoint:** `POST /pekerjaan/completion/project-milestone`  
**Description:** Creates a new milestone for the project.

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
    "orderIndex": 4
  }
}
```

#### Response
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "updated",
  "completionPercentage": 50,
  "data": {
    "id": "milestone-uuid-4",
    "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
    "milestoneName": "Testing Phase",
    "milestoneDescription": "Complete system testing and bug fixes",
    "dueDate": "2024-05-01",
    "status": "pending",
    "completionPercentage": 0,
    "priority": "high",
    "orderIndex": 4,
    "createdAt": "2024-02-25T11:00:00Z",
    "updatedAt": "2024-02-25T11:00:00Z"
  },
  "message": "Milestone created successfully"
}
```

---

### 3. Update Existing Milestone
**Endpoint:** `POST /pekerjaan/completion/project-milestone`  
**Description:** Updates an existing milestone (detected by presence of `id` in data).

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
  "status": "updated",
  "completionPercentage": 75,
  "data": {
    "id": "milestone-uuid-2",
    "pekerjaanId": "550e8400-e29b-41d4-a716-446655440000",
    "milestoneName": "Design Phase",
    "milestoneDescription": "Design phase completed with final approval",
    "dueDate": "2024-03-01",
    "status": "completed",
    "completionPercentage": 100,
    "priority": "medium",
    "orderIndex": 2,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-02-25T15:30:00Z"
  },
  "message": "Milestone updated successfully"
}
```

---

### 4. Delete Milestone
**Endpoint:** `POST /pekerjaan/completion/project-milestone/delete`  
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
  "status": "deleted",
  "completionPercentage": 100,
  "message": "Milestone deleted successfully"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ❌ | Milestone unique identifier (auto-generated) |
| `pekerjaanId` | string (UUID) | ✅ | Foreign key to pekerjaan table |
| `milestoneName` | string | ✅ | Name/title of the milestone |
| `milestoneDescription` | string \| null | ❌ | Detailed description of the milestone |
| `dueDate` | Date \| null | ❌ | Target completion date |
| `status` | enum | ❌ | Current status (default: 'pending') |
| `completionPercentage` | number | ❌ | Progress percentage 0-100 (default: 0) |
| `priority` | enum | ❌ | Milestone priority (default: 'medium') |
| `orderIndex` | number | ❌ | Display order sequence (default: 0) |
| `createdAt` | Date | ❌ | Creation timestamp (auto-generated) |
| `updatedAt` | Date | ❌ | Last update timestamp (auto-updated) |

## Enum Values

### Status Options
- `pending` - Not started yet
- `in_progress` - Currently being worked on  
- `completed` - Finished successfully
- `cancelled` - Cancelled/abandoned

### Priority Options
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `critical` - Critical/urgent priority

## Completion Logic
- **0%**: No milestones exist OR all milestones are pending/cancelled
- **X%**: Percentage based on completed milestones vs total milestones
- **100%**: All milestones marked as completed

**Formula**: `(completed_milestones / total_milestones) * 100`

## Validation Rules

### Milestone Name
- Required field
- Cannot be empty or whitespace only
- Automatically trimmed

### Milestone Description  
- Optional field
- Automatically trimmed
- Can be null or empty string

### Due Date
- Optional field
- Must be valid date format
- Can be null

### Completion Percentage
- Must be between 0 and 100
- Automatically clamped to valid range

### Order Index
- Used for sorting milestones
- Lower numbers appear first
- Default sorting: orderIndex ASC, createdAt ASC

## Error Responses

### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Pekerjaan with id {projectId} not found"
}
```

### 404 - Milestone Not Found
```json
{
  "statusCode": 404,
  "message": "Milestone with id {milestoneId} not found for this project"
}
```

### 400 - Validation Errors
```json
{
  "statusCode": 400,
  "message": "Milestone name is required"
}
```

## Usage Examples

### Complete CRUD Flow
```javascript
// 1. Get current milestones
const milestones = await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: "uuid-here" })
});

// 2. Create new milestone
const newMilestone = await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      milestoneName: "Testing Phase",
      milestoneDescription: "Complete system testing",
      dueDate: "2024-05-01",
      priority: "high",
      orderIndex: 3
    }
  })
});

// 3. Update milestone status
const updateMilestone = await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      id: "milestone-uuid",
      status: "completed",
      completionPercentage: 100
    }
  })
});

// 4. Delete milestone
const deleteMilestone = await fetch('/pekerjaan/completion/project-milestone/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    milestoneId: "milestone-uuid"
  })
});
```

### Common Operations

#### Mark Milestone as Completed
```javascript
await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      id: "milestone-uuid",
      status: "completed",
      completionPercentage: 100
    }
  })
});
```

#### Update Milestone Progress
```javascript
await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      id: "milestone-uuid",
      status: "in_progress",
      completionPercentage: 60
    }
  })
});
```

#### Reorder Milestones
```javascript
// Update multiple milestones with new order indexes
await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      id: "milestone-uuid-1",
      orderIndex: 1
    }
  })
});

await fetch('/pekerjaan/completion/project-milestone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      id: "milestone-uuid-2", 
      orderIndex: 2
    }
  })
});
```

#### Create Milestone Template
```javascript
const milestoneTemplates = [
  {
    milestoneName: "Project Kickoff",
    priority: "critical",
    orderIndex: 1
  },
  {
    milestoneName: "Requirements Analysis", 
    priority: "high",
    orderIndex: 2
  },
  {
    milestoneName: "Design Phase",
    priority: "medium",
    orderIndex: 3
  },
  {
    milestoneName: "Development Phase",
    priority: "high", 
    orderIndex: 4
  },
  {
    milestoneName: "Testing Phase",
    priority: "medium",
    orderIndex: 5
  },
  {
    milestoneName: "Deployment",
    priority: "critical",
    orderIndex: 6
  }
];

// Create all template milestones
for (const template of milestoneTemplates) {
  await fetch('/pekerjaan/completion/project-milestone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: "uuid-here",
      data: template
    })
  });
}
```

## Benefits of Separate Table Approach

### ✅ **Data Integrity**
- Foreign key constraints maintain relationships
- Individual milestone tracking and history
- Proper data normalization

### ✅ **Scalability** 
- Easy to add milestone features (dependencies, assignments, etc.)
- Cross-project milestone analytics
- Template management capabilities

### ✅ **Performance**
- Indexed queries for fast milestone retrieval
- Efficient sorting and filtering
- Optimized completion calculations

### ✅ **Flexibility**
- Rich milestone properties (priority, order, dates)
- Individual milestone status tracking
- Easy milestone reordering and management

## Notes
- **Operation Detection**: Create vs Update determined by presence of `id` field
- **Automatic Timestamps**: `createdAt` and `updatedAt` managed automatically
- **Completion Recalculation**: Project completion percentage recalculated after every milestone change
- **Soft Validation**: Non-critical fields can be null/empty
- **Order Management**: Use `orderIndex` for custom milestone ordering
- **Batch Operations**: Consider implementing batch updates for multiple milestone changes 
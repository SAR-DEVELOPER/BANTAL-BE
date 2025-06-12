# Team Structure Completion API Documentation

## Overview
The Team Structure API allows you to retrieve and update the team member structure completion status for a pekerjaan (project). It manages project leads and team members organized by positions.

## Endpoints

### 1. Get Team Structure Completion Status
**Endpoint:** `POST /pekerjaan/completion/team-structure`  
**Description:** Retrieves the current team structure and completion status for a project.

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
    "project_lead": "user123",
    "frontend_developer": ["user456", "user789"],
    "backend_developer": ["user111"],
    "designer": ["user222", "user333"]
  },
  "message": "Team structure is 50% complete"
}
```

---

### 2. Update Team Structure
**Endpoint:** `POST /pekerjaan/completion/team-structure`  
**Description:** Updates the team structure for a project (same endpoint, detected by presence of `data` field).

#### Request Body
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "project_lead": "user123",
    "frontend_developer": ["user456", "user789"],
    "backend_developer": ["user111"],
    "designer": ["user222", "user333"],
    "qa_tester": ["user444"]
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
    "project_lead": "user123",
    "frontend_developer": ["user456", "user789"],
    "backend_developer": ["user111"],
    "designer": ["user222", "user333"],
    "qa_tester": ["user444"]
  },
  "message": "Team structure updated successfully"
}
```

## Team Structure Format

### Expected JSON Structure
```json
{
  "project_lead": "userID",
  "[position_name]": ["userID1", "userID2", "userID3"],
  "[position_name]": ["userID4", "userID5"]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project_lead` | string | ✅ | User ID of the project leader |
| `[position_name]` | string[] | ❌ | Array of user IDs for each position/role |

### Position Examples
- `frontend_developer`
- `backend_developer`
- `designer`
- `qa_tester`
- `devops_engineer`
- `business_analyst`
- (any custom position name)

## Completion Logic
- **0%**: No project lead AND no team members
- **50%**: Project lead exists OR at least one position with team members
- **100%**: Project lead exists AND at least one position with team members

## Validation Rules

### Project Lead
- Must be a non-empty string
- Cannot be null or undefined when updating

### Positions
- Position names can be any string (except `project_lead`)
- Each position must be an array of user IDs
- User IDs cannot be empty strings
- Empty arrays are allowed (removes all members from that position)

## Error Responses

### 404 - Project Not Found
```json
{
  "statusCode": 404,
  "message": "Pekerjaan with id {projectId} not found"
}
```

### 400 - Validation Errors
```json
{
  "statusCode": 400,
  "message": "Project lead cannot be empty"
}
```

```json
{
  "statusCode": 400,
  "message": "Position 'frontend_developer' must be an array of user IDs"
}
```

```json
{
  "statusCode": 400,
  "message": "Position 'designer' contains empty user IDs"
}
```

## Usage Examples

### Complete Flow Example
```javascript
// 1. Get current team structure
const teamStatus = await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ projectId: "uuid-here" })
});

// 2. Update team structure
const teamUpdate = await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      project_lead: "user123",
      frontend_developer: ["user456", "user789"],
      backend_developer: ["user111"],
      designer: ["user222"]
    }
  })
});
```

### Partial Updates

#### Add Project Lead Only
```javascript
await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      project_lead: "user123"
    }
  })
});
```

#### Add New Position
```javascript
await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      qa_tester: ["user555", "user666"]
    }
  })
});
```

#### Update Specific Position
```javascript
await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      frontend_developer: ["user456", "user789", "user999"] // replaces existing
    }
  })
});
```

#### Remove All Members from Position
```javascript
await fetch('/pekerjaan/completion/team-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: "uuid-here",
    data: {
      designer: [] // removes all designers
    }
  })
});
```

## Team Structure Scenarios

### Minimal Complete Team
```json
{
  "project_lead": "user123",
  "developer": ["user456"]
}
```
**Result:** 100% complete

### Project Lead Only
```json
{
  "project_lead": "user123"
}
```
**Result:** 50% complete

### Team Members Only (No Lead)
```json
{
  "frontend_developer": ["user456", "user789"],
  "backend_developer": ["user111"]
}
```
**Result:** 50% complete

### Empty Structure
```json
{}
```
**Result:** 0% complete

## Notes
- **Flexible position names**: You can use any position/role names
- **Partial updates**: Updates merge with existing structure (doesn't replace entire object)
- **User ID validation**: System validates that user IDs are not empty
- **Position arrays**: Each position must be an array, even for single members
- **Project lead is special**: It's a single string value, not an array
- **Case sensitive**: Position names are case-sensitive
- **Operation detection**: Get vs Update determined by presence of `data` field 
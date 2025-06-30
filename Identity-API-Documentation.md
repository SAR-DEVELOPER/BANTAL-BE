# Identity API Documentation

This document provides comprehensive documentation for all Identity module endpoints.

## Base URL
All endpoints are prefixed with `/identities`

## Endpoints

### 1. Get All Identities

**GET** `/identities`

Retrieves all identities in the system.

#### Response
- **200 OK**: Array of Identity objects
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "department": "Engineering",
    "role": "developer",
    "status": "active",
    "isActive": true,
    "keycloakId": "keycloak-user-id"
  }
]
```

---

### 2. Search Users

**GET** `/identities/search`

Search for users using various criteria.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | No | Search by email (partial match, case-insensitive) |
| `department` | string | No | Search by department (partial match, case-insensitive) |
| `role` | string | No | Search by exact role match |
| `status` | string | No | Search by exact status match |

#### Example Requests
```
GET /identities/search?email=john
GET /identities/search?department=engineering
GET /identities/search?role=developer&status=active
GET /identities/search?email=john&department=eng&role=developer
```

#### Response
- **200 OK**: Array of matching Identity objects

---

### 3. Get Identity by Email

**GET** `/identities/email/:email`

Retrieves a specific identity by email address.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |

#### Example Request
```
GET /identities/email/john.doe@example.com
```

#### Response
- **200 OK**: Identity object or null if not found
```json
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "role": "developer",
  "status": "active",
  "isActive": true,
  "keycloakId": "keycloak-user-id"
}
```

---

### 4. Get Identity by Keycloak ID

**GET** `/identities/keycloak/:keycloakId`

Retrieves a specific identity by Keycloak user ID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keycloakId` | string | Yes | Keycloak user identifier |

#### Example Request
```
GET /identities/keycloak/keycloak-user-123
```

#### Response
- **200 OK**: Identity object or null if not found

---

### 5. Get Identity by ID

**GET** `/identities/:id`

Retrieves a specific identity by its UUID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Identity UUID |

#### Example Request
```
GET /identities/550e8400-e29b-41d4-a716-446655440000
```

#### Response
- **200 OK**: Identity object
- **404 Not Found**: If identity with the specified ID doesn't exist

#### Error Response
```json
{
  "statusCode": 404,
  "message": "Identity with ID \"550e8400-e29b-41d4-a716-446655440000\" not found"
}
```

---

### 6. Import Microsoft Users

**POST** `/identities/import-microsoft-users`

Imports Microsoft users into the identity table.

#### Request Body
No request body required.

#### Example Request
```
POST /identities/import-microsoft-users
```

#### Response
- **200 OK**: Import result (format depends on service implementation)

---

### 7. Update User Status

**PATCH** `/identities/:id/status`

Updates the status and active state of a user.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Identity UUID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | boolean | Yes | Whether the user is active |
| `status` | string | Yes | User status: "active", "inactive", or "pending" |

#### Example Request
```
PATCH /identities/550e8400-e29b-41d4-a716-446655440000/status
Content-Type: application/json

{
  "isActive": false,
  "status": "inactive"
}
```

#### Response
- **200 OK**: Updated Identity object
- **404 Not Found**: If identity with the specified ID doesn't exist

---

### 8. Manually Sync Keycloak ID

**PATCH** `/identities/:id/sync-keycloak`

Manually updates the Keycloak ID for a user (primarily for troubleshooting purposes).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Identity UUID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keycloakId` | string | Yes | New Keycloak user ID |

#### Example Request
```
PATCH /identities/550e8400-e29b-41d4-a716-446655440000/sync-keycloak
Content-Type: application/json

{
  "keycloakId": "new-keycloak-user-id-123"
}
```

#### Response
- **200 OK**: Updated Identity object with new Keycloak ID
- **404 Not Found**: If identity with the specified ID doesn't exist

#### Notes
- This operation logs the change: `Manually synced Keycloak ID for user {email}: {oldId} -> {newId}`

---

## Common Data Types

### Identity Object
```typescript
{
  id: string;           // UUID
  email: string;        // User email address
  department: string;   // User department
  role: string;         // User role
  status: string;       // User status: "active" | "inactive" | "pending"
  isActive: boolean;    // Whether user is active
  keycloakId: string;   // Keycloak user identifier
  // ... other fields may be present
}
```

## Error Handling

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error responses follow the standard NestJS format:
```json
{
  "statusCode": 404,
  "message": "Error description",
  "error": "Not Found"
}
``` 
# Enhanced Login Flow with Entra ID User Validation

## Overview

This enhanced authentication system ensures that only pre-authorized users from your Microsoft Entra ID (formerly Azure AD) can access the application. Users must exist in the internal identity database before they can successfully authenticate.

## How It Works

### 1. **User Pre-Population**
- Admin imports Microsoft users into the internal identity database using: `POST /identities/import-microsoft-users`
- Only users in this database can authenticate

### 2. **Enhanced Login Flow**
1. User initiates login → Redirected to Keycloak (configured with Entra ID)
2. User authenticates with Entra ID credentials via Keycloak
3. Keycloak redirects back with authorization code
4. **NEW**: Backend validates user against internal identity database
5. **NEW**: Keycloak ID is synced with internal identity record
6. Only authorized users receive session cookies

### 3. **Enhanced JWT Guard**
- Validates JWT token signature
- **NEW**: Checks user exists in internal identity database
- **NEW**: Verifies user is active and authorized
- **NEW**: Provides both JWT data and internal identity data

## Key Files Modified/Added

### New Files
- `src/modules/auth/guards/enhanced-jwt-auth.guard.ts` - Enhanced JWT validation
- `ENHANCED_LOGIN_FLOW.md` - This documentation

### Modified Files
- `src/modules/identity/identity.service.ts` - Added user validation methods
- `src/modules/auth/auth.service.ts` - Added user validation during token exchange
- `src/modules/auth/auth.controller.ts` - Added enhanced endpoints
- `src/modules/identity/identity.controller.ts` - Added user management endpoints
- `src/main.ts` - Extended Request interface

## API Endpoints

### Authentication Endpoints
- `GET /auth/profile` - User profile (enhanced guard)
- `GET /auth/profile-legacy` - User profile (legacy guard, for comparison)
- `GET /auth/user-info` - Enhanced user information with database sync
- `POST /auth/refresh` - Token refresh with user validation

### Identity Management Endpoints
- `GET /identities` - List all users
- `GET /identities/search` - Search users by criteria
- `GET /identities/email/:email` - Find user by email
- `GET /identities/keycloak/:keycloakId` - Find user by Keycloak ID
- `POST /identities/import-microsoft-users` - Import users from Microsoft Graph
- `PATCH /identities/:id/status` - Update user status

## User States in Identity Database

### Fields
- `email` - Must match Entra ID email (unique)
- `keycloakId` - Synced automatically on first login (nullable)
- `externalId` - Microsoft Entra ID object ID
- `isActive` - Boolean flag for user status
- `status` - 'active' | 'inactive' | 'pending'
- `role` - User role in the system

### Scenarios

#### First Time Login
1. User exists in identity database (imported from Microsoft)
2. `keycloakId` is null
3. User authenticates successfully
4. `keycloakId` is populated with value from JWT `sub` claim

#### Subsequent Logins
1. User exists with populated `keycloakId`
2. System verifies JWT `sub` matches stored `keycloakId`
3. If mismatch, updates `keycloakId` (logs warning)

#### Unauthorized Access
1. User authenticates with Keycloak successfully
2. User email not found in identity database
3. Access denied with `403 Forbidden`

#### Inactive User
1. User exists in database but `isActive: false` or `status: 'inactive'`
2. Access denied with `403 Forbidden`

## Usage Examples

### Import Users from Microsoft
```bash
POST /identities/import-microsoft-users
Authorization: Bearer <token>
```

### Check User Authorization
```bash
GET /auth/profile
Cookie: auth_session=<jwt_token>

Response:
{
  "jwt": {
    "email": "user@company.com",
    "name": "John Doe",
    "keycloakId": "abc-123-def"
  },
  "identity": {
    "id": "uuid",
    "email": "user@company.com", 
    "department": "Engineering",
    "role": "USER",
    "isActive": true,
    "status": "active"
  }
}
```

### Search Users
```bash
GET /identities/search?department=Engineering&status=active
Authorization: Bearer <token>
```

### Deactivate User
```bash
PATCH /identities/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false,
  "status": "inactive"
}
```

## Security Benefits

1. **Pre-authorization Required** - Users must be explicitly added to identity database
2. **Automatic Sync** - Keycloak IDs are automatically managed
3. **Status Control** - Users can be activated/deactivated without touching Keycloak
4. **Audit Trail** - Login timestamps and user activities are tracked
5. **Role-based Access** - Internal roles can differ from Entra ID roles

## Migration Guide

### For New Protected Endpoints
```typescript
import { UseGuards } from '@nestjs/common';
import { EnhancedJwtAuthGuard } from '../auth/guards/enhanced-jwt-auth.guard';

@Get('protected-endpoint')
@UseGuards(EnhancedJwtAuthGuard)
async protectedMethod(@Req() req: Request) {
  // Access JWT data
  console.log(req.user.email);
  
  // Access internal identity data
  console.log(req.identity.department);
  console.log(req.identity.role);
}
```

### For Existing Endpoints
- Replace `JwtAuthGuard` with `EnhancedJwtAuthGuard`
- Update logic to use `req.identity` for internal user data
- Add user validation as needed

## Environment Variables

Ensure these are set for Microsoft Graph integration:
```
MS_CLIENT_ID=your_microsoft_app_client_id
MS_CLIENT_SECRET=your_microsoft_app_client_secret  
MS_TENANT_ID=your_microsoft_tenant_id
```

## Testing the Flow

1. **Import Users**: Call the import endpoint to populate identity database
2. **Login**: User authenticates via Keycloak/Entra ID
3. **Verify**: Check `/auth/profile` to see both JWT and identity data
4. **Test Unauthorized**: Try with user not in identity database
5. **Test Inactive**: Deactivate a user and try to access protected endpoint 
# Backend Architectural & Security Issues Analysis

## Executive Summary

Critical security and architectural issues have been identified in the BANTAL-BE backend system. This document categorizes issues by severity and provides detailed analysis.

---

## 🔴 **CRITICAL SECURITY ISSUES**

### 1. Hardcoded Credentials in Source Code

**Severity:** CRITICAL
**Impact:** Complete system compromise

**Details:**
- Password `JalanCipunagara25!` is hardcoded in multiple files:
  - `/src/config/database.config.ts` - Database connection
  - `/docker-compose.yaml` - All database services
  - `/src/config/env.config.ts` - Environment configuration
  - `/init-scripts/*.sql` - Database initialization scripts
  - `/debug-surat-penawaran.js` - Debug scripts

**Current Exposure:**
```typescript
// database.config.ts
password: process.env.DB_PASSWORD || 'JalanCipunagara25!',
```

**Risk:**
- Credentials are committed to git repository
- Anyone with repository access has full database credentials
- Same password used across multiple services (PostgreSQL, Keycloak, PgAdmin, Mongo Express)

---

### 2. Publicly Exposed Database Admin Interfaces

**Severity:** CRITICAL
**Impact:** Direct database access to unauthorized users

**Exposed Services (from docker-compose.yaml):**

| Service | Port | Description | Authentication |
|---------|------|-------------|----------------|
| **PgAdmin** | `0.0.0.0:5050` | PostgreSQL admin UI | Weak password (hardcoded) |
| **Mongo Express** | `0.0.0.0:8081` | MongoDB admin UI | Basic auth (hardcoded) |
| **Kong Admin API** | `0.0.0.0:8001` | Kong API Gateway admin | None (unrestricted) |
| **Kong Manager GUI** | `0.0.0.0:8002` | Kong admin dashboard | Basic auth only via Caddy proxy |

**Current Configuration:**
```yaml
pgadmin:
  ports:
    - "5050:80"  # ❌ Publicly accessible
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: JalanCipunagara25!  # ❌ Hardcoded

mongo-express:
  ports:
    - "8081:8081"  # ❌ Publicly accessible
  environment:
    ME_CONFIG_BASICAUTH_USERNAME: admin
    ME_CONFIG_BASICAUTH_PASSWORD: JalanCipunagara25!  # ❌ Hardcoded

kong:
  ports:
    - "8001:8001"  # ❌ Admin API publicly accessible
    - "8002:8002"  # ❌ Admin GUI publicly accessible
```

**Risk:**
- Direct database manipulation possible
- Data exfiltration
- Service configuration tampering
- No audit trail

---

### 3. Publicly Exposed Database Ports

**Severity:** CRITICAL
**Impact:** Direct database access bypass application layer

**Exposed Databases:**

| Database | Internal Port | External Port | Service |
|----------|---------------|---------------|---------|
| PostgreSQL (App) | 5432 | **5434** | Main application database |
| PostgreSQL (Keycloak) | 5432 | **5433** | Authentication database |
| MongoDB | 27017 | **27017** | Document storage |

**Current Configuration:**
```yaml
postgres:
  ports:
    - "5434:5432"  # ❌ Direct PostgreSQL access

keycloak-postgres:
  ports:
    - "5433:5432"  # ❌ Direct Keycloak DB access

mongo:
  ports:
    - "27017:27017"  # ❌ Direct MongoDB access, NO AUTHENTICATION
```

**Risk:**
- Bypass all application-level security
- Direct data manipulation
- No authentication on MongoDB (default configuration)
- SQL injection not required - direct database access

---

### 4. Unauthenticated Debug/Dev Endpoints

**Severity:** HIGH
**Impact:** Information disclosure, potential system manipulation

**Exposed Endpoints:**

1. **`GET /dev/mongo_health`**
   - Creates test documents in MongoDB
   - No authentication guard
   - Available in all environments

2. **`GET /dev/microsoft_users`**
   - Fetches Microsoft Graph API user list
   - Exposes organization user data
   - No authentication guard

3. **`GET /debug/document/types`**
   - Lists all document types in system
   - No authentication guard

4. **`GET /debug/document/factory/:type`**
   - Tests factory service internals
   - No authentication guard

5. **`GET /debug/document/log-test`**
   - Triggers log messages
   - No authentication guard

**Evidence:**
```typescript
// dev.controller.ts - NO @UseGuards decorator
@Controller('dev')
export class DevController {
  @Get('mongo_health')
  async testMongoConnection() { ... }

  @Get('microsoft_users')
  async getMicrosoftUsers() { ... }
}

// debug.controller.ts - NO @UseGuards decorator
@Controller('debug/document')
export class DebugController {
  @Get('types')
  async getAllDocumentTypes() { ... }
}
```

**Risk:**
- Information disclosure about system internals
- Potential for creating junk data
- Exposure of Microsoft organizational user list
- No environment-based conditional loading

---

## 🟠 **HIGH SEVERITY ISSUES**

### 5. DevModule Loaded in Production

**Severity:** HIGH
**Impact:** Debug endpoints available in production

**Details:**
- `DevModule` is unconditionally imported in `app.module.ts`
- No environment check to disable in production
- Debug endpoints accessible regardless of `NODE_ENV`

**Current Code:**
```typescript
// app.module.ts
@Module({
  imports: [
    // ...
    DevModule,  // ❌ Always loaded, no conditional
    // ...
  ]
})
```

**Recommendation:**
Should use conditional module loading:
```typescript
@Module({
  imports: [
    // ...
    ...(process.env.NODE_ENV !== 'production' ? [DevModule] : []),
  ]
})
```

---

### 6. Duplicate Node Processes

**Severity:** HIGH
**Impact:** Resource waste, potential for race conditions

**Evidence:**
```bash
root    48941  node /app/node_modules/.bin/nest start --watch
root  1520801  node --enable-source-maps /app/dist/src/main
```

**Analysis:**
- Multiple backend processes running simultaneously
- Process 48941: Development mode with watch (started Oct 30)
- Process 1520801: Production build (started Oct 31)
- Both processes likely binding to same port or different ports causing confusion

**Risk:**
- Resource exhaustion
- Unclear which process is serving requests
- Race conditions in database operations
- Confusion during debugging

---

### 7. CORS Configuration Mismatch

**Severity:** MEDIUM
**Impact:** Potential for CSRF attacks or blocked legitimate requests

**Current Configuration:**
```typescript
// main.ts
app.enableCors({
  origin: ['https://will-soon.com', 'https://www.will-soon.com'],
  credentials: true,
});
```

**Issues:**
- Only allows `will-soon.com` but backend serves `process.will-soon.com`
- Frontend at `172.17.0.1:3001` not in allowed origins
- Credentials enabled but origin list incomplete
- No localhost/development origins

---

### 8. Verbose Logging in Production

**Severity:** MEDIUM
**Impact:** Information disclosure, performance degradation

**Current Configuration:**
```typescript
// main.ts
process.env.LOG_LEVEL = 'debug';  // ❌ Hardcoded debug level

const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'], // ❌ All levels enabled
});
```

**Risk:**
- Sensitive information in logs (SQL queries, API responses, user data)
- Performance impact from excessive logging
- Log file bloat
- No environment-based configuration

---

## 🟡 **MEDIUM SEVERITY ISSUES**

### 9. Missing Global Authentication Strategy

**Severity:** MEDIUM
**Impact:** Easy to forget authentication on new endpoints

**Details:**
- No global guard applied
- Each controller must explicitly add `@UseGuards(EnhancedJwtAuthGuard)`
- Dev/Debug controllers lack guards entirely

**Current Approach:**
```typescript
// Each controller must remember to add:
@UseGuards(EnhancedJwtAuthGuard)
```

**Recommendation:**
Use global guard with public endpoint decorator:
```typescript
// app.module.ts
APP.useGlobalGuards(new EnhancedJwtAuthGuard());

// public endpoints
@Public()
@Get('public-endpoint')
```

---

### 10. Docker Network Security

**Severity:** MEDIUM
**Impact:** Lateral movement in case of container compromise

**Current Configuration:**
```yaml
networks:
  backend-network:
    driver: bridge  # All services on same network
```

**Issues:**
- All services on single network
- No network segmentation
- Databases accessible from any container
- No firewall rules between services

**Recommendation:**
- Separate networks for different service tiers
- Database network isolated from public-facing services
- Use service-specific network aliases

---

### 11. Insufficient Secrets Management

**Severity:** MEDIUM
**Impact:** Credential exposure

**Issues:**
- No use of Docker secrets
- No integration with secrets management (HashiCorp Vault, AWS Secrets Manager, etc.)
- Credentials in plain text in docker-compose.yaml
- JWT secret in environment variables

**Current:**
```yaml
environment:
  - DB_PASSWORD=JalanCipunagara25!  # ❌ Plain text
```

**Should be:**
```yaml
secrets:
  - db_password
secrets:
  db_password:
    external: true
```

---

### 12. Missing Health Check Endpoints for Application

**Severity:** LOW
**Impact:** Difficult to monitor application health

**Details:**
- Health check endpoints exist but not comprehensive
- No database connection health checks
- No external service dependency checks
- Kong/Caddy don't health check the backend properly

---

## 📊 **ARCHITECTURAL CONCERNS**

### 13. Over-Complicated Infrastructure

**Services Count:** 10+ containers for single application

| Service | Purpose | Necessity |
|---------|---------|-----------|
| Backend | NestJS app | ✅ Required |
| PostgreSQL | App database | ✅ Required |
| MongoDB | Document storage | ✅ Required |
| Keycloak | Authentication | ✅ Required |
| Keycloak PostgreSQL | Keycloak DB | ✅ Required |
| Kong Database | Kong DB | ⚠️ Questionable |
| Kong Migrations | Kong setup | ⚠️ Questionable |
| Kong | API Gateway | ⚠️ Questionable (Caddy already handles routing) |
| Caddy | Reverse proxy | ✅ Required |
| PgAdmin | DB Admin | ❌ Should not be in production |
| Mongo Express | DB Admin | ❌ Should not be in production |

**Analysis:**
- **Kong seems redundant** - Caddy already handles reverse proxy
- **Admin tools in production** - PgAdmin/Mongo Express should be dev-only
- Potential for service mesh (Kong) but not fully utilized

---

### 14. Inconsistent Environment Management

**Issues:**
- Mix of `.env` file and hardcoded defaults
- docker-compose uses hardcoded values instead of `.env`
- Backend container doesn't mount `.env` file
- No environment variable validation

**Current:**
```yaml
# docker-compose.yaml
environment:
  - DB_HOST=postgres  # ❌ Hardcoded
  - DB_PASSWORD=JalanCipunagara25!  # ❌ Hardcoded
```

**Should use:**
```yaml
env_file:
  - .env
```

---

### 15. Missing Rate Limiting

**Severity:** MEDIUM
**Impact:** DDoS vulnerability, resource exhaustion

**Details:**
- No rate limiting on API endpoints
- No throttling configuration
- Kong present but not configured for rate limiting
- Particularly dangerous for:
  - `/dev/microsoft_users` (calls external API)
  - `/identities/import-microsoft-users` (expensive operation)
  - Authentication endpoints

---

## 🔧 **RECOMMENDED FIXES** (Priority Order)

### Immediate Actions (Within 24 Hours)

1. **Remove hardcoded credentials from all files**
   - Use environment variables exclusively
   - Rotate all exposed passwords
   - Add `.env` to `.gitignore` (already present, ensure `.env` not committed)

2. **Restrict database port exposure**
   ```yaml
   # Remove external port mappings for production
   postgres:
     # ports:  # Comment out entirely
     #   - "5434:5432"
   ```

3. **Remove admin UIs from production compose file**
   - Create separate `docker-compose.dev.yaml` for PgAdmin/Mongo Express
   - Only use in local development

4. **Add authentication guards to dev/debug endpoints**
   ```typescript
   @UseGuards(EnhancedJwtAuthGuard)
   @Controller('dev')
   ```

5. **Kill duplicate processes**
   - Identify which process should run
   - Properly stop old processes
   - Configure proper process management (PM2 or Docker restart policies)

### Short-term Actions (Within 1 Week)

6. **Implement conditional DevModule loading**
7. **Configure proper CORS origins**
8. **Implement environment-based logging levels**
9. **Add global authentication guard**
10. **Implement rate limiting (using NestJS throttler or Kong)**

### Medium-term Actions (Within 1 Month)

11. **Network segmentation in Docker**
12. **Implement proper secrets management**
13. **Comprehensive health check endpoints**
14. **Evaluate Kong necessity** - either fully utilize or remove
15. **Add API request validation and sanitization**

---

## 🎯 **SECURITY BEST PRACTICES TO IMPLEMENT**

1. **Principle of Least Privilege**
   - Database users should have minimal required permissions
   - Read-only database user for read operations
   - Separate users for migrations vs application

2. **Defense in Depth**
   - Multiple layers of security
   - Network isolation + authentication + authorization
   - WAF (Web Application Firewall) consideration

3. **Audit Logging**
   - Log all authentication attempts
   - Log all admin actions
   - Log all database schema changes

4. **Regular Security Audits**
   - Dependency vulnerability scanning (npm audit)
   - Container image scanning
   - Penetration testing

---

## 📋 **CHECKLIST FOR PRODUCTION READINESS**

- [ ] No hardcoded credentials in source code
- [ ] All secrets in secure secrets management system
- [ ] Database ports not exposed externally
- [ ] Admin UIs removed from production
- [ ] All endpoints have authentication
- [ ] Debug/dev modules disabled in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Logging level appropriate for environment
- [ ] Health checks comprehensive
- [ ] No duplicate processes
- [ ] Network segmentation implemented
- [ ] SSL/TLS for all external communications
- [ ] Regular automated backups configured
- [ ] Incident response plan documented

---

**Generated:** 2025-11-03
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | ⚪ Low

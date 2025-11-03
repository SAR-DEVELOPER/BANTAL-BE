# Port Mapping Impact Analysis

## Executive Summary

**TL;DR:** Removing external port mappings from databases will **NOT** break your backend application. The backend connects via Docker's internal network using service names, not exposed ports.

✅ **Safe to remove external port mappings**
❌ **Will only affect external/manual database access**

---

## Current Database Connection Architecture

### 1. PostgreSQL (Main Application Database)

#### Current Configuration
```yaml
# docker-compose.yaml
postgres:
  container_name: postgres-db
  ports:
    - "5434:5432"  # External:Internal
  networks:
    - backend-network
```

#### How Backend Connects

**Inside Container (`bantal-backend`):**
```bash
$ docker exec bantal-backend env | grep DB_
DB_HOST=postgres          # ✅ Service name, not localhost
DB_PORT=5432              # ✅ Internal port, not 5434
```

**Configuration Chain:**
1. **docker-compose.yaml** (Backend service):
   ```yaml
   backend:
     environment:
       - DB_HOST=postgres      # Docker service name
       - DB_PORT=5432          # Internal port
   ```

2. **.env file** (Loaded by backend):
   ```env
   DB_HOST=postgres            # ✅ Container name
   DB_PORT=5432                # ✅ Internal port (NOT 5434)
   ```

3. **database.config.ts** (TypeORM configuration):
   ```typescript
   host: process.env.DB_HOST || 'localhost',  // Uses "postgres"
   port: parseInt(process.env.DB_PORT || '5432', 10),  // Uses 5432
   ```

**Connection Flow:**
```
bantal-backend container
    ↓ (uses Docker DNS)
postgres:5432 (internal network)
    ↓ (port mapping - only for external access)
0.0.0.0:5434 (host machine)
```

**Verdict:** ✅ Backend connects to `postgres:5432` via internal Docker network. External port `5434` is **NOT USED** by the backend.

---

### 2. PostgreSQL (Keycloak Database)

#### Current Configuration
```yaml
keycloak-postgres:
  container_name: keycloak-postgres
  ports:
    - "5433:5432"  # External:Internal
  networks:
    - backend-network
```

#### How Keycloak Connects

**Keycloak Service Configuration:**
```yaml
keycloak:
  environment:
    KC_DB_URL: jdbc:postgresql://keycloak-postgres:5432/keycloak_db
                                  # ↑ Service name    ↑ Internal port
```

**Verdict:** ✅ Keycloak connects to `keycloak-postgres:5432` via internal network. External port `5433` is **NOT USED**.

---

### 3. MongoDB

#### Current Configuration
```yaml
mongo:
  container_name: mongo-db
  ports:
    - "27017:27017"  # External:Internal (same port)
  networks:
    - backend-network
```

#### How Backend Connects

**Inside Container:**
```bash
$ docker exec bantal-backend env | grep MONGODB_URI
MONGODB_URI=mongodb://mongo:27017  # ✅ Service name
```

**Configuration Chain:**
1. **.env file**:
   ```env
   MONGODB_URI=mongodb://mongo:27017  # Container name
   ```

2. **mongodb.config.ts**:
   ```typescript
   uri: process.env.MONGODB_URI || 'mongodb://mongo:27017',
   ```

**Verdict:** ✅ Backend connects to `mongo:27017` via internal network. External port exposure is **NOT USED** by the backend.

---

## What Uses External Ports?

### Currently Using External Ports

| Port | Service | Used By | Purpose |
|------|---------|---------|---------|
| 5434 | PostgreSQL | **Manual tools** | Direct DB access from host |
| 5433 | Keycloak DB | **Manual tools** | Direct DB access from host |
| 27017 | MongoDB | **Manual tools** | Direct DB access from host |
| 5050 | PgAdmin | **Web browser** | Database admin UI |
| 8081 | Mongo Express | **Web browser** | Database admin UI |

### Example Use Cases for External Ports

1. **Database GUI clients from host machine:**
   ```bash
   # DBeaver, pgAdmin desktop, etc.
   Host: localhost
   Port: 5434  # Would need this exposed
   ```

2. **Manual queries from host:**
   ```bash
   psql -h localhost -p 5434 -U postgres -d bantal_db
   mongosh mongodb://localhost:27017
   ```

3. **Migration commands run FROM HOST** (if you do this):
   ```bash
   # Run from host machine (BAD PRACTICE)
   npm run migration:run  # Would need port 5434
   ```

---

## What Will Break When Ports Are Removed?

### ✅ Will Continue Working

- ✅ Backend application connecting to PostgreSQL
- ✅ Backend application connecting to MongoDB
- ✅ Keycloak connecting to its database
- ✅ TypeORM migrations (if run inside container)
- ✅ All container-to-container communication
- ✅ All application functionality

### ❌ Will Stop Working

- ❌ Direct database access from **host machine** (your laptop/server)
- ❌ Database GUI tools running on **host** (DBeaver, TablePlus, etc.)
- ❌ PgAdmin/Mongo Express (unless they're in the same Docker network - they are!)
- ❌ Manual queries from host terminal
- ❌ Migration commands run from **host** (if you do this)

**Note:** PgAdmin and Mongo Express are containers on the same `backend-network`, so they will still work even without exposed ports!

---

## Docker Networking Deep Dive

### How Docker Service Name Resolution Works

When containers are on the same network, Docker provides built-in DNS:

```bash
# Inside bantal-backend container
$ ping postgres
PING postgres (172.18.0.4): 56 data bytes
64 bytes from 172.18.0.4: seq=0 ttl=64 time=0.123 ms

# Backend can connect to postgres:5432 directly
# No need for localhost or port mapping
```

### Network Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Host Machine (0.0.0.0)                                      │
│                                                             │
│  Port 5434 ──┐  Port 5433 ──┐  Port 27017 ──┐             │
└──────────────┼──────────────┼───────────────┼──────────────┘
               │              │               │
               │ (mapped)     │ (mapped)      │ (mapped)
               │              │               │
┌──────────────┼──────────────┼───────────────┼──────────────┐
│ Docker Network: backend-network                             │
│              │              │               │               │
│  ┌───────────▼──────────┐ ┌▼───────────────┐ ┌▼───────────┐│
│  │ postgres:5432        │ │ keycloak-pg:   │ │ mongo:     ││
│  │ (internal)           │ │ 5432           │ │ 27017      ││
│  └──────────▲───────────┘ └────▲───────────┘ └──▲─────────┘│
│             │                  │                 │          │
│             │                  │                 │          │
│  ┌──────────┴──────────────────┴─────────────────┴────────┐ │
│  │ bantal-backend:4000                                    │ │
│  │ Connects via service names:                            │ │
│  │ - postgres:5432                                        │ │
│  │ - mongo:27017                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────┐  ┌───────────────────────────┐   │
│  │ keycloak:8080        │  │ pgadmin:80                │   │
│  │ Connects to:         │  │ Connects to:              │   │
│  │ keycloak-pg:5432     │  │ postgres:5432             │   │
│  └──────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
1. **Internal communication** uses service names and internal ports
2. **External port mapping** only affects access from outside Docker network
3. **Removing port mapping** only blocks the top arrow, not internal connections

---

## Hardcoded Port Issues Found

### Issue in `env.config.ts`

**Line 13:**
```typescript
port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5434,
//                                                               ^^^^
//                                                            WRONG!
```

**Problem:** Default fallback uses `5434` (external port) instead of `5432` (internal port).

**Impact:**
- If `.env` file is missing or `DB_PORT` is not set, connection will fail
- Shows confusion between internal/external ports

**Fix:**
```typescript
port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
//                                                               ^^^^
//                                                            CORRECT
```

---

## Migration Commands Analysis

### How Migrations Are Currently Run

**package.json scripts:**
```json
{
  "migration:run": "npm run typeorm -- migration:run -d typeorm.config.ts",
  "migration:generate": "npm run typeorm -- migration:generate -d typeorm.config.ts"
}
```

**typeorm.config.ts:**
```typescript
export default new DataSource({
  ...databaseConfig,  // Uses same config as runtime
  migrations: ['src/migrations/*.ts'],
});
```

**Configuration source:** `database.config.ts`
```typescript
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432', 10),
```

### Two Migration Scenarios

#### Scenario A: Migrations Run from Host Machine

```bash
# On host machine
$ npm run migration:generate -- src/migrations/AddNewColumn

# This would use:
DB_HOST=localhost (from .env or default)
DB_PORT=5434 (needs exposed port!)
```

**Requires:** External port mapping

#### Scenario B: Migrations Run Inside Container (RECOMMENDED)

```bash
# Enter container
$ docker exec -it bantal-backend sh

# Run migration inside container
$ npm run migration:generate -- src/migrations/AddNewColumn

# This uses:
DB_HOST=postgres (from container env)
DB_PORT=5432 (internal port)
```

**Requires:** No external ports needed!

### Auto-Run Migrations

**database.config.ts:**
```typescript
migrationsRun: true,  // Auto-run on startup
```

**This means:** Migrations run automatically when backend container starts, using internal network. **No external ports needed**.

---

## Recommendations

### Immediate: Safe Port Removal

You can **safely remove** these port mappings:

```yaml
# Remove these lines from docker-compose.yaml

postgres:
  # ports:
  #   - "5434:5432"  # ❌ Remove this

keycloak-postgres:
  # ports:
  #   - "5433:5432"  # ❌ Remove this

mongo:
  # ports:
  #   - "27017:27017"  # ❌ Remove this
```

### Alternative: Conditional Port Exposure

Create separate compose files:

**docker-compose.yaml** (Production - no exposed DB ports):
```yaml
postgres:
  # No ports exposed
  networks:
    - backend-network
```

**docker-compose.dev.yaml** (Development - exposes ports):
```yaml
postgres:
  ports:
    - "5434:5432"  # Only for local development
```

**Usage:**
```bash
# Production
docker-compose up

# Development with DB access
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up
```

### Fix Hardcoded Port Issue

**File:** `src/config/env.config.ts`

**Change line 13:**
```typescript
// Before
port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5434,

// After
port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
```

---

## How to Access Databases After Port Removal

### Option 1: Use PgAdmin/Mongo Express Containers

These containers are on the same network and will continue working:
- PgAdmin: http://localhost:5050
- Mongo Express: http://localhost:8081

**They connect internally:**
```
PgAdmin → postgres:5432 (internal network)
Mongo Express → mongo:27017 (internal network)
```

### Option 2: Execute Commands Inside Containers

**PostgreSQL:**
```bash
docker exec -it postgres-db psql -U postgres -d bantal_db
```

**MongoDB:**
```bash
docker exec -it mongo-db mongosh bantal_db
```

### Option 3: Port Forward Temporarily

```bash
# Forward port 5432 from postgres container to localhost:5434
docker run --rm --network backend-network -p 5434:5432 alpine/socat \
  tcp-listen:5432,fork,reuseaddr tcp-connect:postgres:5432
```

### Option 4: SSH Tunnel (for remote servers)

```bash
# If on remote server, SSH tunnel to PgAdmin
ssh -L 5050:localhost:5050 user@server

# Then access http://localhost:5050 from your laptop
```

---

## Testing Plan

### Before Removing Ports

1. **Verify current connections:**
   ```bash
   docker exec bantal-backend env | grep -E "DB_HOST|DB_PORT|MONGODB_URI"
   ```

2. **Test database connectivity:**
   ```bash
   docker exec bantal-backend npm run test:e2e
   # or
   curl http://localhost:4000/health
   ```

### After Removing Ports

1. **Restart services:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Verify backend still works:**
   ```bash
   # Check backend logs
   docker logs bantal-backend --tail 50

   # Test API endpoint
   curl http://localhost:4000/health

   # Test document creation
   curl -X POST http://localhost:4000/documents/...
   ```

3. **Verify migrations still run:**
   ```bash
   docker exec bantal-backend npm run migration:run
   ```

4. **Test external access is blocked:**
   ```bash
   # This should fail (good!)
   psql -h localhost -p 5434 -U postgres
   # Connection refused

   # But this should work
   docker exec -it postgres-db psql -U postgres
   # Success
   ```

---

## Summary Table

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| **Backend → PostgreSQL** | `postgres:5432` | `postgres:5432` | ✅ No change |
| **Backend → MongoDB** | `mongo:27017` | `mongo:27017` | ✅ No change |
| **Keycloak → Its DB** | `keycloak-postgres:5432` | `keycloak-postgres:5432` | ✅ No change |
| **PgAdmin → PostgreSQL** | `postgres:5432` | `postgres:5432` | ✅ No change |
| **Host → PostgreSQL** | `localhost:5434` ✅ | Connection refused ❌ | Expected |
| **Host → MongoDB** | `localhost:27017` ✅ | Connection refused ❌ | Expected |
| **Auto-migrations** | ✅ Works | ✅ Works | ✅ No change |
| **Manual host migrations** | ✅ Works | ❌ Fails | Must use container |

---

## Conclusion

**Removing external port mappings is SAFE and RECOMMENDED for production.**

The backend application uses Docker's internal networking and service name resolution. External ports are only for manual access from the host machine, which should not exist in production.

**What you'll lose:** Convenience of `psql -h localhost -p 5434`
**What you'll gain:** Significantly improved security posture

**Recommended approach:**
1. Remove external ports from production `docker-compose.yaml`
2. Create `docker-compose.dev.yaml` with exposed ports for local development
3. Fix hardcoded `5434` in `env.config.ts` to `5432`
4. Always run migrations inside containers or use auto-run migrations

---

**Generated:** 2025-11-03
**Status:** ✅ Safe to remove external database port mappings

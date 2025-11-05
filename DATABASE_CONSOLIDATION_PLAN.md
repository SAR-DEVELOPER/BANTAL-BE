# PostgreSQL Database Consolidation Plan

## Executive Summary

**Goal:** Merge 3 separate PostgreSQL instances into 1 unified instance

**Current State:**
- 3 separate PostgreSQL 17 containers
- 3 separate volumes
- ~204MB total disk usage
- ~80-100MB total RAM usage
- Separate management overhead

**Target State:**
- 1 PostgreSQL 17 container
- 3 separate databases in one instance
- ~204MB total disk usage (no change)
- ~40-50MB RAM usage (50% reduction)
- Single management point

**Resource Savings:**
- RAM: ~40-50MB saved (~50% reduction)
- CPU: 2-3% saved (fewer postgres processes)
- Disk I/O: Reduced overhead
- Maintenance: 2 fewer containers to manage

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Docker Host                                             │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────┴──────┐
│  │ postgres-db      │  │ keycloak-postgres│  │ kong-database │
│  │ Port: 5432       │  │ Port: 5432       │  │ Port: 5432    │
│  │ RAM: ~27MB       │  │ RAM: ~27MB       │  │ RAM: ~27MB    │
│  │ Disk: 77MB       │  │ Disk: 73MB       │  │ Disk: 54MB    │
│  ├──────────────────┤  ├──────────────────┤  ├───────────────┤
│  │ DB: bantal_db    │  │ DB: keycloak_db  │  │ DB: kong      │
│  │ User: postgres   │  │ User: keycloak_  │  │ User: kong    │
│  │                  │  │       db_user    │  │               │
│  └─────────┬────────┘  └─────────┬────────┘  └───────┬───────┘
│            │                     │                    │
│            ↓                     ↓                    ↓
│  ┌─────────────────┐   ┌─────────────────┐  ┌───────────────┐
│  │ bantal-backend  │   │ keycloak        │  │ kong          │
│  └─────────────────┘   └─────────────────┘  └───────────────┘
└─────────────────────────────────────────────────────────────┘
```

**Current Connections:**
- Backend → `postgres:5432` (bantal_db)
- Keycloak → `keycloak-postgres:5432` (keycloak_db)
- Kong → `kong-database:5432` (kong)

---

## Target Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Docker Host                                                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ unified-postgres                                         ││
│  │ Port: 5432                                               ││
│  │ RAM: ~40-50MB (consolidated overhead)                    ││
│  │ Disk: 204MB                                              ││
│  ├──────────────────────────────────────────────────────────┤│
│  │                                                          ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐││
│  │  │ bantal_db      │  │ keycloak_db    │  │ kong_db    │││
│  │  │                │  │                │  │            │││
│  │  │ Owner:         │  │ Owner:         │  │ Owner:     │││
│  │  │  postgres      │  │  keycloak_user │  │  kong_user │││
│  │  └────────────────┘  └────────────────┘  └────────────┘││
│  │                                                          ││
│  └───────────┬──────────────────┬──────────────────┬───────┘│
│              │                  │                  │         │
│              ↓                  ↓                  ↓         │
│  ┌───────────────────┐ ┌───────────────┐ ┌────────────────┐│
│  │ bantal-backend    │ │ keycloak      │ │ kong           ││
│  └───────────────────┘ └───────────────┘ └────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Target Connections:**
- Backend → `unified-postgres:5432/bantal_db`
- Keycloak → `unified-postgres:5432/keycloak_db`
- Kong → `unified-postgres:5432/kong_db`

---

## Unified Database Design

### Database Isolation Strategy

**Option 1: Separate Databases (RECOMMENDED)**
```sql
-- Single PostgreSQL instance with 3 databases
CREATE DATABASE bantal_db;
CREATE DATABASE keycloak_db;
CREATE DATABASE kong_db;

-- Separate users with database-specific permissions
CREATE USER bantal_user WITH PASSWORD 'xxx';
CREATE USER keycloak_user WITH PASSWORD 'xxx';
CREATE USER kong_user WITH PASSWORD 'xxx';

GRANT ALL PRIVILEGES ON DATABASE bantal_db TO bantal_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
GRANT ALL PRIVILEGES ON DATABASE kong_db TO kong_user;
```

**Benefits:**
- Complete data isolation
- No risk of cross-database queries
- Easy to backup/restore individually
- Can set different connection limits per database
- Keycloak/Kong can't accidentally access app data

**Option 2: Separate Schemas (Alternative)**
```sql
-- Single database with 3 schemas
CREATE SCHEMA bantal_schema;
CREATE SCHEMA keycloak_schema;
CREATE SCHEMA kong_schema;
```

**Drawbacks:**
- Less isolation
- Shared connection pool
- More complex permission management
- Not recommended for multi-tenant services

**Decision: Use Option 1 (Separate Databases)**

---

## Migration Plan

### Phase 0: Preparation (1 hour)

**1. Backup Current Databases**
```bash
# Backup app database
docker exec postgres-db pg_dump -U postgres bantal_db > backup_bantal_db.sql

# Backup Keycloak database
docker exec keycloak-postgres pg_dump -U keycloak_db_user keycloak_db > backup_keycloak_db.sql

# Backup Kong database
docker exec kong-database pg_dump -U kong kong > backup_kong_db.sql
```

**2. Document Current Configurations**
```bash
# Save current environment variables
docker inspect postgres-db > inspect_postgres.json
docker inspect keycloak-postgres > inspect_keycloak_postgres.json
docker inspect kong-database > inspect_kong_database.json
```

**3. Create Rollback Script**
```bash
# Save current docker-compose.yaml
cp docker-compose.yaml docker-compose.yaml.pre-consolidation
```

---

### Phase 1: Create Unified Database Service (30 minutes)

**1. Update docker-compose.yaml**

**BEFORE:**
```yaml
  keycloak-postgres:
    image: postgres:17
    container_name: keycloak-postgres
    # ...

  postgres:
    image: postgres:17
    container_name: postgres-db
    # ...

  kong-database:
    image: postgres:17
    container_name: kong-database
    # ...
```

**AFTER:**
```yaml
  unified-postgres:
    image: postgres:17
    container_name: unified-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use env var, not hardcoded!
      # Multiple databases will be created via init script
    volumes:
      - unified-postgres-data:/var/lib/postgresql/data
      - ./init-scripts/init-unified-db.sql:/docker-entrypoint-initdb.d/01-init-databases.sql
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U postgres" ]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-network
    restart: unless-stopped

volumes:
  unified-postgres-data:
    driver: local
```

**2. Create Database Initialization Script**

**File:** `init-scripts/init-unified-db.sql`
```sql
-- Create databases
CREATE DATABASE bantal_db;
CREATE DATABASE keycloak_db;
CREATE DATABASE kong_db;

-- Create users with strong passwords (use environment variables in production)
CREATE USER bantal_user WITH PASSWORD 'changeme_bantal';
CREATE USER keycloak_user WITH PASSWORD 'changeme_keycloak';
CREATE USER kong_user WITH PASSWORD 'changeme_kong';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bantal_db TO bantal_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
GRANT ALL PRIVILEGES ON DATABASE kong_db TO kong_user;

-- Grant connection privileges
GRANT CONNECT ON DATABASE bantal_db TO bantal_user;
GRANT CONNECT ON DATABASE keycloak_db TO keycloak_user;
GRANT CONNECT ON DATABASE kong_db TO kong_user;
```

**Better: Use environment variables:**

**File:** `init-scripts/init-unified-db.sh`
```bash
#!/bin/bash
set -e

# Read passwords from environment or use defaults
BANTAL_PASSWORD="${BANTAL_DB_PASSWORD:-changeme_bantal}"
KEYCLOAK_PASSWORD="${KEYCLOAK_DB_PASSWORD:-changeme_keycloak}"
KONG_PASSWORD="${KONG_DB_PASSWORD:-changeme_kong}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create databases
    CREATE DATABASE bantal_db;
    CREATE DATABASE keycloak_db;
    CREATE DATABASE kong_db;

    -- Create users
    CREATE USER bantal_user WITH PASSWORD '$BANTAL_PASSWORD';
    CREATE USER keycloak_user WITH PASSWORD '$KEYCLOAK_PASSWORD';
    CREATE USER kong_user WITH PASSWORD '$KONG_PASSWORD';

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE bantal_db TO bantal_user;
    GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
    GRANT ALL PRIVILEGES ON DATABASE kong_db TO kong_user;
EOSQL

echo "Unified database initialization completed"
```

---

### Phase 2: Migrate Data (1-2 hours)

**Method 1: Clean Migration (Recommended for Production)**

```bash
# 1. Stop all services
docker-compose down

# 2. Start only unified-postgres
docker-compose up -d unified-postgres

# 3. Wait for database to be ready
sleep 10

# 4. Restore app database
docker exec -i unified-postgres psql -U postgres -d bantal_db < backup_bantal_db.sql

# 5. Restore Keycloak database
docker exec -i unified-postgres psql -U postgres -d keycloak_db < backup_keycloak_db.sql

# 6. Restore Kong database
docker exec -i unified-postgres psql -U postgres -d kong_db < backup_kong_db.sql

# 7. Verify data
docker exec unified-postgres psql -U postgres -d bantal_db -c "\dt"
docker exec unified-postgres psql -U postgres -d keycloak_db -c "\dt"
docker exec unified-postgres psql -U postgres -d kong_db -c "\dt"
```

**Method 2: Volume Copy (Faster, Less Safe)**

```bash
# Copy data from existing volumes (advanced)
# Not recommended - use Method 1
```

---

### Phase 3: Update Service Connections (30 minutes)

**1. Update Backend Configuration**

**File:** `.env`
```env
# OLD
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=JalanCipunagara25!
DB_DATABASE=bantal_db

# NEW
DB_HOST=unified-postgres  # Changed
DB_PORT=5432
DB_USERNAME=bantal_user   # Changed (better security)
DB_PASSWORD=changeme_bantal
DB_DATABASE=bantal_db
```

**File:** `docker-compose.yaml` (backend service)
```yaml
backend:
  environment:
    - DB_HOST=unified-postgres  # Changed from 'postgres'
    - DB_USERNAME=bantal_user   # Changed from 'postgres'
  depends_on:
    unified-postgres:            # Changed from 'postgres'
      condition: service_healthy
```

**2. Update Keycloak Configuration**

**File:** `docker-compose.yaml` (keycloak service)
```yaml
keycloak:
  environment:
    # OLD
    # KC_DB_URL: jdbc:postgresql://keycloak-postgres:5432/keycloak_db
    # KC_DB_USERNAME: keycloak_db_user

    # NEW
    KC_DB_URL: jdbc:postgresql://unified-postgres:5432/keycloak_db
    KC_DB_USERNAME: keycloak_user
    KC_DB_PASSWORD: changeme_keycloak
  depends_on:
    unified-postgres:                # Changed from 'keycloak-postgres'
      condition: service_healthy
```

**3. Update Kong Configuration**

**File:** `docker-compose.yaml` (kong service)
```yaml
kong:
  environment:
    # OLD
    # KONG_PG_HOST: kong-database

    # NEW
    KONG_PG_HOST: unified-postgres
    KONG_PG_USER: kong_user
    KONG_PG_PASSWORD: changeme_kong
    KONG_PG_DATABASE: kong_db
  depends_on:
    unified-postgres:                # Changed from 'kong-database'
      condition: service_healthy

kong-migrations:
  environment:
    KONG_PG_HOST: unified-postgres   # Changed
    KONG_PG_USER: kong_user
    KONG_PG_PASSWORD: changeme_kong
    KONG_PG_DATABASE: kong_db
```

---

### Phase 4: Testing (1 hour)

**1. Start All Services**
```bash
docker-compose up -d
```

**2. Verify Database Connections**
```bash
# Check backend can connect
docker exec bantal-backend npm run typeorm -- query "SELECT NOW()"

# Check Keycloak
docker logs keycloak | grep -i "database"

# Check Kong
docker exec kong kong health
```

**3. Test Application Functionality**
```bash
# Test API endpoint
curl http://localhost:4000/health

# Test authentication
curl http://localhost:4000/auth/health

# Test database read/write
curl -X POST http://localhost:4000/documents/...
```

**4. Verify Data Integrity**
```bash
# Check row counts match backups
docker exec unified-postgres psql -U postgres -d bantal_db -c "SELECT COUNT(*) FROM master_document_list"

# Compare with backup
grep "COPY master_document_list" backup_bantal_db.sql
```

---

### Phase 5: Cleanup (30 minutes)

**Only after successful testing!**

```bash
# 1. Remove old database services from docker-compose.yaml
#    - keycloak-postgres
#    - kong-database
#    - postgres (rename to unified-postgres)

# 2. Remove old volumes (DANGER!)
docker volume rm bantal-be_keycloak-postgres-data
docker volume rm bantal-be_postgres-data
docker volume rm bantal-be_kong-postgres-data

# 3. Remove backups (after keeping them for a week)
# rm backup_*.sql
```

---

## Configuration Changes Summary

### Environment Variables to Update

**`.env` file:**
```env
# PostgreSQL - Unified
DB_HOST=unified-postgres          # Was: postgres
DB_USERNAME=bantal_user           # Was: postgres
DB_PASSWORD=<generate-new-password>
DB_DATABASE=bantal_db

# Add new variables
BANTAL_DB_PASSWORD=<generate-new>
KEYCLOAK_DB_PASSWORD=<generate-new>
KONG_DB_PASSWORD=<generate-new>
```

### docker-compose.yaml Changes

**Services to REMOVE:**
- `keycloak-postgres`
- `kong-database`
- `postgres` (replaced by `unified-postgres`)

**Services to UPDATE:**
- `backend`: Change `DB_HOST` and `depends_on`
- `keycloak`: Change `KC_DB_URL` and `depends_on`
- `kong`: Change `KONG_PG_HOST` and `depends_on`
- `kong-migrations`: Change `KONG_PG_HOST` and `depends_on`

**Volumes to REMOVE:**
- `keycloak-postgres-data`
- `postgres-data`
- `kong-postgres-data`

**Volumes to ADD:**
- `unified-postgres-data`

---

## Rollback Strategy

### If Migration Fails During Phase 1-2

```bash
# 1. Stop everything
docker-compose down

# 2. Restore old docker-compose.yaml
cp docker-compose.yaml.pre-consolidation docker-compose.yaml

# 3. Start old services
docker-compose up -d

# Result: Back to 3 separate databases, no data loss
```

### If Migration Fails During Phase 3-4

```bash
# 1. Stop everything
docker-compose down

# 2. Restore old docker-compose.yaml
cp docker-compose.yaml.pre-consolidation docker-compose.yaml

# 3. Restore data to old containers
docker-compose up -d postgres keycloak-postgres kong-database
sleep 10

# Restore from backups
docker exec -i postgres-db psql -U postgres -d bantal_db < backup_bantal_db.sql
docker exec -i keycloak-postgres psql -U keycloak_db_user -d keycloak_db < backup_keycloak_db.sql
docker exec -i kong-database psql -U kong -d kong < backup_kong_db.sql

# 4. Start all services
docker-compose up -d
```

---

## Resource Savings Analysis

### Current Resource Usage

| Container | RAM | CPU | Disk | Management |
|-----------|-----|-----|------|------------|
| postgres-db | ~27MB | 1% | 77MB | Separate |
| keycloak-postgres | ~27MB | 1% | 73MB | Separate |
| kong-database | ~27MB | 1% | 54MB | Separate |
| **Total** | **~81MB** | **3%** | **204MB** | **3 services** |

### After Consolidation

| Container | RAM | CPU | Disk | Management |
|-----------|-----|-----|------|------------|
| unified-postgres | ~40-50MB | 1.5% | 204MB | Single |
| **Savings** | **~30-40MB** | **1.5%** | **0MB** | **-2 services** |

**Efficiency Gains:**
- **RAM:** 37-49% reduction (shared buffer pools, single process)
- **CPU:** 50% reduction (fewer postgres processes)
- **Container overhead:** Reduced by 66% (3→1)
- **Network complexity:** Reduced (fewer service connections)
- **Backup complexity:** Single backup job instead of 3

---

## Security Improvements

### Current Security Issues

1. **Same password everywhere:** `JalanCipunagara25!`
2. **Overprivileged users:** `postgres` superuser for app
3. **No isolation:** Each service has full DB access

### After Consolidation

1. **Unique passwords per database:**
   ```
   bantal_user: <strong-password-1>
   keycloak_user: <strong-password-2>
   kong_user: <strong-password-3>
   ```

2. **Principle of least privilege:**
   - `bantal_user`: Only access to `bantal_db`
   - `keycloak_user`: Only access to `keycloak_db`
   - `kong_user`: Only access to `kong_db`

3. **Database isolation:**
   - Kong can't accidentally query app data
   - Keycloak can't access Kong config
   - App can't modify authentication data

---

## Performance Considerations

### Potential Concerns

**Shared Resources:**
- Single connection pool
- Shared memory buffers
- Single WAL (Write-Ahead Log)

**Mitigation:**
```sql
-- Limit connections per database
ALTER DATABASE bantal_db CONNECTION LIMIT 50;
ALTER DATABASE keycloak_db CONNECTION LIMIT 30;
ALTER DATABASE kong_db CONNECTION LIMIT 20;
```

### Performance Tuning

**postgresql.conf adjustments for unified instance:**
```ini
# Increase shared buffers (combined workload)
shared_buffers = 256MB  # Was: 128MB per instance

# Increase max connections (combined)
max_connections = 200   # Was: 100 per instance

# Work memory per query
work_mem = 4MB

# Maintenance
maintenance_work_mem = 64MB
```

---

## Timeline & Effort

| Phase | Duration | Downtime | Risk |
|-------|----------|----------|------|
| 0. Preparation | 1 hour | None | Low |
| 1. Create Unified DB | 30 min | None | Low |
| 2. Migrate Data | 1-2 hours | **Full** | Medium |
| 3. Update Connections | 30 min | **Full** | Medium |
| 4. Testing | 1 hour | **Full** | Low |
| 5. Cleanup | 30 min | None | Low |
| **Total** | **4-5 hours** | **3-4 hours** | **Medium** |

**Recommended Schedule:**
- Start: Saturday 2:00 AM (low traffic)
- Expected completion: Saturday 6:00 AM
- Rollback window: Until Saturday 12:00 PM

---

## Success Criteria

✅ All services start successfully
✅ Backend can query `bantal_db`
✅ Keycloak authentication works
✅ Kong routes traffic correctly
✅ All API endpoints functional
✅ Data integrity verified (row counts match)
✅ Performance acceptable (response times < 200ms)
✅ No error logs in any service
✅ Resource usage reduced as expected

---

## Post-Migration Monitoring

**First 24 hours:**
- Monitor container logs: `docker logs -f unified-postgres`
- Check connection counts: `SELECT count(*) FROM pg_stat_activity;`
- Monitor resource usage: `docker stats unified-postgres`
- Check for errors: `docker logs unified-postgres | grep ERROR`

**First week:**
- Monitor database performance
- Check connection pool exhaustion
- Verify backup jobs work
- Test rollback procedure (on staging)

---

## Alternative: Database Per Container (Keep Separate)

If you decide NOT to consolidate, here's why:

**Keep Separate If:**
- ❌ You need complete resource isolation
- ❌ Services are on different servers
- ❌ You need independent scaling (unlikely for DBs)
- ❌ Different PostgreSQL versions needed

**Reality Check:**
- None of these apply to your setup
- You're running everything on same Docker host
- Same PostgreSQL version everywhere
- Resource waste with separate instances

**Verdict: Consolidation is the right choice**

---

## Final Checklist

### Before Starting
- [ ] Backups created and verified
- [ ] Rollback plan documented
- [ ] Team notified of maintenance window
- [ ] Monitoring dashboards ready
- [ ] Init scripts tested locally

### During Migration
- [ ] Services stopped gracefully
- [ ] Unified database created
- [ ] Data restored successfully
- [ ] Connections updated
- [ ] Services restarted
- [ ] Smoke tests passed

### After Migration
- [ ] Full functionality tested
- [ ] Performance acceptable
- [ ] Logs checked for errors
- [ ] Resource usage verified
- [ ] Documentation updated
- [ ] Old volumes removed (after 1 week)

---

## Next Steps

1. **Review this plan** (15 minutes)
2. **Practice on local dev environment** (2 hours)
3. **Schedule maintenance window** (coordinate with team)
4. **Execute migration** (4-5 hours)
5. **Monitor for 1 week** (daily checks)
6. **Clean up old resources** (30 minutes)

---

**Generated:** 2025-11-03
**Status:** ✅ Ready for review
**Estimated Savings:** ~40MB RAM, 1.5% CPU, -2 containers
**Risk Level:** Medium (full rollback available)

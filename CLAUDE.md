# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BANTAL-BE is a NestJS-based backend application for document management and workflow automation. It uses PostgreSQL for structured data, MongoDB for document content, and Keycloak for authentication with Microsoft Entra ID integration.

## Common Commands

### Development
```bash
npm install                    # Install dependencies
npm run start:dev             # Start dev server with watch mode
npm run start:debug           # Start with debug and watch mode
npm run build                 # Build the application
npm run start:prod            # Run production build
```

### Database Migrations
```bash
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
npm run migration:run                                        # Run pending migrations
npm run migration:revert                                     # Revert last migration
npm run migration:purge                                      # Revert all migrations
npm run migration:purge-and-run                             # Reset and run all migrations
```

### Testing
```bash
npm run test                  # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage
npm run test:e2e              # Run end-to-end tests
npm run test:debug            # Run tests in debug mode
```

## Architecture Overview

### Dual Database System
- **PostgreSQL**: Structured data (entities, relations, master data)
- **MongoDB**: Document content and unstructured data (via Mongoose)

Both databases are configured as "bantal_db" by default.

### Module Structure
The application follows NestJS modular architecture with domain-driven organization:

- **auth**: Authentication with Keycloak + Microsoft Entra ID integration
- **identity**: User management with Microsoft Graph API sync
- **document**: Core document management (Surat Penawaran, Surat Perjanjian Kerja, Surat Tagihan)
- **surat-tugas**: Assignment letters with team management
- **pekerjaan-NB**: Job/project management
- **client**: Client management
- **company**: Company master data
- **division**: Division master data
- **payment**: Payment processing
- **mongodb**: MongoDB connection and schemas
- **dev**: Development utilities and debug endpoints
- **health**: Health check endpoints

### Key Architectural Patterns

#### Document System
Documents use a factory pattern with inheritance:
- `MasterDocumentList`: Base document entity (PostgreSQL)
- Specific document types extend the base (e.g., `SuratPenawaran`, `SuratPerjanjianKerja`)
- `DocumentFactoryService`: Creates appropriate document type instances
- Document content stored in MongoDB, metadata in PostgreSQL

#### Authentication Flow
1. User authenticates via Keycloak (configured with Entra ID)
2. Backend validates user against internal identity database
3. Keycloak ID is synced with internal identity record
4. Session established via HTTP-only cookies

Key files:
- `src/modules/auth/guards/enhanced-jwt-auth.guard.ts`: Enhanced JWT validation with identity check
- `src/modules/identity/identity.service.ts`: User validation and Microsoft Graph sync
- See `ENHANCED_LOGIN_FLOW.md` for detailed flow documentation

#### Entity Organization
- `/src/entities`: Shared entities used across multiple modules
- `/src/modules/*/entities`: Module-specific entities
- All entities use TypeORM decorators and are registered in respective modules

## Database Configuration

### TypeORM Configuration
- Configuration: `src/config/database.config.ts`
- CLI configuration: `typeorm.config.ts` (used for migrations)
- Migrations: Auto-run on startup (`migrationsRun: true`)
- Synchronize: Disabled (`synchronize: false`) - use migrations for schema changes

### MongoDB Configuration
- Configuration: `src/modules/mongodb/mongodb.module.ts`
- Schemas: `src/modules/mongodb/schemas/`
- Used primarily for document content via Mongoose

## Environment Variables

Key environment variables (see `.env`):
- `PORT`: Application port (default 4000)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: PostgreSQL config
- `MONGODB_URI`, `MONGODB_DATABASE`: MongoDB config
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`: Keycloak config
- `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_TENANT_ID`: Microsoft Graph API credentials
- `JWT_SECRET`, `JWT_EXPIRATION`: JWT configuration

## Working with Documents

### Creating Documents
Endpoint: `POST /documents/create/:documentType`

Document types:
- `SP`, `Pwn`, `SuratPenawaran`: Surat Penawaran (Offering Letter)
- `SPK`, `SuratPerjanjianKerja`: Surat Perjanjian Kerja (Work Agreement)
- `STNB`, `SuratTagihanNonBulanan`: Surat Tagihan Non-Bulanan (Non-Monthly Invoice)

The API accepts both structured format (with `baseDocument` and `specificDocument` keys) or flat format. See `docs/document-creation-api.md` for detailed examples.

### Document Lifecycle
1. **Creation**: Document created in draft status
2. **Finalization**: Document finalized via `POST /documents/finalize/:id`
3. **Storage**: Metadata in PostgreSQL, content in MongoDB

Key services:
- `DocumentService`: Core document operations
- `DocumentFactoryService`: Document type instantiation
- Type-specific services: `SuratPenawaranService`, `SuratPerjanjianKerjaService`, etc.

## Identity and User Management

### Microsoft User Sync
Import users from Microsoft Entra ID:
```
POST /identities/import-microsoft-users
```

This populates the internal identity database with Microsoft users. Only users in this database can authenticate.

### User Validation
The enhanced authentication system requires:
1. User exists in identity database (imported from Microsoft)
2. User is active (`isActive: true` and `status: 'active'`)
3. Keycloak ID matches or is synced on first login

See `ENHANCED_LOGIN_FLOW.md` and `Identity-API-Documentation.md` for complete API documentation.

### Using Enhanced Authentication
```typescript
import { UseGuards } from '@nestjs/common';
import { EnhancedJwtAuthGuard } from '../auth/guards/enhanced-jwt-auth.guard';

@Get('protected-route')
@UseGuards(EnhancedJwtAuthGuard)
async protectedMethod(@Req() req: Request) {
  // Access JWT data
  const email = req.user.email;

  // Access internal identity data
  const department = req.identity.department;
  const role = req.identity.role;
}
```

## Path Aliases

The project uses TypeScript path aliases (configured in `tsconfig.json`):
- `@modules/*`: Maps to `src/modules/*`
- `@config/*`: Maps to `src/config/*`

Use these aliases in imports for cleaner code.

## Migration Best Practices

1. Always generate migrations for schema changes (never use `synchronize: true`)
2. Review generated migrations before running
3. Test migrations with `migration:purge-and-run` in development
4. Migrations are auto-executed on application startup
5. Keep migration files in `src/migrations/`

## Testing Strategy

- Unit tests: Use Jest with `*.spec.ts` pattern
- E2E tests: Located in `/test` directory
- Test configuration: See `jest` section in `package.json`
- Coverage reports: Generated in `/coverage` directory

## Docker Setup

Development and production Dockerfiles are provided:
- `Dockerfile`: Production build
- `Dockerfile.dev`: Development with hot reload
- `docker-compose.yaml`: Multi-service orchestration (app, PostgreSQL, MongoDB, Keycloak)

## Important Notes

- Linting and formatting are currently disabled (scripts echo disabled message)
- The application listens on `0.0.0.0` for Docker compatibility
- CORS is configured for `will-soon.com` domains
- Cookie-based sessions are used (HTTP-only cookies)
- Debug logging is enabled in development (`LOG_LEVEL=debug`)
- Migrations directory: Use `src/migrations/*.ts` (compiled to `dist/migrations/*.js`)

npm run migration:generate -- src/migrations/28-10-2025-slate-update

-- Drop schemas if they exist
DROP SCHEMA IF EXISTS document_schema CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS migration CASCADE;

-- Recreate public schema (standard default)
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Recreate custom schemas as needed
CREATE SCHEMA document_schema;
CREATE SCHEMA migration;

-- Optional: if you use extensions (like uuid-ossp)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



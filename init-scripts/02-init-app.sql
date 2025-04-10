-- Create bantal_db only if it doesn't already exist
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bantal_db') THEN
      CREATE DATABASE bantal_db;
   END IF;
END
$$;

-- Create user if not exists
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bantal_db_user') THEN
      CREATE USER bantal_db_user WITH ENCRYPTED PASSWORD 'JalanCipunagara25!';
   END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bantal_db TO bantal_db_user;

-- Connect to target DB and grant schema-level access
\connect bantal_db
GRANT ALL ON SCHEMA public TO bantal_db_user;

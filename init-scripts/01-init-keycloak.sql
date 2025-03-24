-- Create keycloak database and user
CREATE DATABASE keycloak_db;
CREATE USER keycloak_db_user WITH ENCRYPTED PASSWORD 'JalanCipunagara25!';
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_db_user;
\c keycloak_db
GRANT ALL ON SCHEMA public TO keycloak_db_user;
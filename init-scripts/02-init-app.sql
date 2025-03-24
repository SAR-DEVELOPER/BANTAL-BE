-- Create application database and user
CREATE DATABASE bantal_db;
CREATE USER bantal_db_user WITH ENCRYPTED PASSWORD 'JalanCipunagara25!';
GRANT ALL PRIVILEGES ON DATABASE bantal_db TO bantal_db_user;
\c bantal_db
GRANT ALL ON SCHEMA public TO bantal_db_user;
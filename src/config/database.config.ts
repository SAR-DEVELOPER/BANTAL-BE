import { DataSourceOptions } from 'typeorm';
import { Client } from 'pg'; // Add this import

// First, let's define a function to ensure schema exists
async function ensureSchema() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'JalanCipunagara25!',
    database: process.env.DB_DATABASE || 'bantal_db',
  });

  try {
    await client.connect();
    // Create schemas
    await client.query('CREATE SCHEMA IF NOT EXISTS document_schema');
    // Add other schemas as needed based on your schema.config.ts
  } catch (error) {
    console.error('Error ensuring schema exists:', error);
  } finally {
    await client.end();
  }
}

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'JalanCipunagara25!',
  database: process.env.DB_DATABASE || 'bantal_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  logging: true,
  schema: 'public',
};

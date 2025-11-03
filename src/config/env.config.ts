// src/config/env.config.ts
import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.interface';

export default registerAs<AppConfig>('config', () => ({
  // Server
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database - PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'bantal_db_user',
    password: process.env.DB_PASSWORD || 'JalanCipunagara25!',
    name: process.env.DB_DATABASE || 'bantal_db',
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'bantal_db',
  },

  // Keycloak
  keycloak: {
    host: process.env.KEYCLOAK_HOST || 'localhost',
    port: process.env.KEYCLOAK_PORT
      ? parseInt(process.env.KEYCLOAK_PORT, 10)
      : 8080,
    realm: process.env.KEYCLOAK_REALM || 'sar-realm',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'sar-client',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expirationTime: process.env.JWT_EXPIRATION
      ? parseInt(process.env.JWT_EXPIRATION, 10)
      : 900,
  },

  // API Settings
  api: {
    prefix: process.env.API_PREFIX || 'api/v1',
    rateLimit: {
      ttl: process.env.RATE_LIMIT_TTL
        ? parseInt(process.env.RATE_LIMIT_TTL, 10)
        : 60,
      max: process.env.RATE_LIMIT_MAX
        ? parseInt(process.env.RATE_LIMIT_MAX, 10)
        : 1000,
    },
  },
}));

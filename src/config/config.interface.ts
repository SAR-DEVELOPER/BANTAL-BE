// src/config/config.interface.ts
export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  mongodb: {
    uri: string;
    database: string;
  };
  keycloak: {
    host: string;
    port: number;
    realm: string;
    clientId: string;
    clientSecret: string;
  };
  jwt: {
    secret: string;
    expirationTime: number;
  };
  api: {
    prefix: string;
    rateLimit: {
      ttl: number;
      max: number;
    };
  };
}

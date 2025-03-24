// typeorm.config.ts
import { DataSource } from 'typeorm';
import { databaseConfig } from './src/config/database.config';

export default new DataSource({
  ...databaseConfig,
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});
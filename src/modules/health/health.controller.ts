// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db')
  async checkDatabaseConnection() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.release();

      return {
        status: 'ok',
        db: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        db: 'disconnected',
        message: error.message,
      };
    }
  }
}

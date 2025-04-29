import { Controller, Get } from '@nestjs/common';
import { DevService } from './dev.service';

@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Get('mongo_health')
  async testMongoConnection() {
    try {
      // Create a test document
      const testDoc = await this.devService.createTestDocument();
      
      return {
        status: 'success',
        message: 'MongoDB connection and insertion successful',
        testDocument: testDoc,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'MongoDB test failed',
        error: error.message,
      };
    }
  }
} 
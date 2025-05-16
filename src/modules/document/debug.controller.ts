import { Controller, Get, Logger, Param } from '@nestjs/common';
import { DocumentFactoryService } from './document-factory.service';
import { DocumentTypeService } from './document-type.service';

@Controller('debug/document')
export class DebugController {
  private readonly logger = new Logger(DebugController.name);

  constructor(
    private readonly documentFactoryService: DocumentFactoryService,
    private readonly documentTypeService: DocumentTypeService,
  ) {
    this.logger.log('Debug controller initialized');
  }

  @Get('types')
  async getAllDocumentTypes() {
    this.logger.debug('Getting all document types');
    return await this.documentTypeService.findAll();
  }

  @Get('factory/:type')
  async testFactoryService(@Param('type') type: string) {
    this.logger.debug(`Testing factory service for type: ${type}`);
    try {
      const result = await this.documentFactoryService.getServiceForDocumentType(type);
      this.logger.debug(`Factory service result: ${JSON.stringify({
        serviceType: result.service.constructor.name,
        documentType: result.documentTypeEntity.typeName,
        shortHand: result.documentTypeEntity.shortHand,
      })}`);
      return {
        success: true,
        serviceType: result.service.constructor.name,
        documentType: result.documentTypeEntity.typeName,
      };
    } catch (error) {
      this.logger.error(`Error in factory service: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('log-test')
  logLevelTest() {
    this.logger.error('This is an ERROR level message');
    this.logger.warn('This is a WARN level message');
    this.logger.log('This is a LOG level message');
    this.logger.verbose('This is a VERBOSE level message');
    this.logger.debug('This is a DEBUG level message');
    
    return {
      success: true,
      message: 'Log level test completed - check your logs',
    };
  }
} 
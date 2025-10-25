import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentCreateDto } from './core/dto/document-create.dto';
import { MasterDocumentList } from './core/entities';
import { DocumentFactoryService } from './document-factory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentUnifiedDto } from './core/dto/document-unified.dto';
import { Connection } from 'typeorm';

@Controller('documents/createV2')
export class CreateDocumentController {
  private readonly logger = new Logger(CreateDocumentController.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly documentFactoryService: DocumentFactoryService,
    private readonly connection: Connection
  ) {}

  @Post('master-document')
  async createMasterDocumentV2(
    @Body() requestData: DocumentCreateDto,
  ): Promise<MasterDocumentList> {
    return this.documentService.createMasterDocumentV2(requestData);
  }

  /**
   * Create a new document with integrated type-specific handling
   * @param documentType Document type name or shorthand
   * @param requestData Request data containing both common and type-specific document data
   * @returns Created document
   */
  @Post(':documentType')
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(
    @Param('documentType') documentType: string,
    @Body() requestData: DocumentUnifiedDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MasterDocumentList> {
    // Log the entire request data for debugging
    this.logger.debug(`Full request data: ${JSON.stringify(requestData)}`);
    this.logger.debug(`Document type: ${documentType}`);
    if (file) {
      this.logger.debug(`File received: ${file.originalname} (${file.mimetype})`);
    }

    // Start a transaction to ensure data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug('Transaction started');
      
      // Extract base document data and type-specific data
      const { 
        baseDocument = {}, 
        specificDocument = {},
        ...otherData 
      } = requestData;

      // Combine data if not explicitly separated in the request
      const baseDocumentData = Object.keys(baseDocument).length > 0 
        ? baseDocument as DocumentCreateDto
        : requestData as DocumentCreateDto;
      
      // For specific document data, if specificDocument is provided, use it
      // Otherwise, remove the base document fields from the flat structure and use the rest
      const specificDocumentData = Object.keys(specificDocument).length > 0
        ? specificDocument
        : this.extractSpecificDocumentData(otherData, baseDocumentData);
      
      this.logger.debug(`Base document data: ${JSON.stringify(baseDocumentData)}`);
      this.logger.debug(`Specific document data: ${JSON.stringify(specificDocumentData)}`);
      
      // Get the appropriate service for the document type
      this.logger.debug(`Getting service for document type: ${documentType}`);
      const { service, documentTypeEntity } = await this.documentFactoryService.getServiceForDocumentType(documentType);
      
      this.logger.debug(`Found document type entity: ${JSON.stringify(documentTypeEntity)}`);
      this.logger.debug(`Service found: ${service.constructor.name}`);
      
      // Validate type-specific document data
      this.logger.debug(`Validating specific document data`);
      service.validate(specificDocumentData);
      this.logger.debug(`Validation passed`);
      
      // Upload file to MongoDB if provided
      let mongoDocumentId: string | undefined = undefined;
      if (file) {
        this.logger.debug(`Uploading file to MongoDB: ${file.originalname}`);
        mongoDocumentId = await this.documentService.uploadToMongoDB(
          file.buffer,
          file.mimetype
        );
        this.logger.debug(`Uploaded file to MongoDB, ID: ${mongoDocumentId}`);
      }
      
      // Create master document entry
      this.logger.debug(`Creating master document entry`);
      const masterDocument = await this.documentService.createMasterDocument(
        documentTypeEntity,
        baseDocumentData,
        mongoDocumentId
      );
      
      this.logger.debug(`Created master document with ID: ${masterDocument.id}`);
      
      // Create type-specific document entry with explicit transaction
      try {
        // Pass the master document and correctly process specific document data
        this.logger.debug(`Creating type-specific document for ${documentType}`);
        const typeSpecificDocument = await service.create(masterDocument, specificDocumentData);
        this.logger.debug(`Created type-specific document: ${JSON.stringify(typeSpecificDocument)}`);
        
        // Check if type-specific document was created
        if (!typeSpecificDocument || !typeSpecificDocument.id) {
          throw new Error('Type-specific document was not created correctly');
        }
      } catch (error) {
        this.logger.error(`Failed to create type-specific document: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
        // Rollback the transaction in case of error
        this.logger.debug(`Rolling back transaction due to error`);
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(`Failed to create type-specific document: ${error.message}`);
      }
      
      // Commit the transaction if everything succeeds
      this.logger.debug(`Committing transaction`);
      await queryRunner.commitTransaction();
      this.logger.debug(`Transaction committed successfully`);
      
      return masterDocument;
    } catch (error) {
      this.logger.error(`Error creating document: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      
      // Rollback the transaction in case of error
      if (queryRunner.isTransactionActive) {
        this.logger.debug(`Rolling back transaction`);
        await queryRunner.rollbackTransaction();
        this.logger.debug(`Transaction rolled back`);
      }
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to create document: ${error.message}`);
    } finally {
      // Release the query runner
      this.logger.debug(`Releasing query runner`);
      await queryRunner.release();
      this.logger.debug(`Query runner released`);
    }
  }

  /**
   * Extract specific document data by removing base document fields from a flat structure
   * @param flatData Flat data structure from request
   * @param baseDocumentData Base document data
   * @returns Specific document data
   */
  private extractSpecificDocumentData(flatData: any, baseDocumentData: DocumentCreateDto): any {
    // Define base document fields that should be excluded from specific data
    const baseDocumentFields = new Set([
      'documentNumber',
      'documentExternalNumber',
      'documentName',
      'documentLegalDate',
      'indexNumber',
      'masterDivisionListId',
      'masterCompanyListId',
      'createdById',
      'isActive',
      'file'
    ]);
    
    const specificData: any = {};
    
    // Copy non-base fields to specific data
    for (const key in flatData) {
      if (!baseDocumentFields.has(key)) {
        specificData[key] = flatData[key];
      }
    }
    
    this.logger.debug(`Extracted specific data fields: ${Object.keys(specificData).join(', ')}`);
    return specificData;
  }
} 
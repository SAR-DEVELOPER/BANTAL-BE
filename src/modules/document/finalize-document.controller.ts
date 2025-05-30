import { Controller, Post, Body, Param, UseInterceptors, UploadedFiles, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentFactoryService } from './document-factory.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentListDto } from './core/dto/document-list.dto';
import { Connection } from 'typeorm';
import { DocumentFinalizeDto } from './core/dto/document-finalize.dto';

@Controller('documents/finalizeV2')
export class FinalizeDocumentController {
  private readonly logger = new Logger(FinalizeDocumentController.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly documentFactoryService: DocumentFactoryService,
    private readonly connection: Connection
  ) {}

  /**
   * Finalize a document with type-specific handling
   * @param documentType Document type name or shorthand
   * @param finalizeData Document finalization data
   * @param files Optional files to be attached
   * @returns Finalized document information
   */
  @Post(':documentType')
  @UseInterceptors(FilesInterceptor('files', 2))
  async finalizeDocument(
    @Param('documentType') documentType: string,
    @Body() finalizeData: DocumentFinalizeDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<{ message: string; document: DocumentListDto }> {
    this.logger.debug(`Finalizing document with ID ${finalizeData.id} for document type ${documentType}`);
    if (files) {
      this.logger.debug(`Files received: ${files.length}`);
    }

    // Start a transaction to ensure data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the document first to verify it exists
      const document = await this.documentService.findById(finalizeData.id);
      this.logger.debug(`Found document with ID ${document.id} of type ${document.documentType}`);

      // Get the appropriate service for the document type
      const { service, documentTypeEntity } = await this.documentFactoryService.getServiceForDocumentType(documentType);
      this.logger.debug(`Using service ${service.constructor.name} for document type ${documentType}`);

      // Upload files to MongoDB if provided
      let mongoDocumentIds: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const mongoDocId = await this.documentService.uploadToMongoDB(
            file.buffer,
            file.mimetype
          );
          mongoDocumentIds.push(mongoDocId);
        }
        this.logger.debug(`Uploaded ${mongoDocumentIds.length} files to MongoDB`);
      }

      // Call type-specific finalize method
      if (!service.finalize) {
        throw new BadRequestException(`Document type ${documentType} does not support finalization`);
      }

      // Execute type-specific finalization
      const finalizeResult = await service.finalize(
        finalizeData.id,
        finalizeData.finalizationSummary,
        finalizeData.physicalDelivery,
        mongoDocumentIds
      );
      
      this.logger.debug(`Document ${finalizeData.id} finalized successfully`);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      
      // Get the updated document
      const updatedDocument = await this.documentService.findById(finalizeData.id);
      
      return {
        message: finalizeResult?.message || 'Document has been successfully finalized',
        document: updatedDocument
      };
      
    } catch (error) {
      this.logger.error(`Error finalizing document: ${error.message}`);
      
      // Rollback the transaction in case of error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to finalize document: ${error.message}`);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
} 
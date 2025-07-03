import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { SuratTagihanNonBulanan } from '../core/entities/documentType/surat-tagihan-non-bulanan.entity';
import { MasterDocumentList } from '../core/entities/master-document-list.entity';
import { SuratTagihanNonBulananDto } from '../core/dto/surat-tagihan-non-bulanan.dto';
import { DocumentStatus } from '../core/enums/document-status.enum';

@Injectable()
export class SuratTagihanNonBulananService {
  private readonly logger = new Logger(SuratTagihanNonBulananService.name);

  constructor(
    @InjectRepository(SuratTagihanNonBulanan)
    private suratTagihanNonBulananRepository: Repository<SuratTagihanNonBulanan>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    private connection: Connection,
  ) {
    // Log entity metadata on service initialization
    setTimeout(() => {
      this.logEntityMetadata();
    }, 1000);
  }

  /**
   * Create a new SuratTagihanNonBulanan document
   * @param masterDocument The master document reference
   * @param documentData The specific data for SuratTagihanNonBulanan
   * @returns Created SuratTagihanNonBulanan document
   */
  async create(masterDocument: MasterDocumentList, documentData: SuratTagihanNonBulananDto): Promise<SuratTagihanNonBulanan> {
    this.logger.debug(`Creating SuratTagihanNonBulanan for master document ID: ${masterDocument.id}`);
    this.logger.debug(`Document data: ${JSON.stringify(documentData)}`);
    
    // Validate the document data
    try {
      this.validate(documentData);
      this.logger.debug('Document data validation passed');
    } catch (error) {
      this.logger.error(`Document data validation failed: ${error.message}`);
      throw error;
    }
    
    const { clientId, documentDescription } = documentData;

    try {
      // Use raw SQL approach
      const rawValues = {
        client_id: clientId,
        document_description: documentDescription,
        version_number: 1,
        is_latest: true,
        uploaded_by: masterDocument.createdBy?.id || 'system',
        master_document_list_id: masterDocument.id
      };

      this.logger.debug(`Raw values for insert: ${JSON.stringify(rawValues)}`);

      const insertResult = await this.suratTagihanNonBulananRepository.query(
        `INSERT INTO document_schema.surat_tagihan_non_bulanan (
          client_id, 
          document_description, 
          version_number, 
          is_latest, 
          uploaded_by, 
          master_document_list_id,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        ) RETURNING id`,
        [
          clientId,
          documentDescription,
          1,
          true,
          masterDocument.createdBy?.id || 'system',
          masterDocument.id
        ]
      );

      this.logger.debug(`Direct SQL insert result: ${JSON.stringify(insertResult)}`);
      
      if (insertResult && insertResult.length > 0) {
        const insertedId = insertResult[0].id;
        
        // Fetch the freshly created document
        const createdDocument = await this.suratTagihanNonBulananRepository.findOne({
          where: { id: insertedId },
          relations: ['masterDocument']
        });
        
        if (createdDocument) {
          this.logger.debug(`Successfully created and retrieved SuratTagihanNonBulanan with ID: ${createdDocument.id}`);
          return createdDocument;
        } else {
          throw new Error(`Failed to retrieve created document with ID: ${insertedId}`);
        }
      } else {
        throw new Error('Insert operation did not return an ID');
      }
    } catch (error) {
      this.logger.error(`Error creating SuratTagihanNonBulanan: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Custom validation for SuratTagihanNonBulanan document type
   * @param documentData The document data to validate
   */
  validate(documentData: any): void {
    this.logger.debug(`Validating document data: ${JSON.stringify(documentData)}`);
    
    if (!documentData.clientId) {
      throw new BadRequestException('Client ID is required for SuratTagihanNonBulanan');
    }
    
    if (!documentData.documentDescription) {
      throw new BadRequestException('Document description is required for SuratTagihanNonBulanan');
    }
    
    this.logger.debug('All required fields are present');
  }

  /**
   * Finalize a Surat Tagihan Non Bulanan document
   * @param id Document UUID
   * @param finalizationSummary Summary of the finalization
   * @param physicalDelivery Whether physical delivery is required
   * @param mongoDocumentIds Optional MongoDB document IDs for attached files
   * @returns Finalization result
   */
  async finalize(
    id: string,
    finalizationSummary: string,
    physicalDelivery: boolean,
    mongoDocumentIds: string[] = []
  ): Promise<{ message: string }> {
    this.logger.debug(`Finalizing Surat Tagihan Non Bulanan document with ID ${id}`);

    // Find the master document
    const masterDocument = await this.suratTagihanNonBulananRepository.findOne({
      where: { masterDocumentId: id },
      relations: ['masterDocument'],
    });

    if (!masterDocument) {
      throw new NotFoundException(`Surat Tagihan Non Bulanan data for document with ID "${id}" not found`);
    }

    // Start a transaction for data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update master document status
      masterDocument.masterDocument.documentStatus = DocumentStatus.FINALIZED;
      await queryRunner.manager.save(masterDocument.masterDocument);

      // Log the finalization details
      this.logger.debug(`Finalization summary: ${finalizationSummary}`);
      this.logger.debug(`Physical delivery: ${physicalDelivery}`);
      if (mongoDocumentIds.length > 0) {
        this.logger.debug(`Attached document IDs: ${mongoDocumentIds.join(', ')}`);
      }

      // TagNB-specific finalization logic goes here
      // For example, sending notifications, updating related records, etc.
      
      // Log the successful finalization
      this.logger.debug(`Surat Tagihan Non Bulanan document ${id} finalized successfully`);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Surat Tagihan Non Bulanan document has been successfully finalized'
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error finalizing Surat Tagihan Non Bulanan document: ${error.message}`);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private logEntityMetadata() {
    // Log entity metadata on service initialization
    const metadata = this.suratTagihanNonBulananRepository.metadata;
    this.logger.log(`SuratTagihanNonBulanan entity metadata initialized:`);
    this.logger.log(`Table name: ${metadata.tableName}`);
    this.logger.log(`Schema: ${metadata.schema}`);
    this.logger.log(`Columns: ${metadata.columns.map(col => col.propertyName).join(', ')}`);
  }
} 
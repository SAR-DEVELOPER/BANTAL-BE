import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Connection } from 'typeorm';
import { SuratPenawaran } from '../core/entities/documentType/surat-penawaran.entity';
import { MasterDocumentList } from '../core/entities/master-document-list.entity';
import { SuratPenawaranDto } from '../core/dto/surat-penawaran.dto';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { DocumentStatus } from '../core/enums/document-status.enum';

@Injectable()
export class SuratPenawaranService {
  private readonly logger = new Logger(SuratPenawaranService.name);

  constructor(
    @InjectRepository(SuratPenawaran)
    private suratPenawaranRepository: Repository<SuratPenawaran>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private connection: Connection,
  ) {
    // Log entity metadata on service initialization
    setTimeout(() => {
      this.logEntityMetadata();
    }, 1000);
  }

  /**
   * Create a new SuratPenawaran document
   * @param masterDocument The master document reference
   * @param documentData The specific data for SuratPenawaran
   * @returns Created SuratPenawaran document
   */
  async create(masterDocument: MasterDocumentList, documentData: SuratPenawaranDto): Promise<SuratPenawaran> {
    this.logger.debug(`Creating SuratPenawaran for master document ID: ${masterDocument.id}`);
    this.logger.debug(`Document data: ${JSON.stringify(documentData)}`);
    
    // Validate the document data
    try {
      this.validate(documentData);
      this.logger.debug('Document data validation passed');
    } catch (error) {
      this.logger.error(`Document data validation failed: ${error.message}`);
      throw error;
    }
    
    const { clientId, documentDescription, offeredService, personInChargeId } = documentData;

    // Create a query builder to debug the insert operation
    try {
      // Create new document with explicit masterDocumentId
      const newDocument = new SuratPenawaran();
      newDocument.masterDocument = masterDocument;
      newDocument.masterDocumentId = masterDocument.id; // Set this explicitly
      newDocument.clientId = clientId;
      newDocument.documentDescription = documentDescription;
      newDocument.offeredService = offeredService;
      newDocument.versionNumber = 1;
      newDocument.isLatest = true;
      newDocument.uploadedBy = masterDocument.createdBy?.id || 'system';

      this.logger.debug(`New SuratPenawaran object created: ${JSON.stringify(newDocument)}`);

      // Set person in charge if provided
      if (personInChargeId) {
        try {
          const personInCharge = await this.identityRepository.findOne({ 
            where: { id: personInChargeId } 
          });
          
          if (!personInCharge) {
            const error = new NotFoundException(`Person in charge with ID "${personInChargeId}" not found`);
            this.logger.error(error.message);
            throw error;
          }
          
          newDocument.personInCharge = personInCharge;
          this.logger.debug(`Person in charge set to: ${personInCharge.name}`);
        } catch (error) {
          this.logger.error(`Error setting person in charge: ${error.message}`);
          throw error;
        }
      }

      // Try direct insert with query builder
      try {
        // Use raw SQL approach
        const rawValues = {
          client_id: clientId,
          document_description: documentDescription,
          offered_service: offeredService,
          version_number: 1,
          is_latest: true,
          uploaded_by: masterDocument.createdBy?.id || 'system',
          master_document_list_id: masterDocument.id,
          person_in_charge: personInChargeId
        };

        this.logger.debug(`Raw values for insert: ${JSON.stringify(rawValues)}`);

        const insertResult = await this.suratPenawaranRepository.query(
          `INSERT INTO document_schema.surat_penawaran (
            client_id, 
            document_description, 
            offered_service, 
            version_number, 
            is_latest, 
            uploaded_by, 
            master_document_list_id,
            person_in_charge,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
          ) RETURNING id`,
          [
            clientId,
            documentDescription,
            offeredService,
            1,
            true,
            masterDocument.createdBy?.id || 'system',
            masterDocument.id,
            personInChargeId
          ]
        );

        this.logger.debug(`Direct SQL insert result: ${JSON.stringify(insertResult)}`);
        
        if (insertResult && insertResult.length > 0) {
          const insertedId = insertResult[0].id;
          
          // Fetch the freshly created document
          const createdDocument = await this.suratPenawaranRepository.findOne({
            where: { id: insertedId },
            relations: ['masterDocument', 'personInCharge']
          });
          
          if (createdDocument) {
            this.logger.debug(`Successfully created and retrieved SuratPenawaran with ID: ${createdDocument.id}`);
            return createdDocument;
          } else {
            throw new Error(`Failed to retrieve created document with ID: ${insertedId}`);
          }
        } else {
          throw new Error('Insert operation did not return an ID');
        }
      } catch (error) {
        this.logger.error(`Error with direct SQL insert: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Error creating SuratPenawaran: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Custom validation for SuratPenawaran document type
   * @param documentData The document data to validate
   */
  validate(documentData: any): void {
    this.logger.debug(`Validating document data: ${JSON.stringify(documentData)}`);
    
    if (!documentData.clientId) {
      throw new BadRequestException('Client ID is required for SuratPenawaran');
    }
    
    if (!documentData.documentDescription) {
      throw new BadRequestException('Document description is required for SuratPenawaran');
    }
    
    if (!documentData.offeredService) {
      throw new BadRequestException('Offered service is required for SuratPenawaran');
    }
    
    if (!documentData.personInChargeId) {
      throw new BadRequestException('Person in charge ID is required for SuratPenawaran');
    }
    
    this.logger.debug('All required fields are present');
  }

  /**
   * Finalize a Surat Penawaran document
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
    this.logger.debug(`Finalizing Surat Penawaran document with ID ${id}`);

    // Find the master document
    const masterDocument = await this.suratPenawaranRepository.findOne({
      where: { masterDocumentId: id },
      relations: ['masterDocument', 'personInCharge'],
    });

    if (!masterDocument) {
      throw new NotFoundException(`Surat Penawaran data for document with ID "${id}" not found`);
    }

    // Start a transaction for data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update master document status
      masterDocument.masterDocument.documentStatus = DocumentStatus.FINALIZED;
      await queryRunner.manager.save(masterDocument.masterDocument);

      // For SP, handle specific finalization logic
      // Log the finalization details
      this.logger.debug(`Finalization summary: ${finalizationSummary}`);
      this.logger.debug(`Physical delivery: ${physicalDelivery}`);
      if (mongoDocumentIds.length > 0) {
        this.logger.debug(`Attached document IDs: ${mongoDocumentIds.join(', ')}`);
      }

      // SP-specific finalization logic goes here
      // For example, sending notifications, updating related records, etc.
      
      // Log the successful finalization
      this.logger.debug(`Surat Penawaran document ${id} finalized successfully`);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Surat Penawaran document has been successfully finalized'
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error finalizing Surat Penawaran document: ${error.message}`);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private logEntityMetadata() {
    // Log entity metadata on service initialization
    const metadata = this.suratPenawaranRepository.metadata;
    this.logger.log(`SuratPenawaran entity metadata initialized:`);
    this.logger.log(`Table name: ${metadata.tableName}`);
    this.logger.log(`Schema: ${metadata.schema}`);
    this.logger.log(`Columns: ${metadata.columns.map(col => col.propertyName).join(', ')}`);
  }
} 
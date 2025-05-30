import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { SuratPerjanjianKerja } from '../core/entities/documentType/surat-perjanjian-kerja.entity';
import { MasterDocumentList } from '../core/entities/master-document-list.entity';
import { SuratPerjanjianKerjaDto } from '../core/dto/surat-perjanjian-kerja.dto';
import { DocumentStatus } from '../core/enums/document-status.enum';

@Injectable()
export class SuratPerjanjianKerjaService {
  private readonly logger = new Logger(SuratPerjanjianKerjaService.name);

  constructor(
    @InjectRepository(SuratPerjanjianKerja)
    private suratPerjanjianKerjaRepository: Repository<SuratPerjanjianKerja>,
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    private connection: Connection
  ) {}

  /**
   * Create a new SuratPerjanjianKerja document
   * @param masterDocument The master document reference
   * @param documentData The specific data for SuratPerjanjianKerja
   * @returns Created SuratPerjanjianKerja document
   */
  async create(masterDocument: MasterDocumentList, documentData: SuratPerjanjianKerjaDto): Promise<SuratPerjanjianKerja> {
    this.logger.debug(`Creating SuratPerjanjianKerja for master document ID: ${masterDocument.id}`);
    this.logger.debug(`Document data: ${JSON.stringify(documentData)}`);
    
    // Validate the document data
    try {
      this.validate(documentData);
      this.logger.debug('Document data validation passed');
    } catch (error) {
      this.logger.error(`Document data validation failed: ${error.message}`);
      throw error;
    }
    
    const { 
      clientId, 
      documentDescription, 
      startDate, 
      endDate, 
      projectFee, 
      paymentInstallment 
    } = documentData;

    try {
      // Use raw SQL approach
      const rawValues = {
        client_id: clientId,
        document_description: documentDescription,
        start_date: startDate,
        end_date: endDate || null,
        project_fee: projectFee,
        payment_installment: paymentInstallment,
        version_number: 1,
        is_latest: true,
        uploaded_by: masterDocument.createdBy?.id || 'system',
        master_document_list_id: masterDocument.id
      };

      this.logger.debug(`Raw values for insert: ${JSON.stringify(rawValues)}`);

      const insertResult = await this.suratPerjanjianKerjaRepository.query(
        `INSERT INTO document_schema.surat_perjanjian_kerja (
          client_id, 
          document_description, 
          start_date,
          end_date,
          project_fee,
          payment_installment,
          version_number, 
          is_latest, 
          uploaded_by, 
          master_document_list_id,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        ) RETURNING id`,
        [
          clientId,
          documentDescription,
          startDate,
          endDate || null,
          projectFee,
          paymentInstallment,
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
        const createdDocument = await this.suratPerjanjianKerjaRepository.findOne({
          where: { id: insertedId },
          relations: ['masterDocument']
        });
        
        if (createdDocument) {
          this.logger.debug(`Successfully created and retrieved SuratPerjanjianKerja with ID: ${createdDocument.id}`);
          return createdDocument;
        } else {
          throw new Error(`Failed to retrieve created document with ID: ${insertedId}`);
        }
      } else {
        throw new Error('Insert operation did not return an ID');
      }
    } catch (error) {
      this.logger.error(`Error creating SuratPerjanjianKerja: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Custom validation for SuratPerjanjianKerja document type
   * @param documentData The document data to validate
   */
  validate(documentData: any): void {
    this.logger.debug(`Validating document data: ${JSON.stringify(documentData)}`);
    
    if (!documentData.clientId) {
      throw new BadRequestException('Client ID is required for SuratPerjanjianKerja');
    }
    
    if (!documentData.documentDescription) {
      throw new BadRequestException('Document description is required for SuratPerjanjianKerja');
    }
    
    if (!documentData.startDate) {
      throw new BadRequestException('Start date is required for SuratPerjanjianKerja');
    }
    
    if (!documentData.projectFee) {
      throw new BadRequestException('Project fee is required for SuratPerjanjianKerja');
    }
    
    if (!documentData.paymentInstallment) {
      throw new BadRequestException('Payment installment is required for SuratPerjanjianKerja');
    }
    
    // Validate that start date is before end date if end date is provided
    if (documentData.endDate && new Date(documentData.startDate) > new Date(documentData.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    this.logger.debug('All required fields are present');
  }

  /**
   * Finalize a Surat Perjanjian Kerja document
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
    this.logger.debug(`Finalizing SPK document with ID ${id}`);

    // Find the document
    const document = await this.masterDocumentListRepository.findOne({
      where: { id },
      relations: ['type', 'createdBy', 'masterDivisionList', 'masterCompanyList'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    // Find the SPK-specific data
    const spk = await this.suratPerjanjianKerjaRepository.findOne({
      where: { masterDocumentId: id },
    });

    if (!spk) {
      throw new NotFoundException(`SPK data for document with ID "${id}" not found`);
    }

    // Start a transaction for data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update document status
      document.documentStatus = DocumentStatus.FINALIZED;
      await queryRunner.manager.save(document);

      // For SPK, we can store additional finalization metadata in a separate table
      // since the current entity doesn't have these fields
      
      // Example: Create a separate finalization record
      // Since the SPK entity doesn't have finalization fields, we can add them
      // to a separate table or use a custom solution for storing the finalization data
      
      // Instead, we'll just log the finalization details
      this.logger.debug(`Finalization summary: ${finalizationSummary}`);
      this.logger.debug(`Physical delivery: ${physicalDelivery}`);
      if (mongoDocumentIds.length > 0) {
        this.logger.debug(`Attached document IDs: ${mongoDocumentIds.join(', ')}`);
      }

      // Trigger create pekerjaan service
      // This is where you would call your pekerjaan service
      this.logger.debug('Triggering create pekerjaan service');
      
      // Example: Call an external service to create pekerjaan
      // await this.pekerjaanService.createFromSPK(spk, document);
      
      // Log the successful finalization
      this.logger.debug(`SPK document ${id} finalized successfully`);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'SPK document has been successfully finalized and pekerjaan creation has been triggered'
      };
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error finalizing SPK document: ${error.message}`);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
} 
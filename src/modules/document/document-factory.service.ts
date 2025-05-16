import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SuratPenawaranService } from './document-type/surat-penawaran.service';
import { SuratPerjanjianKerjaService } from './document-type/surat-perjanjian-kerja.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentType } from './core/entities';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentFactoryService {
  private readonly documentTypeServices: Map<string, any>;
  private readonly logger = new Logger(DocumentFactoryService.name);

  constructor(
    private readonly suratPenawaranService: SuratPenawaranService,
    private readonly suratPerjanjianKerjaService: SuratPerjanjianKerjaService,
    @InjectRepository(DocumentType)
    private documentTypeRepository: Repository<DocumentType>,
  ) {
    // Initialize the map of document type services
    this.documentTypeServices = new Map<string, any>([
      ['SP', this.suratPenawaranService], // ShortHand for SuratPenawaran
      ['Pwn', this.suratPenawaranService], // Alternative ShortHand for SuratPenawaran
      ['SPK', this.suratPerjanjianKerjaService], // ShortHand for SuratPerjanjianKerja
    ]);
    
    this.logger.log('DocumentFactoryService initialized with services:');
    this.logger.log(`SP/Pwn -> ${this.suratPenawaranService.constructor.name}`);
    this.logger.log(`SPK -> ${this.suratPerjanjianKerjaService.constructor.name}`);
    
    // Query all document types on startup
    setTimeout(async () => {
      try {
        const allTypes = await this.documentTypeRepository.find();
        this.logger.log(`Found ${allTypes.length} document types in the database:`);
        allTypes.forEach(type => {
          this.logger.log(`- ${type.typeName} (${type.shortHand}) [ID: ${type.id}]`);
          // Register all document types 
          const service = this.getServiceForShorthand(type.shortHand);
          if (service) {
            this.logger.log(`  Mapped to service: ${service.constructor.name}`);
          } else {
            this.logger.warn(`  No service mapping found!`);
          }
        });
      } catch (error) {
        this.logger.error(`Error fetching document types: ${error.message}`);
      }
    }, 1000);
  }

  /**
   * Get a service by shorthand
   */
  private getServiceForShorthand(shorthand: string): any {
    return this.documentTypeServices.get(shorthand);
  }

  /**
   * Get the appropriate service for a document type
   * @param documentType The document type (shorthand or name)
   * @returns The service for the document type
   */
  async getServiceForDocumentType(documentType: string): Promise<any> {
    this.logger.debug(`Finding service for document type: ${documentType}`);
    
    // Find the document type in the database
    const type = await this.documentTypeRepository.findOne({
      where: [
        { typeName: documentType },
        { shortHand: documentType }
      ]
    });

    if (!type) {
      this.logger.error(`Document type "${documentType}" not found in database`);
      throw new NotFoundException(`Document type "${documentType}" not found`);
    }
    
    this.logger.debug(`Found document type: ${type.typeName} (${type.shortHand})`);

    // Try to get service by shortHand first
    let service = this.documentTypeServices.get(type.shortHand);
    
    // If not found by shortHand, try by typeName
    if (!service) {
      service = this.documentTypeServices.get(type.typeName);
    }
    
    if (!service) {
      // Log registered services for debugging
      const registeredTypes = Array.from(this.documentTypeServices.keys()).join(', ');
      this.logger.error(`No service registered for document type "${documentType}" (${type.shortHand}). Registered types: ${registeredTypes}`);
      throw new NotFoundException(`No service registered for document type "${documentType}" (${type.shortHand})`);
    }
    
    this.logger.debug(`Found service: ${service.constructor.name}`);

    return {
      service,
      documentTypeEntity: type
    };
  }

  /**
   * Validate document data for a specific document type
   * @param documentType The document type (shorthand or name)
   * @param data The document data to validate
   * @throws Error if validation fails
   */
  async validateDocumentData(documentType: string, data: any): Promise<void> {
    const { service } = await this.getServiceForDocumentType(documentType);
    service.validate(data);
  }
} 
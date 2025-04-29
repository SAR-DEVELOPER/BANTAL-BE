import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType, MasterDocumentList } from './core/entities';
import { DocumentStatus } from './core/enums/document-status.enum';
import { DocumentCreateDto } from './core/dto/document-create.dto';
import { DocumentListDto } from './core/dto/document-list.dto';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(MasterDocumentList)
    private masterDocumentListRepository: Repository<MasterDocumentList>,
    
    @InjectRepository(DocumentType)
    private documentTypeRepository: Repository<DocumentType>,
    
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    
    @InjectRepository(MasterDivisionList)
    private masterDivisionListRepository: Repository<MasterDivisionList>,
    
    @InjectRepository(MasterCompanyList)
    private masterCompanyListRepository: Repository<MasterCompanyList>
  ) {}

  getHello(): any {
    return { message: 'Hello from DocumentService!' };
  }

  /**
   * Get all documents
   * @returns List of all documents with related entity data
   */
  async findAll(): Promise<DocumentListDto[]> {
    const documents = await this.masterDocumentListRepository.find({
      relations: ['type', 'createdBy', 'masterDivisionList', 'masterCompanyList'],
    });

    return documents.map(doc => {
      const documentDto: DocumentListDto = {
        id: doc.id,
        documentNumber: doc.documentNumber,
        documentExternalNumber: doc.documentExternalNumber,
        documentName: doc.documentName,
        documentLegalDate: doc.documentLegalDate,
        documentStatus: doc.documentStatus,
        indexNumber: doc.indexNumber,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      };

      // Add related entity data if available
      if (doc.type) {
        documentDto.documentType = doc.type.typeName;
        documentDto.documentTypeId = doc.type.id.toString();
      }

      if (doc.createdBy) {
        documentDto.createdById = doc.createdBy.id;
        documentDto.createdByName = doc.createdBy.name;
      }

      if (doc.masterDivisionList) {
        documentDto.divisionId = doc.masterDivisionList.id;
        documentDto.divisionName = doc.masterDivisionList.divisionName;
      }

      if (doc.masterCompanyList) {
        documentDto.companyId = doc.masterCompanyList.id;
        documentDto.companyName = doc.masterCompanyList.companyName;
      }

      return documentDto;
    });
  }

  /**
   * Find a document by ID
   * @param id Document UUID
   * @returns Document with the specified ID and its related entity data
   * @throws NotFoundException if document with the specified ID is not found
   */
  async findById(id: string): Promise<DocumentListDto> {
    const document = await this.masterDocumentListRepository.findOne({
      where: { id },
      relations: ['type', 'createdBy', 'masterDivisionList', 'masterCompanyList'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    const documentDto: DocumentListDto = {
      id: document.id,
      documentNumber: document.documentNumber,
      documentExternalNumber: document.documentExternalNumber,
      documentName: document.documentName,
      documentLegalDate: document.documentLegalDate,
      documentStatus: document.documentStatus,
      indexNumber: document.indexNumber,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };

    // Add related entity data if available
    if (document.type) {
      documentDto.documentType = document.type.typeName;
      documentDto.documentTypeId = document.type.id.toString();
    }

    if (document.createdBy) {
      documentDto.createdById = document.createdBy.id;
      documentDto.createdByName = document.createdBy.name;
    }

    if (document.masterDivisionList) {
      documentDto.divisionId = document.masterDivisionList.id;
      documentDto.divisionName = document.masterDivisionList.divisionName;
    }

    if (document.masterCompanyList) {
      documentDto.companyId = document.masterCompanyList.id;
      documentDto.companyName = document.masterCompanyList.companyName;
    }

    return documentDto;
  }

  async createDocument(documentType: string, documentData: DocumentCreateDto): Promise<MasterDocumentList> {
    // Log the document type and data
    console.log(documentType, documentData);  
    // Find the document type
    const type = await this.documentTypeRepository.findOne({ 
      where: [
        { typeName: documentType },
        { shortHand: documentType }
      ]
    });

    if (!type) {
      throw new NotFoundException(`Document type "${documentType}" not found`);
    }

    // Create a new document
    const { 
      createdById, 
      masterDivisionListId, 
      masterCompanyListId, 
      ...documentFields 
    } = documentData;

    // Create the document entity with explicit property assignment
    const newDocument = new MasterDocumentList();
    Object.assign(newDocument, {
      ...documentFields,
      documentStatus: DocumentStatus.DRAFT
    });
    
    // Set the document type (required)
    newDocument.type = type;
    
    // Set relations if provided
    if (createdById) {
      const foundCreatedBy = await this.identityRepository.findOne({ 
        where: { id: createdById }
      });
      if (!foundCreatedBy) {
        throw new NotFoundException(`User with ID "${createdById}" not found`);
      }
      newDocument.createdBy = foundCreatedBy;
    }

    if (masterDivisionListId) {
      const foundDivision = await this.masterDivisionListRepository.findOne({ 
        where: { id: masterDivisionListId }
      });
      if (!foundDivision) {
        throw new NotFoundException(`Division with ID "${masterDivisionListId}" not found`);
      }
      newDocument.masterDivisionList = foundDivision;
    }

    if (masterCompanyListId) {
      const foundCompany = await this.masterCompanyListRepository.findOne({ 
        where: { id: masterCompanyListId }
      });
      if (!foundCompany) {
        throw new NotFoundException(`Company with ID "${masterCompanyListId}" not found`);
      }
      newDocument.masterCompanyList = foundCompany;
    }

    // Save and return the document
    const savedDocument = await this.masterDocumentListRepository.save(newDocument);
    return savedDocument;
  }

  /**
   * Get the latest index number for a document type
   * @param shortHand The short hand of the document type
   * @param month Optional month (1-12) to filter by
   * @param year Optional year to filter by
   * @returns Latest index number for the document type
   */
  async getLatestIndexNumber(shortHand: string, month?: number, year?: number): Promise<number> {
    // Find the document type by shortHand
    const documentType = await this.documentTypeRepository.findOne({
      where: { shortHand }
    });

    if (!documentType) {
      throw new NotFoundException(`Document type with shortHand "${shortHand}" not found`);
    }

    // Build query to get the latest index number
    const queryBuilder = this.masterDocumentListRepository
      .createQueryBuilder('document')
      .where('document.document_type_id = :typeId', { typeId: documentType.id })
      .orderBy('document.index_number', 'DESC')
      .limit(1);

    // Add month filter if provided
    if (month !== undefined) {
      if (month < 1 || month > 12) {
        throw new BadRequestException('Month must be between 1 and 12');
      }
      queryBuilder.andWhere('EXTRACT(MONTH FROM document.created_at) = :month', { month });
    }

    // Add year filter if provided
    if (year !== undefined) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM document.created_at) = :year', { year });
    }

    // Get the document with the highest index number
    const latestDocument = await queryBuilder.getOne();

    // Return 0 if no documents found, otherwise return the index number
    return latestDocument ? latestDocument.indexNumber : 0;
  }
}

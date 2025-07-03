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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuratPenawaran } from './core/entities/documentType/surat-penawaran.entity';
import { SuratPerjanjianKerja } from './core/entities/documentType/surat-perjanjian-kerja.entity';

interface MongoDocument {
  versions: Array<{
    versionNumber: number;
    content: Buffer;
    mimeType: string;
    uploadedAt: Date;
  }>;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(MasterDocumentList)
    private readonly masterDocumentListRepository: Repository<MasterDocumentList>,
    
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    
    @InjectRepository(MasterDivisionList)
    private readonly masterDivisionListRepository: Repository<MasterDivisionList>,
    
    @InjectRepository(MasterCompanyList)
    private readonly masterCompanyListRepository: Repository<MasterCompanyList>,
    
    @InjectRepository(SuratPenawaran)
    private readonly suratPenawaranRepository: Repository<SuratPenawaran>,
    
    @InjectRepository(SuratPerjanjianKerja)
    private readonly suratPerjanjianKerjaRepository: Repository<SuratPerjanjianKerja>,
    
    @InjectModel('Document')
    private readonly documentModel: Model<MongoDocument>
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
        // Basic document info
        id: doc.id,
        documentNumber: doc.documentNumber,
        documentExternalNumber: doc.documentExternalNumber,
        documentName: doc.documentName,
        documentLegalDate: doc.documentLegalDate,
        documentStatus: doc.documentStatus,
        indexNumber: doc.indexNumber,
        mongoDocumentId: doc.mongoDocumentId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,

        // Type info
        documentType: doc.type?.typeName,
        documentTypeId: doc.type?.id?.toString(),
        documentTypeShortHand: doc.type?.shortHand,

        // Related entities
        createdById: doc.createdBy?.id,
        createdByName: doc.createdBy?.name,
        createdByEmail: doc.createdBy?.email,

        divisionId: doc.masterDivisionList?.id,
        divisionName: doc.masterDivisionList?.divisionName,
        divisionCode: doc.masterDivisionList?.divisionCode,

        companyId: doc.masterCompanyList?.id,
        companyName: doc.masterCompanyList?.companyName,
        companyCode: doc.masterCompanyList?.companyCode,
      };

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
      // Basic document info
      id: document.id,
      documentNumber: document.documentNumber,
      documentExternalNumber: document.documentExternalNumber,
      documentName: document.documentName,
      documentLegalDate: document.documentLegalDate,
      documentStatus: document.documentStatus,
      indexNumber: document.indexNumber,
      mongoDocumentId: document.mongoDocumentId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,

      // Type info
      documentType: document.type?.typeName,
      documentTypeId: document.type?.id?.toString(),
      documentTypeShortHand: document.type?.shortHand,

      // Related entities
      createdById: document.createdBy?.id,
      createdByName: document.createdBy?.name,
      createdByEmail: document.createdBy?.email,

      divisionId: document.masterDivisionList?.id,
      divisionName: document.masterDivisionList?.divisionName,
      divisionCode: document.masterDivisionList?.divisionCode,

      companyId: document.masterCompanyList?.id,
      companyName: document.masterCompanyList?.companyName,
      companyCode: document.masterCompanyList?.companyCode,
    };

    // If this is a SuratPenawaran, add the specific fields
    if (document.type?.shortHand === 'Pwn' || document.type?.shortHand === 'SP') {
      const suratPenawaran = await this.suratPenawaranRepository.findOne({
        where: { masterDocumentId: document.id },
        relations: ['personInCharge'],
      });

      if (suratPenawaran) {
        documentDto.clientId = suratPenawaran.clientId;
        documentDto.documentDescription = suratPenawaran.documentDescription;
        documentDto.offeredService = suratPenawaran.offeredService;
        documentDto.personInChargeId = suratPenawaran.personInChargeId;
        documentDto.personInChargeName = suratPenawaran.personInCharge?.name;
        documentDto.versionNumber = suratPenawaran.versionNumber;
        documentDto.isLatest = suratPenawaran.isLatest;
        documentDto.uploadedBy = suratPenawaran.uploadedBy;
      }
    }

    // If this is a SuratPerjanjianKerja, add the specific fields
    if (document.type?.shortHand === 'SPK') {
      const suratPerjanjianKerja = await this.suratPerjanjianKerjaRepository.findOne({
        where: { masterDocumentId: document.id },
      });

      if (suratPerjanjianKerja) {
        documentDto.clientId = suratPerjanjianKerja.clientId;
        documentDto.documentDescription = suratPerjanjianKerja.documentDescription;
        documentDto.startDate = suratPerjanjianKerja.startDate;
        documentDto.endDate = suratPerjanjianKerja.endDate ?? undefined;
        documentDto.projectFee = suratPerjanjianKerja.projectFee;
        documentDto.paymentInstallment = suratPerjanjianKerja.paymentInstallment;
        documentDto.isIncludeVAT = suratPerjanjianKerja.isIncludeVAT;
        documentDto.versionNumber = suratPerjanjianKerja.versionNumber;
        documentDto.isLatest = suratPerjanjianKerja.isLatest;
        documentDto.uploadedBy = suratPerjanjianKerja.uploadedBy;
      }
    }

    return documentDto;
  }

  /**
   * Upload document to MongoDB
   * @param file File to upload
   * @returns MongoDB document ID
   */
  async uploadToMongoDB(file: Buffer, mimeType: string): Promise<string> {
    const mongoDoc = new this.documentModel({
      versions: [{
        versionNumber: 1,
        content: file,
        mimeType: mimeType,
        uploadedAt: new Date(),
      }],
    });
    
    const savedDoc = await mongoDoc.save();
    return savedDoc._id.toString();
  }

  /**
   * Create master document entry
   * @param documentTypeEntity Document type
   * @param documentData Document data
   * @param mongoDocumentId MongoDB document ID (optional)
   * @returns Created master document
   */
  async createMasterDocument(
    documentTypeEntity: DocumentType, 
    documentData: DocumentCreateDto, 
    mongoDocumentId?: string
  ): Promise<MasterDocumentList> {
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
      documentStatus: DocumentStatus.DRAFT,
      mongoDocumentId
    });
    
    // Set the document type (required)
    newDocument.type = documentTypeEntity;
    
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
    return this.masterDocumentListRepository.save(newDocument);
  }

  /**
   * Create a document using the legacy approach (deprecated but kept for backward compatibility)
   */
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
      file,
      ...documentFields 
    } = documentData;

    // Save file to MongoDB if provided
    let mongoDocumentId: string | null = null;
    if (file) {
      const mongoDoc = new this.documentModel({
        versions: [{
          versionNumber: 1,
          content: file.buffer,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        }],
      });
      const savedDoc = await mongoDoc.save();
      mongoDocumentId = savedDoc._id.toString();
    }

    // Create the document entity with explicit property assignment
    const newDocument = new MasterDocumentList();
    Object.assign(newDocument, {
      ...documentFields,
      documentStatus: DocumentStatus.DRAFT,
      mongoDocumentId
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
   * @param companyId Optional company ID to filter by
   * @returns Latest index number for the document type
   */
  async getLatestIndexNumber(shortHand: string, month?: number, year?: number, companyId?: string): Promise<number> {
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

    // Add company filter if provided
    if (companyId !== undefined) {
      queryBuilder.andWhere('document.master_company_list_id = :companyId', { companyId });
    }

    // Get the document with the highest index number
    const latestDocument = await queryBuilder.getOne();

    // Return 0 if no documents found, otherwise return the index number
    return latestDocument ? latestDocument.indexNumber : 0;
  }

  /**
   * Get file extension from MIME type
   * @param mimeType The MIME type of the file
   * @returns The appropriate file extension
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'text/plain': '.txt',
      'text/csv': '.csv',
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar',
    };

    return mimeToExt[mimeType] || '';
  }

  /**
   * Get document content from MongoDB
   * @param id Document UUID
   * @returns Document content, mime type, and filename
   * @throws NotFoundException if document or its content is not found
   */
  async getDocumentContent(id: string): Promise<{ content: Buffer; mimeType: string; filename: string }> {
    // Get document metadata from PostgreSQL
    const document = await this.masterDocumentListRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    if (!document.mongoDocumentId) {
      throw new NotFoundException(`Document with ID "${id}" has no associated content`);
    }

    // Get document content from MongoDB
    const mongoDocument = await this.documentModel.findById(document.mongoDocumentId);
    if (!mongoDocument || mongoDocument.versions.length === 0) {
      throw new NotFoundException(`Document content not found for ID "${id}"`);
    }

    // Get the latest version
    const latestVersion = mongoDocument.versions[mongoDocument.versions.length - 1];

    // Get the file extension based on MIME type
    const extension = this.getFileExtension(latestVersion.mimeType);
    
    // Add extension to filename if it doesn't already have one
    let filename = document.documentName;
    if (!filename.includes('.')) {
      filename = `${filename}${extension}`;
    }

    return {
      content: latestVersion.content,
      mimeType: latestVersion.mimeType,
      filename: filename,
    };
  }

  /**
   * Finalize a document
   * @param id Document UUID
   * @param finalizationSummary Summary of the finalization
   * @param physicalDelivery Whether physical delivery is required
   * @param files Optional files to be attached
   * @returns Finalized document information
   * @throws NotFoundException if document with the specified ID is not found
   */
  async finalizeDocument(
    id: string,
    finalizationSummary: string,
    physicalDelivery: boolean,
    files?: Express.Multer.File[]
  ): Promise<{ message: string; document: DocumentListDto }> {
    // Find the document
    const document = await this.masterDocumentListRepository.findOne({
      where: { id },
      relations: ['type', 'createdBy', 'masterDivisionList', 'masterCompanyList'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    // Upload files to MongoDB if provided
    let mongoDocumentIds: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const mongoDoc = new this.documentModel({
          versions: [{
            versionNumber: 1,
            content: file.buffer,
            mimeType: file.mimetype,
            uploadedAt: new Date(),
          }],
        });
        const savedDoc = await mongoDoc.save();
        mongoDocumentIds.push(savedDoc._id.toString());
      }
    }

    // Update document status
    document.documentStatus = DocumentStatus.FINALIZED;

    // Save the updated document
    const updatedDocument = await this.masterDocumentListRepository.save(document);

    // Convert to DTO
    const documentDto: DocumentListDto = {
      id: updatedDocument.id,
      documentNumber: updatedDocument.documentNumber,
      documentExternalNumber: updatedDocument.documentExternalNumber,
      documentName: updatedDocument.documentName,
      documentLegalDate: updatedDocument.documentLegalDate,
      documentStatus: updatedDocument.documentStatus,
      indexNumber: updatedDocument.indexNumber,
      mongoDocumentId: updatedDocument.mongoDocumentId,
      createdAt: updatedDocument.createdAt,
      updatedAt: updatedDocument.updatedAt,
      documentType: updatedDocument.type?.typeName,
      documentTypeId: updatedDocument.type?.id?.toString(),
      documentTypeShortHand: updatedDocument.type?.shortHand,
      createdById: updatedDocument.createdBy?.id,
      createdByName: updatedDocument.createdBy?.name,
      createdByEmail: updatedDocument.createdBy?.email,
      divisionId: updatedDocument.masterDivisionList?.id,
      divisionName: updatedDocument.masterDivisionList?.divisionName,
      divisionCode: updatedDocument.masterDivisionList?.divisionCode,
      companyId: updatedDocument.masterCompanyList?.id,
      companyName: updatedDocument.masterCompanyList?.companyName,
      companyCode: updatedDocument.masterCompanyList?.companyCode,
    };

    return {
      message: 'Document has been successfully finalized',
      document: documentDto
    };
  }
}

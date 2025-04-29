import { DocumentStatus } from '../enums/document-status.enum';

export class DocumentListDto {
  id: string;
  documentNumber: string;
  documentExternalNumber: string;
  documentName: string;
  documentLegalDate: string;
  documentStatus: DocumentStatus;
  indexNumber?: number;
  
  // Type info
  documentType?: string;
  documentTypeId?: string;
  
  // Related entities (simplified for frontend)
  createdById?: string;
  createdByName?: string;
  
  divisionId?: string;
  divisionName?: string;
  
  companyId?: string;
  companyName?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
} 
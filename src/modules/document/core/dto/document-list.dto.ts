import { DocumentStatus } from '../enums/document-status.enum';

export class DocumentListDto {
  // Basic document info
  id: string;
  documentNumber: string;
  documentExternalNumber: string;
  documentName: string;
  documentLegalDate: string;
  documentStatus: DocumentStatus;
  indexNumber?: number;
  mongoDocumentId?: string;
  
  // Type info
  documentType?: string;
  documentTypeId?: string;
  documentTypeShortHand?: string;
  
  // Related entities (simplified for frontend)
  createdById?: string;
  createdByName?: string;
  createdByEmail?: string;
  
  divisionId?: string;
  divisionName?: string;
  divisionCode?: string;
  
  companyId?: string;
  companyName?: string;
  companyCode?: string;
  
  // Document type specific fields
  clientId?: string;
  documentDescription?: string;
  offeredService?: string;
  personInChargeId?: string;
  personInChargeName?: string;
  
  // Version info
  versionNumber?: number;
  isLatest?: boolean;
  uploadedBy?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
} 
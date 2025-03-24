// src/modules/document/core/dto/create-document-info.dto.ts
export class CreateDocumentInfoDto {
  documentId: string; // UUID of master document
  recipientName: string;
  recipientAddress: string;
}

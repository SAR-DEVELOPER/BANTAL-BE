// src/modules/document/core/dto/create-document.dto.ts
export class CreateDocumentDto {
  documentName: string;
  description?: string;
  typeId: string; // UUID of document type
}

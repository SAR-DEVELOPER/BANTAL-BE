// src/modules/document/core/enums/document-status.enum.ts
export enum DocumentStatus {
  DRAFT = 'DRAFT', // Initial creation
  PENDING = 'PENDING', // Waiting for approval/signature
  SIGNED = 'SIGNED', // Document has been signed
  ACTIVE = 'ACTIVE', // Document is active/in-use
  ARCHIVED = 'ARCHIVED', // Document stored for records
  EXPIRED = 'EXPIRED', // Document no longer valid
  CANCELLED = 'CANCELLED', // Document cancelled/voided
  REJECTED = 'REJECTED', // Document rejected in workflow
}

# Document Creation API Documentation

This document provides details on how to use the enhanced document creation API.

## Endpoint

```
POST /documents/create/:documentType
```

Where `:documentType` is either the full name or shorthand of the document type:
- `SP` or `Pwn` or `SuratPenawaran` for Offering Letter
- `SPK` or `SuratPerjanjianKerja` for Work Agreement Letter

## Request Format

The API supports two formats for submitting document data:

### 1. Structured Format

```json
{
  "baseDocument": {
    // Master document fields
    "documentNumber": "DOC-001",
    "documentExternalNumber": "EXT-001",
    "documentName": "Sample Document",
    "documentLegalDate": "2023-07-20",
    "indexNumber": 1,
    "createdById": "uuid-of-creator",
    "masterDivisionListId": "uuid-of-division",
    "masterCompanyListId": "uuid-of-company"
  },
  "specificDocument": {
    // Document type specific fields
    // For SuratPenawaran (SP/Pwn):
    "clientId": "uuid-of-client",
    "documentDescription": "Offering for Project X",
    "offeredService": "Web Application Development",
    "personInChargeId": "uuid-of-pic"
    
    // For SuratPerjanjianKerja (SPK):
    // "clientId": "uuid-of-client",
    // "documentDescription": "Work Agreement for Project X",
    // "startDate": "2023-07-20",
    // "endDate": "2024-07-20", // Optional
    // "projectFee": 10000000,
    // "paymentInstallment": 3
  }
}
```

### 2. Flat Format

```json
{
  // Master document fields
  "documentNumber": "DOC-001",
  "documentExternalNumber": "EXT-001",
  "documentName": "Sample Document",
  "documentLegalDate": "2023-07-20",
  "indexNumber": 1,
  "createdById": "uuid-of-creator",
  "masterDivisionListId": "uuid-of-division",
  "masterCompanyListId": "uuid-of-company",
  
  // Document type specific fields
  // For SuratPenawaran (SP/Pwn):
  "clientId": "uuid-of-client",
  "documentDescription": "Offering for Project X",
  "offeredService": "Web Application Development",
  "personInChargeId": "uuid-of-pic"
  
  // For SuratPerjanjianKerja (SPK):
  // "clientId": "uuid-of-client",
  // "documentDescription": "Work Agreement for Project X",
  // "startDate": "2023-07-20",
  // "endDate": "2024-07-20", // Optional
  // "projectFee": 10000000,
  // "paymentInstallment": 3
}
```

## File Upload

The API supports file uploads using `multipart/form-data`. The file should be sent with the field name `file`.

Example using curl:

```bash
curl -X POST \
  http://localhost:3000/documents/create/Pwn \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/document.pdf' \
  -F 'documentNumber=DOC-001' \
  -F 'documentExternalNumber=EXT-001' \
  -F 'documentName=Sample Document' \
  -F 'documentLegalDate=2023-07-20' \
  -F 'createdById=uuid-of-creator' \
  -F 'masterDivisionListId=uuid-of-division' \
  -F 'masterCompanyListId=uuid-of-company' \
  -F 'clientId=uuid-of-client' \
  -F 'documentDescription=Offering for Project X' \
  -F 'offeredService=Web Application Development' \
  -F 'personInChargeId=uuid-of-pic'
```

## Examples

### Creating a SuratPenawaran (SP/Pwn) Document

#### Request (JSON format)

```json
POST /documents/create/Pwn
Content-Type: application/json

{
  "baseDocument": {
    "documentNumber": "SP-2023-001",
    "documentExternalNumber": "EXT-SP-001",
    "documentName": "Offering Letter for Client A",
    "documentLegalDate": "2023-07-20",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "masterDivisionListId": "550e8400-e29b-41d4-a716-446655440001",
    "masterCompanyListId": "550e8400-e29b-41d4-a716-446655440002"
  },
  "specificDocument": {
    "clientId": "550e8400-e29b-41d4-a716-446655440003",
    "documentDescription": "Offering for Web Development Project",
    "offeredService": "Full-Stack Web Application Development",
    "personInChargeId": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```

### Creating a SuratPerjanjianKerja (SPK) Document

#### Request (JSON format)

```json
POST /documents/create/SPK
Content-Type: application/json

{
  "baseDocument": {
    "documentNumber": "SPK-2023-001",
    "documentExternalNumber": "EXT-SPK-001",
    "documentName": "Work Agreement for Client B",
    "documentLegalDate": "2023-07-25",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "masterDivisionListId": "550e8400-e29b-41d4-a716-446655440001",
    "masterCompanyListId": "550e8400-e29b-41d4-a716-446655440002"
  },
  "specificDocument": {
    "clientId": "550e8400-e29b-41d4-a716-446655440005",
    "documentDescription": "Work Agreement for Mobile App Development",
    "startDate": "2023-08-01",
    "endDate": "2024-02-01",
    "projectFee": 150000000,
    "paymentInstallment": 3
  }
}
```

## Required Fields By Document Type

### Master Document (Common Fields)
- documentNumber
- documentName
- documentLegalDate
- createdById
- masterDivisionListId
- masterCompanyListId

### SuratPenawaran (SP/Pwn)
- clientId
- documentDescription
- offeredService
- personInChargeId

### SuratPerjanjianKerja (SPK)
- clientId
- documentDescription
- startDate
- projectFee
- paymentInstallment

## Response

The API will respond with the created MasterDocumentList entity:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "documentNumber": "SP-2023-001",
  "documentExternalNumber": "EXT-SP-001",
  "documentName": "Offering Letter for Client A",
  "documentLegalDate": "2023-07-20",
  "documentStatus": "DRAFT",
  "indexNumber": 1,
  "createdAt": "2023-07-20T10:30:00.000Z",
  "updatedAt": "2023-07-20T10:30:00.000Z"
}
```

## Error Handling

If there's an error in the request, the API will respond with a 400 Bad Request and an error message:

```json
{
  "statusCode": 400,
  "message": "Failed to create document: Client ID is required for SuratPenawaran",
  "error": "Bad Request"
}
```

### Common Validation Errors

#### SuratPenawaran (SP/Pwn)
- Client ID is required
- Document description is required
- Offered service is required
- Person in charge ID is required

#### SuratPerjanjianKerja (SPK)
- Client ID is required
- Document description is required
- Start date is required
- Project fee is required
- Payment installment is required
- Start date must be before end date (if end date is provided) 
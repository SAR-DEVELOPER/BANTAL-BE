# Finalize Document API Endpoint

## Overview

The Finalize Document endpoint allows you to finalize a document with type-specific handling. This endpoint supports file uploads and uses database transactions to ensure data consistency. **For SPK (Surat Perjanjian Kerja) documents, finalizing will automatically create a corresponding pekerjaan (work project) record.**

## Endpoint Details

**HTTP Method:** `POST`  
**Path:** `/documents/finalizeV2/{documentType}`  
**Controller:** `FinalizeDocumentController`

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `documentType` | string | Yes | Document type name or shorthand identifier |

### Request Body

The request body should contain a `DocumentFinalizeDto` object with the following structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | The UUID of the document to finalize |
| `finalizationSummary` | string | Yes | Summary or notes about the finalization |
| `physicalDelivery` | boolean | Yes | Whether physical delivery is required |
| `documentType` | string | No | Optional document type override |

### File Upload (Optional)

- **Field Name:** `files`
- **Maximum Files:** 2
- **Supported:** Any file type
- **Upload Method:** `multipart/form-data`

## Request Examples

### Basic Finalization (without files)

```bash
curl -X POST "https://api.example.com/documents/finalizeV2/invoice" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "finalizationSummary": "Document reviewed and approved for processing",
    "physicalDelivery": true
  }'
```

### Finalization with File Upload

```bash
curl -X POST "https://api.example.com/documents/finalizeV2/contract" \
  -F "id=550e8400-e29b-41d4-a716-446655440000" \
  -F "finalizationSummary=Contract signed and ready for execution" \
  -F "physicalDelivery=false" \
  -F "files=@signature.pdf" \
  -F "files=@addendum.pdf"
```

### JavaScript/TypeScript Example

```typescript
const formData = new FormData();
formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
formData.append('finalizationSummary', 'Document processed successfully');
formData.append('physicalDelivery', 'true');

// Optional: Add files
if (files.length > 0) {
  files.forEach(file => {
    formData.append('files', file);
  });
}

const response = await fetch('/documents/finalizeV2/invoice', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Response Format

### Success Response (200 OK)

```json
{
  "message": "Document has been successfully finalized",
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "documentNumber": "INV-2024-001",
    "documentExternalNumber": "EXT-001",
    "documentName": "Invoice for Services",
    "documentLegalDate": "2024-01-15",
    "documentStatus": "FINALIZED",
    "indexNumber": 1,
    "mongoDocumentId": "65a4b8c7f1e2d3a4b5c6d7e8",
    "documentType": "invoice",
    "documentTypeId": "type-uuid-123",
    "documentTypeShortHand": "INV",
    "createdById": "user-uuid-456",
    "createdByName": "John Doe",
    "createdByEmail": "john.doe@example.com",
    "divisionId": "div-uuid-789",
    "divisionName": "Finance Division",
    "divisionCode": "FIN",
    "companyId": "comp-uuid-012",
    "companyName": "ACME Corporation",
    "companyCode": "ACME",
    "clientId": "client-uuid-345",
    "documentDescription": "Monthly service invoice",
    "offeredService": "Consulting Services",
    "personInChargeId": "pic-uuid-678",
    "personInChargeName": "Jane Smith",
    "versionNumber": 1,
    "isLatest": true,
    "uploadedBy": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:45:00Z"
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Document type contract does not support finalization",
  "error": "Bad Request"
}
```

#### 400 Bad Request (Validation Error)

```json
{
  "statusCode": 400,
  "message": [
    "id must be a UUID"
  ],
  "error": "Bad Request"
}
```

#### 400 Bad Request (Document Not Found)

```json
{
  "statusCode": 400,
  "message": "Failed to finalize document: Document not found",
  "error": "Bad Request"
}
```

#### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error occurred during finalization",
  "error": "Internal Server Error"
}
```

## Business Logic Flow

1. **Validation:** Verifies that the document exists and the document type is valid
2. **Service Resolution:** Retrieves the appropriate service for the specified document type
3. **File Upload:** If files are provided, uploads them to MongoDB and retrieves document IDs
4. **Transaction Management:** Uses database transactions to ensure data consistency
5. **Type-Specific Finalization:** Calls the finalize method specific to the document type
6. **SPK-Specific Logic:** For SPK documents, automatically creates a pekerjaan record based on work type (monthly vs non-monthly)
7. **Response:** Returns success message with updated document information

## Error Handling

The endpoint implements comprehensive error handling:

- **Transaction Rollback:** Automatically rolls back database changes if any error occurs
- **Service Validation:** Checks if the document type supports finalization
- **File Upload Errors:** Handles MongoDB upload failures gracefully
- **Logging:** Comprehensive logging for debugging and monitoring

## Usage Notes

### Document Type Support

Not all document types may support finalization. The endpoint will return a 400 error if the document type doesn't have a `finalize` method implemented.

### File Limitations

- Maximum of 2 files per request
- Files are uploaded to MongoDB
- All common file types are supported

### Transaction Safety

The endpoint uses database transactions to ensure:
- Data consistency across multiple database operations
- Automatic rollback on any failure
- Proper cleanup of resources

### Authentication

*Note: Authentication requirements should be documented based on your application's security implementation.*

## Related Endpoints

- `GET /documents/{id}` - Retrieve document details
- `POST /documents` - Create new document
- `PUT /documents/{id}` - Update document
- `DELETE /documents/{id}` - Delete document

## Development Notes

### Dependencies

- `DocumentService` - Core document operations
- `DocumentFactoryService` - Type-specific service resolution
- `Connection` (TypeORM) - Database transaction management

### Logging

The endpoint provides detailed logging at debug level:
- Document finalization initiation
- File upload progress
- Service resolution
- Transaction status
- Error details

### Performance Considerations

- File uploads are processed sequentially
- Database transactions may impact performance under high load
- Consider implementing async processing for large files 

## SPK Document Finalization

### Special Behavior for SPK Documents

When finalizing an SPK (Surat Perjanjian Kerja) document, the system will:

1. **Update document status** to `FINALIZED`
2. **Determine work type** using the `isBulanan` flag (currently hardcoded to `false`, will be moved to database)
3. **Create pekerjaan record** automatically:
   - **Non-Monthly Work** (`isBulanan = false`): Creates pekerjaan-NB record
   - **Monthly Work** (`isBulanan = true`): Creates pekerjaan-B record (planned feature)

### Example SPK Finalization Response

```json
{
  "message": "SPK document has been successfully finalized and non-monthly pekerjaan (ID: 550e8400-e29b-41d4-a716-446655440000) has been created",
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "documentNumber": "SPK-2024-001",
    "documentName": "Work Agreement for Mobile App Development",
    "documentStatus": "FINALIZED",
    // ... other document properties
  }
}
```

### Work Type Classification

| Work Type | `isBulanan` Value | Service Used | Description |
|-----------|-------------------|--------------|-------------|
| Non-Monthly | `false` | `pekerjaan-NB` | Project-based work with defined milestones |
| Monthly | `true` | `pekerjaan-B` | Ongoing monthly work contracts |

*Note: The `isBulanan` flag is currently hardcoded to `false` for development purposes and will be configurable through the database in future releases.* 